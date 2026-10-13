/* —— Live room ——
   Every action is a tiny JSON message appended to one shared list. The deck
   and every phone replay the same list, so everyone ends up with the same
   tallies, reveals and "current slide" without a server of our own.

   Two relays, picked by CONFIG:
     firebase  Firebase Realtime Database over its REST stream. No daily caps.
     ntfy      ntfy.sh. Free, but 250 messages a day per network (IP).

   Messages:
     { t: 'v', v: voterId, d: dinoId, g: guess }   vote (latest per voter wins)
     { t: 's', d: dinoId | 'results' | null }       presenter moved
     { t: 'r', d: dinoId, a: name }                 reveal
     { t: 'h', d: dinoId }                          un-reveal
     { t: 'x' }                                     reset the room (ntfy only;
                                                    Firebase deletes the list) */

const Live = (() => {
  const FIREBASE = Boolean(CONFIG.firebase);
  const url = FIREBASE
    ? `${CONFIG.firebase.replace(/\/$/, '')}/rooms/${CONFIG.topic}.json`
    : `${CONFIG.relay}/${CONFIG.topic}`;

  function emptyState() {
    return { votes: {}, revealed: {}, current: null };
  }

  function clear(state) {
    state.votes = {};
    state.revealed = {};
    state.current = null;
  }

  function apply(state, m) {
    switch (m?.t) {
      case 'v':
        if (!DINOS.some((d) => d.id === m.d) || !ROSTER.includes(m.g)) return;
        (state.votes[m.d] ||= {})[m.v] = m.g;
        break;
      case 's':
        state.current = m.d;
        break;
      case 'r':
        state.revealed[m.d] = m.a;
        break;
      case 'h':
        delete state.revealed[m.d];
        break;
      case 'x':
        clear(state);
        break;
    }
  }

  // Counts per roster name for one dino.
  function tally(state, dinoId) {
    const counts = Object.fromEntries(ROSTER.map((n) => [n, 0]));
    const ballots = Object.values(state.votes[dinoId] || {});
    for (const guess of ballots) counts[guess] += 1;
    return { counts, total: ballots.length };
  }

  function request(method, body) {
    // A string body keeps POST a "simple" CORS request (no preflight).
    return fetch(url, { method, body }).then((r) => {
      if (r.ok) return;
      const err = new Error(`relay ${r.status}`);
      err.limited = r.status === 429;
      throw err;
    });
  }

  const publish = (msg) => request('POST', JSON.stringify(msg));

  // When ntfy's daily allowance comes back, in local time.
  function resetTime() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return next.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // onChange(state) after every change; onStatus('live' | 'connecting' | 'offline').
  // send: false keeps everything local (practice mode) and never publishes.
  function connect({ onChange, onStatus = () => {}, send: sending = true }) {
    const state = emptyState();
    const seen = new Set();
    let source;
    let retry;

    function take(id, msg) {
      if (seen.has(id)) return;
      seen.add(id);
      apply(state, msg);
    }

    // Firebase streams `put` / `patch` events: path "/" is the whole list
    // (on connect, reconnect, or after a reset), "/<key>" is one new message.
    function onFirebase(e) {
      const { path, data } = JSON.parse(e.data);
      if (path === '/') {
        if (e.type === 'put') {
          clear(state);
          seen.clear();
        }
        for (const key of Object.keys(data || {}).sort()) take(key, data[key]);
      } else if (data && !path.slice(1).includes('/')) {
        take(path.slice(1), data);
      }
      onChange(state);
    }

    // ntfy streams plain `message` events; since=all replays the cached history.
    function onNtfy(e) {
      try {
        const env = JSON.parse(e.data);
        if (env.event !== 'message') return;
        take(env.id, JSON.parse(env.message));
      } catch {
        return;
      }
      onChange(state);
    }

    function open() {
      clearTimeout(retry);
      source?.close();
      onStatus('connecting');
      source = new EventSource(FIREBASE ? url : `${url}/sse?since=all`);
      source.onopen = () => onStatus('live');
      if (FIREBASE) {
        source.addEventListener('put', onFirebase);
        source.addEventListener('patch', onFirebase);
        source.addEventListener('cancel', () => onStatus('offline'));
      } else {
        source.onmessage = onNtfy;
      }
      source.onerror = () => {
        // EventSource retries on its own unless the server refused outright.
        if (source.readyState === EventSource.CLOSED) {
          onStatus('offline');
          retry = setTimeout(open, 3000);
        } else {
          onStatus('connecting');
        }
      };
    }

    // Phones drop the stream when the screen locks. Pick it back up on return.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && source?.readyState !== EventSource.OPEN) open();
    });

    // Opening during page load keeps the browser's loading spinner going.
    if (document.readyState === 'complete') open();
    else addEventListener('load', open, { once: true });

    return {
      state,
      // Apply locally right away, then send. The echo is idempotent.
      send(msg) {
        apply(state, msg);
        onChange(state);
        return sending ? publish(msg) : Promise.resolve();
      },
      // Wipe votes and reveals for the whole room.
      reset() {
        clear(state);
        onChange(state);
        if (!sending) return Promise.resolve();
        return FIREBASE ? request('DELETE') : publish({ t: 'x' });
      },
    };
  }

  return { connect, tally, resetTime, relay: FIREBASE ? 'firebase' : 'ntfy' };
})();

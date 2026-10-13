/* —— Live room ——
   Every action is a tiny JSON message on one ntfy.sh topic. The deck and
   every phone replay the same stream, so everyone ends up with the same
   tallies, reveals and "current slide" without a server of our own.

   Messages:
     { t: 'v', v: voterId, d: dinoId, g: guess }   vote (latest per voter wins)
     { t: 's', d: dinoId | 'results' | null }       presenter moved
     { t: 'r', d: dinoId, a: name }                 reveal
     { t: 'h', d: dinoId }                          un-reveal
     { t: 'x' }                                     reset the room */

const Live = (() => {
  const url = `${CONFIG.relay}/${CONFIG.topic}`;

  function emptyState() {
    return { votes: {}, revealed: {}, current: null };
  }

  function apply(state, m) {
    switch (m.t) {
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
        state.votes = {};
        state.revealed = {};
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

  function publish(msg) {
    // Plain-text body keeps this a "simple" CORS request (no preflight).
    return fetch(url, { method: 'POST', body: JSON.stringify(msg) }).then((r) => {
      if (!r.ok) throw new Error(`relay ${r.status}`);
    });
  }

  // onChange(state, msg) after every message; onStatus('live' | 'connecting' | 'offline').
  function connect({ onChange, onStatus = () => {} }) {
    const state = emptyState();
    const seen = new Set();
    let source;
    let retry;

    function open() {
      clearTimeout(retry);
      source?.close();
      onStatus('connecting');
      // since=all replays the cached history; `seen` drops repeats on reconnect.
      source = new EventSource(`${url}/sse?since=all`);
      source.onopen = () => onStatus('live');
      source.onmessage = (e) => {
        let env, msg;
        try {
          env = JSON.parse(e.data);
          if (env.event !== 'message' || seen.has(env.id)) return;
          seen.add(env.id);
          msg = JSON.parse(env.message);
        } catch {
          return;
        }
        apply(state, msg);
        onChange(state, msg);
      };
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
        onChange(state, msg);
        return publish(msg);
      },
    };
  }

  return { connect, tally };
})();

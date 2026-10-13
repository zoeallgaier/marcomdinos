/* —— Live room ——
   Every action is a tiny JSON message on one ntfy.sh topic. The deck and
   every phone replay the same stream, so everyone ends up with the same
   tallies, reveals and "current slide" without a server of our own.

   Messages:
     { t: 'v', v: voterId, w: who, d: dinoId, g: guess }
                                                    vote (latest per voter wins);
                                                    who = voter's own roster name or 'guest'
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
        if (!DINOS.some((d) => d.id === m.d) || !ROSTER.includes(m.g) || m.g === m.w) return;
        (state.votes[m.d] ||= {})[m.v] = { g: m.g, w: m.w };
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

  // Counts per roster name for one dino. The dino's owner knows the
  // answer, so their ballot doesn't count.
  function tally(state, dinoId, owner) {
    const counts = Object.fromEntries(ROSTER.map((n) => [n, 0]));
    let total = 0;
    for (const { g, w } of Object.values(state.votes[dinoId] || {})) {
      if (owner && w === owner) continue;
      counts[g] += 1;
      total += 1;
    }
    return { counts, total };
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

    function open() {
      onStatus('connecting');
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
          setTimeout(open, 4000);
        } else {
          onStatus('connecting');
        }
      };
    }

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

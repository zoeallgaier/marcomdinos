/* —— Phone ballot ——
   Follows the presenter by default. Tap a chip to browse, "back to live" to rejoin. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = (n) => String(n).padStart(2, '0');

const voter = (() => {
  const make = () => (crypto.randomUUID?.() ?? String(Math.random())).replace(/\W/g, '').slice(0, 12);
  try {
    let id = localStorage.getItem('dino-voter');
    if (!id) localStorage.setItem('dino-voter', (id = make()));
    return id;
  } catch {
    return make();
  }
})();

const view = $('.view');
const chips = $('.chips');
const followBtn = $('.follow');
const toastEl = $('.toast');

let following = true;
let browsing = null;
let shownKey;

const dinoById = (id) => DINOS.find((d) => d.id === id);
const myVote = (state, id) => state.votes[id]?.[voter];

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('is-visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
}

/* —— Views —— */
function waitingView() {
  return `
    <section class="waiting">
      <p class="label label--accent">you’re in</p>
      <h1 class="waiting__h">Hang tight.</h1>
      <p>When a dinosaur goes up on screen, it shows up here. Pick the teammate you think it is. You can change your mind until the reveal.</p>
    </section>`;
}

function dinoView(dino) {
  const clues = dino.facts.map((f) => `<li><span>${f.replace(/\[\[(.+?)\]\]/g, '<span class="redact">$1</span>')}</span></li>`).join('');
  return `
    <article class="card">
      <img class="card__img" src="assets/img/${dino.id}.jpg" alt="Illustration of a ${dino.species}">
      <h1 class="card__species">${dino.species}</h1>
      <details class="clues"><summary>field notes (the clues)</summary><ol>${clues}</ol></details>
      <p class="prompt">Who is this?</p>
      <div class="names">${ROSTER.map((name) => `<button class="name" data-name="${name}">${name}</button>`).join('')}</div>
      <p class="verdict"></p>
      <section class="room">
        <p class="label room__head"><span>the room says</span><span class="room__count"></span></p>
        <p class="room__hint">Vote to see what everyone else guessed.</p>
        <ol class="bars" hidden>${ROSTER.map((name) => `
          <li class="bar" data-name="${name}">
            <span class="bar__name">${name}</span>
            <span class="bar__track"><span class="bar__fill"></span></span>
            <span class="bar__n">0</span>
          </li>`).join('')}</ol>
      </section>
    </article>`;
}

function recordView() {
  return `
    <section class="record">
      <p class="label label--accent">field report</p>
      <h1 class="record__h">Your record</h1>
      <p class="record__score label"></p>
      <ol class="ledger"></ol>
    </section>`;
}

function updateDino(state, id) {
  const answer = state.revealed[id];
  const mine = myVote(state, id);

  for (const btn of $$('.name', view)) {
    const name = btn.dataset.name;
    btn.classList.toggle('is-picked', name === mine);
    btn.classList.toggle('is-answer', name === answer);
    btn.disabled = Boolean(answer);
  }
  $$('.redact', view).forEach((r) => r.classList.toggle('is-open', Boolean(answer)));

  const verdict = $('.verdict', view);
  verdict.classList.toggle('verdict--right', Boolean(answer) && mine === answer);
  if (answer && !mine) verdict.innerHTML = `It’s <em>${answer}</em>. You sat this one out.`;
  else if (answer && mine === answer) verdict.innerHTML = `Correct. It’s <em>${answer}</em>.`;
  else if (answer) verdict.innerHTML = `It’s <em>${answer}</em>. You said ${mine}.`;
  else if (mine) verdict.textContent = `Locked in: ${mine}. Change it any time before the reveal.`;
  else verdict.textContent = '';

  const { counts, total } = Live.tally(state, id);
  const showRoom = Boolean(mine || answer);
  $('.room__hint', view).hidden = showRoom;
  $('.bars', view).hidden = !showRoom;
  $('.room__count', view).textContent = `${total} ${total === 1 ? 'vote' : 'votes'}`;
  for (const bar of $$('.bar', view)) {
    const c = counts[bar.dataset.name];
    $('.bar__fill', bar).style.width = total ? `${(c / total) * 100}%` : '0';
    $('.bar__n', bar).textContent = c;
    bar.classList.toggle('is-answer', bar.dataset.name === answer);
  }
}

function updateRecord(state) {
  let right = 0;
  let scored = 0;
  $('.ledger', view).innerHTML = DINOS.map((d) => {
    const answer = state.revealed[d.id];
    const mine = myVote(state, d.id);
    let mark = '<span class="ledger__mark">not yet</span>';
    let detail = mine ? `you said ${mine}` : 'no vote';
    if (answer) {
      scored += 1;
      if (mine === answer) right += 1;
      mark = mine === answer
        ? '<span class="ledger__mark ledger__mark--right">right</span>'
        : '<span class="ledger__mark ledger__mark--wrong">wrong</span>';
      detail += ` – it was ${answer}`;
    }
    return `<li><span class="ledger__species">${d.species}</span>${mark}<span class="ledger__detail">${detail}</span></li>`;
  }).join('');
  $('.record__score', view).textContent = scored ? `${right} of ${scored} identified correctly` : 'Nothing revealed yet.';
}

function renderDrawer(state, key) {
  chips.innerHTML = DINOS.map((d, i) => {
    const answer = state.revealed[d.id];
    const mine = myVote(state, d.id);
    const cls = ['chip'];
    if (d.id === key) cls.push('is-current');
    if (answer && mine) cls.push(mine === answer ? 'is-right' : 'is-wrong');
    else if (mine) cls.push('is-voted');
    return `<li><button class="${cls.join(' ')}" data-go="${d.id}">${pad(i + 1)} ${d.species}</button></li>`;
  }).join('') + '<li><button class="chip chip--record" data-go="record">my record</button></li>';

  followBtn.hidden = following || !state.current;

  const revealed = DINOS.filter((d) => state.revealed[d.id]);
  const right = revealed.filter((d) => myVote(state, d.id) === state.revealed[d.id]).length;
  $('.drawer__record').textContent = revealed.length ? `field record: ${right} / ${revealed.length}` : '';
}

function render(state) {
  const target = following ? state.current : browsing;
  const key = target === 'results' ? 'record' : target || 'waiting';

  if (key !== shownKey) {
    shownKey = key;
    if (key === 'waiting') view.innerHTML = waitingView();
    else if (key === 'record') view.innerHTML = recordView();
    else view.innerHTML = dinoView(dinoById(key));
  }

  if (key === 'record') updateRecord(state);
  else if (key !== 'waiting') updateDino(state, key);
  renderDrawer(state, key);
}

/* —— Live room —— */
const statusEl = $('.status');
const room = Live.connect({
  onChange: render,
  onStatus(s) {
    statusEl.dataset.state = s;
    statusEl.textContent = s;
  },
});

function vote(id, guess) {
  const prev = myVote(room.state, id);
  if (prev === guess || room.state.revealed[id]) return;
  room.send({ t: 'v', v: voter, d: id, g: guess }).catch(() => {
    const ballots = room.state.votes[id];
    if (ballots?.[voter] === guess) {
      if (prev) ballots[voter] = prev;
      else delete ballots[voter];
      render(room.state);
    }
    toast('Vote didn’t send. Tap again.');
  });
}

view.addEventListener('click', (e) => {
  const btn = e.target.closest('.name');
  if (btn && !btn.disabled) vote(shownKey, btn.dataset.name);
});

chips.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-go]');
  if (!btn) return;
  const go = btn.dataset.go;
  const live = room.state.current === 'results' ? 'record' : room.state.current;
  following = go === live;
  browsing = go;
  render(room.state);
  scrollTo({ top: 0, behavior: 'smooth' });
});

followBtn.addEventListener('click', () => {
  following = true;
  render(room.state);
  scrollTo({ top: 0, behavior: 'smooth' });
});

render(room.state);
startDots($('.dots'));

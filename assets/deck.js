/* —— Answer key ——
   Only the deck loads this file. Phones learn answers at the reveal. */
const ANSWERS = {
  cryolophosaurus: 'Lauren',
  kamuysaurus: 'Lindsay',
  spinosaurus: 'Cesar',
  borealopelta: 'Jeff',
  psittacosaurus: 'Leah B.',
  maiasaura: 'David',
  patagotitan: 'Emily',
  oryctodromeus: 'Monica',
  utahraptor: 'Leah K.',
  scipionyx: 'Halen',
  lythronax: 'Zoe',
};
const ASIDES = { lythronax: 'meee!' };

const CITED = [
  'Allgaier, Z. (2026). I can see your kerning from here and I’m not okay [Dissertation, withdrawn under protest].',
  'Anonymous. (2005). Marketing and Communications in the Mesozoic [Unproduced stage musical, two songs about brand guidelines].',
  'Bravo Media. (2026). The Real Housewives of Antarctica, S1 E4: “Who brought the wrong Stanley” [Unaired pilot].',
  'Ciro, S. (113,000,000 BCE). My organs, my business: A memoir. Fossilized in Italy without consent.',
  'The Coca-Cola Company. (1982). Diet Coke: An armored dinosaur’s only weakness [Leaked internal memo].',
  'Crumbl Cookies. (2017). If a cookie is in my mouth I cannot yell: Leadership lessons [Employee handbook, page 1 only].',
  'Lion, E. M. (in press). Do not knock on the burrow: A reader’s manifesto.',
  'Mitchell, H. (n.d.). Untitled explanation of the Precambrian Era [Unverified, non-applicable.].',
  'Miyazaki, H. (2022). Elden Ring: Shadow of the Hokkaido Seafloor [DLC Lindsay has already 100%’d].',
  'Psittacosaurus, A. (125,000,000 BCE). 34 babies, zero rush jobs: A memoir. Foreword by the 34 babies.',
  'Steve, Dr. (n.d.). Verbal testimony from museum gift shop [Stated while holding a plush T. rex].',
  'Swift, T. (2020). folklore (Patagotitan’s Version) [Album, recorded entirely in a lagoon].',
  'The Vibes. (Eternal). Primary data set.',
  'Utah State Legislature. (2018). S.B. 43: Utahraptor named state dinosaur, Leah K. named enforcer [Amendment pending].',
  'Wayback Machine. (1944 to present). Spinosaurus_v47_final_FINAL_v48 [Archived web pages].',
];

/* —— Helpers —— */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = (n) => String(n).padStart(2, '0');

function voteUrl() {
  const local = !location.protocol.startsWith('http') || /^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
  return new URL('vote.html', local ? CONFIG.publicUrl : location.href).href;
}

// Square SVG QR, crisp at any scale.
function qrSvg(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let path = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
  }
  return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="QR code to the voting page">
    <rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#E7DFD1"/><path d="${path}" fill="#211C17"/></svg>`;
}

/* —— Slides —— */
const SLIDES = [
  { kind: 'title' },
  ...DINOS.map((dino, i) => ({ kind: 'dino', dino, n: i + 1 })),
  { kind: 'results' },
  { kind: 'cited' },
];

function titleSlide(qr) {
  return `
    <section class="slide slide--title">
      <div class="enter">
        <p class="label label--accent">a field guide</p>
        <h1 class="title__h1">The Dinosaurs <em>of</em> MarCom</h1>
        <p class="title__sub">Every member of the team, identified down to the species. All real. I checked.</p>
      </div>
      <aside class="ballot-card enter">
        <p class="label label--accent">field participation</p>
        <div class="qr">${qr}</div>
        <p class="ballot-card__h">Guess who’s who.</p>
        <p class="label">Scan to vote on who you think each dinosaur is.</p>
      </aside>
    </section>`;
}

function dinoSlide({ dino }) {
  const bars = ROSTER.map((name) => `
    <li class="bar" data-name="${name}">
      <span class="bar__name">${name}</span>
      <span class="bar__track"><span class="bar__fill"></span></span>
      <span class="bar__n">0</span>
    </li>`).join('');
  const aside = ASIDES[dino.id] ? `<span class="sheet__aside">${ASIDES[dino.id]}</span>` : '';

  return `
    <section class="slide slide--dino" data-dino="${dino.id}">
      <figure class="specimen">
        <img src="assets/img/${dino.id}.jpg" alt="Illustration of a ${dino.species}">
      </figure>
      <div class="sheet">
        <h2 class="sheet__species enter">${dino.species}</h2>
        <div class="sheet__id enter">
          <span class="label">identified as</span>
          <span class="sheet__name"></span>
        </div>
        <ol class="facts enter">${dino.facts.map((f) => `<li><span>${f}</span></li>`).join('')}</ol>
        <div class="poll enter">
          <p class="label poll__head"><span>the room says</span><span class="poll__count">0 votes</span></p>
          <ol class="poll__bars">${bars}</ol>
        </div>
      </div>
    </section>`;
}

function resultsSlide() {
  return `
    <section class="slide slide--results">
      <p class="label label--accent enter">field report</p>
      <h2 class="section__h enter">How well do we know our own herd?</h2>
      <div class="report enter"></div>
    </section>`;
}

function citedSlide() {
  return `
    <section class="slide slide--cited">
      <p class="label label--accent enter">sources</p>
      <h2 class="section__h enter">Works cited</h2>
      <ul class="cited enter">${CITED.map((c) => `<li>${c}</li>`).join('')}</ul>
    </section>`;
}

/* —— Render —— */
const stage = $('.stage');
const url = voteUrl();
const qr = qrSvg(url);

stage.innerHTML = SLIDES.map((s) => {
  if (s.kind === 'title') return titleSlide(qr);
  if (s.kind === 'dino') return dinoSlide(s);
  if (s.kind === 'results') return resultsSlide();
  return citedSlide();
}).join('');

const slideEls = $$('.slide', stage);

function renderDino(state, id) {
  const el = $(`[data-dino="${id}"]`, stage);
  const { counts, total } = Live.tally(state, id);
  const answer = state.revealed[id];

  $('.poll__count', el).textContent = `${total} ${total === 1 ? 'vote' : 'votes'}`;
  for (const bar of $$('.bar', el)) {
    const n = counts[bar.dataset.name];
    $('.bar__fill', bar).style.width = total ? `${(n / total) * 100}%` : '0';
    $('.bar__n', bar).textContent = n;
    bar.classList.toggle('is-answer', bar.dataset.name === answer);
  }

  const wasRevealed = el.classList.contains('is-revealed');
  el.classList.toggle('is-revealed', Boolean(answer));
  if (Boolean(answer) !== wasRevealed) {
    $('.sheet__name', el).innerHTML = answer ? `<span>${answer}</span>${ASIDES[id] ? `<span class="sheet__aside">${ASIDES[id]}</span>` : ''}` : '';
  }
}

function renderReport(state) {
  const rows = DINOS.map((dino, i) => {
    const { counts, total } = Live.tally(state, dino.id);
    const right = counts[ANSWERS[dino.id]];
    return { dino, n: i + 1, right, total, pct: total ? Math.round((right / total) * 100) : null };
  });

  const scored = rows.filter((r) => r.pct !== null);
  const easiest = scored.reduce((a, b) => (b.pct > a.pct ? b : a), scored[0]);
  const hardest = scored.length > 1 ? scored.reduce((a, b) => (b.pct < a.pct ? b : a), scored[0]) : null;
  const award = (r) => (r ? `${ANSWERS[r.dino.id]} <span class="label">as ${r.dino.species}, ${r.pct}%</span>` : '–');

  $('.report', stage).innerHTML = rows.map((r) => `
    <article class="report__cell">
      <header><span>${pad(r.n)}</span><span>${r.total} ${r.total === 1 ? 'vote' : 'votes'}</span></header>
      <p class="report__species">${r.dino.species}</p>
      <p class="report__name">${ANSWERS[r.dino.id]}</p>
      <p class="report__pct">${r.pct === null ? '–' : `${r.pct}%`}<small>got it</small></p>
    </article>`).join('') + `
    <article class="report__cell report__cell--awards">
      <div><p class="label">easiest id</p><p class="report__award">${award(easiest)}</p></div>
      <div><p class="label">best disguise</p><p class="report__award">${award(hardest)}</p></div>
    </article>`;
}

function render(state) {
  DINOS.forEach((d) => renderDino(state, d.id));
  renderReport(state);
  // A reveal (or a reload mid-talk) shows every clue on the current slide.
  const s = SLIDES[index];
  if (s?.kind === 'dino' && state.revealed[s.dino.id]) setBuilt(s.dino.facts.length);
}

/* —— Live room —— */
const statusEl = $('.status');
const alertEl = $('.alert');

function setAlert(text) {
  alertEl.textContent = text || '';
  alertEl.classList.toggle('is-visible', Boolean(text));
}

// Brief blips are normal. Only speak up if the stream stays down.
let downTimer;
const room = Live.connect({
  onChange: render,
  onStatus(s) {
    statusEl.dataset.state = s;
    statusEl.textContent = s;
    clearTimeout(downTimer);
    if (s === 'live') setAlert();
    else downTimer = setTimeout(() => setAlert('Votes aren’t coming through. Reconnecting…'), 5000);
  },
});

function send(msg) {
  room.send(msg).catch(() => setAlert('Couldn’t reach the vote relay. Check the connection.'));
}

/* —— Navigation —— */
let index = Math.min(Math.max((parseInt(location.hash.slice(1), 10) || 1) - 1, 0), SLIDES.length - 1);
let built = 0; // clues showing on the current dino slide
let announced;
let announceTimer;

function slideKey(s) {
  if (s.kind === 'dino') return s.dino.id;
  if (s.kind === 'results') return 'results';
  return null;
}

// Tell phones where we are, once the presenter stops clicking.
function announce() {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    const key = slideKey(SLIDES[index]);
    if (key === announced) return;
    announced = key;
    send({ t: 's', d: key });
  }, 500);
}

function setBuilt(n) {
  built = n;
  $$('.facts li', slideEls[index]).forEach((li, i) => li.classList.toggle('is-shown', i < n));
}

// Going forward, a dino slide starts with no clues. Going back shows them all.
function go(i, { full = false } = {}) {
  index = Math.min(Math.max(i, 0), SLIDES.length - 1);
  slideEls.forEach((el, j) => el.classList.toggle('is-active', j === index));
  history.replaceState(null, '', `#${index + 1}`);
  $('.toolbar__count').textContent = `${pad(index + 1)} / ${pad(SLIDES.length)}`;
  const s = SLIDES[index];
  if (s.kind === 'dino') setBuilt(full || room.state.revealed[s.dino.id] ? s.dino.facts.length : 0);
  announce();
}

function toggleReveal(force) {
  const s = SLIDES[index];
  if (s.kind !== 'dino') return false;
  const id = s.dino.id;
  const show = force ?? !room.state.revealed[id];
  if (show === Boolean(room.state.revealed[id])) return false;
  send(show ? { t: 'r', d: id, a: ANSWERS[id] } : { t: 'h', d: id });
  return true;
}

// Forward: clue, clue, clue, reveal, next slide. Back: un-build clues, then previous slide.
function next() {
  const s = SLIDES[index];
  if (s.kind === 'dino' && built < s.dino.facts.length) setBuilt(built + 1);
  else if (!toggleReveal(true)) go(index + 1);
}

function prev() {
  const s = SLIDES[index];
  if (s.kind === 'dino' && built > 0 && !room.state.revealed[s.dino.id]) setBuilt(built - 1);
  else go(index - 1, { full: true });
}

function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

function reset() {
  if (confirm('Clear every vote and reveal for the whole room?')) send({ t: 'x' });
}

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const actions = {
    ArrowRight: next, ArrowDown: next, PageDown: next, ' ': next, Enter: next,
    ArrowLeft: prev, ArrowUp: prev, PageUp: prev,
    Home: () => go(0), End: () => go(SLIDES.length - 1),
    r: () => toggleReveal(), f: fullscreen,
  };
  const action = actions[e.key];
  if (action) {
    e.preventDefault();
    hideChrome();
    action();
  }
});

stage.addEventListener('click', next);

$('[data-act="prev"]').addEventListener('click', prev);
$('[data-act="next"]').addEventListener('click', next);
$('[data-act="reveal"]').addEventListener('click', () => toggleReveal());
$('[data-act="full"]').addEventListener('click', fullscreen);
$('[data-act="reset"]').addEventListener('click', reset);

/* —— Toolbar + cursor: show on mouse movement, gone a second later —— */
const toolbar = $('.toolbar');
let hideTimer;

function hideChrome() {
  clearTimeout(hideTimer);
  if (toolbar.matches(':hover')) return;
  toolbar.classList.remove('is-visible');
  document.body.classList.add('is-idle');
}

addEventListener('mousemove', () => {
  toolbar.classList.add('is-visible');
  document.body.classList.remove('is-idle');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideChrome, 1200);
});

/* —— Fit —— */
function fit() {
  stage.style.setProperty('--scale', Math.min(innerWidth / 1600, innerHeight / 900));
}
addEventListener('resize', fit);
fit();

render(room.state);
go(index);
startDots($('.dots'));

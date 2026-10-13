/* —— Dot canvas ——
   Ambient dot grid, pulsing on a slow sine wave. Texture, not spectacle. */

function startDots(canvas, { gap = 28, color = '107, 95, 81' } = {}) {
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (let x = gap / 2; x < w; x += gap) {
      for (let y = gap / 2; y < h; y += gap) {
        const wave = Math.sin(t / 1400 + x / 160 + y / 220);
        ctx.fillStyle = `rgba(${color}, ${0.16 + wave * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.1 + wave * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (!still) requestAnimationFrame(draw);
  }

  resize();
  addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pts = [];
  let t = 0;

  function size() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.floor(r.width);
    canvas.height = Math.floor(r.height);
    pts = [];
    const n = Math.round((canvas.width * canvas.height) / 5200);
    for (let i = 0; i < n; i++) {
      pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.4 + .3, p: Math.random() * 6.28 });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      const a = .45 + .55 * Math.abs(Math.sin(t + p.p));
      ctx.fillStyle = 'rgba(230,236,255,' + a + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
    if (!reduce) { t += .02; requestAnimationFrame(draw); }
  }

  size();
  draw();
  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { size(); if (reduce) draw(); });
  });
})();

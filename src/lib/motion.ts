import { initDemos } from './demos';
// Scroll motion for eliooo.org. Every page reads completely without this script;
// it only adds smooth scroll, the stack scale/dim, the statement reveal, count-ups and video play/pause.

export function litWordCount(progress: number, words: number): number {
  return Math.round(Math.min(1, Math.max(0, progress)) * words);
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function stackStyle(t: number): { scale: number; brightness: number } {
  const e = easeInOutCubic(Math.min(1, Math.max(0, t)));
  return { scale: +(1 - 0.06 * e).toFixed(4), brightness: +(1 - 0.4 * e).toFixed(4) };
}

export function countAt(to: number, elapsedMs: number, durationMs = 1400): number {
  const p = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return Math.round(to * (1 - Math.pow(1 - p, 4)));
}

function compactNav(win: Window) {
  const nav = win.document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return () => {};
  const update = () => nav.toggleAttribute('data-compact', win.scrollY > 80);
  update();
  win.addEventListener('scroll', update, { passive: true });
  return () => win.removeEventListener?.('scroll', update);
}

export function setupVideos(doc: Document, autoplay: boolean): () => void {
  const videos = [...doc.querySelectorAll<HTMLVideoElement>('video[data-autoplay]')];
  videos.forEach((video) => {
    const btn = video.parentElement?.querySelector<HTMLButtonElement>('.e-video__play');
    video.removeAttribute('controls');
    if (!btn) return;
    const sync = () => {
      const playing = !video.paused;
      btn.setAttribute('aria-pressed', String(playing));
      btn.textContent = playing ? 'Pause' : 'Play';
    };
    btn.hidden = false;
    btn.addEventListener('click', () => {
      if (video.paused) void video.play()?.catch?.(() => {});
      else video.pause();
      sync();
    });
    video.addEventListener?.('play', sync);
    video.addEventListener?.('pause', sync);
    sync();
  });
  if (!autoplay || typeof IntersectionObserver === 'undefined' || videos.length === 0) return () => {};
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) void v.play().catch(() => {});
      else v.pause();
    }),
    { threshold: 0.25 },
  );
  videos.forEach((v) => io.observe(v));
  return () => io.disconnect();
}

export function splitStatement(doc: Document): HTMLElement[] {
  const p = doc.querySelector<HTMLElement>('[data-reveal]');
  if (!p) return [];
  const text = p.textContent?.trim() ?? '';
  const esc = (w: string) => w.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  p.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">${text
    .split(/\s+/)
    .map((w) => `<span class="w">${esc(w)}</span>`)
    .join(' ')}</span>`;
  return [...p.querySelectorAll<HTMLElement>('.w')];
}

async function initScroll(win: Window): Promise<() => void> {
  const doc = win.document;
  const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import('lenis'),
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  doc.documentElement.classList.add('lenis');

  // Stack: as the next card slides over a card, the covered one scales down and dims (only while cards stick).
  const cards = [...doc.querySelectorAll<HTMLElement>('[data-stack] > .e-card')];
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    ScrollTrigger.create({
      trigger: next,
      start: 'top bottom',
      end: () => `top top+=${parseFloat(getComputedStyle(next).top) || 0}`,
      scrub: true,
      onUpdate: (self) => {
        if (getComputedStyle(card).position !== 'sticky') return;
        const st = stackStyle(self.progress);
        card.style.transform = `scale(${st.scale})`;
        card.style.filter = `brightness(${st.brightness})`;
      },
    });
  });

  // Statement: light words in reading order as the paragraph crosses the viewport.
  const words = splitStatement(doc);
  if (words.length) {
    ScrollTrigger.create({
      trigger: doc.querySelector('[data-reveal]')!,
      start: 'top 80%',
      end: 'bottom 40%',
      scrub: true,
      onUpdate: (self) => {
        const n = litWordCount(self.progress, words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < n));
      },
    });
  }

  // Count-ups: once, when half in view.
  doc.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const t0 = performance.now();
        const step = (now: number) => {
          el.textContent = String(countAt(to, now - t0));
          if (now - t0 < 1400) win.requestAnimationFrame(step);
        };
        win.requestAnimationFrame(step);
      },
    });
  });

  return () => {
    gsap.ticker.remove(tick);
    ScrollTrigger.getAll().forEach((t) => t.kill());
    lenis.destroy();
  };
}

export function initMotion(win: Window = window, opts: { scroll?: boolean } = {}): { reduced: boolean; teardown(): void } {
  const doc = win.document;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stopNav = compactNav(win);
  const stopVideos = setupVideos(doc, !reduced);
  const stopDemos = initDemos(doc, reduced);
  let stopScroll = () => {};
  if (!reduced && opts.scroll) {
    void initScroll(win).then((stop) => { stopScroll = stop; });
  }
  return { reduced, teardown() { stopNav(); stopVideos(); stopDemos(); stopScroll(); } };
}

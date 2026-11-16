// Scroll motion for eliooo.org. Every page reads completely without this script;
// it only adds smooth scroll, the stack scale/dim, the statement reveal, count-ups and video play/pause.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

function showPlayButtons(doc: Document) {
  doc.querySelectorAll<HTMLButtonElement>('.e-video__play').forEach((btn) => {
    const video = btn.parentElement?.querySelector('video');
    if (!video) return;
    btn.hidden = false;
    btn.addEventListener('click', () => {
      if (video.paused) void video.play();
      else video.pause();
    });
  });
}

function splitStatement(doc: Document): HTMLElement[] {
  const p = doc.querySelector<HTMLElement>('[data-reveal]');
  if (!p) return [];
  const text = p.textContent?.trim() ?? '';
  p.setAttribute('aria-label', text);
  p.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="w" aria-hidden="true">${w.replace(/</g, '&lt;')}</span>`)
    .join(' ');
  return [...p.querySelectorAll<HTMLElement>('.w')];
}

export function initMotion(win: Window = window): { reduced: boolean; teardown(): void } {
  const doc = win.document;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stopNav = compactNav(win);

  if (reduced) {
    showPlayButtons(doc);
    return { reduced, teardown: stopNav };
  }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  doc.documentElement.classList.add('lenis');

  // Stack: as the next card slides over a card, the covered one scales down and dims.
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
        const s = stackStyle(self.progress);
        card.style.transform = `scale(${s.scale})`;
        card.style.filter = `brightness(${s.brightness})`;
      },
    });
  });

  // Statement: light words in reading order as the paragraph crosses the viewport.
  const words = splitStatement(doc);
  if (words.length) {
    ScrollTrigger.create({
      trigger: words[0].parentElement!,
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

  // Videos: play when a quarter is in view, pause when out.
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) void v.play().catch(() => {});
      else v.pause();
    }),
    { threshold: 0.25 },
  );
  doc.querySelectorAll<HTMLVideoElement>('video[data-autoplay]').forEach((v) => io.observe(v));

  return {
    reduced,
    teardown() {
      stopNav();
      io.disconnect();
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
    },
  };
}

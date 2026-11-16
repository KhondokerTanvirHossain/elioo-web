// Live product demos inside the cards. Each demo ships its finished frame in the HTML, so no-JS and
// reduced-motion visitors see the end state. With motion, a demo resets and replays its steps when it
// comes into view, and again every 14 s while visible.
//
// Markup contract, inside an element with [data-demo]:
//   [data-seq]                 a step, in DOM order. Revealed by adding .on (CSS hides it only while .armed).
//   [data-seq][data-type]      typed out: its final text is kept and re-typed grapheme by grapheme.
//   [data-seq][data-roll="a"]  counts from a to its final number (one decimal).
//   [data-delay="ms"]          pause before this step (default 350).
//   [data-order="n"]           run order when it differs from page order (lower first).
//   [data-speaking]            while this step types, the demo root gets .speaking.
// The root gets .on when a run starts (used for slow scene motion such as Bolo's sun).

const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('bn', { granularity: 'grapheme' }) : null;

export function graphemes(text: string): string[] {
  return seg ? [...seg.segment(text)].map((s) => s.segment) : [...text];
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function typeInto(el: HTMLElement, text: string, speed: number, alive: () => boolean): Promise<boolean> {
  el.textContent = '';
  for (const g of graphemes(text)) {
    if (!alive()) return false;
    el.textContent += g;
    await wait(g === ' ' ? speed * 1.6 : speed);
  }
  return alive();
}

async function roll(el: HTMLElement, from: number, to: number, alive: () => boolean): Promise<boolean> {
  const t0 = performance.now();
  const dur = 900;
  while (alive()) {
    const p = Math.min(1, (performance.now() - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (to - from) * e).toFixed(1);
    if (p >= 1) return true;
    await wait(16);
  }
  return false;
}

interface Step { el: HTMLElement; text?: string; roll?: [number, number]; delay: number; speaking: boolean }

export function stepOrder(root: HTMLElement): HTMLElement[] {
  const els = [...root.querySelectorAll<HTMLElement>('[data-seq]')];
  const key = (el: HTMLElement, i: number) => (el.dataset.order ? Number(el.dataset.order) : 1000 + i);
  return els.map((el, i) => ({ el, k: key(el, i) })).sort((a, b) => a.k - b.k).map((x) => x.el);
}

function stepsOf(root: HTMLElement): Step[] {
  return stepOrder(root).map((el) => ({
    el,
    text: el.hasAttribute('data-type') ? (el.textContent ?? '') : undefined,
    roll: el.dataset.roll ? [Number(el.dataset.roll), Number(el.textContent)] : undefined,
    delay: Number(el.dataset.delay ?? 350),
    speaking: el.hasAttribute('data-speaking'),
  }));
}

export function initDemos(doc: Document, reduced: boolean): () => void {
  const roots = [...doc.querySelectorAll<HTMLElement>('[data-demo]')];
  if (reduced || roots.length === 0 || typeof IntersectionObserver === 'undefined') return () => {};

  const runs = new Map<HTMLElement, number>();
  const players = new Map<HTMLElement, () => Promise<void>>();

  for (const root of roots) {
    const steps = stepsOf(root);
    const reset = () => {
      root.classList.remove('on', 'speaking');
      for (const s of steps) {
        s.el.classList.remove('on');
        if (s.text !== undefined) s.el.textContent = '';
        if (s.roll) s.el.textContent = s.roll[0].toFixed(1);
      }
    };
    const play = async () => {
      const run = (runs.get(root) ?? 0) + 1;
      runs.set(root, run);
      const alive = () => runs.get(root) === run;
      reset();
      await wait(60);
      root.classList.add('on');
      for (const s of steps) {
        await wait(s.delay);
        if (!alive()) return;
        s.el.classList.add('on');
        if (s.text !== undefined) {
          if (s.speaking) root.classList.add('speaking');
          const ok = await typeInto(s.el, s.text, s.speaking ? 55 : 40, alive);
          root.classList.remove('speaking');
          if (!ok) return;
        }
        if (s.roll && !(await roll(s.el, s.roll[0], s.roll[1], alive))) return;
      }
    };
    root.classList.add('armed');
    reset();
    players.set(root, play);
  }

  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const root = e.target as HTMLElement;
      if (e.isIntersecting) {
        if (!visible.has(root)) void players.get(root)?.();
        visible.add(root);
      } else {
        visible.delete(root);
      }
    }),
    { threshold: 0.4 },
  );
  roots.forEach((r) => io.observe(r));
  const timer = setInterval(() => visible.forEach((r) => void players.get(r)?.()), 14000);
  return () => { io.disconnect(); clearInterval(timer); };
}

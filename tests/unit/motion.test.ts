import { vi } from 'vitest';
import { parseHTML } from 'linkedom';

const lenisCtor = vi.fn();
vi.mock('lenis', () => ({ default: class { constructor() { lenisCtor(); } raf() {} on() {} destroy() {} } }));

import { litWordCount, stackStyle, countAt, initMotion, splitStatement, setupVideos } from '../../src/lib/motion';

test('litWordCount clamps and rounds', () => {
  expect(litWordCount(0, 20)).toBe(0);
  expect(litWordCount(0.5, 20)).toBe(10);
  expect(litWordCount(2, 20)).toBe(20);
  expect(litWordCount(-1, 20)).toBe(0);
});
test('stackStyle runs from untouched to 0.94 scale and 60% brightness', () => {
  expect(stackStyle(0)).toEqual({ scale: 1, brightness: 1 });
  expect(stackStyle(1)).toEqual({ scale: 0.94, brightness: 0.6 });
  const mid = stackStyle(0.5);
  expect(mid.scale).toBeCloseTo(0.97);
});
test('countAt eases to the target and never overshoots', () => {
  expect(countAt(4, 0)).toBe(0);
  expect(countAt(4, 1400)).toBe(4);
  expect(countAt(4, 9999)).toBe(4);
  expect(countAt(100, 700)).toBeGreaterThan(50);
});

function fakeWindow(reduced: boolean) {
  const { document } = parseHTML(`<html><body>
    <header data-nav></header>
    <p class="e-statement" data-reveal>I build AI products.</p>
    <div class="e-video"><video data-autoplay></video><button class="e-video__play" hidden>Play</button></div>
  </body></html>`);
  const win = {
    document,
    matchMedia: (q: string) => ({ matches: reduced && q.includes('reduce'), addEventListener() {} }),
    scrollY: 0,
    addEventListener() {},
    requestAnimationFrame: () => 0,
  } as unknown as Window;
  return { win, document };
}

test('reduced motion: no smooth scroll, no word split, play buttons shown, videos stay paused', () => {
  lenisCtor.mockClear();
  const { win, document } = fakeWindow(true);
  const video = document.querySelector('video')! as unknown as HTMLVideoElement;
  const play = vi.fn();
  Object.assign(video, { play, pause: vi.fn() });
  const r = initMotion(win);
  expect(r.reduced).toBe(true);
  expect(lenisCtor).not.toHaveBeenCalled();
  expect(document.querySelectorAll('.e-statement .w').length).toBe(0);
  expect((document.querySelector('.e-video__play') as HTMLElement).hidden).toBe(false);
  expect(play).not.toHaveBeenCalled();
});

test('split statement keeps one readable copy for screen readers', () => {
  const { document } = parseHTML('<p class="e-statement" data-reveal>I build AI products.</p>');
  const words = splitStatement(document as unknown as Document);
  expect(words.length).toBe(4);
  const p = document.querySelector('.e-statement')!;
  expect(p.hasAttribute('aria-label')).toBe(false);
  expect(p.querySelector('.sr-only')?.textContent).toBe('I build AI products.');
  expect(p.querySelector('[aria-hidden="true"]')?.querySelectorAll('.w').length).toBe(4);
});
test('videos always get a working pause control and lose native controls once enhanced', () => {
  const { document } = parseHTML('<div class="e-video"><video data-autoplay controls></video><button class="e-video__play" hidden>Play</button></div>');
  const v = document.querySelector('video')! as unknown as HTMLVideoElement;
  let paused = false;
  Object.defineProperty(v, 'paused', { get: () => paused });
  Object.assign(v, { play: () => { paused = false; return Promise.resolve(); }, pause: () => { paused = true; } });
  setupVideos(document as unknown as Document, false);
  const btn = document.querySelector('.e-video__play') as HTMLButtonElement;
  expect(btn.hidden).toBe(false);
  expect(v.hasAttribute('controls')).toBe(false);
  btn.click();
  expect(paused).toBe(true);
  expect(btn.getAttribute('aria-pressed')).toBe('false');
  expect(btn.textContent).toContain('Play');
  btn.click();
  expect(paused).toBe(false);
  expect(btn.textContent).toContain('Pause');
});

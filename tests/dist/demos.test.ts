import { page } from './helpers';

const d = page('/');
const themes = ['medioo', 'bolo', 'finioo', 'drugs'];

test('each card leads with the worry, then the pitch', () => {
  for (const t of themes) {
    const card = d.querySelector(`.e-card--${t}`)!;
    expect(card.querySelector('.e-card__worry')?.textContent?.length).toBeGreaterThan(30);
  }
});
test('each card plays a live demo hidden from assistive tech, with one described sentence', () => {
  for (const t of themes) {
    const demo = d.querySelector(`.e-card--${t} [data-demo="${t}"]`)!;
    expect(demo).not.toBeNull();
    expect(demo.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(demo.querySelector('.sr-only')?.textContent?.length).toBeGreaterThan(20);
  }
});
test('the IntelliDrugs demo shows the real Napa + G Warfarin result', () => {
  const t = d.querySelector('[data-demo="drugs"]')!.textContent!;
  for (const s of ['Napa', 'G Warfarin', 'Moderate', 'Acetaminophen + Warfarin. Action: synergy', 'DDInter 2.0']) expect(t).toContain(s);
});
test('the final frame is in the HTML, so no-JS and reduced motion see the finished demo', () => {
  expect(d.querySelector('[data-demo="medioo"]')!.textContent).toContain('আমি ডাক্তার নই।');
  expect(d.querySelector('[data-demo="bolo"]')!.textContent).toContain('Oh nice, what was the bug doing?');
  expect(d.querySelector('[data-demo="finioo"]')!.textContent).toContain('8.4');
});
test('the opening headline speaks to friendly bots', () => {
  expect(d.querySelector('h1')?.textContent).toMatch(/Friendly bots/);
});

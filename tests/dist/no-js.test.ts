import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { page } from './helpers';

const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css')).map((f) => readFileSync(join('dist/_astro', f), 'utf8')).join('\n');

test('no content starts hidden: statement, cards and stats never begin at opacity 0', () => {
  for (const sel of ['.e-statement', '.e-card', '.e-stat__n']) {
    const rules = css.split('}').filter((r) => r.includes(sel));
    for (const r of rules) expect(r.replace(/\s/g, '')).not.toMatch(/opacity:0(?![.\d])/);
  }
});
test('the statement is not split into words in the HTML (JS does that)', () => {
  expect(page('/').querySelectorAll('.e-statement .w').length).toBe(0);
});
test('the motion script is loaded as a module', () => {
  const scripts = [...page('/').querySelectorAll('script[type="module"]')];
  expect(scripts.length).toBeGreaterThan(0);
});

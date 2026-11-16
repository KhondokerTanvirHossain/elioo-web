import { readFileSync } from 'node:fs';
const tokens = JSON.parse(readFileSync('design/tokens.json', 'utf8'));
const css = readFileSync('src/styles/tokens.css', 'utf8');
test('every colour token is a custom property with its exact value', () => {
  for (const t of tokens.color.tokens) {
    const v = typeof t.value === 'string' ? t.value : t.value.ink;
    const expected = v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v;
    expect(css).toContain(`--${t.name}: ${expected};`);
  }
});
test('spacing, radius, shadow, duration, easing and font families are emitted', () => {
  for (const fam of ['spacing', 'radius', 'shadow', 'duration', 'easing'])
    for (const t of tokens[fam].tokens) expect(css).toContain(`--${t.name}: ${t.value};`);
  for (const [k, v] of Object.entries(tokens.type.families)) expect(css).toContain(`--font-${k}: ${v};`);
});
test('first line marks the file as generated', () => {
  expect(css.split('\n')[0]).toBe('/* elioo — generated from design/tokens.json by scripts/build-tokens.mjs */');
});

// Generates src/styles/tokens.css from design/tokens.json (the elioo design system's tokens).
import { readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../design/tokens.json', import.meta.url), 'utf8'));
const theme = tokens.color.themes[0].id;
const value = (v) => {
  const raw = typeof v === 'string' ? v : v[theme];
  return raw.startsWith('{') ? `var(--${raw.slice(1, -1)})` : raw;
};
const lines = ['/* elioo — generated from design/tokens.json by scripts/build-tokens.mjs */', ':root {'];
for (const t of tokens.color.tokens) lines.push(`  --${t.name}: ${value(t.value)};`);
for (const fam of ['spacing', 'radius', 'shadow', 'duration', 'easing'])
  for (const t of tokens[fam].tokens) lines.push(`  --${t.name}: ${value(t.value)};`);
for (const [k, v] of Object.entries(tokens.type.families)) lines.push(`  --font-${k}: ${v};`);
lines.push('}', '');
writeFileSync(new URL('../src/styles/tokens.css', import.meta.url), lines.join('\n'));

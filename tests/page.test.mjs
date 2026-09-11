import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
export const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('document has title, viewport, charset', () => {
  assert.match(html, /<title>elioo<\/title>/);
  assert.match(html, /<meta charset="utf-8">/i);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
});

test('stylesheet defines every palette token from the spec', () => {
  const tokens = {
    '--bg': '#050B1E', '--bg2': '#0D1F4A', '--bg3': '#12285E',
    '--ink': '#EEF1FF', '--mute': '#A9B4E0', '--peri': '#A08CFF',
    '--peri2': '#D4C8FF', '--beam': '#9FE3FF', '--sun': '#FFD166',
    '--coral': '#FF7A85', '--mint': '#5CE8B8', '--line': '#26377A',
  };
  for (const [name, hex] of Object.entries(tokens)) {
    assert.match(css, new RegExp(`${name}:\\s*${hex}`, 'i'), `${name} should be ${hex}`);
  }
});

test('body paints its own background from a token', () => {
  assert.match(css, /body\s*{[^}]*background:[^;]*var\(--bg\)/s);
});

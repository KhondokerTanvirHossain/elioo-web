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

test('nav has wordmark and anchor links to every section', () => {
  assert.match(html, /<header class="nav">/);
  assert.match(html, /class="mark"/);
  for (const id of ['products', 'vision', 'founder', 'contact']) {
    assert.match(html, new RegExp(`href="#${id}"`), `nav should link to #${id}`);
  }
});

test('wordmark spells elioo with a planet on the i and two orb eyes', () => {
  assert.match(html, /<span class="mark"[^>]*>\s*<span class="m-el">el<\/span>/);
  assert.match(html, /class="m-planet"/);
  assert.match(html, /<span class="m-oo"[^>]*>\s*<i><\/i>\s*<i><\/i>\s*<\/span>/);
});

test('hero has headline, sub, two ctas and three bots', () => {
  assert.match(html, /<section id="top" class="hero">/);
  assert.match(html, /Little bots for the <span class="glow">big stuff<\/span> in life\./);
  assert.match(html, /elioo makes friendly AI companions for your health, your memory and your money\. From Dhaka, for everyone\./);
  assert.match(html, /href="mailto:k\.tanvir\.hossain@gmail\.com"[^>]*>Say hi</);
  assert.match(html, /href="#products"[^>]*>Meet the bots</);
  for (const b of ['bot-health', 'bot-ooo', 'bot-money']) {
    assert.match(html, new RegExp(`class="bot ${b}"`), `missing ${b}`);
  }
  assert.match(html, /<canvas id="stars"/);
});

test('motion stops under prefers-reduced-motion', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[^}]*\.bot[^}]*animation:\s*none/s);
});

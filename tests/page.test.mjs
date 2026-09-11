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

test('products section lists Baymax, Ooooo and Scrooge with status', () => {
  assert.match(html, /<section id="products" class="section">/);
  const cards = [
    ['Health', 'Baymax', 'Your personal healthcare buddy. App, web or WhatsApp.', 'Coming 2026'],
    ['Memory', 'Ooooo', 'Sits in every meeting, remembers everything, answers when asked.', 'In development'],
    ['Money', 'Scrooge', 'A money manager that actually nags you.', 'Idea stage'],
  ];
  for (const [cat, name, pitch, status] of cards) {
    assert.match(html, new RegExp(`<span class="card-cat[^"]*">[^<]*<i></i>${cat}</span>`), `${name} category`);
    assert.match(html, new RegExp(`<h3>${name}</h3>`), `${name} title`);
    assert.ok(html.includes(pitch), `${name} pitch`);
    assert.match(html, new RegExp(`<span class="soon">${status}</span>`), `${name} status`);
  }
});

test('vision, founder, contact and footer exist with required links', () => {
  assert.match(html, /<section id="vision" class="section">/);
  assert.match(html, /<h2>Why elioo<\/h2>/);
  assert.match(html, /<section id="founder" class="section">/);
  assert.match(html, /src="assets\/tanvir\.jpg"/);
  assert.match(html, /href="https:\/\/github\.com\/KhondokerTanvirHossain"/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/k-tanvir-hossain\/"/);
  assert.match(html, /<section id="contact" class="section contact">/);
  assert.match(html, /Waitlists open per product when each bot is ready\./);
  assert.match(html, /<footer class="footer">/);
  assert.match(html, /elioo · Dhaka · 2026/);
});

test('mute text on the mid-sky background meets WCAG AA (4.5:1)', () => {
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4));
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const ratio = (lum('#A9B4E0') + .05) / (lum('#0D1F4A') + .05);
  assert.ok(ratio >= 4.5, `contrast ${ratio.toFixed(2)} below 4.5`);
});

test('head carries favicon, canonical and social cards', () => {
  assert.match(html, /<link rel="icon" href="favicon\.svg" type="image\/svg\+xml">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/elioo\.org\/">/);
  assert.match(html, /<meta property="og:title" content="elioo">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/elioo\.org\/og\.png">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});

test('every section has a heading and every image has alt', () => {
  const sections = [...html.matchAll(/<section id="(\w+)"[\s\S]*?<\/section>/g)];
  assert.equal(sections.length, 5);
  for (const m of sections) assert.match(m[0], /<h[12]/, `section ${m[1]} lacks a heading`);
  for (const img of html.matchAll(/<img [^>]*>/g)) assert.match(img[0], /alt="/, 'img without alt');
});

test('no element sets a min-width wider than a phone', () => {
  for (const m of css.matchAll(/min-width:\s*(\d+)px/g)) assert.ok(Number(m[1]) <= 400, `min-width ${m[1]}px`);
});

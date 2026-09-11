# elioo.org Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page static site for elioo.org on Vercel that presents the elioo studio, its three planned bots, its vision, and the founder, in the approved "playful bots in Elio's night sky" visual direction.

**Architecture:** One `index.html` with semantic sections, one `styles.css` holding a token block and section styles, one `main.js` for the canvas star field. No framework, no build step. Tests are a Node test file that reads the HTML and CSS as text and asserts structure, copy and color contrast, plus `html-validate` for markup validity.

**Tech Stack:** HTML5, CSS3, vanilla ES2020 JS, Node 20 `node:test` for tests, `html-validate` via npx, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-09-12-elioo-landing-design.md`

## Global Constraints

- Files at repo root: `index.html`, `styles.css`, `main.js`, `favicon.svg`, `og.png`, `vercel.json`, `robots.txt`. Assets under `assets/`.
- Fonts: Fredoka (600, 700) and Nunito (400, 600, 700, 800) from Google Fonts with `display=swap`. Fallback `system-ui, -apple-system, "Segoe UI", sans-serif`.
- Palette tokens exactly as in the spec table: `--bg #050B1E`, `--bg2 #0D1F4A`, `--bg3 #12285E`, `--ink #EEF1FF`, `--mute #A9B4E0`, `--peri #A08CFF`, `--peri2 #D4C8FF`, `--beam #9FE3FF`, `--sun #FFD166`, `--coral #FF7A85`, `--mint #5CE8B8`, `--line #26377A`.
- Single dark theme. `body` sets `background` explicitly.
- Section ids in order: `top`, `products`, `vision`, `founder`, `contact`.
- Contact email `k.tanvir.hossain@gmail.com`. GitHub `https://github.com/KhondokerTanvirHossain`. LinkedIn `https://www.linkedin.com/in/k-tanvir-hossain/`.
- Product names: Baymax, Ooooo, Scrooge.
- All motion stops under `prefers-reduced-motion: reduce`.
- Works at 400px width with no horizontal scroll. Side gutter at least 16px.
- Commit after every task with the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tests/page.test.mjs`
- Create: `index.html` (skeleton only)
- Create: `styles.css` (tokens only)
- Create: `vercel.json`
- Create: `robots.txt`

**Interfaces:**
- Produces: `tests/page.test.mjs` exports nothing; it reads `index.html` and `styles.css` from repo root. Later tasks append `test()` blocks to this file.
- Produces: `npm test` runs `node --test tests/`. `npm run lint` runs `html-validate index.html`.

- [ ] **Step 1: Write package.json and .gitignore**

`package.json`:
```json
{
  "name": "elioo-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "lint": "npx --yes html-validate@8 index.html",
    "check": "npm run lint && npm test",
    "serve": "python3 -m http.server 4173"
  }
}
```

`.gitignore`:
```
node_modules/
.vercel/
.DS_Store
```

- [ ] **Step 2: Write the failing test**

`tests/page.test.mjs`:
```js
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL, `ENOENT` reading `index.html`.

- [ ] **Step 4: Write the skeleton HTML and token CSS**

`index.html`:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>elioo</title>
  <meta name="description" content="elioo is a studio in Dhaka building friendly AI companions for your health, your memory and your money.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
  </main>
  <script src="main.js" defer></script>
</body>
</html>
```

`styles.css`:
```css
:root {
  --bg: #050B1E;
  --bg2: #0D1F4A;
  --bg3: #12285E;
  --ink: #EEF1FF;
  --mute: #A9B4E0;
  --peri: #A08CFF;
  --peri2: #D4C8FF;
  --beam: #9FE3FF;
  --sun: #FFD166;
  --coral: #FF7A85;
  --mint: #5CE8B8;
  --line: #26377A;

  --display: "Fredoka", system-ui, -apple-system, "Segoe UI", sans-serif;
  --body: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;

  --gutter: clamp(16px, 4vw, 40px);
  --max: 1180px;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

body {
  margin: 0;
  color: var(--ink);
  font: 400 16px/1.55 var(--body);
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg2) 55%, var(--bg3) 100%) fixed, var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
}

a { color: inherit; }
:focus-visible { outline: 2px solid var(--beam); outline-offset: 3px; border-radius: 4px; }

.wrap { max-width: var(--max); margin: 0 auto; padding-inline: var(--gutter); }
```

`main.js` (empty for now, so the script tag resolves):
```js
// star field added in Task 3
```

- [ ] **Step 5: Write vercel.json and robots.txt**

`vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

`robots.txt`:
```
User-agent: *
Allow: /
```

- [ ] **Step 6: Run tests and lint**

Run: `npm run check`
Expected: html-validate reports 0 errors. 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore tests/page.test.mjs index.html styles.css main.js vercel.json robots.txt
git commit -m "feat: scaffold static site with tokens and test harness

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Nav and wordmark

**Files:**
- Modify: `index.html` (inside `<body>`, before `<main>`)
- Modify: `styles.css` (append)
- Modify: `tests/page.test.mjs` (append)

**Interfaces:**
- Produces: a reusable wordmark markup block `<span class="mark">…</span>` used again in the footer (Task 5). Exact markup below.

- [ ] **Step 1: Write the failing test**

Append to `tests/page.test.mjs`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL on the two new tests.

- [ ] **Step 3: Add nav markup**

In `index.html`, replace `<body>` opening through `<main>` with:
```html
<body>
  <header class="nav">
    <div class="wrap nav-row">
      <a class="mark-link" href="#top" aria-label="elioo home">
        <span class="mark" aria-hidden="true"><span class="m-el">el</span><span class="m-i">ı<b class="m-planet"><u></u></b></span><span class="m-oo"><i></i><i></i></span></span>
      </a>
      <nav aria-label="Sections">
        <ul class="nav-links">
          <li><a href="#products">Products</a></li>
          <li><a href="#vision">Vision</a></li>
          <li><a href="#founder">Founder</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a class="btn btn-small" href="mailto:k.tanvir.hossain@gmail.com">Say hi</a>
      </nav>
    </div>
  </header>
  <main>
```

- [ ] **Step 4: Add nav and wordmark styles**

Append to `styles.css`:
```css
/* ---------- nav ---------- */
.nav {
  position: sticky; top: 0; z-index: 10;
  background: rgba(5, 11, 30, .55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(38, 55, 122, .5);
}
.nav-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-block: 14px; }
.nav nav { display: flex; align-items: center; gap: 24px; }
.nav-links { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0; font-weight: 700; font-size: 15px; color: var(--mute); }
.nav-links a { text-decoration: none; }
.nav-links a:hover { color: var(--ink); }
.mark-link { text-decoration: none; display: inline-flex; }

/* ---------- wordmark ---------- */
.mark {
  font: 700 30px/1 var(--display);
  letter-spacing: -.02em;
  display: inline-flex; align-items: baseline;
  background: linear-gradient(180deg, var(--peri2), var(--peri));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 10px rgba(160, 140, 255, .55));
}
.m-i { position: relative; display: inline-block; }
.m-planet {
  position: absolute; left: 50%; top: -.28em;
  width: .42em; height: .42em; transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFE9A8, var(--sun) 55%, #C98A1E);
  box-shadow: 0 0 10px rgba(255, 209, 102, .7);
}
.m-planet u {
  position: absolute; left: 50%; top: 50%;
  width: .8em; height: .3em;
  border: 2px solid var(--peri2); border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-18deg);
  box-shadow: 0 0 6px rgba(160, 140, 255, .7);
}
.m-oo { display: inline-flex; gap: 2px; align-items: center; margin-left: 2px; transform: translateY(1px); }
.m-oo i {
  display: inline-block; width: .62em; height: .62em; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff, var(--beam) 45%, var(--peri) 100%);
  box-shadow: 0 0 10px var(--beam), 0 0 22px rgba(159, 227, 255, .5);
}
.mark.small { font-size: 22px; }

/* ---------- buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 13px 22px; border-radius: 999px;
  font: 700 15px/1 var(--body); text-decoration: none;
  border: 2px solid var(--line); background: rgba(255, 255, 255, .04); color: var(--ink);
  transition: transform .15s ease, box-shadow .15s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary {
  background: linear-gradient(180deg, var(--peri2), var(--peri));
  color: #0B1030; border-color: transparent;
  box-shadow: 0 0 24px rgba(160, 140, 255, .55);
}
.btn-primary:hover { box-shadow: 0 0 32px rgba(160, 140, 255, .75); }
.btn-small { padding: 9px 16px; font-size: 14px; }

@media (max-width: 760px) {
  .nav-links { display: none; }
}
```

- [ ] **Step 5: Run tests and lint**

Run: `npm run check`
Expected: 0 lint errors, 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css tests/page.test.mjs
git commit -m "feat: sticky nav with elioo wordmark

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Hero, bots, light beam and star field

**Files:**
- Modify: `index.html` (inside `<main>`)
- Modify: `styles.css` (append)
- Create: `main.js` (replace placeholder)
- Modify: `tests/page.test.mjs` (append)

**Interfaces:**
- Produces: `.bot` markup with modifier classes `bot-health`, `bot-ooo`, `bot-money`. Product cards in Task 4 reuse the same three color names.
- Produces: `main.js` defines `drawStars(canvas)` and calls it on `#stars`.

- [ ] **Step 1: Write the failing test**

Append to `tests/page.test.mjs`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL on the two new tests.

- [ ] **Step 3: Add hero markup**

Inside `<main>` in `index.html`:
```html
    <section id="top" class="hero">
      <div class="beam" aria-hidden="true"></div>
      <canvas id="stars" class="stars" aria-hidden="true"></canvas>
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <h1>Little bots for the <span class="glow">big stuff</span> in life.</h1>
          <p class="sub">elioo makes friendly AI companions for your health, your memory and your money. From Dhaka, for everyone.</p>
          <div class="cta">
            <a class="btn btn-primary" href="mailto:k.tanvir.hossain@gmail.com">Say hi</a>
            <a class="btn" href="#products">Meet the bots</a>
          </div>
        </div>
        <div class="bots" aria-hidden="true">
          <div class="bot bot-health"><i class="eye eye-l"></i><i class="eye eye-r"></i><i class="mouth"></i></div>
          <div class="bot bot-ooo"><i class="eye eye-l"></i><i class="eye eye-r"></i><i class="mouth"></i></div>
          <div class="bot bot-money"><i class="eye eye-l"></i><i class="eye eye-r"></i><i class="mouth"></i></div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Add hero styles**

Append to `styles.css`:
```css
/* ---------- hero ---------- */
.hero { position: relative; overflow: hidden; padding-block: clamp(40px, 8vw, 96px) clamp(32px, 6vw, 72px); }
.beam {
  position: absolute; top: -30%; right: -10%; width: 60%; height: 170%;
  background: linear-gradient(200deg, rgba(207, 244, 255, .5), rgba(159, 227, 255, .12) 40%, transparent 70%);
  transform: rotate(18deg); filter: blur(24px); pointer-events: none;
}
.stars { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .75; }
.hero-grid { position: relative; display: grid; grid-template-columns: 1.05fr .95fr; gap: 32px; align-items: center; }

h1 {
  font: 700 clamp(38px, 5.2vw, 64px)/1.04 var(--display);
  margin: 0 0 16px; text-wrap: balance;
  text-shadow: 0 2px 24px rgba(160, 140, 255, .25);
}
.glow { color: var(--peri2); text-shadow: 0 0 18px rgba(160, 140, 255, .8); }
.sub { color: var(--mute); font-size: 18px; font-weight: 600; max-width: 42ch; margin: 0 0 26px; }
.cta { display: flex; flex-wrap: wrap; gap: 12px; }

.bots { display: flex; gap: 18px; justify-content: center; align-items: flex-end; min-height: 220px; }
.bot { width: 120px; aspect-ratio: 1; border-radius: 34px; position: relative; animation: bob 2.8s ease-in-out infinite; }
.bot-ooo { width: 150px; border-radius: 50%; animation-delay: .4s; }
.bot-money { animation-delay: .8s; }
.eye {
  position: absolute; top: 38%; width: 16%; aspect-ratio: 1; border-radius: 50%;
  background: #fff; box-shadow: 0 0 10px #fff, 0 0 20px var(--beam);
}
.eye-l { left: 28%; } .eye-r { right: 28%; }
.mouth {
  position: absolute; left: 50%; top: 62%; width: 34%; height: 12%;
  border: 3px solid rgba(255, 255, 255, .85); border-top: 0;
  border-radius: 0 0 40px 40px; transform: translateX(-50%);
}
.bot-health { background: radial-gradient(circle at 35% 30%, #FFB3B9, var(--coral) 60%, #B8404E); box-shadow: 0 0 30px rgba(255, 122, 133, .45); }
.bot-ooo { background: radial-gradient(circle at 35% 30%, #E6DDFF, var(--peri) 55%, #4B3BB5); box-shadow: 0 0 40px rgba(160, 140, 255, .6); }
.bot-money { background: radial-gradient(circle at 35% 30%, #C6FFEB, var(--mint) 60%, #1F9C74); box-shadow: 0 0 30px rgba(92, 232, 184, .45); }

@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

@media (prefers-reduced-motion: reduce) {
  .bot { animation: none; }
}

@media (max-width: 760px) {
  .hero-grid { grid-template-columns: 1fr; }
  .bots { min-height: 160px; order: -1; }
  .bot { width: 90px; }
  .bot-ooo { width: 110px; }
}
```

- [ ] **Step 5: Write the star field**

Replace `main.js`:
```js
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pts = [];
  let t = 0;

  function size() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.floor(r.width);
    canvas.height = Math.floor(r.height);
    pts = [];
    const n = Math.round((canvas.width * canvas.height) / 5200);
    for (let i = 0; i < n; i++) {
      pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.4 + .3, p: Math.random() * 6.28 });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      const a = .45 + .55 * Math.abs(Math.sin(t + p.p));
      ctx.fillStyle = 'rgba(230,236,255,' + a + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
    if (!reduce) { t += .02; requestAnimationFrame(draw); }
  }

  size();
  draw();
  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { size(); if (reduce) draw(); });
  });
})();
```

- [ ] **Step 6: Run tests and lint, then look once**

Run: `npm run check`
Expected: 0 lint errors, 7 tests pass.

Run: `npm run serve` in the background and open `http://localhost:4173` in a browser. Confirm: beam top right, stars twinkle, three bots bob, headline wraps cleanly at 400px.

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css main.js tests/page.test.mjs
git commit -m "feat: hero with glowing bots, light beam and star field

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Products section

**Files:**
- Modify: `index.html` (append inside `<main>`)
- Modify: `styles.css` (append)
- Modify: `tests/page.test.mjs` (append)

**Interfaces:**
- Consumes: color names `health`, `ooo`, `money` from Task 3.
- Produces: `.section` and `.section-head` layout used by Tasks 5.

- [ ] **Step 1: Write the failing test**

Append to `tests/page.test.mjs`:
```js
test('products section lists Baymax, Ooooo and Scrooge with status', () => {
  assert.match(html, /<section id="products" class="section">/);
  const cards = [
    ['Health', 'Baymax', 'Your personal healthcare buddy. App, web or WhatsApp.', 'Coming 2026'],
    ['Memory', 'Ooooo', 'Sits in every meeting, remembers everything, answers when asked.', 'In development'],
    ['Money', 'Scrooge', 'A money manager that actually nags you.', 'Idea stage'],
  ];
  for (const [cat, name, pitch, status] of cards) {
    assert.match(html, new RegExp(`<span class="card-cat[^"]*">[^<]*${cat}</span>`), `${name} category`);
    assert.match(html, new RegExp(`<h3>${name}</h3>`), `${name} title`);
    assert.ok(html.includes(pitch), `${name} pitch`);
    assert.match(html, new RegExp(`<span class="soon">${status}</span>`), `${name} status`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL on the new test.

- [ ] **Step 3: Add products markup**

Append inside `<main>` after the hero:
```html
    <section id="products" class="section">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Products</p>
          <h2>Three bots. One worry each.</h2>
        </div>
        <div class="cards">
          <article class="card card-health">
            <span class="card-cat"><i></i>Health</span>
            <h3>Baymax</h3>
            <p>Your personal healthcare buddy. App, web or WhatsApp.</p>
            <span class="soon">Coming 2026</span>
          </article>
          <article class="card card-ooo">
            <span class="card-cat"><i></i>Memory</span>
            <h3>Ooooo</h3>
            <p>Sits in every meeting, remembers everything, answers when asked.</p>
            <span class="soon">In development</span>
          </article>
          <article class="card card-money">
            <span class="card-cat"><i></i>Money</span>
            <h3>Scrooge</h3>
            <p>A money manager that actually nags you.</p>
            <span class="soon">Idea stage</span>
          </article>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Add section and card styles**

Append to `styles.css`:
```css
/* ---------- sections ---------- */
.section { padding-block: clamp(48px, 7vw, 88px); }
.section-head { margin-bottom: 28px; max-width: 60ch; }
.eyebrow { margin: 0 0 8px; font: 800 12px/1 var(--body); letter-spacing: .14em; text-transform: uppercase; color: var(--beam); }
h2 { margin: 0; font: 700 clamp(28px, 3.6vw, 42px)/1.1 var(--display); text-wrap: balance; }

/* ---------- product cards ---------- */
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card {
  border: 1px solid var(--line); border-radius: 20px; padding: 22px;
  background: rgba(13, 31, 74, .55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; flex-direction: column; gap: 6px;
}
.card-cat { display: flex; align-items: center; gap: 8px; font: 800 11px/1 var(--body); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); margin-bottom: 8px; }
.card-cat i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.card-health .card-cat i { background: var(--coral); box-shadow: 0 0 8px var(--coral); }
.card-ooo .card-cat i { background: var(--peri); box-shadow: 0 0 8px var(--peri); }
.card-money .card-cat i { background: var(--mint); box-shadow: 0 0 8px var(--mint); }
.card h3 { margin: 0; font: 600 22px/1.2 var(--display); }
.card p { margin: 0; color: var(--mute); font-size: 15px; font-weight: 600; }
.soon {
  align-self: flex-start; margin-top: 10px;
  font: 800 11px/1 var(--body); letter-spacing: .08em; text-transform: uppercase;
  color: var(--beam); border: 1px solid rgba(159, 227, 255, .4); padding: 6px 10px; border-radius: 999px;
}

@media (max-width: 760px) {
  .cards { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Run tests and lint**

Run: `npm run check`
Expected: 0 lint errors, 8 tests pass.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css tests/page.test.mjs
git commit -m "feat: products section with three bot cards

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Vision, founder, contact and footer

**Files:**
- Modify: `index.html` (append inside `<main>` and after it)
- Modify: `styles.css` (append)
- Modify: `tests/page.test.mjs` (append)
- Create: `assets/.gitkeep`

**Interfaces:**
- Consumes: `.section`, `.section-head`, `.eyebrow`, `h2` from Task 4; `.mark` markup from Task 2; `.btn` from Task 2.
- Produces: `assets/tanvir.jpg` is the expected photo path. The `<img>` has `onerror` that swaps in the orb fallback.

- [ ] **Step 1: Write the failing test**

Append to `tests/page.test.mjs`:
```js
test('vision, founder, contact and footer exist with required links', () => {
  assert.match(html, /<section id="vision" class="section">/);
  assert.match(html, /<h2>Why elioo<\/h2>/);
  assert.match(html, /<section id="founder" class="section">/);
  assert.match(html, /src="assets\/tanvir\.jpg"/);
  assert.match(html, /href="https:\/\/github\.com\/KhondokerTanvirHossain"/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/k-tanvir-hossain\/"/);
  assert.match(html, /<section id="contact" class="section">/);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL on the first new test. The contrast test passes already (ratio is about 8.9).

- [ ] **Step 3: Add vision, founder, contact markup inside `<main>`, footer after it**

Append inside `<main>` after products:
```html
    <section id="vision" class="section">
      <div class="wrap vision-grid">
        <div class="section-head">
          <p class="eyebrow">Vision</p>
          <h2>Why elioo</h2>
        </div>
        <div class="prose">
          <p>Most of us carry a phone and a thousand small worries. Did I take that pill. What did the doctor actually say. Where did the money go this month.</p>
          <p>elioo builds small, friendly AI companions that take one worry each and hold it well. They live where you already are: WhatsApp, the browser, your meetings. They remember, they nag gently, and they never pretend to be a doctor or a bank.</p>
          <p>This is a studio in Dhaka building for the next billion phones, one bot at a time.</p>
        </div>
      </div>
    </section>

    <section id="founder" class="section">
      <div class="wrap founder-row">
        <div class="avatar">
          <img src="assets/tanvir.jpg" alt="Tanvir Hossain" width="120" height="120" onerror="this.parentElement.classList.add('avatar-fallback'); this.remove();">
          <span class="avatar-orb" aria-hidden="true"></span>
        </div>
        <div>
          <p class="eyebrow">Founder</p>
          <h2>Tanvir Hossain</h2>
          <p class="founder-line">Senior software engineer in Dhaka. Years of building banking, government and healthcare systems. Now building elioo.</p>
          <p class="links">
            <a href="https://github.com/KhondokerTanvirHossain" rel="me noopener" target="_blank">GitHub</a>
            <a href="https://www.linkedin.com/in/k-tanvir-hossain/" rel="me noopener" target="_blank">LinkedIn</a>
          </p>
        </div>
      </div>
    </section>

    <section id="contact" class="section contact">
      <div class="wrap">
        <p class="eyebrow">Contact</p>
        <h2>Say hi</h2>
        <p class="sub">Building something in health, memory or money? Want to compare notes? One email away.</p>
        <div class="cta">
          <a class="btn btn-primary" href="mailto:k.tanvir.hossain@gmail.com">k.tanvir.hossain@gmail.com</a>
        </div>
        <p class="note">Waitlists open per product when each bot is ready.</p>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap footer-row">
      <span class="mark small" aria-hidden="true"><span class="m-el">el</span><span class="m-i">ı<b class="m-planet"><u></u></b></span><span class="m-oo"><i></i><i></i></span></span>
      <span class="footer-text">elioo · Dhaka · 2026</span>
      <a class="footer-link" href="https://github.com/KhondokerTanvirHossain/elioo-web" rel="noopener" target="_blank">Source</a>
    </div>
  </footer>
```

Create empty `assets/.gitkeep`.

- [ ] **Step 4: Add styles**

Append to `styles.css`:
```css
/* ---------- vision ---------- */
.vision-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 32px; align-items: start; }
.prose { max-width: 62ch; font-size: 17px; font-weight: 600; color: var(--mute); }
.prose p { margin: 0 0 16px; }
.prose p:last-child { margin-bottom: 0; color: var(--ink); }

/* ---------- founder ---------- */
.founder-row { display: flex; gap: 28px; align-items: center; }
.avatar { position: relative; width: 120px; height: 120px; flex: 0 0 120px; border-radius: 50%; box-shadow: 0 0 0 3px var(--peri), 0 0 28px rgba(160, 140, 255, .55); overflow: hidden; background: var(--bg2); }
.avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.avatar-orb { display: none; position: absolute; inset: 18%; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff, var(--beam) 45%, var(--peri) 100%); box-shadow: 0 0 20px var(--beam); }
.avatar-fallback .avatar-orb { display: block; }
.founder-line { margin: 10px 0 12px; color: var(--mute); font-weight: 600; max-width: 52ch; }
.links { display: flex; gap: 18px; margin: 0; font-weight: 800; }
.links a { color: var(--peri2); }

/* ---------- contact ---------- */
.contact .sub { margin-top: 10px; }
.note { margin: 18px 0 0; color: var(--mute); font-size: 14px; font-weight: 600; }

/* ---------- footer ---------- */
.footer { border-top: 1px solid rgba(38, 55, 122, .5); padding-block: 24px; }
.footer-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--mute); font-size: 14px; font-weight: 600; }
.footer-link { color: var(--mute); }

@media (max-width: 760px) {
  .vision-grid { grid-template-columns: 1fr; }
  .founder-row { flex-direction: column; align-items: flex-start; }
}
```

- [ ] **Step 5: Run tests and lint**

Run: `npm run check`
Expected: 0 lint errors, 10 tests pass. If html-validate flags the inline `onerror`, add a `.htmlvalidate.json` at root:
```json
{ "extends": ["html-validate:recommended"], "rules": { "no-inline-style": "off", "attribute-boolean-style": "off" } }
```

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css tests/page.test.mjs assets/.gitkeep
git commit -m "feat: vision, founder, contact and footer sections

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Favicon, Open Graph image and social meta

**Files:**
- Create: `favicon.svg`
- Create: `og.html` (source for the screenshot, kept in repo)
- Create: `og.png`
- Modify: `index.html` `<head>`
- Modify: `tests/page.test.mjs` (append)

**Interfaces:**
- Produces: `og.png` 1200x630 at repo root, referenced by absolute URL `https://elioo.org/og.png`.

- [ ] **Step 1: Write the failing test**

Append to `tests/page.test.mjs`:
```js
test('head carries favicon, canonical and social cards', () => {
  assert.match(html, /<link rel="icon" href="favicon\.svg" type="image\/svg\+xml">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/elioo\.org\/">/);
  assert.match(html, /<meta property="og:title" content="elioo">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/elioo\.org\/og\.png">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL on the new test.

- [ ] **Step 3: Write favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="g" cx=".4" cy=".35" r=".7">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset=".45" stop-color="#9FE3FF"/>
      <stop offset="1" stop-color="#A08CFF"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#050B1E"/>
  <circle cx="22" cy="32" r="11" fill="url(#g)"/>
  <circle cx="44" cy="32" r="11" fill="url(#g)"/>
</svg>
```

- [ ] **Step 4: Add head meta**

Insert into `<head>` after the description meta:
```html
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="https://elioo.org/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://elioo.org/">
  <meta property="og:title" content="elioo">
  <meta property="og:description" content="Friendly AI companions for your health, your memory and your money. From Dhaka, for everyone.">
  <meta property="og:image" content="https://elioo.org/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#050B1E">
```

- [ ] **Step 5: Write og.html and capture og.png**

`og.html` (1200x630 canvas reusing the site styles):
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>og</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Nunito:wght@700&display=swap">
  <link rel="stylesheet" href="styles.css">
  <style>
    html, body { width: 1200px; height: 630px; overflow: hidden; }
    body { background: linear-gradient(180deg, var(--bg), var(--bg2) 60%, var(--bg3)); display: grid; place-items: center; }
    .og { display: grid; gap: 22px; text-align: center; }
    .mark { font-size: 140px; justify-self: center; }
    .tag { font: 700 30px/1.3 var(--body); color: var(--mute); }
  </style>
</head>
<body>
  <div class="beam" aria-hidden="true"></div>
  <div class="og">
    <span class="mark" aria-hidden="true"><span class="m-el">el</span><span class="m-i">ı<b class="m-planet"><u></u></b></span><span class="m-oo"><i></i><i></i></span></span>
    <div class="tag">Little bots for the big stuff in life.</div>
  </div>
</body>
</html>
```

Capture: run `npm run serve`, then with the browser tool open `http://localhost:4173/og.html`, resize the page to 1200x630, wait for fonts, screenshot to `og.png` at repo root. If no browser tool is available, run:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot=og.png http://localhost:4173/og.html
```

- [ ] **Step 6: Run tests and lint**

Run: `npm run check`
Expected: 0 lint errors, 11 tests pass. Confirm `og.png` is 1200x630 with `file og.png`.

- [ ] **Step 7: Commit**

```bash
git add favicon.svg og.html og.png index.html tests/page.test.mjs
git commit -m "feat: favicon, open graph image and social meta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Responsive and accessibility pass

**Files:**
- Modify: `styles.css` (only if a check fails)
- Modify: `tests/page.test.mjs` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/page.test.mjs`:
```js
test('every section has a heading and every image has alt', () => {
  const sections = [...html.matchAll(/<section id="(\w+)"[\s\S]*?<\/section>/g)];
  assert.equal(sections.length, 5);
  for (const m of sections) assert.match(m[0], /<h[12]/, `section ${m[1]} lacks a heading`);
  for (const img of html.matchAll(/<img [^>]*>/g)) assert.match(img[0], /alt="/, 'img without alt');
});

test('no element sets a min-width wider than a phone', () => {
  for (const m of css.matchAll(/min-width:\s*(\d+)px/g)) assert.ok(Number(m[1]) <= 400, `min-width ${m[1]}px`);
});
```

- [ ] **Step 2: Run test**

Run: `npm test`
Expected: PASS (these guard against regressions; if either fails, fix the markup or CSS, not the test).

- [ ] **Step 3: Manual viewport check**

Serve and view at 400px, 760px and 1280px widths. Checklist:
- No horizontal scrollbar at 400px.
- Bots sit above the headline at 400px, beside it at 1280px.
- Nav shows only wordmark and "Say hi" under 760px.
- Tab through the page: every link and button shows the cyan focus ring.
- Enable reduced motion in OS settings: stars freeze, bots stop bobbing.

- [ ] **Step 4: Lighthouse**

With the page served, run a Lighthouse audit (browser tool `lighthouse_audit` on `http://localhost:4173`, or Chrome DevTools). Targets: performance 90+, accessibility 95+, best practices 95+, SEO 95+. Fix anything under target before moving on. Typical fixes: add `width`/`height` to `<img>`, ensure `<html lang>`, ensure link text is descriptive.

- [ ] **Step 5: Commit**

```bash
git add styles.css tests/page.test.mjs
git commit -m "test: responsive and accessibility guards

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: README and deploy to Vercel

**Files:**
- Modify: `README.md`
- Create: `.vercel/` (ignored, produced by CLI)

- [ ] **Step 1: Write README**

Replace `README.md`:
```markdown
# elioo-web

Single-page site for [elioo.org](https://elioo.org). Plain HTML, CSS and JS. No build step.

## Run locally

    npm run serve
    open http://localhost:4173

## Check

    npm run check   # html-validate + node tests

## Deploy

Production deploys from `main` via Vercel. Preview deploys per branch.

    npx vercel        # preview
    npx vercel --prod # production

## DNS (Hostinger)

| Type  | Name | Value                 |
|-------|------|-----------------------|
| A     | @    | 76.76.21.21           |
| CNAME | www  | cname.vercel-dns.com  |

Existing subdomain records stay as they are.

## Founder photo

Drop a square portrait at `assets/tanvir.jpg`. Until it exists the page shows the orb.

## Design

Spec: `docs/superpowers/specs/2026-09-12-elioo-landing-design.md`
```

- [ ] **Step 2: Push the repo**

```bash
git add README.md
git commit -m "docs: readme with run, check and deploy steps

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin main
```

- [ ] **Step 3: Deploy a preview**

```bash
npx --yes vercel@latest --yes
```
Expected: prompts for login if not logged in (open the URL it prints). Then prints a preview URL. Open it and confirm the page renders with fonts and stars.

- [ ] **Step 4: Deploy production and attach the domain**

```bash
npx --yes vercel@latest --prod --yes
npx --yes vercel@latest domains add elioo.org
npx --yes vercel@latest domains add www.elioo.org
```
Expected: Vercel prints the DNS records it needs. They match the README table.

- [ ] **Step 5: Update DNS at Hostinger**

In Hostinger's DNS zone for elioo.org: change the apex `A` record to `76.76.21.21`, and set `www` `CNAME` to `cname.vercel-dns.com`. Do not touch other records. Wait for `npx vercel domains inspect elioo.org` to show verified (minutes to an hour).

- [ ] **Step 6: Verify live**

```bash
curl -sI https://elioo.org | head -5
```
Expected: `HTTP/2 200`, `x-content-type-options: nosniff`. Open https://elioo.org and https://www.elioo.org (redirects to apex).

- [ ] **Step 7: Commit anything the CLI changed**

```bash
git status
```
Expected: clean. `.vercel/` is ignored.

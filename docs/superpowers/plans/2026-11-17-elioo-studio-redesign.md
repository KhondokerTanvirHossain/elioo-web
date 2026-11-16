# eliooo.org studio redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single static page at eliooo.org with an Astro studio site (home with stacked product cards, four product pages, Markdown blog) built from the approved elioo design system, and move hosting from Vercel to the shared EC2 box with a CI/CD pipeline.

**Architecture:** Astro builds static HTML from `src/data/products.ts` (four products) and a `blog` content collection (Markdown in `src/content/blog/`). Styles are the design system's tokens and component CSS; motion is one client script (Lenis + GSAP ScrollTrigger) layered over pages that work without it. The built `dist/` ships in a `caddy:2-alpine` image to GHCR; GitHub Actions deploys it over SSH as container `elioo-web` on the box's `n8n_edge` network, behind the existing shared Caddy.

**Tech Stack:** Astro 5, TypeScript, Vitest, Playwright (one e2e suite), GSAP 3 + ScrollTrigger, Lenis, Fontsource (self-hosted fonts), html-validate, Docker, Caddy 2, GitHub Actions, GHCR.

**Spec:** `docs/superpowers/specs/2026-11-17-elioo-studio-redesign-design.md`
**Design system (approved):** https://claude.ai/artifact/AGc4BCs6q6iMqARWopegVu. Read it with the Artifact tool, by path: `project/README.md` (rules), `project/tokens.json`, `project/components/bundle.css`, `project/components/<Name>/README.md` and `preview.html`. Asset ids are in `project/design-system.json` → `assetGroups`.

## Global Constraints

- Product order, names, categories, URLs and status exactly: 01 Medioo · Health · https://medioo.eliooo.org/ · live; 02 Bolo · Speaking · https://bolo.eliooo.org/ · live; 03 Finioo · Finance · https://finioo.eliooo.org/ · not live ("Launching soon"); 04 IntelliDrugs · Pharmacy data · https://drugdb.eliooo.org/ · live.
- A product with `live: false` never renders a link to its URL anywhere (no Try it button, no footer link to the URL).
- Colour inside a product card, product page header or product video slot comes only from that product's tokens (`medioo-*`, `bolo-*`, `finioo-*`, `drugs-*`). elioo's own palette is ink only (`ground`, `raised`, `raised-2`, `hairline`, `control-line`, `ink`, `ink-2`, `ink-3`, `on-ink`).
- Fonts: Instrument Sans everywhere; Instrument Serif italic only for the single `e-accent` word in a display headline; JetBrains Mono only in blog code; Onest 600 only for the IntelliDrugs wordmark.
- Copy rules from the design system README: first person singular ("I built"), sentence case, no emoji, no exclamation marks, buttons named by result (Try it, Read more, Say hi, Read the post).
- Arrows: `↗` for links leaving eliooo.org, `→` for links inside it.
- Video budgets: hero ≤ 4 MB, product clip ≤ 3 MB, ≤ 1080p; files under `public/video/`; `preload="none"`, muted, inline, loop.
- Reduced motion (`prefers-reduced-motion: reduce`): no Lenis, no scrubbed effects, statement words at full `ink`, numbers at final value, videos paused on poster with a Play button.
- No page may scroll horizontally at 360px wide.
- Blog frontmatter: `title` (required), `description` (required), `date` (required), `updated`, `tags`, `cover`, `draft` (default false). Drafts are not built in production.
- Never restart, recreate or `docker compose up` the shared Caddy container `n8n-caddy-1`; Caddyfile changes are append-in-place, `caddy validate`, `caddy reload`, then check medioo, bolo, drugdb and n8n still answer.
- Image: `ghcr.io/khondokertanvirhossain/elioo-web:<git sha>`, public package; container name prefix `elioo-web`, network alias `elioo-web`, network `n8n_edge`, no published ports.
- Every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work on branch `feat/studio-redesign`.

## Review Focus

1. **JavaScript fails or is blocked**: every page must still read completely: statement text visible, cards stacked by CSS, numbers showing final values, no element stuck at `opacity: 0`. Pinned in Task 6 (dist assertions) and Task 10 (e2e with JS disabled).
2. **Reduced motion**: a visitor with reduced motion gets no smooth scroll, no scrubbing and no autoplaying video. Pinned in Task 6 (unit test on `initMotion` with a reduced-motion `matchMedia`) and Task 10 (e2e with `reducedMotion: 'reduce'`).
3. **Phone width 360px**: long email address, product names, code blocks and the nav must not push the page sideways. Pinned in Task 10 (e2e `scrollWidth <= clientWidth` on every route).
4. **Finioo goes live later**: flipping `live` to true must make the Try it link appear, with nothing else to edit; while false, its URL must not appear as an `href` anywhere in `dist/`. Pinned in Task 2 (data test both states) and Task 5 (dist test).
5. **Blog edge cases**: zero published posts hides the nav Blog link, the home teaser and the `/blog` list (but `/blog` still builds an empty-state page); a `draft: true` post never appears; a post tagged with a product slug shows on that product page. Pinned in Task 3 and Task 8.

---

## File structure

```
astro.config.mjs                 site, integrations (sitemap), no adapters (static)
package.json                     scripts: dev, build, preview, test, test:e2e, check, tokens
tsconfig.json
scripts/
  build-tokens.mjs               tokens.json → src/styles/tokens.css
  check-dist.mjs                 html-validate + internal links + required meta on dist/
  check-video-budget.mjs         public/video/* sizes vs budgets
  launch-gate.mjs                lists anything still blocking DNS cutover
  smoke.sh                       HTTPS smoke test against $SMOKE_BASE_URL
design/tokens.json               copy of the design system's tokens.json (source of truth in repo)
src/
  styles/tokens.css              GENERATED by build-tokens.mjs, committed
  styles/components.css          the design system's bundle.css minus its Google Fonts @import
  styles/global.css              font imports (Fontsource) + page frame + sr-only
  data/products.ts               Product type, products[], helpers
  data/site.ts                   site-wide copy (hero, statement, stats, founder, contact)
  content.config.ts              blog collection schema
  content/blog/                  posts (.md); empty at launch unless the owner adds one
  lib/blog.ts                    published posts, reading time, related posts
  lib/motion.ts                  pure helpers + initMotion()
  components/                    Seo, Wordmark, Nav, Footer, StatusLabel, VideoSlot, Hero,
                                 StatementReveal, ProductCard, ProductStack, StatCounter,
                                 Founder, PostCard, ContactCTA, ProductHeader
  layouts/Base.astro             html shell, head (Seo), Nav, Footer, motion script
  layouts/Post.astro             post page body
  pages/index.astro, pages/[product].astro, pages/blog/index.astro,
  pages/blog/[slug].astro, pages/rss.xml.ts, pages/404.astro, pages/robots.txt.ts
public/
  favicon.svg, og.png, brand/*, images/tanvir.jpg, video/README.md
deploy/
  Dockerfile, Caddyfile (inside the image), deploy.sh (runs on the box),
  edge-staging.caddy, edge-production.caddy (blocks appended to ~/n8n/Caddyfile)
tests/
  unit/*.test.ts                 vitest: data, blog, motion, tokens, budgets
  dist/*.test.ts                 vitest on built dist/ (run after build)
  deploy/deploy.test.sh          deploy.sh against a fake docker
  e2e/site.spec.ts               playwright against `astro preview`
  fixtures/blog/*.md             posts used only by tests (BLOG_DIR override)
.github/workflows/ci.yml         check on every push/PR; build, push, deploy on main
```

Removed at the start: `index.html`, `main.js`, `styles.css`, `og.html`, `tests/page.test.mjs`. Removed at cutover: `vercel.json`.

---

### Task 1: Astro scaffold, tokens and base layout

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`, `design/tokens.json`, `scripts/build-tokens.mjs`, `src/styles/tokens.css` (generated), `src/styles/components.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Seo.astro`, `src/pages/index.astro` (placeholder "elioo"), `public/favicon.svg`, `tests/unit/tokens.test.ts`, `vitest.config.ts`
- Modify: `package.json`, `.gitignore` (add `dist/`, `.astro/`, `test-results/`, `playwright-report/`), `README.md` (run/build/deploy sections)
- Delete: `index.html`, `main.js`, `styles.css`, `og.html`, `tests/page.test.mjs`

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; path: string; ogImage?: string; theme?: 'ink'; jsonLd?: object[] }`; CSS custom properties named exactly as the tokens (`--ground`, `--medioo-primary`, `--s-6`, `--r-lg`, `--font-sans`, …); every class in the design system's `bundle.css` (`e-btn`, `e-card`, …).

- [ ] **Step 1:** Install: `npm i astro @astrojs/sitemap @astrojs/rss gsap lenis @fontsource-variable/instrument-sans @fontsource/instrument-serif @fontsource/jetbrains-mono @fontsource/onest` and `npm i -D vitest @playwright/test html-validate typescript`. Scripts: `"dev": "astro dev"`, `"tokens": "node scripts/build-tokens.mjs"`, `"build": "npm run tokens && astro build"`, `"preview": "astro preview --port 4321"`, `"test": "vitest run tests/unit"`, `"test:dist": "vitest run tests/dist"`, `"test:e2e": "playwright test"`, `"check": "astro check && npm test && npm run build && npm run test:dist && node scripts/check-dist.mjs && node scripts/check-video-budget.mjs"`. `astro.config.mjs`: `site: 'https://eliooo.org'`, `integrations: [sitemap()]`, `trailingSlash: 'never'`, `build: { format: 'directory' }`.
- [ ] **Step 2:** Copy `project/tokens.json` from the design system into `design/tokens.json` byte for byte (read it with the Artifact tool).
- [ ] **Step 3: Write the failing test** `tests/unit/tokens.test.ts`:

```ts
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
```

- [ ] **Step 4:** Run `npx vitest run tests/unit/tokens.test.ts`. Expected: FAIL (tokens.css missing).
- [ ] **Step 5:** Implement `scripts/build-tokens.mjs` (no arguments; reads `design/tokens.json`, writes `src/styles/tokens.css` as one `:root { … }` block in the order of the JSON, `{alias}` → `var(--alias)`, type families as `--font-<key>`), run `npm run tokens`.
- [ ] **Step 6:** Run the test. Expected: PASS.
- [ ] **Step 7:** Create `src/styles/components.css` = the design system's `project/components/bundle.css` with the first `@import url("https://fonts.googleapis.com/…")` line removed. `global.css` imports the four Fontsource packages (`@fontsource-variable/instrument-sans/wdth.css` for the width axis, `@fontsource/instrument-serif/400-italic.css`, `@fontsource/jetbrains-mono/400.css`, `@fontsource/onest/600.css`), then defines `.sr-only`, `.e-frame { max-width: var(--page-max); margin-inline: auto; padding-inline: max(var(--s-4), env(safe-area-inset-left, 0px)); }` with `--s-6` from 768px and `--s-8` from 1280px.
- [ ] **Step 8:** `public/favicon.svg` = the design system's `elioo-mark.svg` asset. `Seo.astro` renders title, description, canonical (`new URL(path, site)`), Open Graph and Twitter tags, `<link rel="icon" href="/favicon.svg">`, and each `jsonLd` item as `<script type="application/ld+json">`. `Base.astro` imports the three stylesheets, renders `<html lang="en">`, a skip link to `#main`, `<slot />` inside `<main id="main">`, and sets `<meta name="theme-color" content="#0b0b0a">`.
- [ ] **Step 9:** Run `npm run build`. Expected: `dist/index.html` exists, build exits 0.
- [ ] **Step 10: Commit** `git add -A && git commit -m "feat: astro scaffold with elioo design tokens"`

---

### Task 2: Product data

**Files:**
- Create: `src/data/products.ts`, `tests/unit/products.test.ts`, `public/brand/` (assets below)

**Interfaces:**
- Produces:

```ts
export type ProductSlug = 'medioo' | 'bolo' | 'finioo' | 'intellidrugs';
export type ProductTheme = 'medioo' | 'bolo' | 'finioo' | 'drugs';   // matches e-card--<theme> / e-video--<theme>
export interface Product {
  slug: ProductSlug; num: '01' | '02' | '03' | '04'; name: string; category: string;
  theme: ProductTheme; url: string; live: boolean;
  pitch: string; description: string;
  logo: { kind: 'image'; src: string; alt: string } | { kind: 'drugs-wordmark' };
  placeholder: { src: string; widthPct: number };
  video?: { webm?: string; mp4?: string; poster?: string };
  what: string[];                 // 3–5 points
  stack: { label: string; value: string }[];
  architecture: string;           // 2–4 sentences
  hardProblems: { title: string; body: string }[];  // 2–3
  screens: { src: string; alt: string }[];
  copyApproved: boolean;          // owner sign-off; false until approved (launch gate)
}
export const products: Product[];
export function getProduct(slug: string): Product | undefined;
export function nextProduct(slug: ProductSlug): Product;   // wraps 04 → 01
export function tryUrl(p: Product): string | null;         // p.live ? p.url : null
```

- [ ] **Step 1: Write the failing test** `tests/unit/products.test.ts`:

```ts
import { products, getProduct, nextProduct, tryUrl } from '../../src/data/products';
test('order, names, categories, urls and status match the spec', () => {
  expect(products.map(p => [p.num, p.name, p.category, p.url, p.live])).toEqual([
    ['01', 'Medioo', 'Health', 'https://medioo.eliooo.org/', true],
    ['02', 'Bolo', 'Speaking', 'https://bolo.eliooo.org/', true],
    ['03', 'Finioo', 'Finance', 'https://finioo.eliooo.org/', false],
    ['04', 'IntelliDrugs', 'Pharmacy data', 'https://drugdb.eliooo.org/', true],
  ]);
});
test('slugs are unique and themes match', () => {
  expect(products.map(p => [p.slug, p.theme])).toEqual([['medioo','medioo'],['bolo','bolo'],['finioo','finioo'],['intellidrugs','drugs']]);
});
test('every product has the content its page needs', () => {
  for (const p of products) {
    expect(p.pitch.length).toBeGreaterThan(10);
    expect(p.what.length).toBeGreaterThanOrEqual(3); expect(p.what.length).toBeLessThanOrEqual(5);
    expect(p.hardProblems.length).toBeGreaterThanOrEqual(2); expect(p.hardProblems.length).toBeLessThanOrEqual(3);
    expect(p.stack.length).toBeGreaterThan(0);
  }
});
test('tryUrl is null exactly when not live, and flipping live exposes it', () => {
  const f = getProduct('finioo')!;
  expect(tryUrl(f)).toBeNull();
  expect(tryUrl({ ...f, live: true })).toBe('https://finioo.eliooo.org/');
});
test('nextProduct wraps', () => { expect(nextProduct('intellidrugs').slug).toBe('medioo'); });
test('copy has no emoji or exclamation marks', () => {
  const text = JSON.stringify(products);
  expect(text).not.toMatch(/!/); expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
});
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/products.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Download the brand assets from the design system (Artifact `read` by asset id, ids in `project/design-system.json`) into `public/brand/`: `medioo-light.svg`, `mio.webp`, `bolo-wordmark-night.svg`, `bolo-mark.svg`, `finioo-wordmark.svg`, `finioo-fox-head.svg`, `intellidrugs-icon.svg`; and `tanvir.jpg` into `public/images/`.
- [ ] **Step 4:** Implement `src/data/products.ts`. Pitches are the design system README's "Real copy" lines; descriptions are the ProductCard preview's. Logos: Medioo `medioo-light.svg`, Bolo `bolo-wordmark-night.svg`, Finioo `finioo-wordmark.svg`, IntelliDrugs `{ kind: 'drugs-wordmark' }`. Placeholders: Medioo `mio.webp` 34, Bolo `bolo-mark.svg` 22, Finioo `finioo-fox-head.svg` 26, IntelliDrugs `intellidrugs-icon.svg` 18. Draft `what`, `stack`, `architecture` and `hardProblems` from the product sources (design-system READMEs; repos `~/Documents/projects/github/elioo-health`, `~/Documents/projects/github/bolo`, `KhondokerTanvirHossain/drugbd`; Finioo from its design-system README only). State only what the sources say; set `copyApproved: false` on all four.
- [ ] **Step 5:** Run the test. Expected: PASS.
- [ ] **Step 6: Commit** `git commit -m "feat: product data for the four products"`

---

### Task 3: Blog collection and helpers

**Files:**
- Create: `src/content.config.ts`, `src/content/blog/.gitkeep`, `src/lib/blog.ts`, `tests/unit/blog.test.ts`, `tests/fixtures/blog/2026-11-01-first-post.md`, `tests/fixtures/blog/2026-10-20-medioo-notes.md`, `tests/fixtures/blog/2026-11-10-draft.md`

**Interfaces:**
- Produces:

```ts
// content.config.ts: collection 'blog', glob loader, base = process.env.BLOG_DIR ?? './src/content/blog'
// schema: { title: string; description: string; date: Date; updated?: Date; tags: string[] (default []); cover?: string; draft: boolean (default false) }
export interface PostSummary { slug: string; title: string; description: string; date: Date; tags: string[]; minutes: number; }
export function isPublished(p: { data: { draft: boolean } }, env?: { PROD: boolean }): boolean;  // false for drafts in PROD
export function readingMinutes(markdown: string): number;    // ceil(words / 220), min 1
export function sortNewestFirst<T extends { date: Date }>(posts: T[]): T[];
export function relatedTo(slug: string, posts: PostSummary[]): PostSummary[];  // posts whose tags include slug
export async function getPublishedPosts(): Promise<PostSummary[]>;            // astro:content, filtered + sorted
```

- [ ] **Step 1: Write the failing test** `tests/unit/blog.test.ts` covering: `isPublished` false for `{draft:true}` with `{PROD:true}` and true with `{PROD:false}`; `readingMinutes('word '.repeat(440))` is 2 and `readingMinutes('')` is 1; `sortNewestFirst` orders 2026-11-01 before 2026-10-20; `relatedTo('medioo', posts)` returns only the post tagged `medioo`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/blog.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `content.config.ts` and `lib/blog.ts` to the interface. Fixture posts: `first-post` (no tags), `medioo-notes` (tags `[medioo]`), `draft` (`draft: true`), each with a few paragraphs, an `h2`, a list, a code block and a long unbroken URL (for the 360px check).
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: markdown blog collection and helpers"`

---

### Task 4: Shared components (wordmark, nav, footer, status, video slot)

**Files:**
- Create: `src/components/Wordmark.astro`, `Nav.astro`, `Footer.astro`, `StatusLabel.astro`, `VideoSlot.astro`, `src/data/site.ts`, `scripts/check-video-budget.mjs`, `tests/unit/video-budget.test.ts`, `public/video/README.md`
- Modify: `src/layouts/Base.astro` (render Nav and Footer)

**Interfaces:**
- Consumes: `products`, `tryUrl` (Task 2); `getPublishedPosts` (Task 3).
- Produces: `<Nav current?: 'products'|'blog'|'founder' hasPosts: boolean />`; `<Footer hasPosts: boolean />`; `<StatusLabel live: boolean />`; `<VideoSlot theme?: ProductTheme; hero?: boolean; video?: Product['video']; placeholder?: Product['placeholder']; label: string />`; `site.ts` exports `hero`, `statement`, `stats: {n: number; label: string}[]`, `founder`, `contact` with the design system README's real copy (stats: 4 / "products designed, built and shipped", 3 / "live today, used by real people", 1 / "builder, from design to deploy"); `checkBudgets(dir: string): { file: string; bytes: number; limit: number; ok: boolean }[]`.

- [ ] **Step 1: Write the failing test** `tests/unit/video-budget.test.ts`: in a temp dir, a 4,000,001-byte `hero.webm` fails (limit 4,000,000), a 3,000,000-byte `medioo.mp4` passes, a 3,000,001-byte `bolo.webm` fails; files named `hero.*` get the hero limit, all others the product limit; posters (`*.jpg|*.webp|*.png`) are not checked.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement `checkBudgets` in `scripts/check-video-budget.mjs` (exported; when run directly, checks `public/video/`, prints the table and exits 1 on any failure). `public/video/README.md` documents names (`hero.webm|mp4|jpg`, `<slug>.webm|mp4|jpg`), aspect (hero 16:9 1920×1080, products 16:10 1728×1080), budgets and "muted, loops cleanly, under 20 s".
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Build the components from the design system's previews and READMEs (same markup and classes). Specifics the previews do not show: Nav gets `e-nav--compact` via `data-compact` toggled by the motion script (Task 6) and is `position: sticky; top: env(safe-area-inset-top, 0px)`; the Menu button opens a `<dialog>`-based full-screen overlay on `scrim` with links at `title-1` size, closing on Escape and on link click; the Blog link and footer Blog/RSS links render only when `hasPosts`. Footer product links point to the product pages (`/medioo`…), never to a non-live product's URL. VideoSlot renders `<video preload="none" muted playsinline loop poster=…>` with `webm` then `mp4` sources and `data-autoplay` when `video` is present, else the placeholder image in the themed ground; the Play button is rendered but `hidden` (the motion script reveals it under reduced motion).
- [ ] **Step 6:** Run `npm run build`. Expected: exit 0.
- [ ] **Step 7: Commit** `git commit -m "feat: nav, footer, status label and video slot"`

---

### Task 5: Home page

**Files:**
- Create: `src/components/Hero.astro`, `StatementReveal.astro`, `ProductCard.astro`, `ProductStack.astro`, `StatCounter.astro`, `Founder.astro`, `PostCard.astro`, `ContactCTA.astro`, `tests/dist/home.test.ts`, `tests/dist/helpers.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces: `tests/dist/helpers.ts` exports `page(path: string): Document` (parses `dist/<path>/index.html` with `linkedom`, add `linkedom` as a dev dependency) and `allHtml(): string` (concatenated dist HTML). `<ProductCard product: Product />` (heading level 3 with the product name, visually hidden behind the logo, `id="product-<slug>"`).

- [ ] **Step 1: Write the failing test** `tests/dist/home.test.ts`:

```ts
import { page, allHtml } from './helpers';
const d = page('/');
test('one h1 with the accent word', () => {
  expect(d.querySelectorAll('h1').length).toBe(1);
  expect(d.querySelector('h1 .e-accent')?.textContent).toBe('builder.');
});
test('four product cards in order with their themes', () => {
  expect([...d.querySelectorAll('.e-stack > .e-card')].map(c => c.className))
    .toEqual(['e-card e-card--medioo', 'e-card e-card--bolo', 'e-card e-card--finioo', 'e-card e-card--drugs']);
});
test('finioo shows launching soon and its url is never linked', () => {
  const f = d.querySelector('.e-card--finioo')!;
  expect(f.querySelector('.e-status--soon')?.textContent).toBe('Launching soon');
  expect(f.querySelector('.e-btn--try')).toBeNull();
  expect(allHtml()).not.toContain('href="https://finioo.eliooo.org');
});
test('live cards link out with the arrow and new tab', () => {
  const a = d.querySelector('.e-card--medioo .e-btn--try')!;
  expect(a.getAttribute('href')).toBe('https://medioo.eliooo.org/');
  expect(a.getAttribute('target')).toBe('_blank'); expect(a.textContent).toContain('↗');
});
test('statement is plain readable text in the HTML', () => {
  expect(d.querySelector('.e-statement')?.textContent).toContain('I build AI products for Bangladesh');
});
test('stats render final values server-side', () => {
  expect([...d.querySelectorAll('.e-stat__n')].map(n => n.textContent)).toEqual(['4', '3', '1']);
});
test('no blog teaser and no blog nav link when there are no posts', () => {
  expect(d.querySelector('.e-posts')).toBeNull();
  expect(d.querySelector('nav a[href="/blog"]')).toBeNull();
});
test('contact shows the address as text', () => {
  expect(d.querySelector('.e-contact__mail')?.textContent).toBe('k.tanvir.hossain@gmail.com');
});
```

- [ ] **Step 2:** Run `npm run build && npx vitest run tests/dist/home.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Build the components from the design system previews (Hero, StatementReveal, ProductCard, ProductStack with `style="--i:<index>"`, StatCounter with `data-to`, Founder, PostCard, ContactCTA) and compose `index.astro` in the spec's order: Hero → Statement → Products (eyebrow "Products", heading "Four products. Each one <span class=e-accent>solves one worry.</span>") → Stats → Founder → From the blog (only if posts) → Contact. Statement words are **not** split server-side; Task 6 splits them on the client. The hero video slot uses the four placeholders when `public/video/hero.*` is absent.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: home page with stacked product cards"`

---

### Task 6: Motion

**Files:**
- Create: `src/lib/motion.ts`, `tests/unit/motion.test.ts`, `tests/dist/no-js.test.ts`
- Modify: `src/layouts/Base.astro` (`<script>import { initMotion } from '../lib/motion'; initMotion();</script>`)

**Interfaces:**
- Produces:

```ts
export function litWordCount(progress: number, words: number): number;   // clamp(progress,0,1) * words, rounded
export function stackStyle(t: number): { scale: number; brightness: number }; // t∈[0,1] → scale 1-0.06·e, brightness 1-0.4·e, e = easeInOutCubic(t)
export function countAt(to: number, elapsedMs: number, durationMs?: number): number; // ease-out-quart, default 1400, integer
export function initMotion(win?: Window): { reduced: boolean; teardown(): void };
```

- [ ] **Step 1: Write the failing test** `tests/unit/motion.test.ts`: `litWordCount(0, 20)=0`, `litWordCount(0.5, 20)=10`, `litWordCount(2, 20)=20`; `stackStyle(0)` = `{scale:1, brightness:1}`, `stackStyle(1)` = `{scale:0.94, brightness:0.6}`; `countAt(4, 0)=0`, `countAt(4, 1400)=4`, `countAt(4, 9999)=4`; with a `matchMedia` stub returning `matches: true` for `(prefers-reduced-motion: reduce)`, `initMotion(stubWindow).reduced` is true and no `Lenis` instance is created (spy on the module mock), and every `video[data-autoplay]` stays paused with its Play button un-hidden.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement. `initMotion` does, only when not reduced: Lenis smooth scroll wired to `gsap.ticker`; ScrollTrigger per stacked card (trigger = next card, scrub, apply `stackStyle`); statement: split `.e-statement` text into `.w` spans on the client and scrub `litWordCount` (keep `aria-label` with the full sentence on the paragraph); count-up via `countAt` when half in view, once; nav `data-compact` after the hero leaves the viewport; videos: IntersectionObserver at 0.25 plays/pauses `video[data-autoplay]`. Under reduced motion: none of the above, and unhide `.e-video__play` buttons that call `video.play()`.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5: Write** `tests/dist/no-js.test.ts`: no CSS file in `dist/_astro/` contains `opacity:0` or `opacity: 0` on `.e-statement`, `.e-card` or `.e-stat__n` selectors; the statement paragraph in `dist/index.html` has no `.w` spans (split happens only in JS).
- [ ] **Step 6:** Run `npm run build && npx vitest run tests/dist/no-js.test.ts`. Expected: PASS.
- [ ] **Step 7: Commit** `git commit -m "feat: scroll motion with reduced-motion and no-js fallbacks"`

---

### Task 7: Product pages

**Files:**
- Create: `src/pages/[product].astro`, `src/components/ProductHeader.astro`, `tests/dist/product.test.ts`

**Interfaces:**
- Consumes: `products`, `nextProduct`, `tryUrl` (Task 2); `relatedTo`, `getPublishedPosts` (Task 3); `VideoSlot`, `StatusLabel` (Task 4).
- Produces: routes `/medioo`, `/bolo`, `/finioo`, `/intellidrugs`.

- [ ] **Step 1: Write the failing test** `tests/dist/product.test.ts`: each of the four routes exists with one `h1` equal to the product name and `<title>` `"<Name> · elioo"`; the header has class `e-card--<theme>` styling (`.e-product-header.e-card--<theme>`); sections with headings "What it does", "How I built it", "Status and links" exist in that order; "Screens" is absent when `screens` is empty; Finioo's page has "Launching soon" and no `href` to its URL; the next-product link on `/intellidrugs` points to `/medioo`; Medioo's Try it link opens `https://medioo.eliooo.org/` in a new tab.
- [ ] **Step 2:** Run `npm run build && npx vitest run tests/dist/product.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `[product].astro` (`getStaticPaths` from `products`). `ProductHeader` reuses the card classes with the product theme: category eyebrow, logo, `display`-size name (the h1, visually hidden behind the logo like the card), pitch, status, Try it / Launching soon, VideoSlot. Body in `.e-prose`: What it does (list), How I built it (stack as a definition list, architecture paragraph, hard problems as `h3` + paragraph), Screens (only if any), Status and links (live URL as text and link when live; related posts via `relatedTo`, hidden if none), then "Next: <name> →".
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: product pages"`

---

### Task 8: Blog pages and RSS

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/layouts/Post.astro`, `src/pages/rss.xml.ts`, `tests/dist/blog.test.ts`
- Modify: `package.json` (`"build:fixtures": "BLOG_DIR=./tests/fixtures/blog astro build --outDir dist-fixtures"`), `tests/dist/helpers.ts` (accept a root: `page(path, root = 'dist')`)

**Interfaces:**
- Consumes: Task 3 helpers; `PostCard` (Task 5).
- Produces: `/blog`, `/blog/<slug>`, `/rss.xml`.

- [ ] **Step 1: Write the failing test** `tests/dist/blog.test.ts` with two groups. Against `dist/` (no posts): `/blog` exists, shows an empty-state line "No posts yet.", and has no RSS link; `rss.xml` exists with zero `<item>`. Against `dist-fixtures/`: `/blog` lists `first-post` before `medioo-notes`; `/blog/draft` does not exist; `/blog/first-post` has `h1` = its title, a `time[datetime="2026-11-01"]`, "min read", previous/next links; home shows the `.e-posts` teaser and nav has `a[href="/blog"]`; `/medioo` lists `medioo-notes` under related posts; `rss.xml` has two `<item>`s.
- [ ] **Step 2:** Run `npm run build && npm run build:fixtures && npx vitest run tests/dist/blog.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the pages (`Post.astro`: eyebrow date · minutes · tags, `title-1` h1, optional cover, `<div class="e-prose">` body, prev/next) and `rss.xml.ts` with `@astrojs/rss` (title "elioo", description from `site.ts`, items from `getPublishedPosts`). Add `dist-fixtures/` to `.gitignore`.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: blog list, post pages and rss"`

---

### Task 9: SEO, 404, robots and the build checks

**Files:**
- Create: `src/pages/404.astro`, `src/pages/robots.txt.ts`, `public/og.png`, `scripts/check-dist.mjs`, `tests/dist/seo.test.ts`, `.htmlvalidate.json`

**Interfaces:**
- Consumes: `Seo.astro` (Task 1).
- Produces: `node scripts/check-dist.mjs [dir=dist]` exits 1 on any html-validate error, broken internal link (`href`/`src` starting with `/` that has no matching file in the dir), or page missing `<title>`, meta description or canonical.

- [ ] **Step 1: Write the failing test** `tests/dist/seo.test.ts`: every HTML file in `dist/` has `<title>`, `meta[name=description]`, `link[rel=canonical]` starting `https://eliooo.org/`, `meta[property="og:image"]`; home has JSON-LD with `"@type":"Organization"` and `"@type":"Person"` (name "Tanvir Hossain", `sameAs` GitHub, LinkedIn, tanvir.eliooo.org); `dist/404.html` exists with links to `/` and the four product pages; `robots.txt` contains `Sitemap: https://eliooo.org/sitemap-index.xml`; `sitemap-index.xml` exists.
- [ ] **Step 2:** Run `npm run build && npx vitest run tests/dist/seo.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. `og.png` is 1200×630: render a temporary page in the ink style (wordmark, "Four products. One *builder.*", the four marks) with headless Chrome as the old README did, and commit only the PNG. Post pages emit `BlogPosting` JSON-LD. 404 uses `display` "Not *here.*" and the product list. Write `check-dist.mjs` (html-validate via its Node API with `.htmlvalidate.json` extending `html-validate:recommended`; turn off only rules the design requires, each with a comment).
- [ ] **Step 4:** Run the test, then `node scripts/check-dist.mjs`. Expected: PASS, exit 0.
- [ ] **Step 5:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 6: Commit** `git commit -m "feat: seo, 404, robots and dist checks"`

---

### Task 10: End-to-end checks in a real browser

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/site.spec.ts`

**Interfaces:**
- Consumes: the built site via `npm run preview` (Playwright `webServer`), and `dist-fixtures` via a second web server on port 4322 (`astro preview --outDir dist-fixtures --port 4322`).

- [ ] **Step 1: Write the tests** `tests/e2e/site.spec.ts` (Chromium only):
  - For `/`, `/medioo`, `/bolo`, `/finioo`, `/intellidrugs`, `/blog`, `/404`, and fixtures `/blog/first-post`: at viewport 360×740, `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; no console errors.
  - With `javaScriptEnabled: false` on `/`: the statement text is visible, four `.e-card` are visible after scrolling to each, numbers read 4, 3, 1.
  - With `reducedMotion: 'reduce'` on `/`: `.e-statement` has no `.w` span with computed colour ≠ ink; `html` has no `lenis` class; any `video[data-autoplay]` has `paused === true`.
  - Default on `/` at 1440×900: after scrolling to the third card, the first card's computed `transform` scale is below 1 (stack motion runs).
  - Mobile menu at 360px: Menu opens the overlay, Escape closes it and focus returns to the Menu button.
- [ ] **Step 2:** Run `npx playwright install chromium && npm run build && npm run build:fixtures && npm run test:e2e`. Expected: PASS. Fix any failures in the owning component, not in the test.
- [ ] **Step 3: Commit** `git commit -m "test: e2e checks for phone width, no-js, reduced motion and menu"`

---

### Task 11: Container image

**Files:**
- Create: `deploy/Dockerfile`, `deploy/Caddyfile`, `.dockerignore`, `tests/deploy/image.test.sh`

**Interfaces:**
- Produces: an image serving `dist/` on port `8080`; `GET /healthz` → 200 `ok`; `/tanvir` → 308 to `https://tanvir.eliooo.org`; unknown paths → 404 with `404.html`.

- [ ] **Step 1: Write the failing test** `tests/deploy/image.test.sh` (bash, `set -euo pipefail`): build `docker build -f deploy/Dockerfile -t elioo-web:test .`, run it on a random host port, then assert with `curl -s -o /dev/null -w '%{http_code}'`: `/` 200, `/medioo` 200, `/healthz` 200, `/nope` 404, `/tanvir` 308 with `Location: https://tanvir.eliooo.org`; `/_astro/<any file>` has `Cache-Control: public, max-age=31536000, immutable`; `/` has `Cache-Control: public, max-age=300`; response has `Content-Encoding: zstd` or `gzip` when requested; image size under 120 MB (`docker image inspect -f '{{.Size}}'`). Stop and remove the container on exit.
- [ ] **Step 2:** Run `bash tests/deploy/image.test.sh`. Expected: FAIL (no Dockerfile).
- [ ] **Step 3:** Implement. Dockerfile: stage `build` `node:22-alpine`, `npm ci`, `npm run build`; stage `serve` `caddy:2-alpine`, copy `dist/` to `/srv`, copy `deploy/Caddyfile` to `/etc/caddy/Caddyfile`, `EXPOSE 8080`, `HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1`. Caddyfile: `:8080 { root * /srv; encode zstd gzip; respond /healthz "ok" 200; redir /tanvir https://tanvir.eliooo.org permanent; header /_astro/* Cache-Control "public, max-age=31536000, immutable"; header /video/* Cache-Control "public, max-age=604800"; header Cache-Control "public, max-age=300" (only when not already set: use a `@html` matcher on `not path /_astro/* /video/*`); file_server; handle_errors { @404 expression {err.status_code} == 404; handle @404 { rewrite * /404.html; file_server } } }`. Security headers stay at the edge (Task 13). The `/tanvir` redirect lives here, so it is versioned with the site and works on the staging hostname too; the edge block does not repeat it.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: static container image"`

---

### Task 12: Deploy script and CI/CD workflow

**Files:**
- Create: `deploy/deploy.sh`, `tests/deploy/deploy.test.sh`, `scripts/smoke.sh`, `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `IMAGE_TAG=<sha> bash ~/elioo-web/deploy.sh` on the box; `SMOKE_BASE_URL=<url> bash scripts/smoke.sh` (exit 1 on any failed check).

- [ ] **Step 1: Write the failing test** `tests/deploy/deploy.test.sh`: put a fake `docker` first on `PATH` that appends each invocation to a log and answers `ps`/`inspect`/`images` from canned files; run `deploy.sh` with `IMAGE_TAG=bbb`, a running `elioo-web-aaa`, and `STATE_DIR` set to a temp dir. Assert the log order: `pull ghcr.io/khondokertanvirhossain/elioo-web:bbb` → `run -d --name elioo-web-bbb --network n8n_edge --network-alias elioo-web --restart unless-stopped --memory 96m ghcr.io/…:bbb` (no `-p`) → health wait (`inspect --format {{.State.Health.Status}}` until `healthy`, max 60 s) → `rm -f elioo-web-aaa` → prune; `STATE_DIR/TAG` = `bbb`, `STATE_DIR/PREV_TAG` = `aaa`. Second case: health never turns healthy → `rm -f elioo-web-bbb`, `elioo-web-aaa` untouched, exit 1. Third case: prune removes only `ghcr.io/khondokertanvirhossain/elioo-web` tags beyond the newest three and never the running tag or other repositories. Fourth case: `IMAGE_TAG` unset → exit 1 before any docker call.
- [ ] **Step 2:** Run `bash tests/deploy/deploy.test.sh`. Expected: FAIL.
- [ ] **Step 3:** Implement `deploy.sh` to that sequence (`set -euo pipefail`, `STATE_DIR` default `~/elioo-web`). Zero downtime comes from the shared network alias: old and new answer as `elioo-web` until the old one is removed.
- [ ] **Step 4:** Run the test. Expected: PASS. Also run `shellcheck deploy/deploy.sh scripts/smoke.sh` if available.
- [ ] **Step 5:** Implement `scripts/smoke.sh`: with retries (10 × 5 s), `GET $SMOKE_BASE_URL/` 200 and body contains `Four products.`; `/medioo` 200; `/blog` 200; `/healthz` 200. Only when `SMOKE_BASE_URL` is exactly `https://eliooo.org`: `https://www.eliooo.org/` → 308 to `https://eliooo.org/`, and `/tanvir` → 308 to `https://tanvir.eliooo.org`.
- [ ] **Step 6:** Write `.github/workflows/ci.yml`. Job `check` (every push and PR; `ubuntu-latest`, Node 22, npm cache): `npm ci`, `npm run check`, `npm run build:fixtures`, `npx playwright install --with-deps chromium`, `npm run test:e2e`, `bash tests/deploy/image.test.sh`, `bash tests/deploy/deploy.test.sh`. Job `deploy` (push to `main` only, `needs: check`, `permissions: { contents: read, packages: write }`, `concurrency: { group: deploy-elioo-web, cancel-in-progress: false }`): skip unless `github.sha` equals `git ls-remote origin refs/heads/main`; `docker/login-action@v3` to ghcr.io with `GITHUB_TOKEN`; `docker/build-push-action@v6` with `file: deploy/Dockerfile`, tag `ghcr.io/khondokertanvirhossain/elioo-web:${{ github.sha }}`; `appleboy/scp-action@v1` copies `deploy/deploy.sh` to `/home/ec2-user/elioo-web/`; `appleboy/ssh-action@v1` runs `IMAGE_TAG=${{ github.sha }} bash /home/ec2-user/elioo-web/deploy.sh`; then `SMOKE_BASE_URL=${{ vars.SMOKE_BASE_URL }} bash scripts/smoke.sh`. Secrets `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.
- [ ] **Step 7:** Push the branch; open a draft PR. Expected: the `check` job passes on GitHub; `deploy` is skipped (not `main`).
- [ ] **Step 8: Commit** `git commit -m "ci: check, build, push and deploy pipeline"` (before the push in Step 7).

---

### Task 13: Box setup and first deploy (staging hostname)

Operational task on the shared box. Before each command that changes the box, tell the owner what it will change. Follow the Global Constraints for Caddy.

**Files:**
- Create: `deploy/edge-staging.caddy`, `deploy/edge-production.caddy`, `docs/RUNBOOK.md`

**Interfaces:**
- Consumes: the image and `deploy.sh` (Tasks 11–12).

- [ ] **Step 1:** Write `deploy/edge-staging.caddy`:

```
# eliooo.org staging (appended to ~/n8n/Caddyfile; see elioo-web docs/RUNBOOK.md)
elioo.13-205-14-249.sslip.io {
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		-Server
	}
	reverse_proxy elioo-web:8080
}
```

and `deploy/edge-production.caddy` with the same block for `eliooo.org` plus `www.eliooo.org { redir https://eliooo.org{uri} permanent }` and `elioo.13-205-14-249.sslip.io { redir https://eliooo.org{uri} permanent }` (the last replaces the staging block at cutover). `docs/RUNBOOK.md`: deploy, rollback (`IMAGE_TAG=$(cat ~/elioo-web/PREV_TAG) bash ~/elioo-web/deploy.sh`), Caddy edit procedure, where logs are (`docker logs elioo-web-<sha>`).
- [ ] **Step 2:** Repo settings via `gh`: `gh secret set EC2_HOST` (13.205.14.249), `EC2_USER` (ec2-user), `EC2_SSH_KEY` (contents of the owner's `bdemr-text-analysis.pem`, piped from the file, never echoed); `gh variable set SMOKE_BASE_URL --body https://elioo.13-205-14-249.sslip.io`.
- [ ] **Step 3:** On the box: `mkdir -p ~/elioo-web`. Nothing else is created.
- [ ] **Step 4 (owner):** Freeze Vercel: Vercel dashboard → the eliooo.org project → Settings → Git → Disconnect. Confirm the live site still loads unchanged.
- [ ] **Step 5:** Merge the PR to `main`. Expected: `deploy` job builds and pushes the image, runs `deploy.sh`, and the smoke test fails only because the staging Caddy block does not exist yet (expected on this first run).
- [ ] **Step 6:** Check anonymous pull on the box: `docker pull ghcr.io/khondokertanvirhossain/elioo-web:<sha>` without login. If denied, the owner sets the package to public (GitHub → Packages → elioo-web → Package settings → Change visibility → Public) and the job is re-run.
- [ ] **Step 7:** Append the staging block: `cp ~/n8n/Caddyfile ~/n8n/Caddyfile.bak-$(date -u +%Y%m%dT%H%M%SZ)`, then `cat edge-staging.caddy >> ~/n8n/Caddyfile` (append keeps the bind-mounted inode), `docker exec n8n-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`, `docker exec n8n-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`.
- [ ] **Step 8:** Verify: `https://elioo.13-205-14-249.sslip.io/` 200 with a valid certificate; medioo, bolo and drugdb each 200; `docker ps` shows every other container with an unchanged uptime. Re-run the deploy job. Expected: smoke test PASS.
- [ ] **Step 9:** Commit the edge files and runbook: `git commit -m "docs: runbook and edge caddy blocks"`.

---

### Task 14: Launch gate and DNS cutover

**Files:**
- Create: `scripts/launch-gate.mjs`, `tests/unit/launch-gate.test.ts`
- Modify: `src/data/products.ts` / `src/data/site.ts` (owner-approved copy), delete `vercel.json`, `README.md` (deploy section now describes EC2)

**Interfaces:**
- Produces: `launchBlockers(products: Product[], site: { copyApproved: boolean }): string[]`; `node scripts/launch-gate.mjs` prints them and exits 1 if any.

- [ ] **Step 1: Write the failing test** `tests/unit/launch-gate.test.ts`: returns `["Medioo copy not approved", …]` for each product with `copyApproved: false` and `"Home copy not approved"` when `site.copyApproved` is false; returns `[]` when all are true.
- [ ] **Step 2:** Run it. Expected: FAIL. Implement (add `copyApproved: false` to `site.ts`). Run it. Expected: PASS. Commit.
- [ ] **Step 3 (owner):** Review the staging site at `https://elioo.13-205-14-249.sslip.io`: hero, statement, each product's copy. Apply the owner's edits, set the approvals to true, merge. Expected: `node scripts/launch-gate.mjs` exits 0.
- [ ] **Step 4 (owner):** At Hostinger set `@` A → `13.205.14.249` and `www` A → `13.205.14.249` (replacing the Vercel records). Wait until `dig +short eliooo.org` and `dig +short www.eliooo.org` both return `13.205.14.249`.
- [ ] **Step 5:** Replace the staging block in `~/n8n/Caddyfile` with `deploy/edge-production.caddy` using the same procedure (backup; edit in place with `sed -i` scoped to the staging block, keeping the file's inode; validate; reload). Verify certificates are issued for `eliooo.org` and `www.eliooo.org` and the other tenants still answer.
- [ ] **Step 6:** `gh variable set SMOKE_BASE_URL --body https://eliooo.org`; re-run the deploy job. Expected: smoke test PASS including the `www` and `/tanvir` redirects.
- [ ] **Step 7:** Lighthouse on `https://eliooo.org/` (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Fix and redeploy anything under target.
- [ ] **Step 8:** `git rm vercel.json`, update README, commit, merge. **Owner:** delete the Vercel project.

---

## Out of this plan

Moving tanvir.eliooo.org to the box and updating its elioo blurb is the follow-up project named in the spec. Videos, screenshots and blog posts arrive from the owner over time and need no code changes.

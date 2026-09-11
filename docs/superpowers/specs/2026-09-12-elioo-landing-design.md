# elioo.org landing page, design spec

Date: 2026-09-12
Status: approved

## Purpose

elioo.org is the front door for every product Tanvir builds under the elioo brand. Today nothing is live under the domain and the root points at a Hostinger placeholder. This page replaces it with a single-page studio site that sells the vision, lists the planned bots, and gives visitors one way to reach out.

Voice: **elioo the studio** ("elioo builds AI companions"), with Tanvir as founder in one section near the bottom.

Audience today: recruiters, investors, collaborators, curious developers. Later: patients and doctors arriving via elioo-health.

## Visual direction (D)

Playful glowing bots inside the night sky of Pixar's *Elio*. The user has decided to lean into the Elio resemblance deliberately for emotional connection; the IP trade-off was raised and accepted.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#050B1E` | page ground, top of gradient |
| `--bg2` | `#0D1F4A` | gradient mid, card fill base |
| `--bg3` | `#12285E` | gradient bottom |
| `--ink` | `#EEF1FF` | primary text |
| `--mute` | `#A9B4E0` | secondary text |
| `--peri` | `#A08CFF` | brand accent, wordmark, primary button |
| `--peri2` | `#D4C8FF` | wordmark highlight, glow |
| `--beam` | `#9FE3FF` | light beam, bot eyes, "soon" badges |
| `--sun` | `#FFD166` | ringed planet on the i |
| `--coral` | `#FF7A85` | Baymax |
| `--mint` | `#5CE8B8` | Scrooge |
| `--line` | `#26377A` | borders |

Single-theme (dark). No light theme. Background and every color are painted explicitly so the page holds on any host ground.

### Typography

- Display: **Fredoka** 600/700 (Google Fonts). Wordmark, h1, h2, product names.
- Body: **Nunito** 400/600/700/800 (Google Fonts). Everything else.
- Fallback stack: `system-ui, -apple-system, "Segoe UI", sans-serif`.
- Running text max 65ch. Uppercase labels get `letter-spacing: .14em`.

### Wordmark

"elioo" in Fredoka 700, periwinkle vertical gradient with soft glow. The i is dotted with a small ringed planet (sun-yellow body, periwinkle ring). The final two o's are rendered as glowing orbs: Ooo's eyes. Built in HTML/CSS, no image asset. Also exported as an SVG favicon.

### Atmosphere

- Diagonal blurred light beam from top-right (CSS gradient + blur).
- Canvas star field, ~140 points, gentle twinkle. Stops under `prefers-reduced-motion`.
- Bots bob on a 2.8s ease loop, staggered. Stops under `prefers-reduced-motion`.

## Page structure

Single `index.html`. Sections in order, each an `id` for anchor nav.

1. **Nav** (sticky, translucent). Wordmark left. Links: Products, Vision, Founder, Contact. Collapses to wordmark + "Say hi" button under 760px.
2. **Hero** (`#top`). Left: h1 "Little bots for the big stuff in life." with "big stuff" glowing periwinkle. Sub: "elioo makes friendly AI companions for your health, your memory and your money. From Dhaka, for everyone." Two buttons: primary "Say hi" (mailto), secondary "Meet the bots" (anchor to #products). Right: the three bots.
3. **Products** (`#products`). Three cards, one per bot, glass fill over the sky. Each: color dot + category label, name, one-line pitch, status badge.
   - Health · **Baymax** · "Your personal healthcare buddy. App, web or WhatsApp." · Coming 2026
   - Memory · **Ooooo** · "Sits in every meeting, remembers everything, answers when asked." · In development
   - Money · **Scrooge** · "A money manager that actually nags you." · Idea stage
   Cards are not links yet. When a subdomain goes live, the card becomes a link and the badge changes to "Live".
4. **Vision** (`#vision`). One short manifesto, 4 to 6 sentences, headed "Why elioo". Core idea: AI should feel like a companion you trust with the parts of life that matter, and it should work on the phone people already have. Copy drafted in the plan, Tanvir edits.
5. **Founder** (`#founder`). Small section. Photo `assets/tanvir.jpg` (circle, 120px, periwinkle glow ring; if the file is missing the circle shows the wordmark orb), name, one line: "Tanvir Hossain. Senior software engineer in Dhaka. Ten years of building banking, government and healthcare systems. Now building elioo." Links: GitHub `https://github.com/KhondokerTanvirHossain`, LinkedIn `https://www.linkedin.com/in/k-tanvir-hossain/`.
6. **Contact** (`#contact`). Heading "Say hi". Primary button `mailto:k.tanvir.hossain@gmail.com`. Social row. One-line note: "Waitlists open per product when each bot is ready."
7. **Footer**. Wordmark small, "elioo · Dhaka · 2026", link to GitHub repo.

## Copy source of truth

All copy lives in `index.html` directly. No CMS, no JSON. Tanvir edits HTML.

## Waitlist decision

v1: no email capture. "Say hi" is a `mailto:` link. Reason: no backend, nothing to maintain, nothing to secure. v2 (out of scope): serverless form to a sheet or Resend.

## Stack and deployment

- Plain HTML, CSS, vanilla JS. No framework, no build step.
- Files: `index.html`, `styles.css`, `main.js`, `favicon.svg`, `og.png`, `vercel.json`.
- Vercel static deploy from the GitHub repo `elioo-web`, `main` branch, production domain `elioo.org` and `www.elioo.org` (www redirects to apex).
- DNS: at Hostinger, point apex A record to Vercel (76.76.21.21) and `www` CNAME to `cname.vercel-dns.com`. Existing subdomain records untouched.
- `vercel.json`: security headers only (nosniff, frame-deny, referrer-policy). No rewrites.

## SEO and sharing

- `<title>elioo</title>`, meta description, canonical, Open Graph and Twitter card with `og.png` (1200x630, wordmark on the night sky, generated from the page).
- `robots.txt` allow all. No analytics in v1.

## Accessibility and performance

- Every color pair on the sky meets WCAG AA for text. `--mute` on `--bg2` is the tightest pair; verified in the plan.
- Focus rings visible on all links and buttons.
- Reduced motion respected for stars and bots.
- Fonts loaded with `display=swap`, two families only.
- Target: Lighthouse performance 95+, no layout shift from fonts (size-adjust fallback or fixed hero heights).
- Works at 400px width. No horizontal scroll.

## Testing

No JS framework, so tests are light:
- HTML validity (`html-validate` via npx) in CI.
- Lighthouse CI run on Vercel preview URL, thresholds: perf 90, a11y 95, best practices 95, SEO 95.
- Manual check: 400px, 760px, 1280px; reduced-motion on; keyboard nav.

## Out of scope

- Email capture / waitlist backend.
- Blog or journal.
- Light theme.
- Per-product pages (each lives on its own subdomain).
- Analytics.
- Bangla localisation.

## Inputs (received 2026-09-12)

- Contact email: k.tanvir.hossain@gmail.com
- GitHub: https://github.com/KhondokerTanvirHossain
- LinkedIn: https://www.linkedin.com/in/k-tanvir-hossain/
- Product names: Baymax, Ooooo, Scrooge. Disney-name resemblance is a deliberate choice by the owner.
- Founder photo: owner to add `assets/tanvir.jpg` (portrait, brown suit). Page falls back to the orb until then.

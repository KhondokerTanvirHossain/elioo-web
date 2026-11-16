# eliooo.org studio redesign, design

Date: 2026-11-17. Supersedes `2026-09-12-elioo-landing-design.md` for everything below; that spec stays as history.

## Intent

eliooo.org is the showcase for elioo, a one-person product studio. Tanvir Hossain designs, builds and ships every product himself. The site has two audiences:

- **Recruiters**, who should come away thinking "this person can do the whole job: product, backend, AI, infra, design".
- **Investors**, who should see range, shipping speed and a coherent family of products from one founder.

Both read the same message: *four products, one builder*. The current page (dark navy, Fredoka/Nunito, three placeholder bots with Disney-adjacent names) undersells that. The owner wants it premium, professional, "hooked" and interactive, with a blog, modelled on the feel of https://www.theproductstudiohq.com/.

The owner's personal portfolio, tanvir.eliooo.org (repo `tanvir-web`), covers employer work and the résumé. eliooo.org covers only his own products and links across to the portfolio for career history. No duplication.

## Goals

1. Each product is shown in its own visual world, so range is visible before anything is read.
2. A visitor can reach every live product in one click and a product's own page in one click.
3. Each product page answers what it is, who it is for, how it was built (stack, the hard problems), its status, and where to try it.
4. A Markdown blog in the repo: write a `.md` file, push, and it is live.
5. Scroll-driven interaction that feels premium: stacked product cards, word-by-word statement reveal, count-up numbers, smooth scrolling.
6. Slots for the owner's Remotion videos everywhere a video helps (hero, each product card, each product page), working with a still image until a video exists.
7. Self-hosted on the owner's EC2 box, deployed automatically from `main` by GitHub Actions, with checks that block a bad deploy.

## Non-goals

- No CMS, no comments, no newsletter, no analytics in this round.
- No Bangla version of the site (the site is English; Bangla appears inside product screenshots and videos).
- No waitlist or sign-up forms; products link out to their own sites.
- No change to the products themselves or their design systems.
- Moving tanvir.eliooo.org to EC2 is a separate follow-up project, not part of this one.

## Anti-goals (failure even if it "works")

- Looks like a template or "AI landing page" (blue-purple gradients, emoji cards, glassy everything).
- A dead or broken link a recruiter or investor clicks (Finioo must not look broken).
- Motion that blocks reading, hijacks scroll so it feels slow, or ignores `prefers-reduced-motion`.
- Heavy videos that make the first screen slow or burn the box's bandwidth.
- Any deploy step that restarts or disturbs medioo, bolo, drugdb or n8n on the shared box.
- Product logos or mascots redrawn or approximated instead of the real assets.

## Decisions made with the owner

| Topic | Decision |
|---|---|
| Overall mood | **C. Ink editorial**: near-black ground, very large left-aligned type, Instrument Sans with an italic Instrument Serif accent word. Products land as blocks of their own colour. |
| Product showcase | **A. Stacked cards**: one large card per product in its own palette; as you scroll, the next card slides up and stacks over the previous one (Product Studio's "booths"). |
| Product order | 01 Medioo, 02 Bolo, 03 Finioo, 04 IntelliDrugs. |
| Finioo | Not live yet. Shown as "Launching soon"; its URL stays in the data and is switched on at launch (see Product data). |
| Blog | Markdown files in this repo. |
| Videos | Owner produces them with Remotion to match the site; the site provides slots. |
| Hosting | Owner's EC2 box, not Vercel. |
| Stack and deploy | Astro static build, served by a small container on the box, deployed by GitHub Actions like the owner's other apps (option 1 below). |

## Approaches considered

**Site build.**
1. *Astro (chosen).* Markdown content collections for posts, one template for product pages fed by data, static HTML output, small islands of JS for motion. Fits a content-and-visuals site with no backend.
2. *Plain HTML + a home-made Markdown script.* Closest to today, but the owner would maintain a mini site generator (layouts, product template, RSS, images) by hand.
3. *Next.js.* What the reference uses; React and a server runtime for a site that is all static content. Only worth it if eliooo.org later needs logins or dashboards.

**Hosting on the EC2 box.**
1. *Container like the other apps (chosen).* CI builds the Astro site into a tiny static web-server image, pushes it to GHCR tagged with the commit sha, SSHes in and swaps the container. Caddy gets one site block, added once with a reload. Rollback is redeploying an older sha. Same pattern as medioo, bolo, drugdb.
2. *Folder served by the shared Caddy.* Needs a new volume on the Caddy container, which means recreating it and briefly taking down every site on the box. Rejected.
3. *Folder plus a separate static container.* Avoids touching Caddy's container but adds a second deploy style and loses image-based rollback. Rejected.

**Hosting provider** (discussed before the EC2 decision): Vercel Hobby is personal/non-commercial only and caps bandwidth; Cloudflare Pages was the free commercial alternative. The owner chose his EC2 box, where the products already run.

## Site map

| Path | Page |
|---|---|
| `/` | Home |
| `/medioo`, `/bolo`, `/finioo`, `/intellidrugs` | Product pages (one shared template) |
| `/blog` | Post list, newest first |
| `/blog/<slug>` | A post |
| `/rss.xml`, `/sitemap-index.xml`, `/robots.txt` | Feeds and crawl files |
| `/tanvir` | Permanent redirect to `https://tanvir.eliooo.org` (exists today, must keep working) |
| 404 | Custom page in the ink style with links home and to the products |

`www.eliooo.org` redirects permanently to `eliooo.org`.

## Home page, top to bottom

1. **Nav.** `elioo` wordmark left; Products, Blog, Founder, and a "Say hi ↗" pill right. Sticky, becomes a compact translucent bar after the hero. On phones, a menu button opens a full-screen ink overlay.
2. **Hero.** Very large left-aligned headline with one italic serif word (working copy: "Four products. One *builder.*"), a one-line lede, and the hero video slot (owner's intro reel) beside or below it. Links to the products and to "Say hi".
3. **Story statement.** One or two sentences about building products end to end alone; words light up one by one as the section scrolls through the viewport (dim to full ink). Plain readable text under reduced motion.
4. **Products: stacked cards.** Section heading, then four cards in the order above. Each card: number (01–04), category label, product name/wordmark, a one-line pitch, a two-to-three-line description, a status label, a primary action (Try it ↗ to the live site, or "Launching soon" for Finioo) and a secondary action (Read more → to the product page), and the card's video slot. Each card uses that product's own palette and real wordmark or mascot. Cards stick and stack as the user scrolls; the covered card scales down slightly and dims.
5. **Numbers.** A row of three or four figures that count up when they enter the viewport (e.g. products shipped, live products, years building, a stack fact). Real numbers come from the owner; see Inputs.
6. **Founder.** Photo (`assets/tanvir.jpg`), short bio aimed at recruiters, links to GitHub, LinkedIn and the portfolio (tanvir.eliooo.org), which holds the career detail.
7. **From the blog.** The three newest posts as cards (title, date, description). Hidden entirely when there are no published posts.
8. **Contact.** Big "Let's talk." call to action with the email link.
9. **Footer.** Wordmark, nav links, product links, GitHub, LinkedIn, RSS, "Source" link to the repo, copyright.

## Product page template

Fed by one data file per product. Sections:

1. Header in the product's own palette: name or wordmark, category, one-line pitch, status label, Try it ↗ (or Launching soon), and the product video slot.
2. **What it does**: the problem and who it is for, three to five short points.
3. **How I built it**: stack (as plain labelled list), architecture in a few sentences, and two or three "hard problems I solved", the part recruiters read.
4. **Screens**: a small gallery of screenshots (images supplied later; section hidden if none).
5. **Status and links**: live URL, launch state, related blog posts (posts tagged with the product's slug).
6. Next-product link at the bottom, cycling through the four.

Draft copy for sections 1–3 can be written from each product's design-system README (see Sources). The owner reviews it before launch.

## Product data

| # | Slug | Name | Category | Live URL | Status |
|---|---|---|---|---|---|
| 01 | medioo | Medioo | Health | https://medioo.eliooo.org/ | Live |
| 02 | bolo | Bolo | Speaking | https://bolo.eliooo.org/ | Live |
| 03 | finioo | Finioo | Finance | https://finioo.eliooo.org/ | Launching soon |
| 04 | intellidrugs | IntelliDrugs | Pharmacy data | https://drugdb.eliooo.org/ | Live |

Each product's data includes a `live` boolean. When `live` is false the URL is kept but not rendered as a link; the action shows "Launching soon". Launching Finioo is flipping one value.

One-line pitches (from the design systems, to be polished):
- Medioo: keeps a family's medical papers and explains them in plain Bangla, for adult children (often abroad) looking after a parent.
- Bolo: a voice-first speaking buddy for Bangla speakers who know English on paper but freeze when they speak.
- Finioo: an AI co-pilot that builds and runs a founder's business model by chat, by direct edit, or over MCP.
- IntelliDrugs: a drug database for Bangladesh with a pharmacist review desk, honest about missing interaction data.

## Visual system

- **Ground and type.** Near-black ground (around `#0C0C0C`), warm off-white ink (around `#F2F0EA`), one muted secondary ink. Instrument Sans for everything; Instrument Serif italic only for the single accent word in large headlines. Very large display sizes on desktop, scaling down fluidly; body at a comfortable 17–18 px. Exact tokens are the builder's call, defined once as CSS custom properties.
- **Product palettes.** Each product card and page header uses that product's own colours and assets, taken from its design system, not invented:
  - Medioo: calm green on white, Noto Sans Bengali for any Bangla.
  - Bolo: "Neon Dusk": indigo sky, mustard sun, violet hills, rose glow.
  - Finioo: Apple-calm light ground with ember (fox orange) as the one accent; the fox-with-glasses mark.
  - IntelliDrugs: "Clinical Calm" neutrals with one cobalt accent (`#1F5BB8`); wordmark with the cobalt full stop.
- **Real assets only.** Logos, wordmarks and mascots come from the products' design systems or their repos (`elioo-health`, `bolo`, the bddrug repo), copied as files, never redrawn. Medioo's design system forbids drawing the Mio mascot on app screens; on eliooo.org use Medioo's wordmark, not Mio, unless the owner supplies approved Mio artwork.
- **Banned:** blue-purple gradients, emoji, glassmorphism everywhere, left-border accent cards, stock-photo people.
- Text contrast meets WCAG AA in every product palette as well as on ink.

## Motion and interaction

- **Smooth scroll** with Lenis; **scroll-linked effects** with GSAP ScrollTrigger (stacked cards, word reveal, count-up). Load them only on pages that use them.
- **Stacked cards:** CSS `position: sticky` does the stacking; GSAP adds the scale and dim on the covered card. If JS fails, cards still stack via sticky and remain readable.
- **Word reveal, count-up:** progressive enhancement over plain text and final numbers.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, no smooth scroll, no scrubbed effects, numbers show final values, videos do not autoplay (poster + play button).
- **Hover and focus:** buttons and cards respond on hover with restraint; every interactive element has a visible focus ring.
- Mobile: same structure; stacked cards still stack; no horizontal scroll at 360 px.

## Video slots

- Each slot takes a short muted looping clip: `.webm` (VP9 or AV1) plus `.mp4` (H.264) fallback, and a poster image.
- Until a video file exists, the slot shows the poster or a styled placeholder in the product's palette; the page must look finished without any videos.
- Videos load only when the slot nears the viewport (`preload="none"` plus an IntersectionObserver), autoplay muted inline, and pause when off screen.
- Budget: hero clip ≤ 4 MB, each product clip ≤ 3 MB, at most 1080p. The build or CI fails if a video in `public/` exceeds its budget.
- Files live under `public/video/` in the repo for now. If total video size outgrows the repo, moving them to object storage is a later change.
- The owner will make the Remotion compositions; the builder documents the expected file names, aspect ratios (hero 16:9, cards 16:10 or as the layout needs, stated explicitly) and durations in the README.

## Blog

- Posts are Markdown files in `src/content/blog/`, one per post, file name = slug.
- Frontmatter: `title` (required), `description` (required, used for cards and meta), `date` (required), `updated` (optional), `tags` (optional; a product slug in tags links the post to that product page), `cover` (optional image), `draft` (optional, default false; drafts are not built in production).
- Post page: title, date, reading time, cover, body with good typography for long-form reading (headings, lists, code blocks with syntax highlighting, images, blockquotes), previous/next links.
- `/blog` lists all published posts newest first. RSS at `/rss.xml`.
- Launching with zero posts is allowed: the home "From the blog" section and the nav Blog link hide when there are no published posts. (Whether to launch with a first post is an owner input.)
- Writing a post = add a `.md` file, open a PR or push to `main`; CI builds and deploys.

## SEO and sharing

- Per-page `<title>`, description, canonical URL, Open Graph and Twitter card tags.
- One default OG image in the ink style; product pages and posts may override with their own.
- `sitemap` and `robots.txt` generated at build.
- Structured data: `Organization` on home, `Person` for the founder, `BlogPosting` on posts.

## Accessibility and performance

- Semantic landmarks, one `h1` per page, skip link, alt text on every image, captions or a text description for each video's message.
- Keyboard: every action reachable; focus visible; the mobile menu traps focus while open and closes on Escape.
- Lighthouse on the home page (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, measured on the deployed site.
- Fonts self-hosted or via Google Fonts with `display=swap` and only the weights used.
- JS shipped to the home page stays small: GSAP + ScrollTrigger + Lenis + page scripts only.

## Deployment

### Today

- eliooo.org and www are served by Vercel (`vercel.json` holds security headers and the `/tanvir` redirect). DNS is at Hostinger: `@` A record and `www` CNAME point at Vercel.
- The EC2 box (Amazon Linux 2023, ap-south-1) runs medioo, medscribe-ai, bolo, bddrug and n8n as containers. One Caddy container, `n8n-caddy-1`, compose project in `~/n8n`, config `~/n8n/Caddyfile` mounted read-only, fronts them all on the Docker network `n8n_edge`. Security group: only 22, 80, 443 open.
- The other apps deploy with GitHub Actions: build an image, push to `ghcr.io/khondokertanvirhossain/<repo>:<sha>`, `appleboy/ssh-action` runs a deploy script on the box, then an HTTPS smoke test from the runner. See `elioo-health/.github/workflows/ci-cd.yml` for the established pattern (tip-of-main check, one deploy at a time, prune old images).

### Target

- **Image.** Multi-stage Dockerfile: Node stage runs `astro build`; final stage is a minimal static server (choice between `caddy:2-alpine` with `file_server` or `nginx:alpine` is the builder's) serving `dist/` on an internal port, with long cache headers for hashed assets and short ones for HTML, gzip/zstd, and a health endpoint or a reliable `GET /`. Image name `ghcr.io/khondokertanvirhossain/elioo-web:<sha>`.
- **Container on the box.** Name `elioo-web`, joined to `n8n_edge`, no published ports, `restart: unless-stopped`, small memory limit. Managed by a compose file or deploy script under `~/elioo-web/` on the box, with the current and previous tag recorded so rollback is one command.
- **Caddy.** One-time addition to `~/n8n/Caddyfile` of:
  - an `eliooo.org` block: `encode zstd gzip`, security headers (HSTS, `X-Content-Type-Options nosniff`, `X-Frame-Options DENY`, `Referrer-Policy strict-origin-when-cross-origin`, `-Server`), `redir /tanvir https://tanvir.eliooo.org permanent`, `reverse_proxy elioo-web:<port>`;
  - a `www.eliooo.org` block redirecting permanently to `https://eliooo.org{uri}`.
  Applied with the procedure the box already uses: back up the Caddyfile, edit in place, `caddy validate` inside the container, `caddy reload`, then confirm medioo, bolo, drugdb and n8n still answer. Never `docker compose up`, recreate or restart the Caddy container.
- **CI (every push and PR).** Install, `astro check`, build, existing-style HTML validation, unit tests for the content and data rules (e.g. every product has the required fields; Finioo not linked while `live` is false; video budgets), internal link check of the built site.
- **CD (push to `main` only, after CI passes).** One deploy at a time, only the tip of `main`; build and push the image; SSH deploy script pulls the image, starts the new container, waits for it to answer, swaps it in, keeps the previous image for rollback, prunes only `elioo-web` images beyond the last three; then an HTTPS smoke test against `https://eliooo.org` (home, one product page, `/blog`, `/tanvir` redirect, `www` redirect). A failed smoke test leaves the previous container serving or rolls back to it.
- **Secrets.** Reuse the box's existing deploy credentials pattern: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` as repo secrets in `elioo-web`; pushing to GHCR via `GITHUB_TOKEN`. The package is public, so the box pulls without logging in (see below).
- **Disk.** The box has about 5.7 GB free; the image must stay small (static files plus videos) and pruning must keep it bounded.

### Who does the box and repo setup

The builder (Claude, working in the owner's session) has SSH access to the box with the owner's key and admin access to the repo through the `gh` CLI, so the one-time setup is carried out and verified by the builder, not handed over as a runbook: repo secrets, `~/elioo-web/` on the box, the Caddy blocks, the first deploy. Every change on the shared box follows the rules above, is announced to the owner before it runs, and ends with a check that medioo, bolo, drugdb and n8n still answer. The only steps that need the owner's own hands are the Vercel dashboard (step 1 below) and the DNS change at Hostinger.

**GHCR access:** the `elioo-web` repo is public, so its image package is made public too and the box pulls it without a login. No `GHCR_TOKEN` is needed for this site.

### Staging hostname and smoke-test target

- A Caddy block for `elioo.13-205-14-249.sslip.io` proxies to `elioo-web` from the first deploy. It is the smoke-test target until cutover.
- The smoke test reads its base URL from a repository variable `SMOKE_BASE_URL` (initially `https://elioo.13-205-14-249.sslip.io`). The `www` and `/tanvir` checks run only when `SMOKE_BASE_URL` is `https://eliooo.org`, so pre-cutover deploys never fail on redirects that point at Vercel.
- At cutover `SMOKE_BASE_URL` becomes `https://eliooo.org`, and the sslip block becomes a permanent redirect to `https://eliooo.org{uri}` (as bolo's did).

### Cutover order

1. **Freeze Vercel first (owner, Vercel dashboard):** disconnect the Vercel project's Git connection so pushes to `main` stop deploying there. The current production deployment keeps serving eliooo.org unchanged until DNS moves. This happens before the redesign is merged to `main`.
2. Build on a feature branch; merge to `main` when CI is green. CD deploys to the box; the smoke test runs against the sslip hostname.
3. Owner reviews the site on the sslip hostname and approves.
4. Owner changes DNS at Hostinger: `@` A record and `www` to `13.205.14.249` (www as an A record or CNAME to the apex). Caddy obtains certificates on first request.
5. Builder flips `SMOKE_BASE_URL`, converts the sslip block to a redirect, re-runs the deploy and verifies the domain, redirects and certificates.
6. Remove `vercel.json` from the repo; owner deletes the Vercel project.

### Launch gate

DNS moves only when: the site passes CI and the smoke test on the sslip hostname, and the owner has approved the hero copy, story statement and each product's copy. Everything else is optional at launch and has a finished-looking fallback:
- No video: poster or palette placeholder (see Video slots).
- No screenshots: the Screens section is hidden.
- No numbers from the owner: the Numbers section is hidden.
- No blog post: blog teaser and nav link hidden.
- A product mark that cannot be sourced: the product name set in type in that product's palette (the products' own design-system rule: "no logo means plain type").

## Testing

- Unit tests (Node test runner or Vitest, builder's call) for product data rules, blog frontmatter rules and the video budget check.
- Build-output checks: every page has title, description and canonical; internal links resolve; `/tanvir` and `www` redirects exist in the Caddy block (checked in the smoke test).
- Manual check on a real phone and desktop: stacked cards, reduced motion, keyboard navigation.
- The current `tests/page.test.mjs` assertions are tied to the old page and are replaced.

## Inputs needed from the owner

- Final hero headline and story statement (working copy above).
- The numbers for the count-up row.
- Approval of drafted product copy ("What it does", "How I built it", hard problems).
- Product logo/wordmark files if they cannot be pulled from the design systems or repos.
- Screenshots per product (optional at launch).
- Whether to launch with a first blog post.
- Videos when ready (site launches without them).
- The DNS change at Hostinger at cutover time.

## Sources

- Reference site: https://www.theproductstudiohq.com/ (hero with italic serif accent word, word-by-word dark statement, numbered product booths, count-up stats, per-product pages, blog).
- Product design systems (Claude artifacts): Medioo https://claude.ai/artifact/F7Kj5uHkfv4nmPWVrDhimZ, Finioo https://claude.ai/artifact/YFAEKfrCXd5Wg2Tr9EtfZh, Bolo https://claude.ai/artifact/EWmxzbHCfzhn5b1q65zspd, IntelliDrugs https://claude.ai/artifact/69RwCeSPGerRJE5vr7oim8.
- Product brand assets, in order of preference: the design-system artifacts above (their uploaded logo/icon assets, readable with the Artifact tool), then the public repos `KhondokerTanvirHossain/elioo-health` (Medioo; local at `~/Documents/projects/github/elioo-health`), `KhondokerTanvirHossain/bolo` (local at `~/Documents/projects/github/bolo`), `KhondokerTanvirHossain/drugbd` (IntelliDrugs). Finioo has no repo on GitHub; its fox and wordmark come from its design-system artifact. Medioo's wordmark is a code component (Medi + green "oo"), so it is reproduced as live text with its exact tokens, which counts as using the real mark.
- Brainstorm mockups: `.superpowers/brainstorm/` (git-ignored).

## Left to the builder

- Exact colour, spacing and type-scale tokens within the ink direction.
- Static server image (Caddy or nginx) and its internal port.
- Test runner, link checker and how the video budget check is wired.
- Component structure, file layout inside `src/`, and how product palettes are scoped (CSS variables per product).
- Responsive breakpoints and the exact mobile treatment of the stacked cards.
- Whether the deploy script on the box is a compose file or a shell script, provided it follows the shared-box rules above.

## Follow-up project (not in this one)

Move tanvir.eliooo.org (`tanvir-web`, already plain static HTML) from Vercel to the same box with the same container + Caddy pattern, and update its "On the side I run elioo…" blurb to the new product line.

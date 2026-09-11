# elioo-web

Single-page site for [eliooo.org](https://eliooo.org). Plain HTML, CSS and JS. No build step.

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

## Open Graph image

`og.png` is a screenshot of `og.html` at 1200x630. Regenerate after changing the wordmark:

    npm run serve
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
      --window-size=1200,630 --virtual-time-budget=4000 --screenshot=og.png http://localhost:4173/og.html

## Design

Spec: `docs/superpowers/specs/2026-09-12-elioo-landing-design.md`
Plan: `docs/superpowers/plans/2026-09-12-elioo-landing.md`

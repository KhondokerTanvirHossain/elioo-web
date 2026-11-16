# elioo-web

The studio site for [eliooo.org](https://eliooo.org): four products, one builder. Astro, built to static HTML.

- Spec: `docs/superpowers/specs/2026-11-17-elioo-studio-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-11-17-elioo-studio-redesign.md`
- Design system: https://claude.ai/artifact/AGc4BCs6q6iMqARWopegVu (tokens copied to `design/tokens.json`; `npm run tokens` regenerates `src/styles/tokens.css`)

## Run locally

    npm install
    npm run dev          # http://localhost:4321

## Check

    npm run check        # astro check, unit tests, build, dist checks
    npm run test:e2e     # browser checks (after npm run build)

## Write a blog post

Add `src/content/blog/<slug>.md` with `title`, `description` and `date` in the frontmatter (`draft: true` keeps it out of production). Push; CI builds and deploys.

## Deploy

Pushes to `main` build a container image and deploy it to the EC2 box (see `docs/RUNBOOK.md`).

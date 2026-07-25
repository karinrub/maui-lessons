# Codex Handoff — 2026-07-25

## Read first

This handoff covers all Codex work completed today after the previous
repository state. Read `CLAUDE.md`, then this file, before making changes.

Repository: `/Users/karinrubin/Developer/maui-lessons`  
Branch: `main`  
Live Pages site: `https://karinrub.github.io/maui-lessons/`

## Git state

Published commit already on `main` and GitHub Pages:

```text
3233354 Prepare launch-ready Pages release
```

Current working tree has **intentional, uncommitted** cleanup/documentation
changes. Do not discard or overwrite them. Do not commit or push unless owner
asks.

Expected changed/new paths:

```text
M  README.md
M  package-lock.json
M  package.json
M  src/styles/mauiPalette.ts
M  test/weekly-rhythm-faithful.test.mjs
?? docs/README.md
?? docs/codebase-health/
?? docs/CODEX-HANDOFF-2026-07-25.md
```

## Published release work

Commit `3233354` shipped and Pages deployment completed successfully.

### Launch/readiness fixes

- `src/components/GlobalNavigation.tsx`
  - Escape now closes open navigation through document capture, including when
    focus has left header subtree.
  - Fixed-header wordmark collision observer now covers semantic text and
    controls, not only headings/eyebrows.
- `src/components/faq/FaqSections.tsx`
  - FAQ H1 remains visually complete at first paint; its old clipped entrance
    animation no longer hides arrival content before GSAP gets a frame.
- `src/pages/Book.tsx`, `src/pages/Book.css`,
  `src/utils/submitBookingRequest.{js,d.ts}`
  - Optional `VITE_BOOKING_ENDPOINT` delivery path added.
  - Uses Formspree-compatible `fetch`, 15-second timeout, pending/retry/error
    UI, and truthful preview copy when endpoint is absent.
  - No endpoint is currently configured; preview deliberately says request
    details are ready instead of claiming a request was delivered.
- `.env.example`
  - Documents optional booking endpoint configuration.
- `scripts/booking-submission.test.mjs`
  - Covers success, endpoint error, and unconfigured endpoint behavior.
- `scripts/check-launch-readiness.mjs`
  - Covers FAQ first paint, nav collision behavior, FAQ rail release, booking
    preview truthfulness, and horizontal overflow from 320px to 1440px.

### Deploy pipeline

- `.github/workflows/deploy-pages.yml` now installs `ffmpeg`, runs
  `npm run optimize:media`, injects `VITE_BOOKING_ENDPOINT` from GitHub Pages
  variable, builds, runs SEO checks, prerenders, and deploys.
- `scripts/optimize-media.mjs` re-encodes both production source videos when
  `ffmpeg` exists. It mutates source video files; do not run casually during
  cleanup or local QA.

## Codebase health audit and safe cleanup

Full audit: `docs/codebase-health/2026-07-25-codebase-health-audit.md`  
Implementation plan: `docs/codebase-health/2026-07-25-codebase-cleanup-gameplan.md`  
Current-doc index: `docs/README.md`

Audit score before cleanup: **7.4 / 10**. Main risk: documentation drift and
large animation/controller files, not confirmed unreachable runtime code.

### Completed safe cleanup

- Added `npm run test:all`:

  ```sh
  node --test scripts/booking-submission.test.mjs test/*.mjs
  ```

- Fixed stale test `test/weekly-rhythm-faithful.test.mjs`:
  - It still expected old title `Ongoing Lessons | Maui Lessons`.
  - `578c883` intentionally changed live title to
    `Guitar & Ukulele Teacher in Kihei & Wailea, Maui`.
  - Test now asserts current title. No runtime title changed.
- Removed confirmed unused production dependency `@gsap/react` from
  `package.json` and `package-lock.json`. Direct repository-wide search found
  no source/script/test/config import.
- Removed confirmed unused `toCssRgb` and `MAUI_PALETTE_CSS_VARS` from
  `src/styles/mauiPalette.ts`. No `--maui-*` variable consumers existed;
  `toGlslVec3` remains used by `NavGradient` and `HomeAmbientBackground`.
- Removed ignored untracked Finder metadata:
  `assets/.DS_Store`, `assets/images/.DS_Store`,
  `assets/videos/.DS_Store`.
- Added validation commands and documentation guide to README/docs.

### Do not remove or move yet

These require owner/external-use/runtime proof; no deletion approval exists:

```text
public/icons.svg
assets/images/aaron-palms-beach-1.jpg
assets/images/aaron-playing-2.jpg
assets/images/aaron-beach-dance-1.jpg
assets/images/canopy-bright-1.jpg
assets/images/canopy-dense-1.jpg
assets/images/canopy-sky-1.jpg
```

They have no current source/config/test/runtime reference and source images are
omitted from Vite build, but historic design documents reference them; public
`icons.svg` can have external URL consumers.

Also do not bulk-move the 67 historical documents or touch ignored
`.worktrees/` without link/history/worktree review. Do not bulk-remove CSS or
refactor large components without runtime selector/animation coverage.

## Validation completed after safe cleanup

All passed after package/export cleanup:

```sh
npm run test:all      # 66 tests passed
npm run typecheck
npm run lint
npm run build
npm run check:seo
npm run test:launch
```

`test:launch` passed FAQ first paint, nav collision targets, FAQ rail release,
booking preview, and no horizontal overflow across tested widths 320–1440px.

Browser-oriented commands use temporary localhost servers. In restricted
sandboxes, port binding can fail with `EPERM`; rerun unchanged with permission
for local ports rather than changing tests.

## Dependency security note

`npm audit --omit=dev` currently reports two high-severity advisories through
`react-router-dom` / `react-router` 7.18.0:

```text
GHSA-qwww-vcr4-c8h2 — RSC Mode CSRF Bypass Allows Action Execution Before 400 Response
```

Npm's offered automatic fix is `react-router-dom@7.11.0`, a downgrade. No
security dependency change was made. Review React Router release notes,
applicable RSC exposure, and routing regression coverage before acting.

## Safe next steps

1. Review and commit current intentional changes as one cleanup/documentation
   commit only if owner asks.
2. Before asset removal, obtain owner confirmation that listed images/sprite
   have no planned creative or external public URL use; then use the exact
   Phase 4 validation in cleanup game plan.
3. Before documentation archive moves, make a link inventory and preserve Git
   history with `git mv`; do not treat historical docs as disposable.
4. If CI hardening is authorized, add `npm run test:all` to Pages workflow,
   then validate a full GitHub Actions run.
5. Treat `OpeningScene.tsx`, `Book.tsx`, `WeeklyJourneySections.tsx`,
   `AaronStorySections.tsx`, and `FaqSections.tsx` as high-risk refactor
   zones. Add behavior tests before splitting any of them.

## Explicit boundaries

- Do not change booking-delivery wording or configure an endpoint without
  owner-provided endpoint/consent.
- Do not run `npm run optimize:media` during cleanup unless source-video
  replacement is intended and visually reviewed.
- Do not reset/discard working-tree changes.
- Do not claim test failure from localhost `EPERM` is a code regression.

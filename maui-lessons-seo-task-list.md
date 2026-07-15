# Maui Lessons — Combined Task List (Design-Audit Score + SEO) — v3

**Purpose:** This document merges two work streams into one prioritized, execution-ready backlog: (1) fixes needed to raise the score in `maui-lessons-design-audit.md`, and (2) SEO improvements identified by direct repo inspection. It is written as an execution brief for an AI coding agent (Codex, Claude Code, or equivalent) working directly in this repository. Every open task below is self-contained: an agent should be able to open this document, jump to a single task, and complete it correctly without reading any other task first.

**Version history:**
- v1 (July 12, 2026) — baseline backlog against a 74/100 audit score. Tasks 1, 2, 4, 5, 6, 7, and 9 shipped, verified live during the July 13, 2026 re-audit (score raised to **83/100**).
- v2 (July 13, 2026) — closed out v1, added Task 11 (a P0 defect introduced by the v1 prerendering work itself), restated the remaining backlog.
- v3 (this version, July 15, 2026) — re-audited the live repo against v2's open items. **Tasks 3, 11, 12, and 13 are now done and verified** (see "Completed since v2" below). Added a new completed item for sitewide entity/structured-data and internal-link-depth work done in this pass. **Corrected an inaccuracy in the old Task 8**: it claimed `preload="metadata"` already shipped in v1 — the live code still has `preload="auto"`; that part was never actually done. Task 8 (video compression) remains open and is now additionally blocked on tooling (no `ffmpeg`/`brew` in the agent sandbox used so far). Tasks 10 and 14 remain open, unchanged.

**Repo facts (do not re-derive — read once, reuse across every task):**

- Stack: Vite 8, React 19, TypeScript 6, `react-router-dom` v7 `BrowserRouter` (client-side routing only, no SSR).
- Deploy: static GitHub Pages project site, `base: '/maui-lessons/'` (see `vite.config.ts`), live at `https://karinrub.github.io/maui-lessons/`. CI is `.github/workflows/deploy-pages.yml`: installs deps, installs Playwright + Chromium, `npm run build`, **`npm run check:seo`** (wired in as of Task 13), `npm run prerender`, copies `dist/index.html` to `dist/404.html` for SPA-fallback routing, then deploys `dist/` to Pages.
- SEO infrastructure now exists (do not rebuild): `src/hooks/useDocumentMeta.ts`, `src/config/seo.ts` (`SITE_URL` constant), `src/components/StructuredData.tsx` (`LocalBusiness` + `Organization` + `WebSite` + per-route `BreadcrumbList`, sitewide), `public/robots.txt`, `public/sitemap.xml`, `scripts/prerender.mjs` (now rewrites the local preview-server origin to `SITE_URL` before writing each `dist/**/index.html` — see Task 11), `scripts/check-seo.mjs` (`npm run check:seo`, now a CI gate).
- Project rules that override default agent behavior — read `CLAUDE.md` in full before touching anything, but the two most load-bearing rules for this task list are: **do not invent pricing, copy, addresses, logos, or other business facts not already published on the live site or confirmed by the owner**, and **run `npm run build`, `npm run lint`, `npm run typecheck`, and `npm run check:seo` after every task and confirm all four pass before considering the task done.**

**Global acceptance criteria (apply to every task below in addition to each task's own criteria):**

- [ ] `npm run build` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run check:seo` exits 0
- [ ] No bracketed/placeholder text was introduced anywhere
- [ ] No invented business facts (pricing, address, quotes, policies, logos, social URLs) were introduced
- [ ] For any task touching `scripts/prerender.mjs` output: verify with a raw HTTP fetch / raw file read of `dist/**/index.html` (not a browser devtools inspection), since client-side hydration silently hides prerender-output defects.

---

## Priority legend

- **P0** — either a confirmed, live, reproducible defect actively harming users/crawlers right now, or a hard blocker for another P0 task.
- **P1** — meaningfully raises the audit score or SEO visibility; nothing is currently broken, but the gap is confirmed and specific.
- **P2** — polish, verification, or regression-proofing work.

---

## Completed since v2 (closed — do not re-open unless a regression is found)

**Task 11 — Fix `localhost:4173` asset URLs baked into the prerendered HTML.** ✅ Verified July 15: `scripts/prerender.mjs` now captures `page.content()` and does `.replaceAll(previewOrigin, SITE_URL)` before writing each `dist/**/index.html`. Confirmed via full `build` + `prerender` + `grep -rl localhost dist/**/index.html dist/index.html` → zero matches. `og:image` on the prerendered homepage resolves to `https://karinrub.github.io/maui-lessons/assets/...`.

**Task 3 — Bring Ongoing Lessons composition up to the site's established standard.** ✅ Done via the 2026-07-15 `WeeklyJourneySections.tsx` redesign (see `CLAUDE.md` Source Map): a full horizontally-pinned, chapter-stepped scroll sequence on both desktop and mobile, with a reduced-motion vertical fallback. **Divergence from original acceptance criteria, flagged for awareness, not a defect:** the redesign dropped the Beginner/Intermediate/Advanced skill-level pill selector rather than preserving it — `SkillLevelSection.tsx` (which held it) is confirmed dead code, not imported or rendered anywhere. If the pill selector was meant to survive, it needs to be re-added deliberately; it was not carried forward.

**Task 12 — Investigate the Ongoing Lessons intro video load.** ✅ Closed via the "did not reproduce" branch: `src/components/weekly/SkillLevelSection.tsx` (line ~330) carries a dated comment — "Investigated July 13, 2026 in a normal browser: this video reached readyState 4 and played on a fresh local load. The prior HAVE_NOTHING observation was an automated-test artifact." No poster-fallback code was added (not needed, per the task's own branching logic). Note: this file is currently unrendered dead code per Task 3's note above, so this fix is dormant unless/until the component is reinstated.

**Task 13 — Wire `check:seo` into CI.** ✅ Verified: `.github/workflows/deploy-pages.yml` runs `npm run check:seo` as an explicit step (between `Build` and `Prerender routes`), no `continue-on-error`, so it fails the job on a real regression.

**New (unnumbered) — Sitewide entity signals + internal link depth + canonical audit, July 15, 2026 pass.** ✅ Done, targeting Google sitelink eligibility specifically (crawlability/entity-clarity signals, not on-page content):
- `src/components/StructuredData.tsx` gained `Organization` (`name`, `url`, `sameAs: ["https://www.facebook.com/aaron.grzanich/"]`, **no `logo`** — `public/favicon.svg` is off-palette/generic, deliberately not used, see Task 10) and `WebSite` (`name`, `url`, no `SearchAction` — site has no internal search) JSON-LD, plus a per-route `BreadcrumbList` (Home > page) on all 5 non-home routes. Verified: valid JSON, correct `@type`s, correct URLs baked into prerendered HTML.
- Internal link depth: all 6 routes now linked from ≥2 places. Home previously had only the nav-logo link — added an explicit `Home` link to `SiteFooter.tsx` and the weekly-close footer band in `WeeklyJourneySections.tsx`.
- Canonical URL audit: all 6 prerendered routes' `<link rel="canonical">` verified consistent with `sitemap.xml` (trailing slash on home only), no duplicates/mismatches.
- Nav crawlability re-confirmed: `GlobalNavigation.tsx` — all 6 routes reachable via `<Link>` with descriptive anchor text, no icon-only/vague links.

## Completed since v1 (closed — do not re-open unless a regression is found)

**Task 1 — Fix the `/book` entrance-animation hang.** ✅ `src/pages/Book.tsx` has a hard `setTimeout` fallback mirroring `OpeningScene.tsx`'s pattern.

**Task 2 — Fix the Ongoing Lessons curtain-video stall.** ✅ Content-reveal fallback shipped (narrower remainder closed as Task 12 above).

**Task 4 — Per-route meta description, canonical URL, Open Graph/Twitter tags.** ✅ Verified live on all six routes via raw HTTP fetch.

**Task 5 — Structured data (JSON-LD).** ✅ `LocalBusiness` shipped in v1; extended with `Organization`/`WebSite`/`BreadcrumbList` in the v3 pass above.

**Task 6 — `robots.txt` and `sitemap.xml`.** ✅ Verified live and re-verified July 15: both correct, all 6 routes present at `SITE_URL`.

**Task 7 — Prerender static HTML per route.** ✅ Shipped in v1; the `localhost` defect it introduced is now fixed (Task 11 above).

**Task 9 — FAQ price-anchor line.** ✅ Verified live and re-verified July 15: "Rates start at $35 for a 30-minute lesson..." still present in `src/components/faq/FaqSections.tsx`.

---

## Open

## Task 8 — Compress the 14MB hero video [Audit + SEO overlap · P2 — open, blocked on tooling]

**Objective:** `assets/videos/aaron-ukelele-vid.MP4` is ~14MB with `preload="auto"` (confirmed live in code July 15 — **a prior version of this document incorrectly claimed `preload="metadata"` had already shipped; it has not**). This is a Core Web Vitals (LCP) risk on a real mobile/cellular connection, which in turn measurably lowers the odds Google shows sitelinks for this site (page-experience score is a factor).

**Status:** A July 15, 2026 attempt to run the `ffmpeg` re-encode below failed — neither `ffmpeg` nor `brew` was available in that agent's sandboxed environment. Needs either (a) an environment/agent session with `ffmpeg` installed, or (b) the owner supplying a pre-compressed file to swap in directly.

**Implementation steps (unchanged from v2):**

1. Locate the source asset at `assets/videos/aaron-ukelele-vid.MP4` and its usage in `src/components/home/OpeningScene.tsx` (`heroVideo`).
2. Re-encode at a lower bitrate/resolution tier appropriate for a background hero — target well under 3–4MB without visible quality loss at typical display sizes:

   ```
   ffmpeg -i aaron-ukelele-vid.MP4 -vcodec libx264 -crf 28 -preset slow -an aaron-ukelele-vid-compressed.mp4
   ```

   Verify visually before committing — check for banding or blocking artifacts at the site's actual display size, not just file size.
3. Replace the asset reference in `OpeningScene.tsx` with the compressed file.
4. Re-test the existing hero-video-stall fallback (`videoLoadTimedOut`/`heroMediaSettled`) after this change to confirm it still functions correctly with the new file.
5. Consider changing `preload="auto"` to `preload="metadata"` in the same pass, since that was long assumed done and never was — verify the stall fallback and autoplay behavior still work correctly with `metadata` before shipping it.

**Acceptance criteria:**

- [ ] Hero video payload is under 4MB, measured in DevTools Network tab against the live/preview deployment.
- [ ] Poster frame (already shipped) still displays immediately on load, before the video is playable.
- [ ] Lighthouse/PageSpeed Insights LCP score for the homepage improves versus a pre-change baseline (capture both reports and note the delta in the PR description).
- [ ] Stall-fallback behavior still works when video load is artificially blocked/throttled (DevTools network throttling or blocking `**/*.mp4`).

---

## Task 10 — Replace the generic favicon with a branded one [SEO · P2 — open, owner decision needed]

**Objective:** `public/favicon.svg` exists but is still generic/unbranded (a purple abstract mark, off-palette from the site's forest-green/gold/cream system — reconfirmed July 15). Minimal direct ranking impact, but affects click-through in search results, browser tabs/bookmarks, and was deliberately *not* used as `Organization.logo` in the July 15 structured-data pass for the same off-brand reason.

**Implementation steps:**

1. This requires a design-asset decision — flag to the site owner for approval of a mark derived from the site's existing visual system (e.g. the ghost-numeral/wordmark motif, or a simplified ukulele silhouette in the site's forest-green) rather than inventing brand iconography unilaterally.
2. Once approved, replace `public/favicon.svg` in place (same filename, same `<link>` reference in `index.html`).
3. Generate and add standard fallback sizes (`favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`) from the new SVG, referenced in `index.html`'s `<head>` alongside the existing SVG link.
4. Once a branded mark exists, also add it as `logo` to the `Organization` JSON-LD block in `src/components/StructuredData.tsx` (an absolute `SITE_URL`-based URL, per schema.org `ImageObject`/URL conventions) — this was deliberately left out in the July 15 pass pending this asset.

**Acceptance criteria:**

- [ ] Browser tab, bookmark, and mobile home-screen icon all show the new branded mark, not the previous generic one.
- [ ] `Organization.logo` added to `StructuredData.tsx` once the asset exists.

---

## Task 14 — Real-device mobile QA [Audit · P2 — requires a human, cannot be completed by an AI agent alone]

**Objective:** True narrow-viewport (≤430px) behavior has been unverifiable by an AI agent across all audits to date (this testing environment cannot force a true small viewport — window resize succeeds but `window.innerWidth` doesn't follow). This caps the Mobile Responsiveness score regardless of code quality until someone confirms it on an actual phone.

**What to check, one real phone, on cellular data if possible (not just wifi):**

1. Homepage hero-video-stall fallback: does the tagline/arch/deck sequence still work if the video is slow to load on a real cellular connection?
2. `/book`: confirm the entrance animation resolves correctly on a real mobile Safari/Chrome session.
3. `/weekly-lessons`: confirm the pinned horizontal chapter sequence (2026-07-15 redesign) behaves correctly on a real phone — this is new since the last mobile QA pass and has only been checked in an automated/desktop-viewport environment so far.
4. General narrow-viewport layout check across all six routes for any overflow, cut-off text, or broken tap targets at real small-screen widths.

**This is not a coding task.** If issues are found, file them as new, specific tasks in a future version of this document with exact repro steps (device, browser, network condition, screenshot) rather than fixing anything speculatively.

**Acceptance criteria:**

- [ ] A specific person has tested on a specific real device and reported pass/fail for each of the four checks above.
- [ ] Any failures found are documented as new tasks with repro steps, not silently patched without confirmation.

---

## Explicitly out of scope for this document

- Booking form submission/routing (`handleSubmit` in `Book.tsx`) — intentionally deferred pending a Formspree form ID from the site owner.
- Real testimonials — pending owner-supplied content.
- Analytics/tag-manager setup, paid search, and off-site/backlink SEO — none are coding tasks executable unilaterally against this repository.

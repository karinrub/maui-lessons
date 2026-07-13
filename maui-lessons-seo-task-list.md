# Maui Lessons — Combined Task List (Design-Audit Score + SEO) — v2

**Purpose:** This document merges two work streams into one prioritized, execution-ready backlog: (1) fixes needed to raise the score in `maui-lessons-design-audit.md`, and (2) SEO improvements identified by direct repo inspection. It is written as an execution brief for an AI coding agent (Codex, Claude Code, or equivalent) working directly in this repository. Every open task below is self-contained: an agent should be able to open this document, jump to a single task, and complete it correctly without reading any other task first.

**Version history:**
- v1 (July 12, 2026) — baseline backlog against a 74/100 audit score. Tasks 1, 2, 4, 5, 6, 7, and 9 have since shipped and were independently verified live on `https://karinrub.github.io/maui-lessons/` during the July 13, 2026 re-audit (score raised to **83/100**). See "Completed since v1" below for evidence.
- v2 (this version, July 13, 2026) — closes out the completed tasks, adds one new P0 discovered by that same re-audit (a defect introduced by the v1 prerendering work itself), and restates the remaining backlog needed to keep pushing the score up. **Goal for this pass: address and close every open item below**, not just the P0.

**Repo facts (do not re-derive — read once, reuse across every task):**

- Stack: Vite 8, React 19, TypeScript 6, `react-router-dom` v7 `BrowserRouter` (client-side routing only, no SSR).
- Deploy: static GitHub Pages project site, `base: '/maui-lessons/'` (see `vite.config.ts`), live at `https://karinrub.github.io/maui-lessons/`. CI is `.github/workflows/deploy-pages.yml`: installs deps, installs Playwright + Chromium, runs `npm run build`, then `npm run prerender`, then copies `dist/index.html` to `dist/404.html` for SPA-fallback routing, then deploys `dist/` to Pages.
- SEO infrastructure now exists (added in v1, do not rebuild): `src/hooks/useDocumentMeta.ts`, `src/config/seo.ts` (`SITE_URL` constant), `src/components/StructuredData.tsx`, `public/robots.txt`, `public/sitemap.xml`, `scripts/prerender.mjs`, `scripts/check-seo.mjs` (`npm run check:seo`).
- Project rules that override default agent behavior — read `CLAUDE.md` in full before touching anything, but the two most load-bearing rules for this task list are: **do not invent pricing, copy, addresses, or other business facts not already published on the live site**, and **run `npm run build`, `npm run lint`, and `npm run typecheck` after every task and confirm all three pass before considering the task done.**

**Global acceptance criteria (apply to every task below in addition to each task's own criteria):**

- [ ] `npm run build` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] No bracketed/placeholder text was introduced anywhere
- [ ] No invented business facts (pricing, address, quotes, policies) were introduced
- [ ] For any task touching `scripts/prerender.mjs` output: verify with a raw HTTP fetch of the deployed HTML (not a browser devtools inspection), since client-side hydration silently hides prerender-output defects.

---

## Priority legend

- **P0** — either a confirmed, live, reproducible defect actively harming users/crawlers right now, or a hard blocker for another P0 task.
- **P1** — meaningfully raises the audit score or SEO visibility; nothing is currently broken, but the gap is confirmed and specific.
- **P2** — polish, verification, or regression-proofing work.

---

## Completed since v1 (closed — do not re-open unless a regression is found)

**Task 1 — Fix the `/book` entrance-animation hang.** ✅ Verified July 13: reloaded `/book` three separate times; `.bw-panel` computed `visibility: visible` and all hero-word transforms settled to identity within 3–4 seconds every time. `src/pages/Book.tsx` now has a hard `setTimeout` fallback mirroring `OpeningScene.tsx`'s pattern.

**Task 2 — Fix the Ongoing Lessons curtain-video stall.** ✅ Verified July 13: `/weekly-lessons` reliably reveals its heading, copy, tabs, and "how it works" section on repeated fresh loads. `src/components/weekly/SkillLevelSection.tsx` now has a 3-second `IntersectionObserver` + `setTimeout` fallback. Note: a narrower, lower-severity remainder of this task survives as a new item below (Task 12 — the background video itself doesn't load, even though the fallback correctly reveals the surrounding content).

**Task 4 — Per-route meta description, canonical URL, Open Graph/Twitter tags.** ✅ Verified live on all six routes via raw HTTP fetch (no JS executed): distinct `<title>`, `<meta name="description">`, `<link rel="canonical">`, and full OG/Twitter tag sets per route.

**Task 5 — Structured data (JSON-LD).** ✅ Verified: exactly one `LocalBusiness` script tag present sitewide, no duplication across routes, valid JSON.

**Task 6 — `robots.txt` and `sitemap.xml`.** ✅ Verified live: both files fetch correctly with valid content.

**Task 7 — Prerender static HTML per route.** ✅ Verified: raw HTTP fetch of all six routes returns real titles, meta tags, a single correct `<h1>`, and full visible body copy with no JS execution. **However, this task shipped with a defect — see Task 11 (new) below, which must be fixed before this can be considered fully done.**

**Task 9 — FAQ price-anchor line.** ✅ Verified live: "Rates start at $35 for a 30-minute lesson. The exact rate depends on the lesson type and how often you'd like to meet — send a booking request and Aaron will confirm current pricing with you directly."

---

## Execution order (v2)

1. **Tier 1 (P0):** Task 11
2. **Tier 2 (P1):** Task 3
3. **Tier 3 (P2, parallelizable):** Task 8, Task 10, Task 12, Task 13
4. **Tier 4 (P2, requires a human, not an agent):** Task 14

---

## Task 11 — Fix `localhost:4173` asset URLs baked into the prerendered HTML [SEO · P0 — NEW]

**Objective:** The July 13 re-audit fetched the raw HTML (no JS executed) of all six live routes and found every route's `og:image`/`twitter:image` meta tags, plus several in-page `<img>`/`<video>` `src` attributes (including the homepage hero photo and hero video, and the Ongoing Lessons intro video), resolve to `http://localhost:4173/maui-lessons/assets/...` instead of `https://karinrub.github.io/maui-lessons/assets/...`. `localhost:4173` is the local `vite preview` server that `scripts/prerender.mjs` spins up during the build — that address is meaningless outside the CI runner and is unreachable from the internet.

**Why this is P0:** This defect is invisible to a normal visitor, because `src/main.tsx` uses `createRoot` (not `hydrateRoot`), so the browser immediately replaces the prerendered markup with a fresh client-side render, and the JS-computed `og:image` value is correct. But it is exactly wrong for the audience Task 7 was built to serve: any crawler or bot that reads the static HTML without executing JavaScript (social-share preview generators for iMessage/Facebook/Slack, and some search engine crawlers) will try to load a preview image from `localhost:4173` and fail. Right now, sharing a link to this site anywhere will likely produce a broken image in the preview card.

**Root-cause hypothesis to verify first:** Open `scripts/prerender.mjs`. It calls Vite's `preview()` to start a local server, resolves `baseUrl` from `server.resolvedUrls.local[0]` (which will be something like `http://localhost:4173/maui-lessons/`), navigates Playwright to each route relative to that `baseUrl`, and writes `page.content()` verbatim to `dist/**/index.html`. Any asset URL that was resolved absolutely by the browser during that snapshot (via `new URL(..., import.meta.url).href` in component source, e.g. `src/hooks/useDocumentMeta.ts`'s `DEFAULT_IMAGE`, `OpeningScene.tsx`'s `heroVideo`, `SkillLevelSection.tsx`'s `weeklyVideo`) will resolve against `window.location.origin` at snapshot time — which is the local preview server, not `SITE_URL`.

**Implementation steps:**

1. Reproduce locally first: run `npm run build && npm run prerender`, then `grep -r "localhost" dist/*.html dist/*/index.html` (or open a prerendered file directly) and confirm the same `localhost:4173` URLs appear in the local output. Do not attempt a fix before confirming you can see the bug locally.
2. Preferred fix: after `page.content()` is captured for each route in `scripts/prerender.mjs`, run a string replace on the captured HTML that rewrites the resolved preview-server origin (whatever `baseUrl`'s origin actually is, e.g. `http://localhost:4173`) to `SITE_URL` (imported from `src/config/seo.ts`) before writing the file. This is more robust than trying to change what origin Playwright/Vite resolves assets against.
3. Alternative fix (only if step 2 proves insufficient): investigate whether Vite's `preview()` can be configured to serve on a host/port that matches production, or whether a `<base>`-tag / origin override can be injected before the snapshot is taken. Prefer the string-replace approach unless it demonstrably breaks something else.
4. After the fix, rebuild and re-run the prerender step, then grep the output again to confirm zero remaining `localhost` occurrences in any `dist/**/index.html`.
5. Deploy (or wait for the next CI run) and re-verify with a raw HTTP fetch of the live site — a browser-based check will not catch this, since hydration hides it.

**Acceptance criteria:**

- [ ] `grep -r "localhost" dist/` (after a full `build` + `prerender`) returns zero matches in any `index.html`.
- [ ] A raw HTTP fetch (not a browser) of all six live routes shows `og:image`/`twitter:image` and every asset `src` resolving to `https://karinrub.github.io/maui-lessons/assets/...`.
- [ ] Client-side (post-hydration) behavior is unchanged — this is a build-output fix only, not a runtime code change.
- [ ] Spot-check the fix against Facebook's Sharing Debugger or a similar link-preview tool once deployed, if available.

---

## Task 3 — Bring Ongoing Lessons composition up to the site's established standard [Audit · P1 — carried over, unchanged]

**Objective:** Still the flattest, least art-directed page on the site — a tab selector, a static numbered "how it works" list (confirmed via raw HTML fetch on July 13: three plain numbered entries, no pinned sequencing), and a CTA — with none of the scroll-pinned sequencing used on Home, Vacation Lessons, and About. This is now the single largest remaining gap in the Layout/Composition score.

**Implementation steps:**

1. Do not build new motion infrastructure. Reuse the existing `ScrollTrigger` pin pattern already implemented for the homepage card carousel (`src/hooks/useHomeScrollSequence.ts` and `src/components/home/StackedServicesDeck.tsx`) as the reference implementation.
2. Convert the static "how it works" numbered list in `src/components/weekly/WeeklyJourneySections.tsx` into a pinned, scroll-driven sequence consistent with that pattern — `CLAUDE.md` already notes this section is "pinned on desktop, unpinned on mobile," so confirm the current implementation and extend/adjust rather than rebuilding from scratch if partial pinning already exists.
3. Preserve the existing skill-level pill selector (Beginner/Intermediate/Advanced) unchanged — both prior audits called this out as the best-executed interaction on the page; do not regress it.
4. Test both normal motion and `prefers-reduced-motion` per `CLAUDE.md`'s agent rules.

**Acceptance criteria:**

- [ ] The "how it works" section reads as a paced, sequential reveal on desktop, not a static stacked list.
- [ ] Mobile behavior remains functional (unpinned/in-flow, per existing documented pattern).
- [ ] Skill-level pill selector still functions identically to before.
- [ ] `prefers-reduced-motion` fallback renders the fully-visible static layout with no pins.

---

## Task 8 — Compress the 14MB hero video [Audit + SEO overlap · P2 — carried over, partially done]

**Objective:** `preload="auto"` was changed to `preload="metadata"` and a `poster` frame was added in v1 (confirmed via source diff) — that part is done and verified. The underlying video file itself (`assets/videos/aaron-ukelele-vid.MP4`) is unchanged and still ~14MB. This remains a Core Web Vitals (LCP) risk on a real mobile/cellular connection.

**Implementation steps:**

1. Locate the source asset at `assets/videos/aaron-ukelele-vid.MP4` and its usage in `src/components/home/OpeningScene.tsx` (`heroVideo`).
2. Re-encode at a lower bitrate/resolution tier appropriate for a background hero — target well under 3–4MB without visible quality loss at typical display sizes:

   ```
   ffmpeg -i aaron-ukelele-vid.MP4 -vcodec libx264 -crf 28 -preset slow -an aaron-ukelele-vid-compressed.mp4
   ```

   Verify visually before committing — check for banding or blocking artifacts at the site's actual display size, not just file size.
3. Replace the asset reference in `OpeningScene.tsx` with the compressed file (keep the existing `.MP4`/`.mp4` extension convention consistent with the rest of the codebase, or update the import accordingly).
4. Re-test the existing hero-video-stall fallback (`videoLoadTimedOut`/`heroMediaSettled`) after this change to confirm it still functions correctly with the new file and `preload="metadata"`.

**Acceptance criteria:**

- [ ] Hero video payload is under 4MB, measured in DevTools Network tab against the live/preview deployment.
- [ ] Poster frame (already shipped) still displays immediately on load, before the video is playable.
- [ ] Lighthouse/PageSpeed Insights LCP score for the homepage improves versus a pre-change baseline (capture both reports and note the delta in the PR description).
- [ ] Stall-fallback behavior still works when video load is artificially blocked/throttled (DevTools network throttling or blocking `**/*.mp4`).

---

## Task 10 — Replace the generic favicon with a branded one [SEO · P2 — carried over, unchanged]

**Objective:** `public/favicon.svg` exists but is still generic/unbranded. Minimal direct ranking impact, but affects click-through in search results and browser tabs/bookmarks.

**Implementation steps:**

1. This requires a design-asset decision — flag to the site owner for approval of a mark derived from the site's existing visual system (e.g. the ghost-numeral/wordmark motif, or a simplified ukulele silhouette in the site's forest-green) rather than inventing brand iconography unilaterally.
2. Once approved, replace `public/favicon.svg` in place (same filename, same `<link>` reference in `index.html`).
3. Generate and add standard fallback sizes (`favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`) from the new SVG, referenced in `index.html`'s `<head>` alongside the existing SVG link.

**Acceptance criteria:**

- [ ] Browser tab, bookmark, and mobile home-screen icon all show the new branded mark, not the previous generic one.

---

## Task 12 — Investigate the Ongoing Lessons intro video load [Audit · P2 — NEW, narrower remainder of Task 2]

**Objective:** Task 2's fix (the `IntersectionObserver` + timeout fallback) reliably reveals the curtain-intro's *content* — this was the fix that mattered most and is closed. But the July 13 re-audit found that the background video behind that content (`aaron-weekly-section.mp4`) never begins loading in the tested (automated Chrome MCP) session: `video.readyState` stayed at `0` (`HAVE_NOTHING`) and no matching network request fired, leaving a blank cream box where motion was intended.

**Confidence note:** This may be a testing-environment artifact — automated/headless browser sessions sometimes apply stricter autoplay/media-loading restrictions than a real user's browser. It is explicitly not escalated to P0 or P1 because the content fallback already covers the failure mode that mattered (a permanently stuck page). Do not over-invest here without first confirming it reproduces on a real device.

**Implementation steps:**

1. Test locally (`npm run dev`) in a normal, non-automated Chrome/Safari/Firefox session on a real machine, on a fresh hard reload of `/weekly-lessons`, and check whether `document.querySelector('video').readyState` reaches `4` (or at least starts increasing from `0`) within a few seconds.
2. If it reproduces in a real browser too: add an explicit `error`/`stalled` event listener on the `<video>` element in `src/components/weekly/SkillLevelSection.tsx`, and fall back to a static poster image (reuse `beginnerImage` or a dedicated frame) if the video hasn't reached `readyState >= 2` within ~2–3 seconds — mirroring the poster-fallback pattern used for the homepage hero in Task 8.
3. If it does **not** reproduce in a real browser: leave a comment in `SkillLevelSection.tsx` near the video element documenting that this was investigated and ruled out as an automated-testing-environment artifact, with the date, so a future agent doesn't re-investigate the same non-issue.

**Acceptance criteria:**

- [ ] Either a poster-fallback is shipped and verified to trigger correctly when video load is artificially blocked (DevTools: block `**/*.mp4`), or a code comment documents that the issue was investigated and not reproduced on a real device.
- [ ] No change to the already-fixed content-reveal fallback from Task 2.

---

## Task 13 — Wire `check:seo` into CI [SEO · P2 — NEW]

**Objective:** `scripts/check-seo.mjs` (`npm run check:seo`) already exists and automates the `<h1>`-count-per-route and missing-`alt` checks that both design audits have so far performed manually. It is not currently invoked anywhere in `.github/workflows/deploy-pages.yml` — confirmed by reading the workflow file, which runs `build` and `prerender` but never `check:seo`. Right now it only runs if a developer remembers to invoke it locally, which means a future regression to `<h1>` or `alt` coverage would ship silently.

**Implementation steps:**

1. Open `.github/workflows/deploy-pages.yml`. Add a `Run SEO checks` step after the existing `Build` step and before `Prerender routes` (or after prerender — either works since `check-seo.mjs`, like `prerender.mjs`, spins up its own `vite preview()` server against `dist/`).
2. Use the same `run: npm run check:seo` convention as the existing `Build`/`Prerender routes` steps.
3. Confirm the workflow fails the job (non-zero exit) if `check-seo.mjs` finds a violation — it already sets `process.exitCode = 1` on failure, so this should work automatically once wired in; just confirm the GitHub Actions step doesn't have `continue-on-error: true` or similar swallowing the failure.
4. Test by temporarily removing an `alt` attribute from one image locally, running `npm run build && npm run check:seo`, and confirming it fails with a clear message — then revert the temporary change.

**Acceptance criteria:**

- [ ] `.github/workflows/deploy-pages.yml` runs `npm run check:seo` as an explicit step.
- [ ] A deliberately-broken local test (missing `alt` or duplicate `<h1>`) causes `npm run check:seo` to exit non-zero with a clear failure message, confirmed before wiring into CI.
- [ ] A normal, unmodified build passes the new CI step.

---

## Task 14 — Real-device mobile QA [Audit · P2 — requires a human, cannot be completed by an AI agent alone]

**Objective:** True narrow-viewport (≤430px) behavior has been unverifiable by an AI agent across all three audits to date (this testing environment cannot force a true small viewport — window resize succeeds but `window.innerWidth` doesn't follow). This caps the Mobile Responsiveness score regardless of code quality until someone confirms it on an actual phone.

**What to check, one real phone, on cellular data if possible (not just wifi):**

1. Homepage hero-video-stall fallback: does the tagline/arch/deck sequence still work if the video is slow to load on a real cellular connection? (Verifies the `videoLoadTimedOut`/`heroMediaSettled` pattern under real-world network conditions, not just artificial DevTools throttling.)
2. `/book`: confirm the entrance animation (fixed in Task 1) resolves correctly on a real mobile Safari/Chrome session, not just this session's desktop-viewport testing.
3. `/weekly-lessons`: same check for the curtain-intro fix (Task 2), plus visually confirm whether the intro video plays or shows a blank box (relevant to Task 12).
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

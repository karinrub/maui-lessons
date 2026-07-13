# Maui Lessons — Combined Task List (Design-Audit Score + SEO)

**Purpose:** This document merges two prior work streams into one prioritized, execution-ready backlog: (1) fixes needed to raise the score in `maui-lessons-design-audit.md` (re-audit, July 12, 2026 — current score 74/100), and (2) SEO improvements identified by direct repo inspection. It is written as an execution brief for an AI coding agent (Codex or equivalent) working directly in this repository. Every task below is self-contained: an agent should be able to open this document, jump to a single task, and complete it correctly without reading any other task first.

**Repo facts (do not re-derive — read once, reuse across every task):**

- Stack: Vite 8, React 19, TypeScript 6, `react-router-dom` v7 `BrowserRouter` (client-side routing only, no SSR).
- Deploy: static GitHub Pages project site, `base: '/maui-lessons/'` (see `vite.config.ts`), live at `https://karinrub.github.io/maui-lessons/`.
- No `react-helmet`/`react-helmet-async` or any SEO/meta-tag library is installed. Follow the existing lightweight-hook convention in `src/hooks/useDocumentTitle.ts` instead of adding a dependency unless a task explicitly says otherwise.
- No `robots.txt` or `sitemap.xml` exists in `public/` yet.
- Routes (`src/App.tsx`): `/` (Home), `/tourist-lessons` (Vacation Lessons), `/weekly-lessons` (Ongoing Lessons), `/about`, `/faq`, `/book`.
- Project rules that override default agent behavior — read `CLAUDE.md` in full before touching anything, but the two most load-bearing rules for this task list are: **do not invent pricing, copy, addresses, or other business facts not already published on the live site**, and **run `npm run build`, `npm run lint`, and `npm run typecheck` after every task and confirm all three pass before considering the task done.**

**Global acceptance criteria (apply to every task below in addition to each task's own criteria):**

- [ ] `npm run build` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] No bracketed/placeholder text was introduced anywhere
- [ ] No invented business facts (pricing, address, quotes, policies) were introduced

---

## Priority legend

- **P0** — either a confirmed, live, reproducible defect actively harming users/crawlers right now, or a hard blocker for another P0 task.
- **P1** — meaningfully raises the audit score or SEO visibility; nothing is currently broken, but the gap is confirmed and specific.
- **P2** — polish, verification, or regression-proofing work.

---

## Execution order

Run tasks in this order. Tasks in the same tier can run in parallel/any order relative to each other; do not start a later tier until every task in an earlier tier that it depends on (noted per-task) is done.

1. **Tier 1 (P0):** Task 1 → Task 2
2. **Tier 2 (P1):** Task 3, Task 4, Task 5, Task 6 (parallelizable)
3. **Tier 3 (P1, depends on Tier 2):** Task 7
4. **Tier 4 (P2):** Task 8, Task 9, Task 10, Task 11 (parallelizable)

---

## Task 1 — Fix the `/book` entrance-animation hang [Audit · P0]

**Objective:** On the live site, `https://karinrub.github.io/maui-lessons/book` fails to render usable content. Confirmed via three independent fresh page loads in the design audit: `.bw-panel`'s computed `visibility` stays `hidden` indefinitely, and `.bw-hero-word-inner` elements remain frozen at non-zero `translateY` transform values instead of settling to `0`. The correct step content exists in the DOM underneath (verified by force-overriding inline styles via script and confirming the real copy renders) — this is a stuck GSAP entrance timeline, not missing content. This is the single highest-priority item in this entire document: it blocks the site's primary conversion action, and it blocks Task 7 (prerendering) from having any usable content to capture on this route.

**Root-cause hypothesis to verify first:** `src/pages/Book.tsx` was recently redesigned to remove the old dark "canvas" card element and its associated glow layer. Check every `useLayoutEffect` in that file for refs or DOM queries (e.g. a `canvasRef`, `.bw-canvas`, `.bw-canvas-glow` selector) that assumed those elements still exist. A `gsap.timeline()` chained `.to(canvas, {...})` call where `canvas` is `null`, or an early-return guard clause (`if (!canvas) return`) that now always fires and skips building the rest of the timeline, are the two most likely causes — confirm which by adding temporary logging, not by guessing.

**Implementation steps:**

1. Open `src/pages/Book.tsx`. Search for every ref (`useRef`) and every `useLayoutEffect`/`useEffect` that manipulates GSAP tweens tied to the hero headline (`.bw-hero-word-inner`) and the step panel (`.bw-panel`).
2. Identify and remove any remaining reference to removed elements (old canvas/glow divs). If the entrance timeline was structured as a single chained sequence that included a step for the now-deleted canvas, restructure it to animate only the elements that still exist: the hero word reveal, then the step panel/rail/option-row reveal.
3. Add a hard fallback: regardless of animation completion, the hero headline and step panel must become fully visible within a bounded time (e.g. 2–3 seconds), mirroring the existing stall-fallback pattern already used for the homepage hero video in `src/components/home/OpeningScene.tsx` (`videoLoadTimedOut`/`heroMediaSettled`). This is a defense-in-depth requirement, not just a bug patch — the goal is that no future regression in this file can ever again leave the booking flow permanently invisible.
4. Confirm the `prefers-reduced-motion` branch (if one exists in this file) independently renders the fully-visible static layout with zero tweens — this path must not be affected by whatever broke the animated path.

**Acceptance criteria:**

- [ ] Load `/book` in a fresh browser tab (hard reload, cache disabled) three separate times; each time, within 3 seconds, the step panel (progress rail, "Choose your experience" heading, the two lesson-type rows) is fully visible with `visibility: visible` and no leftover transform offset on any hero word.
- [ ] Repeat with the OS/browser `prefers-reduced-motion: reduce` setting enabled — content must appear immediately with no animation.
- [ ] Step through all five wizard steps (lesson type → participants → date/time → contact → confirm) end to end and confirm each step's content is visible and interactive.
- [ ] No new console errors introduced.

---

## Task 2 — Investigate and fix the Ongoing Lessons curtain-video stall [Audit · P0]

**Objective:** On two independent page loads during the design audit, `/weekly-lessons` never progressed past its "curtain video intro" placeholder (a static sage-colored block). No `.mp4` network request was observed firing during the stall window, which points to a client-side JS stall rather than a slow asset fetch — the same failure *signature* as Task 1, though not confirmed to share a root cause.

**Implementation steps:**

1. Open `src/components/weekly/SkillLevelSection.tsx` and locate the curtain-video-intro logic.
2. Reproduce locally: run `npm run dev`, navigate to `/weekly-lessons`, hard-reload multiple times, and confirm whether the stall reproduces in a controlled environment. If it does not reproduce locally, add temporary console logging around the video's `loadeddata`/`canplay`/`error` event listeners and the intro-reveal trigger, deploy to a preview build if necessary, and determine what condition the reveal logic is actually waiting on.
3. Whatever the root cause, apply the same fix pattern as `OpeningScene.tsx`'s existing hero-video-stall fallback and Task 1's new fallback: a bounded timeout that reveals the page content regardless of video load state.
4. If, after investigation, this turns out to be a testing-environment artifact rather than a real defect (e.g., a network condition specific to the audit's sandboxed browser), document that finding in a comment or commit message rather than silently closing the task — this needs to be either fixed or explicitly ruled out, not left ambiguous.

**Acceptance criteria:**

- [ ] `/weekly-lessons` reliably reaches its fully-revealed state within a bounded time on repeated fresh loads, both locally and on the deployed site.
- [ ] If a fallback timeout was added, verify it does not fire prematurely under normal video load conditions (i.e., it shouldn't visibly interrupt a video that's loading normally within a couple seconds).

---

## Task 3 — Bring Ongoing Lessons composition up to the site's established standard [Audit · P1]

**Objective:** Unchanged since the original audit: `/weekly-lessons` is the flattest, least art-directed page on the site — a tab selector, a static vertical "how it works" list, and a CTA — with none of the scroll-pinned sequencing used on Home, Vacation Lessons, and About. This is the most visible remaining "template-adjacent" section on an otherwise bespoke site.

**Implementation steps:**

1. Do not build new motion infrastructure. Reuse the existing `ScrollTrigger` pin pattern already implemented for the homepage card carousel (`src/hooks/useHomeScrollSequence.ts` and `src/components/home/StackedServicesDeck.tsx`) as the reference implementation.
2. Convert the static "how it works" numbered list in `src/components/weekly/WeeklyJourneySections.tsx` into a pinned, scroll-driven sequence consistent with that pattern — CLAUDE.md already notes this section is "pinned on desktop, unpinned on mobile," so confirm the current implementation and extend/adjust rather than rebuilding from scratch if partial pinning already exists.
3. Preserve the existing skill-level pill selector (Beginner/Intermediate/Advanced) unchanged — the audit specifically called this out as the best-executed interaction on the page; do not regress it.
4. Test both normal motion and `prefers-reduced-motion` per `CLAUDE.md`'s agent rules.

**Acceptance criteria:**

- [ ] The "how it works" section reads as a paced, sequential reveal on desktop, not a static stacked list.
- [ ] Mobile behavior remains functional (unpinned/in-flow, per existing documented pattern).
- [ ] Skill-level pill selector still functions identically to before.
- [ ] `prefers-reduced-motion` fallback renders the fully-visible static layout with no pins.

---

## Task 4 — Add per-route meta description, canonical URL, and Open Graph/Twitter tags [SEO · P1]

**Objective:** No route currently emits a unique `<title>`/description — every route falls back to the generic `<title>Maui Lessons</title>` in `index.html` with no `<meta name="description">`, no canonical `<link>`, and no Open Graph/Twitter Card tags anywhere in the codebase. Social-share previews (iMessage, Facebook, Instagram bio links) and search snippets currently render with no description and no preview image.

**Implementation steps:**

1. Create `src/hooks/useDocumentMeta.ts`, mirroring the existing pattern in `src/hooks/useDocumentTitle.ts`:

   ```ts
   type DocumentMetaOptions = {
     title: string
     description: string
     path: string // e.g. '/tourist-lessons' — used to build canonical URL and og:url
     image?: string // absolute URL; falls back to a sitewide default if omitted
   }

   export default function useDocumentMeta(options: DocumentMetaOptions): void
   ```

   Find-or-create each tag by a stable attribute (e.g. `data-managed="true"` plus `name`/`property`) so route changes update tags in place instead of duplicating them. Set: `meta[name=description]`, `link[rel=canonical]`, `og:title`, `og:description`, `og:type` (`website`), `og:url`, `og:image`, `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`.

2. Create `src/config/seo.ts` exporting a single `SITE_URL = 'https://karinrub.github.io/maui-lessons'` constant — every route's canonical/`og:url` must derive from this one constant, not be hardcoded six times.
3. In each page component (`Home.tsx`, `TouristLessons.tsx`, `WeeklyLessons.tsx`, `About.tsx`, `FAQ.tsx`, `Book.tsx`), call `useDocumentMeta({...})` alongside the existing `useDocumentTitle(...)` call. Reuse copy already live on each page — do not write new marketing copy. Example:

   ```ts
   useDocumentMeta({
     title: 'Vacation Ukulele Lessons in Maui | Maui Lessons',
     description:
       "A private, unhurried ukulele lesson on a Maui beach — no experience needed. Lessons meet at Maipoina Beach Park and along the coast through Kihei and Wailea.",
     path: '/tourist-lessons',
   })
   ```

4. Set one sitewide fallback `og:image` (an existing hero/beach photo from `assets/`) for routes that don't specify their own. Leave a code comment noting that a purpose-built 1200×630 social card is a follow-up design task, not a coding blocker.

**Acceptance criteria:**

- [ ] `document.title` and `document.querySelector('meta[name="description"]').content` differ per route, verified on all six routes.
- [ ] `document.querySelector('link[rel="canonical"]').href` matches the correct absolute URL per route.
- [ ] Meta tags update in place on client-side route navigation (no duplicate tags accumulate — check `document.querySelectorAll('meta[name="description"]').length === 1` after navigating between two routes without a full reload).

---

## Task 5 — Add structured data (JSON-LD) for the business [SEO · P1]

**Objective:** No structured data exists anywhere on the site. `LocalBusiness` schema is one of the highest-leverage additions available for a local, in-person service business.

**Implementation steps:**

1. Create `src/components/StructuredData.tsx` — renders nothing visible, injects a `<script type="application/ld+json">` into `<head>` via `useEffect`, using the same find-or-create-by-id pattern as Task 4 to avoid duplicate injection on remount.
2. Populate using only facts already published on the live site — do not invent an address, phone number, or rating:

   ```json
   {
     "@context": "https://schema.org",
     "@type": "LocalBusiness",
     "name": "Maui Lessons",
     "description": "Private ukulele and guitar lessons on Maui, taught by Aaron Grzanich, for vacationing visitors and local students.",
     "url": "https://karinrub.github.io/maui-lessons/",
     "areaServed": { "@type": "Place", "name": "South Maui (Kihei, Wailea)" },
     "founder": { "@type": "Person", "name": "Aaron Grzanich" }
   }
   ```

3. Render `<StructuredData />` once in `src/layout/SiteLayout.tsx` (layout level, not per-page — business identity doesn't change by route).
4. Do not add `aggregateRating`, `priceRange`, or a physical `address` field unless that exact data already exists elsewhere on the live site.

**Acceptance criteria:**

- [ ] `document.querySelector('script[type="application/ld+json"]')` returns exactly one tag on every route.
- [ ] JSON parses without error and validates with zero errors in Google's Rich Results Test once deployed.

---

## Task 6 — Add `robots.txt` and `sitemap.xml` [SEO · P1]

**Objective:** Neither file exists in `public/`. Without a sitemap, search engines rely entirely on crawled-link discovery, which is slower and less reliable for a client-rendered SPA.

**Implementation steps:**

1. Create `public/robots.txt`:

   ```
   User-agent: *
   Allow: /

   Sitemap: https://karinrub.github.io/maui-lessons/sitemap.xml
   ```

2. Create `public/sitemap.xml` with all six live routes (include the `/maui-lessons/` base path):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url><loc>https://karinrub.github.io/maui-lessons/</loc></url>
     <url><loc>https://karinrub.github.io/maui-lessons/tourist-lessons</loc></url>
     <url><loc>https://karinrub.github.io/maui-lessons/weekly-lessons</loc></url>
     <url><loc>https://karinrub.github.io/maui-lessons/about</loc></url>
     <url><loc>https://karinrub.github.io/maui-lessons/faq</loc></url>
     <url><loc>https://karinrub.github.io/maui-lessons/book</loc></url>
   </urlset>
   ```

3. `public/` is copied verbatim to `dist/` by Vite — no build-config change needed. After `npm run build`, verify both files land unmodified in `dist/`.
4. Leave a one-line comment at the top of `sitemap.xml` noting it's manually maintained; if routes are ever added/renamed, this file must be updated in the same PR.

**Acceptance criteria:**

- [ ] `dist/robots.txt` and `dist/sitemap.xml` exist post-build with correct content.
- [ ] Both files are syntactically valid (robots.txt per spec, sitemap.xml is well-formed XML).

---

## Task 7 — Prerender static HTML per route [SEO · P1 — depends on Tasks 1, 4, 5]

**Objective:** This site is a pure client-side SPA. GitHub Pages serves the same near-empty HTML shell for every route until React hydrates. Most social-preview crawlers (iMessage, Facebook, Slack) and some search engines do not execute JavaScript, so Task 4 and Task 5's tags may never be seen by them despite being correctly injected at runtime. This task generates real pre-rendered HTML per route at build time.

**Why this depends on Tasks 1, 4, 5:** Prerendering `/book` while it's stuck in the entrance-animation hang (Task 1) would freeze a broken, near-empty page into the static output. Prerendering before Task 4/5 exist would capture only the generic fallback title/meta with nothing to prerender.

**Implementation steps:**

1. Evaluate `vite-plugin-ssg` or `vite-plugin-prerender` for React 19 + Vite 8 compatibility before adding either as a dependency. If neither has a compatible release, write a custom post-build script using `playwright` or `puppeteer` that starts a local `vite preview` server, visits each of the six routes, waits for the app to reach its fully-rendered state (this is exactly why Task 1/2's fallback timeouts matter — a prerender script needs a deterministic "ready" signal), and writes the resulting HTML to the matching path in `dist/`.
2. Target output: `dist/index.html`, `dist/tourist-lessons/index.html`, `dist/weekly-lessons/index.html`, `dist/about/index.html`, `dist/faq/index.html`, `dist/book/index.html` — each containing that route's real `<title>`, meta tags, structured data, and visible body content.
3. Confirm GitHub Pages' static serving resolves clean route URLs (e.g. `/maui-lessons/about`) to the matching prerendered file rather than falling through to a SPA-fallback `404.html`. If a `404.html` SPA-redirect trick currently exists in this repo, verify it doesn't intercept requests that now have real prerendered files, and adjust if it does.
4. Treat this as its own PR. Run `npm run build`, `npm run lint`, `npm run typecheck`, then manually diff `dist/` before/after to confirm no route regressed to a blank shell.

**Acceptance criteria:**

- [ ] `curl` (not a browser devtools inspector — a raw HTTP fetch) against each deployed route returns real title, meta, and body content without executing JavaScript.
- [ ] No route's prerendered output is a blank/near-empty shell.
- [ ] Client-side navigation between routes (post-hydration) still works exactly as before — prerendering must not break the SPA behavior for real visitors.

---

## Task 8 — Compress and lazy-load the 14MB hero video [Audit + SEO overlap · P2]

**Objective:** The homepage hero video is a ~14MB MP4 loaded with `preload="auto"` (flagged in both `CLAUDE.md`'s "Known Risks" and the design audit). This hurts Core Web Vitals (LCP, TBT) — a confirmed Google ranking factor — and directly affects the audit's Mobile Responsiveness and Frontend Polish scores.

**Implementation steps:**

1. Locate the hero video in `src/components/home/OpeningScene.tsx` and its source asset in `assets/`.
2. Re-encode at a lower bitrate/resolution tier appropriate for a background hero — target well under 3–4MB without visible quality loss at typical display sizes:

   ```
   ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -an output.mp4
   ```

   Verify visually before committing.
3. Add a `poster="..."` attribute with a static frame so there's immediate paint before the video is ready.
4. Change `preload="auto"` to `preload="metadata"` (or `"none"`, combined with the existing/new stall-fallback logic from Task 1) so the video doesn't block on full download.
5. Re-test the existing hero-video-stall fallback after this change to confirm it still functions correctly under the new preload strategy.

**Acceptance criteria:**

- [ ] Hero video payload is under 4MB, measured in DevTools Network tab.
- [ ] A poster frame displays immediately on load, before the video is playable.
- [ ] Lighthouse/PageSpeed Insights LCP score for the homepage improves versus a pre-change baseline (capture both reports).
- [ ] Stall-fallback behavior still works when video load is artificially blocked/throttled.

---

## Task 9 — Add a price-anchor line to the FAQ [Audit · P2]

**Objective:** The FAQ's pricing answer still reads "Rates depend on the lesson type and how often you'd like to meet," even though real prices ($35–$120) are now visible inside the Book wizard. This is a small, low-risk content addition that closes a previously-flagged gap now that the underlying numbers already exist elsewhere on the site.

**Implementation steps:**

1. Locate the pricing Q&A in `src/components/faq/FaqSections.tsx`.
2. Add one sentence referencing the actual price range already shown in the Book wizard (`src/pages/Book.tsx`'s `VACATION_LESSON_OPTIONS`/`ONGOING_LESSON_OPTIONS`) — e.g. "Rates start at $35 for a 30-minute lesson; the exact rate depends on the lesson type and how often you'd like to meet." Do not invent a number not already present in `Book.tsx`.
3. Keep the rest of the existing answer copy unchanged.

**Acceptance criteria:**

- [ ] FAQ pricing answer contains a real, verifiable dollar figure that matches a value already present in `Book.tsx`.
- [ ] No other FAQ copy changed.

---

## Task 10 — Replace the generic favicon with a branded one [SEO · P2]

**Objective:** `public/favicon.svg` exists but is documented as "still generic/unbranded." Minimal direct ranking impact, but affects click-through in search results and browser tabs/bookmarks.

**Implementation steps:**

1. This requires a design-asset decision — flag to the site owner for approval of a mark derived from the site's existing visual system (e.g. the ghost-numeral/wordmark motif, or a simplified ukulele silhouette in the site's forest-green) rather than inventing brand iconography unilaterally.
2. Once approved, replace `public/favicon.svg` in place (same filename, same `<link>` reference in `index.html`).
3. Generate and add standard fallback sizes (`favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`) from the new SVG, referenced in `index.html`'s `<head>` alongside the existing SVG link.

**Acceptance criteria:**

- [ ] Browser tab, bookmark, and mobile home-screen icon all show the new branded mark, not the previous generic one.

---

## Task 11 — Add automated regression checks for `<h1>`, `alt` text, and real-device mobile risk [Audit + SEO overlap · P2]

**Objective:** The design audit confirmed all six routes currently have exactly one `<h1>` and zero images missing `alt` text — already fixed, not a current gap. This task exists purely to prevent silent regression, and to formally flag the one item in the audit that remains genuinely unverifiable by an AI coding agent: true narrow-viewport (≤430px) behavior on a real device.

**Implementation steps:**

1. Add a lightweight smoke test (e.g. Playwright) that renders each of the six routes and asserts:

   ```ts
   expect(await page.locator('h1').count()).toBe(1)
   expect(await page.locator('img:not([alt])').count()).toBe(0)
   ```

2. Wire it into the existing `npm run lint`/`npm run typecheck` flow or a new `npm run check:seo` script — match existing project tooling conventions rather than introducing a new CI system.
3. For the real-device mobile verification: this cannot be completed by an AI coding agent working only in this repository. Add a checklist item to the PR description (not a code change) explicitly requesting the site owner test the homepage hero-video-stall fallback on one real phone on a throttled/cellular connection before this task is marked fully complete.

**Acceptance criteria:**

- [ ] New smoke test passes locally and fails intentionally when a `<h1>` or `alt` attribute is manually removed (verify the test actually catches the regression before committing it).
- [ ] PR description includes an explicit, unchecked action item for real-device mobile QA, clearly labeled as pending human verification.

---

## Explicitly out of scope for this document

- Booking form submission/routing (`handleSubmit` in `Book.tsx`) — intentionally deferred pending a Formspree form ID from the site owner.
- Real testimonials — pending owner-supplied content.
- Analytics/tag-manager setup, paid search, and off-site/backlink SEO — none are coding tasks executable unilaterally against this repository.

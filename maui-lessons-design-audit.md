
# Maui Lessons — Website Design & Conversion Audit (Re-Audit)

**Site audited:** https://karinrub.github.io/maui-lessons/
**Business:** Maui Music Lessons (Aaron Grzanich) — ukulele/guitar lessons for tourists and local students
**Audit date:** July 13, 2026
**Method:** Live review of the deployed GitHub Pages site via Chrome (desktop viewport ~1456×829), DOM/JavaScript inspection, console/network inspection, repeated fresh page loads (reload testing for reproducibility), and — new this round — direct fetches of the raw server-delivered HTML for all six routes (i.e., what a non-JS crawler or social-share bot actually receives, independent of client-side hydration). Findings are also cross-checked against the source repository (`git log`, component source, build/deploy config) to confirm root cause, not just symptom. Directly compared against the prior audit (`maui-lessons-design-audit.md`, July 12, 2026, score 74/100). Same weighted-scorecard system and terminology as that document.

**Known acceptable gaps for this round (excluded from scoring and not flagged as issues below), per instruction:**
- The booking form does not route/submit anywhere.
- The amount of images is limited.
- No testimonials exist yet.

---

## 1. Current Grade

**Current score: 83/100** (previous: 74/100, **+9**)

This round resolved both critical, reproducible rendering defects named in the prior audit: the `/book` entrance-animation hang and the Ongoing Lessons curtain-video stall. Both are now confirmed fixed with hard timeout fallbacks, verified across multiple fresh page loads — this alone restores the site's primary conversion flow, which was the prior audit's dominant concern. Alongside that, a substantial SEO initiative shipped — per-route meta tags, JSON-LD structured data, `robots.txt`/`sitemap.xml`, and full static prerendering of all six routes — which is a genuine, verified upgrade to how the site is seen by search engines and non-JS clients. The FAQ pricing gap flagged last round is also closed. Offsetting this progress: the prerendering pipeline itself introduced a new, confirmed defect — the static HTML for every route bakes in `http://localhost:4173/...` asset URLs (images, `og:image`, hero video) instead of the production domain, which breaks image loading for exactly the non-JS crawlers and social-share bots the prerendering work was built to serve. That defect is self-healing for ordinary visitors (client-side hydration corrects it instantly) but is a real, sitewide technical bug, so it caps rather than reverses this round's progress.

---

## 2. Weighted scorecard

| Category | Max | Earned (prior → now) | Rationale |
|---|---|---|---|
| Visual design & art direction | 15 | 12 → 13 | The Book page's cream/ink editorial redesign can now be credited at closer to full value — it actually renders for a visitor (see Section 3), which the prior audit could not confirm. Home, Vacation, About unchanged and still strong. |
| Brand distinctiveness / freedom from template patterns | 15 | 13 → 13 | Unchanged. The ghost-numeral motif on Book is now visible and consistent with the sitewide motif, but this is a small, already-anticipated payoff rather than new brand work — held flat. |
| Typography, hierarchy, readability | 10 | 9 → 9 | Unchanged. Exactly one `<h1>` per route remains confirmed — and, new this round, confirmed present in the raw server-delivered HTML too (see Section 3), not just after client-side JS runs. Held flat pending a full cross-route contrast/hierarchy pass, as before. |
| Layout, spacing, composition, rhythm | 10 | 7 → 8 | Book's new layout is now actually experienced by a live visitor and reads as a real improvement over the old dark card. Ongoing Lessons' "how it works" section remains a static numbered list, not the pinned scroll sequence used elsewhere on the site — still the flattest page, unchanged since the last two audits. |
| UX, navigation, IA | 10 | 7 → 9 | **Confirmed fix:** the booking wizard is now fully usable end to end from a fresh page load — stepped through all four visible steps (Lesson Type → Date & Time → Booking Summary → Confirmation) with real, interactive content at each stage. This directly resolves the prior audit's most severe finding. |
| Content clarity, persuasion, trust, conversion journey | 10 | 8 → 9 | **Confirmed fix:** the FAQ's pricing answer now reads "Rates start at $35 for a 30-minute lesson. The exact rate depends on the lesson type and how often you'd like to meet — send a booking request and Aaron will confirm current pricing with you directly." This closes the P2 gap named in the last audit. Meeting-location copy remains intact. Testimonials remain absent but are excluded from scoring this round per instruction. |
| Mobile responsiveness & cross-viewport quality | 10 | 6 → 7 | Could not force a true narrow (≤430px) browser viewport in this testing environment, the same limitation noted in both prior audits. Modest credit for a confirmed, verifiable improvement: the homepage hero video's `preload` attribute changed from `"auto"` to `"metadata"` and now ships a `poster` frame (confirmed via source diff), which reduces the amount of data a mobile visitor downloads before any paint. The video file itself is still ~14MB and uncompressed — see Section 4. |
| Interaction design, motion, feedback | 5 | 2 → 4 | **Both prior-round regressions confirmed fixed.** `/book`: reloaded three separate times; `.bw-panel` computed `visibility` was `"visible"` and all `.bw-hero-word-inner` transforms had settled to identity (`matrix(1,0,0,1,0,0)`) within ~3–4 seconds every time. `/weekly-lessons`: the curtain intro now reliably reveals the heading, body copy, tab selector, and "how it works" content within the same window. One point held back: the intro's background video (`aaron-weekly-section.mp4`) itself never starts loading in this environment (`readyState: 0`, no network request observed) even though the surrounding content correctly reveals via the fallback — the box that should show video plays back as an empty cream panel. |
| Accessibility & inclusive usability | 5 | 4 → 5 | **Confirmed fix:** the one accessibility concession the prior audit held back — that assistive-tech users arriving at `/book` hit the same broken, permanently-hidden experience as sighted users — no longer applies, since the page now reliably renders. `<h1>` and `alt` coverage remain complete sitewide, and are now confirmed present even before JavaScript executes (a meaningful accessibility/SEO combination win, see Section 3). |
| Frontend polish, consistency, perceived performance | 5 | 2 → 2 | The two "page appears frozen" defects that dominated this score last round are gone — a real, felt improvement. That gain is offset by a new, confirmed defect: the prerendered static HTML for every route serves asset URLs (product photos, the hero video, and every `og:image`/`twitter:image` tag) pointing at `http://localhost:4173/...`, the build-time preview server, instead of the live `karinrub.github.io` domain (see Section 4). This self-heals instantly once JavaScript hydrates for a normal visitor, so it doesn't reverse the hang fixes' benefit — but it's exactly wrong for the non-JS crawlers and share-preview bots this round's SEO work was meant to reach, so it's scored as a wash rather than a net gain. |
| Cohesion, memorability, overall premium impression | 5 | 4 → 4 | Book and Ongoing Lessons now deliver the polished experience their design intended, rather than reading as broken — a real gain. Held flat because a broken social-share preview image (Section 4) works directly against "premium impression" for anyone who receives a shared link right now. |
| **Total** | **100** | **74 → 83** | |

Arithmetic: 13 + 13 + 9 + 8 + 9 + 9 + 7 + 4 + 5 + 2 + 4 = **83**.

---

## 3. Improvements — confirmed, with evidence

**1. The `/book` entrance-animation hang is fixed.**
Reloaded the live `/book` route three separate times (hard navigation, not cached). Each time, within 3–4 seconds: `document.querySelector('.bw-panel')` computed `visibility: visible`, `opacity: 1`, and every `.bw-hero-word-inner` transform resolved to `matrix(1, 0, 0, 1, 0, 0)` (identity — no leftover offset). Stepped through the visible wizard steps (Lesson Type → Date & Time → Booking Summary → Confirmation) and confirmed real, interactive content at each: lesson-type option rows with actual copy and pricing, a working progress rail, and the ghost-numeral watermark. Source confirms the fix matches the diagnosed root cause: `src/pages/Book.tsx` now includes a `settle()`/timeout fallback (`window.setTimeout(apply, ms)`) explicitly commented as mirroring `OpeningScene.tsx`'s hero-video stall pattern.

**2. The Ongoing Lessons curtain-video stall is fixed.**
Reloaded `/weekly-lessons` and confirmed the heading ("Twenty-two years of music, taught with patience."), body copy, skill-level tabs, and "how it works" section all reveal reliably within the same bounded window. Source confirms `src/components/weekly/SkillLevelSection.tsx` now has an explicit 3-second `IntersectionObserver` + `setTimeout` fallback that force-completes the GSAP entrance timeline regardless of trigger state — directly addressing the prior audit's finding.

**3. Meaningful SEO work shipped and is verified live** (this is the largest body of new work this round):
   - **Per-route meta tags:** every route now serves a distinct `<title>`, `<meta name="description">`, canonical `<link>`, and Open Graph/Twitter Card tag set, confirmed by directly fetching the raw HTML of all six routes (no JavaScript executed). Example — Vacation Lessons: title "Vacation Ukulele Lessons on Maui | Maui Lessons", description reusing the site's own live copy about Maipoina Beach Park. No route falls back to a generic title anymore.
   - **Structured data:** a single `LocalBusiness` JSON-LD block (`name`, `description`, `url`, `areaServed: South Maui (Kihei, Wailea)`, `founder: Aaron Grzanich`) is injected once at the layout level and confirmed present (`document.querySelectorAll('script[type="application/ld+json"]').length === 1`) with no duplication.
   - **`robots.txt` and `sitemap.xml`:** both fetched live and confirmed correct — `robots.txt` correctly points crawlers at the sitemap; `sitemap.xml` lists all six live routes with valid XML.
   - **Full static prerendering:** this is the standout addition. Fetching each of the six routes' raw HTML — the exact document a non-JS crawler or a social-share bot receives — now returns the real page: correct `<title>`, correct meta description, correct single `<h1>` with real copy, and the full visible body text (verified word-for-word on Home, Vacation, Ongoing, About, FAQ, and Book). Previously, per this project's own SEO task list, "GitHub Pages serves the same near-empty HTML shell for every route until React hydrates" — that gap is now closed for five of the six routes' core content (see Section 4 for the one confirmed defect within this feature).
   - **CI-integrated deploy pipeline:** `.github/workflows/deploy-pages.yml` now installs Playwright, runs `npm run prerender` as a build step, and copies the prerendered `index.html` to `404.html` for GitHub Pages SPA-fallback routing — confirmed by reading the workflow file directly.

**4. FAQ pricing gap closed.**
The FAQ's pricing answer, fetched live, now reads: *"Rates start at $35 for a 30-minute lesson. The exact rate depends on the lesson type and how often you'd like to meet — send a booking request and Aaron will confirm current pricing with you directly."* This directly resolves the P2 item named in the prior audit, using a figure already live in the Book wizard (no invented pricing).

**5. Homepage hero video: incremental Core Web Vitals improvement.**
Confirmed via source diff: `preload="auto"` changed to `preload="metadata"`, and a `poster={landscapeImage}` attribute was added. The video asset itself is unchanged (still ~14MB), so this is a partial, not complete, resolution of the known hero-video risk — see Section 4.

---

## 4. Remaining Gaps

**Location:** Sitewide — every route's prerendered static HTML.
**Issue:** The build-time prerender step baked in asset URLs pointing at `http://localhost:4173/...` (the local `vite preview` server used during the build) instead of the production domain. Confirmed on every route tested: Home's hero photo (`<img src="http://localhost:4173/maui-lessons/assets/aaron-beach-1-....jpg">`) and hero video source, Ongoing Lessons' intro video source, and — most consequentially — the `og:image`/`twitter:image` meta tags on **all six routes**, all resolve to `localhost:4173`. A normal visitor never sees this, because React's `createRoot` immediately replaces the prerendered markup with a fresh client render, and the JS-computed `og:image` value is correct (confirmed: `https://karinrub.github.io/maui-lessons/assets/...`). But the entire point of this round's prerendering work was to serve real content to clients that *don't* run JavaScript — and for exactly those clients (social-share crawlers building an iMessage/Facebook/Slack preview, and any search engine that reads the static HTML rather than executing it), the preview image will fail to load, since `localhost:4173` is not reachable from the internet.
**Evidence:** Directly fetched raw HTML for all six routes; `meta-og:image` and `meta-twitter:image` read `http://localhost:4173/maui-lessons/assets/aaron-beach-1-Dh7gur-x.jpg` on every single one. Cross-checked against `scripts/prerender.mjs`, which starts a local `vite preview()` server and snapshots `page.content()` against that server's own base URL — the script has no step that rewrites `localhost:...` asset references back to `SITE_URL` before writing the file.
**Why it matters:** This undercuts the round's single biggest SEO investment. A visitor sharing a Maui Lessons link in a text message or on social media will currently see a broken image in the preview card.
**Severity:** High (confirmed, sitewide, but self-healing for JS-executing visitors — capped short of Critical because it does not block any user-facing task the way the prior round's two hangs did).
**Recommendation:** In `scripts/prerender.mjs`, either serve the preview build from a URL matching `SITE_URL` (or a path-relative equivalent) rather than the default `vite preview()` local address, or post-process the captured HTML with a find/replace of the preview server's origin back to `https://karinrub.github.io` before writing each `dist/**/index.html`. Re-verify with a raw fetch (not a browser) after the fix, since a browser-based check will hide this defect via hydration.

**Location:** Ongoing Lessons (`/weekly-lessons`), intro video element.
**Issue:** The curtain-intro *content* (heading, copy, tabs) now reliably reveals via the new fallback, which is the fix that mattered most. However, the background video behind that content (`aaron-weekly-section.mp4`) never begins loading in this testing environment — `video.readyState` stayed at `0` (`HAVE_NOTHING`) and no matching network request was observed, leaving a blank cream box where motion was intended.
**Severity:** Medium, unconfirmed root cause.
**Confidence:** Confirmed observed behavior in this session; consistent with the prior audit's own caution that this class of finding could be a testing-environment artifact (e.g., automated-browser autoplay restrictions) rather than a real-visitor defect — flagged with the same hedge, not escalated to a P0 given the content fallback already covers the failure mode that mattered.
**Recommendation:** Retest on a real device/browser session (not an automated one) before prioritizing further; if it reproduces there too, add an explicit `loadeddata`/`error` listener with a static poster-image fallback for the video panel, mirroring the pattern already used for the homepage hero.

**Location:** Ongoing Lessons page, composition (unchanged from prior two audits).
**Issue:** Still the flattest, least art-directed page on the site — tab selector, a static numbered "how it works" list (confirmed via raw HTML: three plain numbered entries, no pinned sequencing), and a CTA — with none of the scroll-pinned sequencing used on Home/Vacation/About. This is the one named P1 task (Task 3 in the project's own SEO/audit task list) that was not part of this round's work.
**Severity:** Medium (unchanged).
**Recommendation:** Unchanged from prior audit — bring up to the site's established pacing standard using the existing `useHomeScrollSequence`/`StackedServicesDeck` pattern as reference, as already scoped in the project's task list.

**Location:** Homepage hero video asset.
**Issue:** Still ~14MB, unchanged file. `preload` and `poster` improvements (Section 3) reduce how much of that file loads before first paint, but the file itself has not been compressed, and this remains a Core Web Vitals risk on a real mobile/cellular connection.
**Severity:** Medium (down from the prior audit's framing, given the preload/poster mitigation).
**Recommendation:** Re-encode per the project's own task list guidance (`ffmpeg -crf 28`) to bring the file under ~4MB.

**Location:** CI / regression tooling.
**Issue:** A `check:seo` script exists (`npm run check:seo`, verified in `package.json`) that automates the `<h1>`-count and missing-`alt` checks this and the prior audit performed manually. It is not wired into `.github/workflows/deploy-pages.yml` or any other CI trigger — confirmed by reading the workflow file, which runs `build` and `prerender` but never `check:seo`. It currently only runs if a developer remembers to invoke it locally.
**Severity:** Low (process gap, not a live defect).
**Recommendation:** Add a `check:seo` step to the deploy workflow (or a separate PR-triggered workflow) so a future regression to `<h1>` or `alt` coverage fails CI instead of requiring another manual audit to catch it.

**Location:** True narrow-viewport (≤430px) behavior, sitewide.
**Issue:** Not independently re-verifiable in this testing environment — same limitation as both prior audits.
**Severity:** Unverified risk, not a confirmed defect either way.
**Recommendation:** Unchanged — a real-device check remains the only way to fully close this out.

---

## 5. What was intentionally not flagged (per this audit's scope)

- The booking form's lack of end-to-end submission/routing — unchanged, explicitly out of scope.
- The site's limited photo library — unchanged, explicitly accepted.
- The absence of testimonials — unchanged, explicitly accepted; not counted against the Content Clarity/Trust score this round.

---

## 6. Prioritized action plan (delta from last audit)

| Priority | Location | Exact change | Reason | Effort | Confidence |
|---|---|---|---|---|---|
| P0 (new) | `scripts/prerender.mjs` | Rewrite the preview server's `localhost` origin to the production `SITE_URL` (or serve prerendering from a matching origin) before writing each route's static HTML | Confirmed, sitewide: every route's `og:image`/`twitter:image` and several `<img>`/`<video>` sources point at an unreachable local address in the static HTML that crawlers and share-bots actually read | Small | Confirmed behavior |
| P1 (carried over) | Ongoing Lessons composition | Convert the static "how it works" list into a pinned, scroll-driven sequence per the existing home-page pattern | Unchanged flat composition; only remaining unfinished P1 from the project's own task list | Medium | Confirmed gap |
| P2 (carried over) | Homepage hero video | Compress to under ~4MB via `ffmpeg` re-encode | `preload`/`poster` mitigations shipped this round, but the file itself is unchanged | Small | Confirmed gap |
| P2 (new) | CI workflow | Wire `npm run check:seo` into `deploy-pages.yml` (or a PR workflow) | Regression-detection script exists but isn't automated | Small | Confirmed gap |
| P2 (unconfirmed) | `/weekly-lessons` intro video | Retest video load behavior on a real device/browser; add an explicit fallback poster if it reproduces | Content fallback already covers the failure mode that mattered; video-specific stall is a smaller, unconfirmed remainder | Small | Unverified in this environment |
| P2 (carried over) | Real-device mobile QA | Confirm hero-video and Book/Ongoing fallback behavior on an actual phone | Testing-environment limitation persists across all three audits to date | Small | Unverified risk |

---

## 7. Final reassessment

- **Previous score:** 74/100
- **Current score:** 83/100 (**+9**)
- **What moved the score up:** Both critical, reproducible rendering failures from the prior audit — the `/book` entrance-animation hang and the Ongoing Lessons curtain-video stall — are confirmed fixed, restoring the site's primary conversion flow to a usable state. A substantial, verified SEO effort shipped: per-route meta tags, JSON-LD, `robots.txt`/`sitemap.xml`, and full static prerendering of real content and titles across all six routes. The FAQ pricing gap is closed.
- **What held the score back from a larger jump:** The prerendering work that represents this round's biggest investment shipped with a sitewide defect of its own — every route's static HTML points social-preview and other asset URLs at an unreachable local build address rather than the live domain, scored as a wash in Frontend Polish and held flat in Cohesion. Ongoing Lessons' composition gap and the uncompressed hero video also remain exactly as before.
- **Single most important next move:** Fix the `localhost:4173` asset-URL leak in `scripts/prerender.mjs` before treating the SEO work as complete — right now, anyone sharing a Maui Lessons link will see a broken preview image, which is a visible, public-facing symptom of an otherwise well-executed prerendering pipeline.

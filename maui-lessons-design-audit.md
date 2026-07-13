
# Maui Lessons — Website Design & Conversion Audit (Re-Audit)

**Site audited:** https://karinrub.github.io/maui-lessons/
**Business:** Maui Music Lessons (Aaron Grzanich) — ukulele/guitar lessons for tourists and local students
**Audit date:** July 12, 2026
**Method:** Live rendered review of the deployed GitHub Pages site (Chrome, desktop viewport ~1440–1568px; narrow-viewport resize attempted but, as in the prior audit, the testing environment could not force a true ≤430px browser viewport — window was resized but `window.innerWidth` remained ~1440px), interactive testing, DOM/JavaScript inspection, and direct comparison against the prior audit (`maui-lessons-design-audit.md`, July 11, 2026, score 69/100). Same weighted-scorecard system and terminology as that document.

**Known acceptable gaps for this round (excluded from scoring and not flagged as issues below), per instruction:**
- The booking form does not route/submit anywhere.
- The amount of images is limited.
- No testimonials exist yet.

---

## 1. Current Grade

**Current score: 74/100** (previous: 69/100, **+5**)

The site made genuine, confirmed progress on every P0 item named in the prior audit — semantic `<h1>`s, image `alt` text, a standardized footer, and stated meeting-location copy are all now live and verified. Those are real, sitewide wins. Against that progress, this audit found one new, serious, **reproducible defect that was not present before**: the redesigned `/book` page's entrance animation fails to complete, leaving the entire booking wizard permanently invisible on a normal desktop viewport. A closely related stalled-loading state was also reproduced on the Ongoing Lessons page. Because this audit evaluates what is actually live rather than what was intended, the score reflects both the real accessibility/trust fixes and this new, higher-severity regression on the site's highest-intent page.

---

## 2. Weighted scorecard

| Category | Max | Earned (prior → now) | Rationale |
|---|---|---|---|
| Visual design & art direction | 15 | 12 → 12 | Home, Vacation, About unchanged and still strong. The new Book-page treatment (cream/ink editorial rows, hairline rules, gold arrow, sage-tinted wash) is a real design improvement over the old dark-green card *on paper*, but it cannot currently be credited at full value because it does not reliably render for a live visitor (see Section 3). Held flat rather than penalized twice — the rendering failure is scored under Interaction Design and Frontend Polish below. |
| Brand distinctiveness / freedom from template patterns | 15 | 13 → 13 | Unchanged. The ghost-numeral motif's planned extension into the Book wizard is a good idea but unverifiable while the page fails to render. |
| Typography, hierarchy, readability | 10 | 7 → 9 | **Confirmed fix:** exactly one `<h1>` per route now exists sitewide (verified via DOM query on Home, Vacation, Ongoing, About, FAQ, Book). This was an explicit, named gap in the prior audit and is now resolved. One point held back pending a full cross-route contrast/hierarchy pass. |
| Layout, spacing, composition, rhythm | 10 | 8 → 7 | Ongoing Lessons remains the flattest page, unchanged since the last audit. The Book page's new layout, while better-conceived, is not experienced by a live visitor due to the rendering defect, so composition on the site's highest-intent page currently reads as broken rather than improved. |
| UX, navigation, IA | 10 | 6 → 7 | **Confirmed fix:** footer is now standardized across all six routes, including `/book`, which previously had none (verified: identical nav links + copyright on every route). This directly resolves a named P0. Offsetting that gain: the Book wizard itself is currently unusable from a fresh page load (Section 3), which is a direct navigation/task-completion failure on the site's most important flow. |
| Content clarity, persuasion, trust, conversion journey | 10 | 6 → 8 | **Confirmed fix:** Vacation Lessons now states a specific meeting location ("Lessons meet at Maipoina Beach Park and along the coast through Kihei and Wailea — or Aaron will come to you"), also echoed on the FAQ. This was the other named high-severity gap and is resolved. Real lesson prices ($35–$120) are now visible inside the Book wizard's option rows, a partial answer to the pricing-anchor gap even though the FAQ's pricing answer text itself is unchanged. Testimonials remain absent but are excluded from scoring this round per instruction. |
| Mobile responsiveness & cross-viewport quality | 10 | 4 → 6 | Could not independently force a true narrow viewport in this testing environment (same limitation as the prior audit — window resize succeeded but `innerWidth` stayed ~1440px). At the achievable width, the homepage header was **not** suppressed and rendered normally, consistent with the hard-timeout fallback described as implemented in the project's internal documentation. Raised from 4, but capped short of full marks because the specific narrow-viewport failure mode from the last audit still cannot be independently re-confirmed or ruled out on a true small screen. |
| Interaction design, motion, feedback | 5 | 4 → 2 | **New, confirmed defect:** on `/book`, the entrance animation (hero headline word reveal → step panel reveal) does not complete. Reproduced on three separate full page loads: the step panel remains `visibility: hidden` in computed style indefinitely (observed up to ~13 seconds), with real step content present underneath but never shown. A related stalled-loading state (a static placeholder that never resolves into the video-driven intro) was also reproduced twice on Ongoing Lessons, with no video network request ever observed firing — suggesting a JS-side stall rather than a slow asset fetch. |
| Accessibility & inclusive usability | 5 | 2 → 4 | **Confirmed fixes:** 0 missing `alt` attributes found across every route tested (previously 4 of 5 homepage images lacked alt text), and a semantic `<h1>` now exists on every route (previously zero anywhere). One point held back: the Book page's permanently-hidden panel state, while not a traditional a11y violation, means assistive-tech users arriving at the booking flow encounter the same broken experience as sighted users. |
| Frontend polish, consistency, perceived performance | 5 | 3 → 2 | Footer standardization is a genuine polish win. It's outweighed by the new Book-page hang and the Ongoing Lessons stall — both read, to a real visitor, as a broken or frozen page, which is a more severe perceived-reliability problem than the footer inconsistency it replaced. |
| Cohesion, memorability, overall premium impression | 5 | 4 → 4 | Footer consistency and the (currently invisible) sage-tint tie-in on Book are conceptually positive for cohesion, but a booking page that appears to hang undercuts "premium" more than it helps. Net roughly flat. |
| **Total** | **100** | **69 → 74** | |

Arithmetic: 12 + 13 + 9 + 7 + 7 + 8 + 6 + 2 + 4 + 2 + 4 = **74**.

---

## 3. Improvements — confirmed, with evidence

**1. Semantic `<h1>` now present on every route.**
Verified via `document.querySelectorAll('h1')` on Home, Vacation Lessons, Ongoing Lessons, About, FAQ, and Book — each returned exactly one `<h1>` with correct, real copy (e.g., Home: "Learn your first ukulele song on one of the world's most beautiful beaches."; About: "About Aaron"). The prior audit found zero anywhere. This directly resolves a named P0 accessibility/SEO gap.

**2. Image `alt` text now complete.**
`[...document.querySelectorAll('img')].filter(i => !i.getAttribute('alt'))` returned `0` on every route tested. The prior audit found 4 of 5 homepage images missing `alt`. Resolved sitewide, not just on the homepage.

**3. Footer standardized across all six routes, including Book.**
Every route now renders the same footer: `Vacation Lessons · Ongoing Lessons · About · FAQ · Book a Lesson · © 2026 Maui Lessons`. The prior audit found three different treatments (full nav+copyright on Home, none on Vacation/Ongoing/About/Book, a stripped two-link version on FAQ) and specifically flagged Book's absence. Book now has one too — a direct fix of a named gap.

**4. Meeting location now stated on the primary tourist conversion page.**
Vacation Lessons' full text (confirmed via `textContent`, since the line only appears after the page's scroll-driven reveal) now reads: *"Lessons meet at Maipoina Beach Park and along the coast through Kihei and Wailea — or Aaron will come to you, wherever you're staying."* The same detail is echoed on the FAQ's "Where do lessons happen?" answer. This was the audit's other named high-severity gap and is now resolved.

**5. Real pricing is now visible inside the booking flow.**
The Book wizard's step-2 option rows show actual dollar figures ($35 for a 30-minute solo lesson up to $120 for a 6–8 person group) rather than the fully-deferred "Aaron will confirm pricing" language that was the only pricing information anywhere on the site previously. The FAQ's own pricing answer text is unchanged, so this is a partial rather than complete resolution of the P1 pricing-anchor opportunity.

**6. Homepage header no longer stayed suppressed in this session's viewport testing.**
At the narrowest width this environment could force (~1440px effective viewport, window resized to 390×844), the header rendered normally with `opacity: 1` and no `is-suppressed` class, consistent with the documented 3-second hard-timeout fallback. This is a positive signal but not a full re-confirmation of the original mobile defect, which was specifically reported at true ≤500px widths — see Section 4.

---

## 4. Remaining Gaps

**Location:** `/book` — the redesigned booking wizard.
**Issue:** The entrance sequence (hero headline word-reveal, followed by the step panel/progress rail/option rows) does not complete. On three independent fresh page loads, the step panel's computed `visibility` remained `hidden` for the entire observation window (up to ~13 seconds), and the hero headline words remained frozen at partial, mid-transform offsets rather than settling into place. Forcing `visibility`/`opacity`/`transform` via script confirmed the correct step content exists underneath (e.g., "Choose your experience," the Vacation/Ongoing option rows with their real copy) — this is a rendering/animation failure, not missing content.
**Evidence:** Reproduced on three separate full navigations to `https://karinrub.github.io/maui-lessons/book` at desktop viewport width (not a narrow-viewport-only issue). `.bw-panel` computed style: `visibility: hidden`. `.bw-hero-word-inner` elements retained non-zero `translateY` transform values indefinitely.
**Why it matters:** This is the site's primary conversion action. A real visitor arriving at `/book` in this state sees an almost-blank cream page with only the eyebrow label and a partially-rendered headline — no visible way to proceed with booking.
**Severity:** Critical.
**Confidence:** Confirmed (reproduced behavior); root cause not independently diagnosed from the live site alone (this audit is DOM/behavior-based, not a source-code review), but the pattern — content present, permanently stuck in its pre-animation hidden state — is consistent with a GSAP entrance timeline that never completes, possibly tied to a reference to an element removed during the redesign (the old dark "canvas" card no longer exists in the DOM).
**Recommendation:** Treat as a P0 regression, not a refinement item. Verify the entrance timeline's element references now that the old canvas/glow elements are gone, and add a hard fallback (mirroring the pattern already used for the homepage hero video) that reveals the step content on a timeout regardless of animation state.

**Location:** Ongoing Lessons (`/weekly-lessons`).
**Issue:** On two independent page loads, the page's video-driven intro (a sage-colored placeholder block, consistent with the documented "curtain video intro") never resolved into visible page content within the observation window. No video network request was observed firing at all, which points toward a stalled client-side condition rather than a slow asset fetch.
**Evidence:** Reproduced twice; `read_network_requests` filtered for `.mp4` returned no matching requests during the stall.
**Why it matters:** If this reproduces for real visitors, it silently removes access to the Ongoing Lessons page content, similar in kind (though not confirmed to be the same root cause) to the mobile hero-video issue flagged in the prior audit.
**Severity:** High, pending confirmation.
**Confidence:** Confirmed observed behavior in this session; unverified whether this is a pre-existing issue unrelated to the recent Book-page work, a new regression, or a testing-environment artifact — flagged with the same caution the prior audit applied to its mobile finding.
**Recommendation:** Retest independently of this audit, ideally on a real device, and add the same timeout/fallback pattern used elsewhere if it reproduces.

**Location:** Ongoing Lessons page, composition (unchanged from prior audit).
**Issue:** Still the flattest, least art-directed page on the site — tab selector, vertical list, CTA — with none of the scroll-pinned sequencing used on Home/Vacation/About.
**Severity:** Medium (unchanged).
**Recommendation:** Unchanged from prior audit — bring up to the site's established pacing standard.

**Location:** FAQ, pricing answer text.
**Issue:** Still reads "Rates depend on the lesson type and how often you'd like to meet" with no figure, even though real prices now exist one click away in the Book wizard.
**Severity:** Low-Medium (down from Medium, since a price anchor is now reachable in-flow even if not on the FAQ itself).
**Recommendation:** Consider a one-line "rates start at $35" addition to the FAQ answer now that the number exists elsewhere on the site.

**Location:** True narrow-viewport (≤430px) behavior, sitewide.
**Issue:** Not independently re-verifiable in this testing environment, same limitation as the prior audit.
**Severity:** Unverified risk, not a confirmed defect either way.
**Recommendation:** A real-device check remains the only way to fully close this out.

---

## 5. What was intentionally not flagged (per this audit's scope)

- The booking form's lack of end-to-end submission/routing — unchanged, explicitly out of scope.
- The site's limited photo library — unchanged, explicitly accepted.
- The absence of testimonials — unchanged, explicitly accepted; not counted against the Content Clarity/Trust score this round.

---

## 6. Prioritized action plan (delta from last audit)

| Priority | Location | Exact change | Reason | Effort | Confidence |
|---|---|---|---|---|---|
| P0 (new) | `/book`, entrance animation | Fix the GSAP entrance timeline so the step panel and hero headline reliably resolve to their visible end-state; add a hard timeout fallback that force-reveals content regardless of animation completion | Confirmed, reproduced 3×: booking wizard is unusable from a fresh page load on desktop | Small–Medium | Confirmed behavior |
| P0 (new, unconfirmed root cause) | `/weekly-lessons` curtain video intro | Investigate the stalled placeholder state; add the same timeout/fallback pattern if it reproduces on retest | Confirmed observed behavior; possible pre-existing or environment-specific issue | Small | Confirmed behavior / unverified cause |
| P1 (carried over) | Ongoing Lessons composition | Bring up to the pacing/art-direction standard used elsewhere on the site | Unchanged flat composition | Medium | Subjective, well-supported |
| P2 (carried over, downgraded) | FAQ pricing answer | Add a "starting at $X" line now that real prices exist in the Book flow | Small remaining gap | Small | Confirmed gap |
| P2 (carried over) | Real-device mobile QA | Confirm the hero-video timeout fallback and this session's new Book/Ongoing findings on an actual phone | Testing-environment limitation persists | Small | Unverified risk |

---

## 7. Final reassessment

- **Previous score:** 69/100
- **Current score:** 74/100 (**+5**)
- **What moved the score up:** Confirmed, sitewide fixes to all four named P0 items from the prior audit — `<h1>` coverage, `alt` text coverage, footer standardization, and stated meeting location.
- **What moved the score down relative to a "clean P0 pass" (previously projected at 76/100):** A new, critical, reproducible rendering failure on the redesigned Book page, plus a related unresolved stall on Ongoing Lessons, neither of which existed in the prior audit's testing.
- **Single most important next move:** Fix the `/book` entrance-animation hang before anything else on this list — every other improvement in this audit is moot if a real visitor cannot see the booking flow at all.

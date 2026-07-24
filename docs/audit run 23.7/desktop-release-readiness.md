# Desktop Release Readiness Report

Project: Maui Lessons (Aaron Grzanich)
Scope: Desktop only (1440–1600px, Chromium). Mobile/tablet audits not yet begun.
Date: 2026-07-23
Sources: the five section audits in this folder — `hero-audit.md`, `vacation-lessons-audit.md`, `ongoing-lessons-audit.md`, `faq-audit.md`, `booking-audit.md`.

This is a decision and implementation document, not a recap. It merges the five audits into one backlog and roadmap. Every item below is traceable to observed evidence in those audits; nothing here is speculative or a new feature.

---

## 1. Executive Summary

The desktop experience is, in its marketing surfaces, a genuinely high-quality, portfolio-grade piece of work: cohesive art direction, disciplined typography, restrained premium motion, authentic photography, and a clear emotional and commercial throughline from "come try this on vacation" to "make this a weekly part of your life." Three of the five audited sections — Hero, Vacation Lessons, Ongoing Lessons — are complete or effectively complete, with only small recommended/preference-level polish outstanding.

However, **desktop is not launchable today**, and the reason is narrow, specific, and shared. The two sections that carry the actual conversion — the **FAQ** and the **Booking** flow — both fail to display their content because of **the same underlying defect**: content whose visibility is gated on a scroll-reveal animation that does not fire when the content appears without a scroll event. In the FAQ, the question rows measure opacity 0 while sitting in the viewport, so a visitor scrolling the page sees empty panels instead of answers. In Booking, every step transition (pace/size → date & time → contact form → the post-submit confirmation) renders blank until the user manually scrolls, including the screen shown immediately after "Send booking request," where the user gets no visible confirmation at all.

These are not two separate problems to design around; they are one engineering defect in a shared reveal pattern, manifesting in the two worst possible places. The good news for the team: fixing the reveal behavior once, correctly, plausibly resolves both Critical blockers at the same time.

In addition, the project owner flagged three must-fix-first items (all Hero/Home area): (1) the Home "Choose your experience" card deck truncates its body copy so the service descriptions aren't fully readable; (2) the Ongoing Lessons progress-graph line renders from the wrong starting position instead of drawing up from the graph's origin; and (3) the hero video is an important, intended element that **must always be shown** — it plays for the owner, but the 14.3 MB uncompressed asset risks not appearing on slower connections and must be made reliable (kept, not dropped). These are **C0a**, **C0b**, and **C0c**, to be fixed before the other Critical work.

**Would I launch today? No.** A visitor cannot reliably read the FAQ or complete a booking as currently rendered, the booking flow gives no feedback on submit, and — per the owner — the homepage cards cut off their text, the Ongoing graph animates incorrectly, and the hero video must be guaranteed to always display. **Would I launch after a focused correction pass? Yes.** The remaining work is small and well-defined; there is no redesign, no re-scoping, and no creative-direction change required. This is a "fix one class of bug, verify, ship" situation, not a "keep iterating" one.

---

## 2. Overall Assessment

**Visual consistency — Excellent.** A single system runs end to end: warm cream / deep forest green / sage / reserved gold, Fraunces + Cormorant display over a quiet sans, and the recurring oversized low-alpha "ghost word" motif (experiences, practice, begin, onward, curious). Nothing on desktop reads as off-brand.

**Storytelling — Excellent.** Each section has a purpose-built narrative arc: the Hero's photo-first mood, Vacation's "a song you keep, not a souvenir," Ongoing's practice-loop → rising-progress → 22-year credibility chapter. The sections are sequenced so intent escalates naturally.

**Motion quality — Strong in concept, systemically fragile in one dimension.** The scroll-driven choreography (pinned hero, image-to-frame scaling, the practice loop, the rising graph, horizontal About) is confident and original. But the *reveal* layer of that same motion system is where the product breaks: the same opacity-on-scroll mechanism that animates content in gracefully on the marketing pages leaves content invisible where it must appear without a scroll (FAQ, Booking steps). Motion is simultaneously the site's biggest craft asset and the source of its only launch blockers.

**Interaction quality — Good underneath, undermined at the surface.** The FAQ accordion is semantically correct and functional when reached; the booking wizard has a real stepper, live breadcrumb, a well-behaved calendar (past dates disabled, today marked, instant time slots), auto-advance, sound state management (hidden context fields carried the full selection accurately end to end), required-field validation, and a clean confirmation recap. All of this is invisible to a user who can't see the questions to click or the steps to fill.

**Trust & professionalism — High where visible.** Real student photography, a named teacher with concrete experience, transparent pricing/payment/locations, and honest copy all build credibility. The blank FAQ panels and blank booking steps are the one thing that actively erodes trust, precisely because they read as "broken."

**Conversion — Compromised, but only by the shared defect.** Everything *around* conversion is well made; the conversion moments themselves (reading answers, completing a booking, seeing a confirmation) are where the reveal bug lands.

**Cohesion & portfolio quality — High, and would be clearly higher post-fix.** From beginning to end the site feels like one authored thing. As a portfolio piece it is currently held back only by the two visible defects; with them fixed, this is showcase-quality frontend/UX work.

---

## 3. Cross-Section Findings (patterns, each stated once)

**P1 — The scroll-reveal opacity defect (the dominant pattern; root cause of both Critical items).**
Content is set to `opacity:0` and animated up by a scroll-reveal. Where content appears *without* a scroll event to drive the trigger, it stays invisible:
- FAQ: question rows measured `opacity 0` at multiple in-viewport scroll positions (scrollY ~300–1300); only the section scaffolding shows.
- Booking: on each step transition the incoming content measured `opacity 0` and did not resolve on its own (calendar 0 at ~2.2s; all form inputs 0 at ~2s; confirmation blank after submit); only a manual scroll revealed it.
The same mechanism behaves correctly on Home/Vacation/Ongoing/About because the user is always scrolling there. **This is one bug with two Critical symptoms.** It also explains the Hero's benign ~2–3s blank-cream open (reveal gated on hero media). Fix the pattern once; verify everywhere content can appear without a scroll.

**P2 — Light-on-light legibility.** Cream/near-white text over pale backgrounds recurs: the Hero tagline (H1 color ~`rgb(250,245,238)` over a pale sky, no scrim) and the faint top wordmark. Legible content elsewhere is strong; this is a localized, recommended-level contrast motif, not systemic.

**P3 — Minor copy leaks / inaccuracies.** Two small user-facing text issues worth a single copy pass: "Silent lesson footage" captioning a still photo (Ongoing; inconsistent with its sibling captions) and "…once booking delivery is connected" exposing an internal state in the FAQ "How do I book?" answer.

**P4 — Asset weight / perceived performance.** One heavy uncompressed hero video (~14.3 MB) that did not reach a playable state in testing; the strong poster carries the hero, but the weight is the likely cause of the gated blank open.

**Positives that recur (do not disturb):** consistent palette/type/ghost-motif; one `<h1>` per route and complete image alt text (verified on multiple routes); authentic real-student photography as the trust engine; a single, consistent "Book a Lesson" CTA language.

---
np
## 4. Remaining Desktop Work (implementation backlog)

### Critical — must be resolved before launch

> **Owner-flagged, fix first.** The following three items (C0a, C0b, C0c) were reported directly by the project owner on 2026-07-23 and verified/clarified live in this pass. They are to be addressed **before** the other Critical work.

**C0a. Home "Choose your experience" card deck — body copy is truncated (text not fully readable).**
- *Why it matters:* On the Home card deck (the "Ukulele Lessons / Guitar Lessons / Group Experience" cards), the card body is clipped so the description is cut off. Verified live at 1568px: the Ukulele Lessons card shows only "A private ukulele lesson shaped entirely around you — your pace, your" and then the CTA — the rest of the sentence ("…favorite songs, your ear. No classroom, no crowd, just the beach and the instrument.") is not visible. This is on the primary landing page's featured offering.
- *Expected impact:* Restores readability of the core service descriptions and removes a visible "broken/cut-off text" impression on the homepage. Direct clarity and professionalism gain.
- *Effort:* **Small.** Give the card's text area enough height for the full copy (or otherwise stop clipping the body), so all three lines render above the CTA; verify each of the three cards.

**C0b. Ongoing Lessons rising-progress graph — the line starts in the wrong position instead of animating up from the graph's start.**
- *Why it matters:* On the "How it develops" progress graph, the gold line is initially shown in the wrong location; verified live, it renders from a mid-point of the plot rather than beginning at the graph's origin. Intended behavior (per owner): the line should **start at the beginning of the graph and animate upward** along the progression. As-is, the section's central "students improve over time" metaphor reads as a rendering glitch.
- *Expected impact:* Correct, intentional-looking progression animation; protects the credibility of the section that most communicates structured long-term growth.
- *Effort:* **Small–Medium.** Fix the line's initial state/path so the draw begins at the graph origin (left/low) and animates up to the final point; verify the milestone dots align with the drawn path throughout.

**C0c. Hero video must always be shown (owner requirement).**
- *Why it matters:* The owner confirms the hero video is an **important, intended element that plays for them and must always be displayed** — it is not optional and must not be replaced by the poster. (In the automated audit environment the video showed `readyState 0` and only the poster rendered; the owner's confirmation indicates that was most likely media-throttling in the automated browser, as originally caveated.) The risk to "always shown" is the asset weight: the video is a **14.3 MB uncompressed `.MP4`**, which on slower connections may not buffer before the visitor scrolls past, leaving only the poster.
- *Expected impact:* Guarantees the hero's signature motion appears for every visitor on every connection; also removes the ~2–3 s blank-cream open by not gating the hero on the full video.
- *Effort:* **Small–Medium.** (1) Confirm reliable autoplay (`autoplay muted playsinline preload`) and that the poster only bridges until the video is ready, then the video reliably takes over — never a permanent poster substitution. (2) **Compress the video to a few MB (keep `.MP4`/H.264)** so it loads fast enough to always appear. (3) Let the poster paint immediately so there's no blank hold, with the video fading in when ready. (4) Verify playback on real browsers/devices, including a slower connection.

**C1. Fix the scroll-reveal so gated content is visible without a manual scroll (FAQ + Booking).**
- *Why it matters:* As rendered, visitors cannot read FAQ answers or complete/confirm a booking; the post-submit confirmation shows nothing. These are the conversion surfaces.
- *Expected impact:* Restores the entire FAQ and the entire booking funnel; removes the site's only launch blockers; converts "looks broken" into "works." Largest single quality gain available.
- *Effort:* **Medium.** Likely a small, shared change to the reveal pattern (default content to visible / fire-and-resolve the reveal on mount or on step change), but with mandatory verification across all 5 FAQ categories, all booking steps, and the confirmation — on a native browser.

### High Priority — significant, meaningful impact

*(The former H1 — "compress or drop the hero video / fix the blank open" — has been folded into the owner-flagged **C0c** above, since the owner requires the video always be shown. Do not drop the video; keep it and guarantee it displays.)*

**H2. Hero tagline contrast.**
- *Why:* The hero's only verbal message (the H1) is cream script over a pale sky with no scrim; the first line is hard to read.
- *Impact:* Makes the value proposition legible without touching the airy aesthetic.
- *Effort:* **Small** (localized scrim / subtle text-shadow / weight nudge).

### Medium Priority — worth doing if time allows

**M1. Copy pass for two leaks (P3).**
- *Why:* "Silent lesson footage" (still photo) and "…once booking delivery is connected" (internal state) read as unpolished/leftover.
- *Impact:* Small professionalism/consistency gain; the booking-answer edit also removes a phrase that can make a visitor doubt booking works.
- *Effort:* **Small** (two string edits).

### Low Priority — unlikely to affect launch quality

**L1. Wordmark legibility at the top of bright heroes (P2).**
- *Why:* "AARON GRZANICH" is near-invisible on first paint over bright imagery.
- *Impact:* Minor brand-legibility nicety; navigation is unaffected (hamburger works; veil helps once scrolled).
- *Effort:* **Small** (slight contrast/weight increase or extend the existing veil).

*Explicitly excluded from the backlog (evidence says leave alone):* grading/cropping the casual student photos (their rawness is the trust asset), and any FAQ content additions such as a cancellation policy (pay-on-the-day model means no money at risk, so it does not block booking).

---

## 5. Page-by-Page Summary (final state only)

**Hero — ~90% complete. Quality: high.**
Strengths: striking art-directed imagery, elegant scrub-driven tagline reveal, poster fallback, correct semantics. Remaining: **C0c** (owner requirement — keep the video and guarantee it always displays; compress + don't gate the reveal, which also removes the blank-cream open — Required) and H2 (tagline contrast); L1 wordmark is optional. Not complete until C0c.

**Vacation Lessons — 100% complete. Quality: excellent.**
Strengths: emotional "song you keep" arc, objection-handling copy, authentic photography, clean pinned-image-to-frame motion, clear CTA. Remaining: none (one dismissed photo-polish preference with a real authenticity tradeoff). Production-ready.

**Home card deck ("Choose your experience") — Quality: high, one Required fix.**
Strengths: pinned three-card swap, ghost word, progress counter, clear CTA and per-card imagery. Remaining: **C0a** (card body copy truncated — text not fully readable — Required). Not complete until C0a.

**Ongoing Lessons — ~90% complete (was ~98% before the owner-flagged graph issue). Quality: excellent.**
Strengths: practice-loop concept, rising-progress graph, 22-year credibility chapter, low-pressure close, correct semantics. Remaining: **C0b** (progress-graph line starts in the wrong position instead of animating up from the start — Required) and M1 caption rename ("Silent lesson footage"). Not complete until C0b.

**FAQ — ~70% complete. Quality: strong content, blocked delivery.**
Strengths: excellent, well-scoped answers (all major booking concerns covered), sensible category index, "Aaron's note" voice, price anchor, semantic accordion. Remaining: **C1** (questions invisible on scroll — Required); M1-adjacent copy edit to the booking answer. Not production-ready until C1.

**Booking — ~80% complete. Quality: strong flow, blocked delivery.**
Strengths: 4-step stepper, live breadcrumb, calendar (disabled past dates, today marked, instant times), auto-advance, solid state management, required-field validation, clean "Request received" confirmation with an accurate full summary. Remaining: **C1** (every step + confirmation blank until scroll — Required). Submission routing is a separately-planned task, not counted here. Not production-ready until C1.

---

## 6. Design System Observations

- **Typography & palette:** consistent and well-executed across all pages; no changes needed. The only type-level issue is contrast in one place (H2), not the system itself.
- **Motion philosophy:** a single, admirable scroll-choreography language — but it currently conflates two responsibilities: (a) *animating* content as the user scrolls (works well) and (b) *revealing* content that must be present regardless of scroll (fails: FAQ, Booking). The system needs a clear rule: **anything that can become visible without a scroll must default to visible; scroll animations may enhance but must never gate presence.** Encoding this rule prevents recurrence as mobile/tablet work begins.
- **Component consistency:** the accordion and the booking wizard are individually well built and semantically sound; both are victims of the reveal rule above, not of their own logic.
- **Brand identity & polish:** cohesive and high; the ghost-word motif is used at a consistent, tasteful frequency.

---

## 7. Production Risks

- **Trust / "looks broken" risk (highest):** blank FAQ panels and blank booking steps read as failure and can drive abandonment and support messages. Source: FAQ + Booking audits. Resolved by C1.
- **Conversion risk:** the funnel's two most important surfaces are compromised at their conversion moments, including no feedback after submit. Resolved by C1.
- **Perceived-performance + "video not shown" risk:** the hero video is a 14.3 MB uncompressed asset the owner requires to *always* display; on slower connections that weight risks it not appearing before the visitor scrolls past (only the poster shows), and it causes the ~2–3s blank hero open. Resolved by C0c (compress + reliable autoplay + don't gate the poster reveal).
- **Maintainability risk:** the reveal pattern is a repeatable footgun — if not corrected at the pattern level, the same bug will reappear on mobile/tablet and in any new step-based or in-place-swapped UI. Addressed by fixing the *pattern* in C1, not just the two instances.
- **Verification risk (process):** all measurements were taken in an automated browser. The reveal defect is well-corroborated (opacity 0 persisting while in view; same automation revealed content correctly elsewhere), but C1 and H1 must be reproduced and re-verified on a native browser before sign-off.
- **Out of scope but flagged:** booking submission routing is not wired; the confirmation currently promises an email that won't send until it is. Planned separately.

---

## 8. Recommended Implementation Order

1. **C0a + C0b + C0c first — the three owner-flagged fixes.** Do these before anything else per the owner's direction. All are Hero/Home-area and largely independent of the reveal work: C0a is a card-body height/clipping fix on the Home deck (all three cards); C0b corrects the Ongoing progress-graph line's initial position and draw-up animation; C0c keeps the hero video and guarantees it always displays (reliable autoplay + compress + don't gate the poster reveal). C0c also naturally resolves the old blank-cream open. Group C0a and C0c together (both Home hero area).
2. **C1 next — fix the shared reveal pattern, then verify FAQ and Booking together.** This unblocks *both* remaining Critical symptoms in one focused effort and is the highest-value engineering work. Verify across every FAQ category, every booking step, and the confirmation, on a native browser.
3. **H2 — Hero tagline contrast.** Do it in the same Hero session as C0a/C0c.
4. **M1 — copy pass.** Two trivial string edits; fold into the Hero pass (one of the two lives in the FAQ you'll already be testing for C1).
5. **L1 — wordmark contrast**, only if time remains.

This order front-loads the owner-flagged fixes (batched by area — Home hero for C0a/C0c/H2), then the single shared reveal fix that unblocks both conversion surfaces, then folds the copy edits in — minimizing context-switching and re-verification.

---

## 9. Launch Readiness Score (1–10)

- **Visual Design — 9.** Cohesive, premium, original; no systemic visual issues.
- **UX — 6.** Excellent structure and IA, but two core flows don't display their content as rendered.
- **Motion — 7.** Beautiful and original in concept; the reveal layer has a launch-blocking class of bug.
- **Interaction — 6.** Accordion and wizard are well built and functional, but invisible until interacted with/scrolled.
- **Storytelling — 9.** Purpose-built, emotionally effective, well sequenced.
- **Conversion — 5.** Both conversion surfaces (FAQ, Booking) are compromised at their decisive moments, including no submit feedback.
- **Professionalism — 7.** High where visible; blank panels/steps undercut it until fixed.
- **Portfolio Quality — 7.** Currently held back only by the two visible defects; ~9 post-fix.
- **Overall Desktop Readiness — 6.** Three sections done; two blocked by one shared, well-understood defect.

---

## 10. Final Recommendation

**Nearly Ready.**

As design lead I would **not** approve for production today: as rendered, a visitor cannot reliably read the FAQ or complete/confirm a booking, and the funnel gives no feedback on submit. But this is not "Needs Another Iteration" territory — there is no redesign, re-scoping, or creative change required. What stands between this and production is a **single, well-diagnosed defect** (with two symptoms) plus a short Hero/perf/copy polish pass. Fix C1, verify on a native browser, complete H1–H2 and M1, and this desktop experience is production-ready and portfolio-strong.

---

## 11. Stop Doing List

- **Do not keep polishing the finished marketing sections.** Vacation is 100% and Ongoing ~98%; further design iteration there produces no meaningful value.
- **Do not "fix" the casual student photos.** Their raw authenticity is the site's trust engine; grading/cropping them toward the hero's polish would reduce credibility.
- **Do not add FAQ questions** (e.g., a cancellation policy). Coverage is strong and the pay-on-the-day model removes the risk such a question would address.
- **Do not add more animation or new motion set-pieces.** Motion is already the strongest and the riskiest part of the product; the job now is to make existing content reliably *present*, not to add more choreography.
- **Do not redesign the booking flow or the FAQ.** Their structure, IA, state handling, validation, and confirmation are sound; the only issue is the reveal defect.
- **Do not change the creative direction, palette, type, or ghost-word motif.** They are consistent and working.
- **Do not treat the FAQ and Booking bugs as two separate tickets to design around.** Treat them as one pattern fix.

---

## 12. Final Conclusion (handoff to a future senior designer)

If you are picking this up cold: the Maui Lessons desktop site is a well-authored, cohesive, premium marketing experience that is **one bug away from being production-ready and portfolio-grade.**

**Current state.** Five desktop sections were audited. Hero, Vacation Lessons, and Ongoing Lessons are complete or nearly so — strong art direction, disciplined type, original scroll motion, authentic photography, and a clear commercial narrative that moves a visitor from "try a beach lesson" to "make music a weekly habit." Semantics are clean (one H1 per route, complete alt text). The two sections that carry conversion — the FAQ and the Booking flow — are excellently *designed* but currently fail to *display* their content.

**The remaining work, and why.** There is exactly one launch blocker, and it has one root cause: a scroll-reveal animation sets content to `opacity:0` and only reveals it in response to a scroll. Wherever content must appear *without* a scroll — the FAQ's question rows in a pinned layout, and every booking step/confirmation that swaps in place — the content stays invisible. It was measured at opacity 0 while sitting in the viewport, and it stays that way until the user happens to scroll. This is why the FAQ shows empty panels and why the booking flow (including the screen right after "Send booking request") goes blank. Fix this pattern once, establish the rule that **presence must never depend on scrolling**, and re-verify the FAQ (all categories) and Booking (all steps + confirmation) on a native browser. That single fix (Critical) resolves both blockers. After it, a short pass improves the Hero's first paint and the heavy video (High), lifts the hero tagline's contrast (High), and cleans up two small copy leaks (Medium). Nothing else is required.

**The philosophy to carry forward.** This product's motion is its signature and its liability. Keep the choreography; discipline the reveals. Any content that a user could encounter without scrolling — a swapped step, an accordion, an in-place update, and every mobile/tablet analogue you build next — must be visible by default, with scroll animation as enhancement only. Resist the urge to add polish or animation to the sections that are already done; the value now is in reliability, not in more craft. Judge future desktop work by one test: *does a first-time visitor ever see a blank where content should be?* When the answer is reliably no, desktop is finished.

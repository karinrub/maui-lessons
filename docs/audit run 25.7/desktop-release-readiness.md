# Desktop Release Readiness Report

Project: Maui Lessons (Aaron Grzanich)
Scope: Desktop only (1512–1536px, Chromium, real browser via Claude in Chrome — not emulation, not a resized window). Mobile/tablet are covered by the separate mobile-audit track and are out of scope here.
Date: 2026-07-25
Source: Independent, from-scratch audit of the live production site at `https://karinrub.github.io/maui-lessons/`. No prior report was used as a checklist; every finding below was reproduced directly against the deployed build during this pass. The most recent prior desktop report (`docs/audit run 23.7/desktop-release-readiness.md`, 2026-07-23) is referenced only where useful for context on what has changed.

This is a decision document, not a recap. It reflects the live site's current state as of this pass, independent of what any earlier report claimed was fixed or outstanding.

---

## 1. Executive Summary

The desktop experience remains, in its foundations, a genuinely premium piece of work: a coherent warm cream / forest green / sage / gold system, disciplined Fraunces + Cormorant Garamond typography, confident scroll choreography, real photography, and a commercial narrative that escalates cleanly from "try this on vacation" to "make this part of your week." Several items that blocked the previous (2026-07-23) desktop pass are now genuinely fixed and were re-verified independently in this pass: the Home "Choose your experience" card copy no longer truncates (all three cards show their full descriptions), the Ongoing Lessons progress graph now draws correctly from its origin rather than a mid-point, the hero video loads and plays (readyState 4, no playback error), and — most significantly — the entire booking wizard now renders every step and the final confirmation immediately, with no blank screens and no reliance on a manual scroll. Two small copy leaks flagged previously ("Silent lesson footage," "…once booking delivery is connected") are also gone.

However, **desktop is not launchable today**, for a reason that is new to this pass and was not caught previously: **the same class of scroll-reveal bug that used to block the FAQ and Booking pages is still present, just relocated.** On the FAQ page, the page's own headline — "Good questions, honest answers." — is invisible for an indefinite period after the page loads, with no scroll interaction. A visitor who lands on `/faq` directly (from a Google result, a bookmark, or the site's own "Read the FAQ" link) sees a large blank gap above the category cards until they happen to scroll. This was independently reproduced by loading the page fresh and waiting five seconds with zero interaction: the headline never appeared. It is gated on a scroll-driven reveal animation exactly like the one that used to hide the FAQ's question rows and the booking steps — except this time it is the page's own title.

Separately, a genuine and reproducible **text-collision defect** was found on two of the three marketing pages: the fixed header's centered "AARON GRZANICH" wordmark renders directly on top of body copy as the page scrolls, on Home (over the "A note from Aaron" paragraph) and on Vacation Lessons (over the "Long after the tan fades…this one doesn't" pull-quote paragraph), producing genuinely illegible overlapping text at a normal, unhurried scroll speed — not an edge case. Investigation traced the cause precisely: an existing collision-avoidance mechanism (documented in the project's own handoff notes) only watches `h1`, `h2`, `h3`, and elements carrying an `__eyebrow` class; both of the paragraphs affected here are plain `<p>` tags outside that selector, so the header never fades for them.

**Would I launch today? No.** A visitor who opens the FAQ page directly has a real chance of seeing an apparently broken, content-free page for as long as they don't scroll, and any visitor who scrolls at a normal pace through Home or Vacation Lessons will, at a specific and easily-reproduced point, see the site's own wordmark stamped illegibly across a paragraph of copy. **Would I launch after a short, well-scoped fix pass? Yes.** Both defects are narrow, well-diagnosed, and — unlike the 2026-07-23 pass — this time there is no ambiguity about root cause for either one. Everything else on desktop, including the previously-blocking booking flow, is in strong, professional shape.

---

## 2. Overall Assessment

**Visual consistency — Excellent.** The palette, type pairing, and the recurring oversized low-alpha "ghost word" motif (experiences, practice, begin, curious) are applied consistently across all six routes. Nothing reads as off-brand or inconsistent in tone.

**Storytelling — Excellent.** Home's photo-first mood, Vacation's "bring home more than photos" arc, Ongoing's practice-loop-to-rising-progress-to-22-years-credibility arc, and About's four-chapter horizontally pinned biography are all well-sequenced and emotionally coherent. Nothing here needs redesign.

**Motion quality — Strong in concept, with one recurring failure mode.** The scroll choreography (Home's pinned hero and card-deck swap, Vacation's image-to-frame pin, Ongoing's rising graph, About's horizontal chapter travel) is confident, original, and — on this pass — largely bug-free. The one place motion actively breaks the product is the same failure class documented previously: content whose *presence*, not just its animation, is made conditional on a scroll event. This pass found it on the FAQ page's own headline; the header/body text collision is a related but distinct motion-and-layer-order problem.

**Interaction quality — Strong, and meaningfully improved since the last pass.** The booking wizard — lesson type, date and time, contact details, and confirmation — now works end to end with no blank steps, no manual-scroll dependency, and an accurate, instant "Request received" summary. The FAQ accordion opens and closes correctly and content is fully legible once visible. Nav overlay, hover states, and category navigation all behave correctly.

**Trust & professionalism — High, with one real dent.** Real student photography, a named teacher with concrete credentials, transparent pricing, and honest copy (no placeholder text found anywhere) all build credibility. The FAQ's blank-on-load headline and the wordmark-over-text collisions are the two things on desktop that will read to a visitor as "this site is broken," which actively works against that trust.

**Conversion — Substantially de-risked versus the last pass, not fully clear.** The single biggest previous blocker — a non-functional-looking booking flow — is resolved. The FAQ's blank-headline issue is a smaller but real risk specifically for visitors who land there first (a meaningful share of organic/search traffic, given the site's SEO investment in the FAQ's `FAQPage` schema).

**Cohesion & portfolio quality — High.** The site feels authored end to end. With the two issues below fixed, this is showcase-quality frontend work; right now it is one focused fix pass away from that standard.

---

## 3. Cross-Section Findings (patterns, each stated once)

**P1 — Scroll-reveal gating content that should be present on load (recurrence, relocated).**
The FAQ page's own `<h1>` ("Good questions, honest answers.") is wrapped in a scroll-triggered reveal: its rendered text sits translated below an `overflow: hidden` clipping box until a scroll event resolves the animation. Verified via DOM inspection (`transform: matrix(1, 0, 0, 1, 0, 48.9196)` on the innermost text span, parent `overflow: hidden`) and by loading the page fresh and waiting 5 seconds with no interaction — the headline never appeared. This is the identical defect class the 2026-07-23 report flagged as the site's sole Critical blocker (there, on FAQ question rows and every booking step); this pass found the booking flow and FAQ question rows fully fixed, but the same mechanism is still live on the FAQ page's own title. The site-wide rule the previous report recommended — "anything that can become visible without a scroll must default to visible" — has evidently not yet been applied everywhere it needs to be.

**P2 — Fixed header wordmark collides with body paragraphs (new finding, root-caused).**
The centered "AARON GRZANICH" wordmark in the fixed header renders on top of in-flow paragraph text at specific, easily reproduced scroll positions on two of the three marketing pages: Home's "A note from Aaron" paragraph (`.meet-aaron__description`) and Vacation Lessons' pull-quote paragraph (`.vacation-quote__text`, "Most vacation activities end when you fly home. This one doesn't."). Both overlaps were confirmed visually (zoomed screenshots show interleaved, illegible characters) and both elements are plain `<p>` tags. The project's own handoff notes describe a fix for exactly this class of collision, implemented as an `IntersectionObserver` that fades the wordmark while it overlaps `h1, h2, h3, [class*="__eyebrow"]` — but that selector list does not include plain paragraphs, so these two collisions fall outside its coverage. This is a scoping gap in an existing, otherwise-working fix, not a new mechanism that needs to be built.

**P3 — Previously-flagged issues confirmed resolved, verified independently.** The Home card-deck copy truncation, the Ongoing Lessons progress-graph line starting at the wrong point, and the two FAQ copy leaks ("Silent lesson footage," "…once booking delivery is connected") were all specifically re-tested this pass and are gone. These are not re-flagged below.

**P4 — Hero video loads and plays; one benign transient network error observed.** The 14 MB hero video reached `readyState 4` (`HAVE_ENOUGH_DATA`) with no playback error during this pass. One of its range requests returned an HTTP 503 mid-load, immediately followed by a successful request that completed loading — consistent with the benign superseded-request pattern already documented in the project's Known Risks, not a new defect. Not re-flagged as an issue below, but worth a passing mention since it is the kind of thing that could tip into a real failure on a slower connection; see Low Priority.

**Positives that recur (do not disturb):** consistent palette/type/ghost-motif; exactly one `<h1>` and zero missing `alt` attributes, verified on all 6 routes this pass; zero console errors observed on any route tested; the booking wizard's state handling, calendar (past dates disabled, today selectable), time-slot selection, auto-advance, and required-field validation are all correct; the About page's horizontal chapter travel shows no stranding on rapid or reversed scroll; nav overlay, hover underlines, and category/footer links all work correctly.

---

## 4. Remaining Desktop Work (implementation backlog)

### Critical — must be resolved before launch

**C1. FAQ page headline is invisible until the user scrolls.**
- *Why it matters:* This is the page's own `<h1>`, sitting directly below the fixed header, fully in view on initial load. A visitor who arrives at `/faq` from a search result, a bookmark, a shared link, or the site's own footer/nav "FAQ" link — and does not immediately scroll — sees a large blank gap where the page's title should be. Reproduced by loading the URL fresh and waiting 5 seconds with zero interaction: the text never resolves.
- *How to reproduce:* Navigate directly to `https://karinrub.github.io/maui-lessons/faq` (fresh load, don't scroll). The space between the header and the "Visiting Maui / Learning week to week / Before you book" category row is blank. Scrolling down and back up reveals the headline correctly; it is only the zero-scroll initial state that fails.
- *Recommended solution:* Apply the same rule the project has already committed to in principle — presence must not depend on a scroll event; scroll animation may enhance a reveal already at rest in its final, visible position. Concretely: default the FAQ hero heading's transform to its resolved state and let the reveal only add a subtle *entrance* if the section is scrolled into a fresh state, or gate the reveal on an intersection check rather than a raw scroll listener so it fires as soon as the element is in view (including immediately on load, since it's already in the initial viewport here).
- *Effort:* **Small–Medium.** Likely the same fix pattern already applied elsewhere on this page (question rows) and on the booking flow; this instance appears to have been missed rather than requiring new engineering.

### High Priority — significant, meaningful impact

**H1. Fixed header wordmark overlaps and obscures body paragraphs on Home and Vacation Lessons.**
- *Why it matters:* At a normal scroll speed, the "AARON GRZANICH" wordmark in the fixed header sits directly on top of two different paragraphs of real copy — Home's "A note from Aaron" testimonial-adjacent text, and Vacation Lessons' central pull quote — producing genuinely illegible, interleaved text. This is not a contrast issue; it is two blocks of content occupying the same pixels. It reads as a rendering defect to any visitor scrolling normally, on the site's highest-traffic page (Home) and its primary conversion page for tourists (Vacation Lessons).
- *How to reproduce:* On Home, scroll until the "A note from Aaron" card (just above the "Ready to play your first song?" close) sits with its first two lines under the header band. On Vacation Lessons, scroll until the pull quote "Most vacation activities end when you fly home. This one doesn't." sits under the header. In both cases the wordmark renders on top of the paragraph text.
- *Recommended solution:* Extend the existing header-collision `IntersectionObserver` selector (currently `h1, h2, h3, [class*="__eyebrow"]`, per the project's own notes) to also watch the specific paragraph classes involved (`.meet-aaron__description`, `.vacation-quote__text`), or — more robustly — broaden the selector to catch any large-type in-flow text block rather than enumerating classes one at a time, so the next instance of this pattern doesn't require another one-off fix.
- *Effort:* **Small.** The mechanism exists and works correctly for headings; this is a selector-scope extension, not new engineering.

### Medium Priority — worth doing if time allows

*(None identified this pass. The copy leaks and truncation issues that occupied this tier in the previous report are confirmed fixed.)*

### Low Priority — unlikely to affect launch quality

**L1. Wordmark legibility over bright hero imagery at first paint.**
- *Why:* "AARON GRZANICH" in the fixed header is low-contrast against the bright sky/cloud portion of the Home and Vacation hero photography before any scroll has occurred (the `is-scrolled` backdrop veil hasn't engaged yet). This is a pre-existing, previously-documented condition, still present, and still minor — the hamburger menu remains fully usable regardless.
- *Effort:* **Small**, if addressed (slight contrast or weight increase on first paint).

**L2. Hero video range-request instability.**
- *Why:* One video range request returned an HTTP 503 during this pass, immediately followed by a successful retry; the video still reached a fully loaded, playable state with no visible impact. This matches an already-documented benign pattern, but a 503 (vs. the previously-seen benign `ERR_ABORTED`/206 pattern) is a slightly different signal and worth a spot-check on a throttled connection before treating it as fully inert.
- *Effort:* **Small** (monitoring/verification only, not necessarily a code change).

*Explicitly not re-litigated:* booking submission is still not wired to a live endpoint (no Formspree form ID configured — confirmed this pass: submitting the wizard produces the correct on-screen "Request received" confirmation but triggers no outbound network request). This is a known, owner-blocked item per the project's own handoff notes, not a defect introduced or newly discovered in this pass, and it is a business decision (get the form ID) rather than an engineering fix. It is flagged here only because it directly affects whether the booking flow can be considered functionally complete at launch, not because it is new.

---

## 5. Page-by-Page Summary (final state only)

**Home — Quality: high, one High-priority defect.**
Strengths: full, untruncated card-deck copy (C0a from the prior pass confirmed fixed), working hero video, correct pinned tagline scrub, functioning nav overlay and hover states. Remaining: **H1** (wordmark/paragraph collision on the "A note from Aaron" section). Not complete until H1 is addressed.

**Vacation Lessons — Quality: high, one High-priority defect.**
Strengths: legible headline with scrim on the hero image, clean pinned image-to-frame transition with a color-appropriate headline recolor, well-sequenced statement/collage/pull-quote/finale flow, working CTA. Remaining: **H1** (wordmark/paragraph collision on the pull-quote finale). Otherwise production-ready.

**Ongoing Lessons — Quality: excellent, no defects found.**
Strengths: progress-graph line now correctly draws up from its origin (C0b from the prior pass confirmed fixed), practice-loop opening intro renders and settles correctly, teacher chapter and cross-link to Vacation Lessons both present, no header/text collisions observed anywhere on this page. Production-ready.

**About — Quality: excellent, no defects found.**
Strengths: horizontal four-chapter biography travels smoothly in both directions with no stranding on repeated forward/reverse scroll testing, chapter progress indicator accurate, no header/text collisions observed. Production-ready.

**FAQ — Quality: strong content and interaction, one Critical defect.**
Strengths: the accordion opens/closes correctly with fully legible answers once visible, category navigation and the sticky "in this guide" rail work correctly, price-anchor line present, both previously-flagged copy leaks are gone. Remaining: **C1** (headline invisible until scroll on initial load). Not production-ready until C1 is fixed.

**Booking — Quality: excellent, functionally complete.**
Strengths: every step (lesson type, date & time, contact details, confirmation) renders immediately and fully without any manual scroll — the defect that made this page a Critical blocker in the previous report is gone. Calendar correctly disables past dates and allows same-day booking; required-field validation correctly gates the submit button; the "Request received" confirmation shows an accurate recap of every selection. The only outstanding item is the separately-tracked, owner-blocked submission wiring (no live endpoint yet), which is a business dependency, not a UI defect.

---

## 6. Design System Observations

- **Typography & palette:** consistent and well-executed across all six routes; no changes needed.
- **Motion philosophy:** the project's own stated rule — "anything that can become visible without a scroll must default to visible; scroll animation may enhance but must never gate presence" — is sound and was clearly applied to fix the booking flow and the FAQ's question rows. This pass shows it was not applied everywhere: the FAQ's own headline still violates it. Recommend a final sweep specifically for any other above-the-fold heading or hero text on any route that uses the same reveal pattern, since this is the second time a headline (Home's hero tagline, functioning correctly, versus FAQ's, not) has turned out to depend on scroll state.
- **Component consistency:** the header collision-avoidance system is a good pattern, correctly implemented for headings; it needs its selector scope widened rather than a new mechanism built.
- **Brand identity & polish:** cohesive and high; ghost-word motif used at a consistent, tasteful frequency across routes.

---

## 7. Production Risks

- **First-impression risk (FAQ):** a visitor who lands directly on `/faq` — a meaningfully likely entry point given the site's investment in FAQ-specific SEO schema — may see an apparently empty page above the fold. Resolved by C1.
- **"Looks broken" risk (Home, Vacation):** the wordmark/text collision is the kind of defect a visitor is likely to screenshot or bounce over, precisely because it looks like a bug rather than a design choice. Resolved by H1.
- **Maintainability risk:** both issues in this report are narrow-scope instances of patterns the codebase has already solved correctly elsewhere (scroll-reveal defaulting to visible; header-collision avoidance). The risk is coverage gaps recurring as new sections are added, not a fundamentally unsound architecture. Worth a short "audit every scroll-reveal and every large in-flow text block against these two rules" pass rather than only patching the two instances found here.
- **Booking submission (carried forward, not new):** the wizard is functionally complete but not connected to a live endpoint. Not a UI defect; flagged so it isn't lost before the site goes live for real bookings.

---

## 8. Recommended Implementation Order

1. **C1 — FAQ headline reveal.** Highest priority: affects the first thing a directly-landing visitor sees on a page the site has specifically optimized for search traffic.
2. **H1 — Header/paragraph collision.** Extend the existing, working collision-avoidance selector to cover `.meet-aaron__description` and `.vacation-quote__text` (or broaden it structurally to catch large in-flow text generally).
3. **L1 / L2** — only if time remains; neither blocks launch.
4. **Confirm the booking Formspree ID with the owner** so the flow is truly complete before real traffic arrives — not a code task for this punch list, but worth closing the loop on before shipping.

This order fixes the two things a normal visitor will actually notice first, in the order they're likely to be noticed (arriving on FAQ vs. scrolling Home/Vacation), before spending any time on cosmetic-only items.

---

## 9. Launch Readiness Score (1–10)

- **Visual Design — 9.** Cohesive, premium, original; no systemic visual issues.
- **UX — 7.** Structure and IA are excellent; one page's own headline is invisible on arrival, which is a real first-impression problem.
- **Motion — 7.** Confident and mostly correct; the reveal-gating pattern has recurred in a new spot, and the header-collision fix has a coverage gap.
- **Interaction — 9.** Booking wizard, accordion, calendar, nav overlay, and hover states all work correctly — a substantial improvement over the previous pass.
- **Storytelling — 9.** Purpose-built, emotionally effective, well sequenced.
- **Conversion — 7.** Booking, the flow that most needed fixing, is now solid; FAQ's blank-on-arrival headline is a smaller but real drag on the page many visitors will hit first.
- **Professionalism — 7.** High where visible; the two defects in this report are exactly the kind that make a visitor question whether the site "works."
- **Portfolio Quality — 8.** Held back only by two narrow, well-diagnosed issues; ~9–10 once fixed.
- **Overall Desktop Readiness — 7.** A real step up from the previous pass's 6 — the flow that used to be fully broken (booking) is now solid — but two new/relocated defects keep this from being launch-ready today.

---

## 10. Final Recommendation

**Ready after minor fixes.**

This is not a "keep iterating" verdict. The substantive engineering work from the previous pass — fixing the booking flow so every step and the confirmation render without a scroll — clearly landed and was independently re-verified end to end in this pass, along with the three owner-flagged Home/Ongoing fixes. What remains is two narrow, precisely root-caused issues: one page's headline needs the same "default to visible" treatment already correctly applied elsewhere on that same page, and one existing, working collision-avoidance system needs its coverage widened by two class names. Neither requires new design work, new architecture, or a scope discussion with the owner. Fix C1 and H1, re-verify both on the live build, and this desktop experience is ready to ship.

---

## 11. Stop Doing List

- **Do not re-litigate the booking flow's UI.** It is now correct, complete, and well-tested; further changes there without a specific new defect would be wasted effort.
- **Do not touch Ongoing Lessons or About.** Both are in excellent shape with zero defects found this pass; further design iteration produces no meaningful value right now.
- **Do not build a new collision-avoidance mechanism.** The existing `IntersectionObserver`-based system works correctly for headings; the fix is a selector extension, not a rewrite.
- **Do not add new scroll-driven reveals to any above-the-fold content** until the "default to visible" rule has been swept across the existing ones — this is the second headline found to violate it.
- **Do not change the creative direction, palette, type, or ghost-word motif.** They are consistent and working well.
- **Do not treat the booking-submission wiring as a UI bug.** It's a configuration/business dependency (a Formspree form ID), not something for a frontend punch list.

---

## 12. Final Conclusion (handoff to a future senior designer)

If you are picking this up cold: the Maui Lessons desktop site made real, verifiable progress since the last audit. The flow that used to be the site's single Critical blocker — booking — is now genuinely solid: every step and the confirmation screen render immediately, with no scroll dependency, and the whole wizard was walked through live in this pass with a real submission attempt, correct validation, and an accurate confirmation recap. The three owner-flagged Home/Ongoing issues from the prior pass (card-copy truncation, the progress-graph starting position, and the hero video) are also confirmed fixed, independently, against the live site.

**What's left, and why.** Two issues, both narrow and both already understood by the codebase in principle. First, the FAQ page's own headline is invisible on arrival because it is still wired to the same scroll-gated reveal pattern that used to hide the FAQ's question rows and every booking step — that pattern has clearly been fixed *elsewhere* on this exact page, so this looks like one missed instance rather than an unsolved problem. Second, the fixed header's wordmark collides with two specific paragraphs of body copy (on Home and on Vacation Lessons) because the project's own collision-avoidance system only watches headings and elements with an `__eyebrow` class — both offending paragraphs are plain text blocks outside that net. Both fixes are scoped, both have a working reference implementation already in the codebase to extend, and neither touches design, copy, or architecture.

**The philosophy to carry forward.** The project's own stated rule remains correct: presence must never depend on scrolling, only enhancement may. The lesson from this pass specifically is that fixing a pattern in the two places it was first found (question rows, booking steps) doesn't guarantee it's fixed everywhere the same pattern is used — a page's own hero heading is just as capable of using a scroll-reveal as a list of accordion rows is, and needs the same audit. The same applies to the header-collision fix: solving it for headings doesn't solve it for body text using the same layout pattern. A short, deliberate sweep — "every scroll-reveal defaults to visible; every large in-flow text block is covered by collision avoidance" — closes both, and closes the class of bug behind both, not just today's two instances.

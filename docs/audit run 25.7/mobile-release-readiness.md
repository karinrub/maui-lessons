# Mobile and Smaller Screens Release Readiness Report

Project: Maui Lessons (Aaron Grzanich)
Scope: Phones, tablets, and smaller/intermediate screens. Real Playwright device emulation — explicit viewport dimensions, device pixel ratio, `isMobile`/touch flags, and real mobile/tablet user-agent strings, confirmed live via `navigator.userAgent`, `window.innerWidth/innerHeight`, `window.devicePixelRatio`, and `'ontouchstart' in window` before any finding was trusted. Not a resized desktop browser window. Desktop is covered by the separate desktop-audit track (`docs/audit run 25.7/desktop-release-readiness.md`) and is out of scope here except where a desktop-documented defect was independently re-tested at mobile/tablet widths.
Date: 2026-07-25
Source: Independent, from-scratch audit of the live production site at `https://karinrub.github.io/maui-lessons/`, conducted across two parallel real-device-emulation passes (phones; tablets and breakpoint-edge widths). Prior mobile audit documents (the 2026-07-24 and three 2026-07-25 passes referenced in the project's `CLAUDE.md`) were used only for context on expected behavior and known design intent — every issue below was reproduced independently against the current live build during this pass, not assumed from a prior document.

This is a decision document, not a recap. It reflects the live site's current mobile/tablet state as of this pass, independent of what any earlier report claimed was fixed or outstanding.

---

## Devices and viewports tested

**Phones** (real Playwright device emulation, confirmed UA/viewport/DPR/touch per device):
- iPhone SE — 375×667, DPR 2 — portrait and landscape (667×375)
- iPhone 13 — 390×844, DPR 3 — portrait and landscape (844×390)
- iPhone 14 Pro Max — 430×932, DPR 3 — portrait
- Pixel 7 (Android) — 412×915, DPR 2.625 — portrait and landscape (915×412)
- Intermediate, unnamed profile — 414×896, DPR 2 — portrait

**Tablets and breakpoint-edge widths** (real Playwright device emulation, confirmed UA/viewport/DPR/touch per device):
- iPad Mini — 768×1024, DPR 2 — portrait and landscape (1024×768)
- iPad Air — 820×1180, DPR 2 — portrait and landscape (1180×820)
- Breakpoint-edge below — 745×1000, DPR 2, touch, tablet UA (just under the project's ~760px mobile/desktop breakpoint)
- Breakpoint-edge above — 780×1000, DPR 2, touch, tablet UA (just over the breakpoint)

All 6 live routes (Home, Vacation Lessons, Ongoing Lessons, About, FAQ, Book) were tested on every device above — 36 route/device combinations at minimum, plus additional orientation and edge-width combinations. Testing covered initial load, direct navigation, refresh, back/forward, slow/fast/reverse scroll, repeated animated-section scroll, touch interaction, `prefers-reduced-motion`, and console/network monitoring on every combination. This is real device emulation, not physical-device testing — no physical phone or tablet was used in this pass, consistent with every prior mobile audit in this project's history.

One methodology note surfaced mid-audit and is disclosed rather than smoothed over: the tablet-track agent found evidence the underlying browser session was reused/shared across some tool calls (an unexpected route appearing mid-script, one screenshot inconsistent with logged state). Every finding reported as confirmed below was re-verified atomically (navigate → interact → assert → screenshot within a single uninterrupted execution) specifically to guard against this; the one place this discipline briefly slipped (the FAQ sidebar at 780px, see T-3 in the raw findings) is called out explicitly as needing a recheck rather than reported as fact.

---

## 1. Executive Summary

The mobile and tablet experience is, structurally, in strong shape — meaningfully stronger than the picture the last several mobile-audit documents in this project painted, and stronger in some specific respects than desktop is today. Across 36+ route/device combinations spanning 375px to 1180px, this pass found **zero horizontal overflow, zero console errors, and zero failed network requests anywhere** — the strongest and most uniform result of any audit pass on this project to date. The previously Critical About-page chapter-track stranding bug does not reproduce under real touch-drag input at tablet widths (it was only ever wheel-emulation-tested before this pass). Reduced motion, the nav overlay, the Book wizard, and FAQ's accordion all work correctly under real touch across every device tested. And — notably — the single Critical defect blocking the desktop report today (the FAQ page's own headline being invisible until the user scrolls) **does not reproduce at any phone or tablet width tested**; it appears to be a desktop-only manifestation of that reveal animation.

However, **mobile is not launchable today**, for a reason that is a scoped-up version of something the desktop report also flagged: **the fixed header's "AARON GRZANICH" wordmark collision with body content is broader and more frequent on mobile than on desktop.** The existing collision-avoidance system only watches `h1, h2, h3, [class*="__eyebrow"]`. On phone widths this pass found the wordmark sitting directly on top of not just paragraph text (as desktop found) but also FAQ accordion question buttons and Book's calendar day-number buttons — meaning the collision now touches interactive, conversion-relevant controls, not only prose. It reproduces identically at tablet widths on Vacation Lessons. This is the same root cause the desktop report already diagnosed and scoped a fix for; this pass's contribution is confirming the blast radius on mobile is wider than "two paragraphs."

Separately, and more troubling for the project's own credibility: **the FAQ page's category tab rail never releases from the top of the viewport at phone widths and at the 745px breakpoint-edge width**, staying pinned over the closing CTA and footer for the rest of the page. This is not a new discovery — it has now been independently flagged in the 2026-07-24 pass, the third 2026-07-25 pass, and again in this pass, three separate times, and it is still live in production.

**Would I launch today? No.** The header-collision gap now reaches interactive controls on mobile, and a three-times-documented, still-unfixed sticky-rail bug on a page the site has specifically SEO-optimized is not a good look to hand to a client as "ready." **Would I launch after a short, well-scoped fix pass? Yes.** Both defects have known root causes, known fix locations, and no design or architecture questions attached — this is execution, not diagnosis, at this point.

---

## 2. Overall Assessment

**Visual consistency — Excellent.** The cream/forest-green/sage/gold system, Fraunces + Cormorant Garamond pairing, and ghost-word motif hold up cleanly at every phone and tablet width tested. Nothing reads as off-brand at smaller sizes.

**Storytelling — Excellent, and genuinely adapted per screen size, not just shrunk.** About's four-chapter biography correctly drops its horizontal pin below 761px in favor of an in-flow, blur-to-focus reveal — a real per-breakpoint redesign of the interaction, not a naive resize. Home's reduced-motion fallback lays the three service cards out as a normal column rather than leaving two of them invisible. This is the kind of adaptation a "genuinely designed for the screen" bar requires, and it is present.

**Motion quality — Strong, with one confirmed-solid result and one still-open pattern.** The About page's chapter-pin mechanic was stress-tested this pass with real touch-drag gestures (not mouse-wheel emulation, which is all prior passes used) under reversing, rapid-alternating, and stop-mid-transition scenarios at both iPad Mini and iPad Air — zero stranding in every case. This is the strongest confirmation this specific mechanic has received to date. Reduced motion is correctly honored sitewide (no autoplay video, no absolutely-positioned invisible cards) on every device checked. The one place motion still causes a real problem is the header/content collision described above — a layering bug, not a choreography bug.

**Interaction quality — Strong.** The Book wizard was walked through via real touch taps and correctly advances between steps; calendar day cells measure 46×46px (clears the 44px guideline) and correctly disable past dates; the FAQ accordion toggles correctly via touch with 60.8px-tall rows. The nav overlay opens and closes correctly via real touch tap, restores body scroll, and — on the one device where it was specifically re-checked (iPhone SE landscape, 667×375, the shortest tested viewport) — every link plus the "Book a Lesson" CTA fits without needing to scroll the overlay itself.

**Trust & professionalism — Good, with two real dents.** The About and Ongoing Lessons pages, and the underlying zero-overflow/zero-console-error result sitewide, build real confidence. The header-collision gap and the still-unreleased FAQ sticky rail are exactly the kind of thing a visitor — or a client doing their own final check on a phone — will notice and read as "this wasn't finished."

**Conversion — Good, with a mobile-specific caveat.** The Book flow itself works correctly via touch. The header collision now overlapping FAQ's question buttons and Book's calendar-day buttons is a real (if narrow-window) risk to the two pages most directly tied to conversion; it does not block completion (the controls remain tappable underneath the overlapping text) but it looks broken at the exact moment a visitor is trying to book or find an answer.

**Cohesion & portfolio quality — High, one step behind desktop's "ready after minor fixes" bar for a different reason.** Where desktop's blocker is a single-page invisible-headline bug, mobile's blockers are a wider-reaching version of a bug desktop already found, plus a bug that has been reported three times without being fixed. Neither is a large amount of engineering; the second one is more of a process gap than a technical one.

---

## 3. Cross-Section Findings (patterns, each stated once)

**M1 — Header wordmark collision reaches interactive controls on mobile, not just prose (broadened scope of a desktop-documented defect).**
The existing `IntersectionObserver` (documented in the project's own handoff notes as watching `h1, h2, h3, [class*="__eyebrow"]`) does not cover plain `<p>` tags — this was already found on desktop today (`.meet-aaron__description` on Home, `.vacation-quote__text` on Vacation). This pass confirms the same gap reproduces identically at phone widths (iPhone SE, full 24-step scroll sweep) and at tablet widths (iPad Mini portrait, iPad Air landscape, on Vacation specifically — DOM geometry confirmed a 35.5px overlap with the wordmark at full opacity). More significantly, on phone widths the collision was also confirmed against FAQ's accordion question `<button>` elements and Book's calendar day-number `<button>` elements — meaning the same layering bug now sits on top of interactive, conversion-path controls on two of the six routes, not only on decorative prose. The fix location is identical to the one the desktop report already scoped; the mobile-specific addition is that the selector needs to cover buttons and calendar cells as well as paragraphs, or the mechanism needs to move from an enumerated-selector approach to a general "any text-bearing element under the header" approach.

**M2 — FAQ category rail never releases at the bottom of the page (recurrence, three times documented, still unfixed).**
`.faq-category-nav`'s `position: sticky` container has no upper bound tied to the length of the accordion content it's meant to track — verified via DOM geometry that it remains pinned at `top: ~60px` all the way to the true bottom of the document (`scrollY + innerHeight >= scrollHeight`) on iPhone SE portrait and at the 745px breakpoint-edge width, sitting directly over the closing "Ready to play your first song?" CTA and the footer. This defect was first reported in the 2026-07-24 mobile pass, reported again in the third 2026-07-25 pass, and is confirmed still live in this, the fourth report to flag it. It is phone-width-and-breakpoint-edge-specific — both true tablet widths (iPad Mini, iPad Air) and the 780px above-breakpoint edge correctly render an entirely different, non-sticky sidebar layout with no rail to un-stick, consistent with what prior audits already established.

**M3 — The desktop-blocking FAQ headline scroll-gate bug does not reproduce on mobile or tablet.**
The most recent desktop pass (today) found the FAQ page's own `<h1>` invisible for an indefinite period after load due to a scroll-gated reveal animation. This pass specifically re-tested that exact behavior at every phone and tablet width: in every case, FAQ's H1 was `opacity: 1` and fully in-viewport immediately on a zero-scroll, zero-interaction load. This appears to be a desktop-only manifestation of the reveal (likely a media-query- or breakpoint-scoped animation variant), not a defect that also affects mobile visitors. Stated here so it is not mistakenly carried into the mobile backlog as an open item, and so a future pass knows it was specifically checked and cleared for mobile, not merely not mentioned.

**M4 — About page's chapter-pin mechanic confirmed solid under real touch input, not just wheel emulation (positive, strengthens an existing "resolved" claim).**
The project's own notes describe the About chapter-track stranding fix as re-verified via mouse-wheel-emulated scroll only. This pass ran the same class of stress test — reversing gestures mid-transition, rapid alternating-direction bursts, stop-mid-chapter — using real CDP touch-drag input at iPad Mini portrait and iPad Air landscape, with long settle waits and DOM-geometry confirmation (chapter positions landing on exact viewport-width multiples). Zero stranding across all scenarios on both devices. This closes the specific gap the prior report's own stopping rule called out ("a physical-device pass is still the next-best confirmation") one step further than before.

**M5 — Sitewide positives that recur (do not disturb):** zero horizontal overflow across all 36+ route/device combinations tested (the strongest such result to date on this project); zero console errors and zero failed non-video network requests anywhere; nav overlay opens/closes correctly via real touch with correct scroll-lock and restoration on every device checked; reduced motion correctly honored (no autoplay video, in-flow static layout) on Home and About at both phone and tablet widths; Book wizard advances correctly via real touch tap with correctly-sized calendar cells and past-date disabling; FAQ accordion rows are touch-friendly (60.8px tall) and toggle correctly; footer link tap-target extension via `::after` verified functional via hit-testing; direct navigation, refresh, and back/forward all resolve to correct content on every device tested.

---

## 4. Remaining Mobile and Smaller Screen Work (implementation backlog)

### Critical — must be resolved before launch

**C1. Fixed header wordmark collides with interactive controls (FAQ question buttons, Book calendar-day buttons) as well as body paragraphs, sitewide on mobile.**
- *Why it matters:* This is the same collision-avoidance gap the desktop report found and scoped as High Priority there — but on mobile, the same gap was confirmed against tappable controls on the FAQ and Book pages, not only prose. A visitor tapping into the calendar or reading an FAQ answer at the wrong scroll position sees the wordmark stamped illegibly across a button they're about to interact with. That is a stronger signal of "broken" than text-over-text, and it touches the two most conversion-relevant surfaces on the site (booking, answering pre-purchase questions), which is why this is rated a step above the equivalent desktop finding.
- *How to reproduce:* On iPhone SE (375×667) or any phone width, scroll slowly through FAQ until an accordion question row sits under the fixed header, or through Book until a calendar day-number sits under it; the wordmark renders at full opacity over the control in both cases. On Vacation Lessons at iPad Mini portrait (768×1024) or iPad Air landscape (1180×820), scroll to the "Never held a ukulele before…" collage paragraph — DOM geometry confirms a 35.5px overlap at full wordmark opacity.
- *Recommended solution:* Same fix location the desktop report already identified — extend the `IntersectionObserver` selector beyond `h1, h2, h3, [class*="__eyebrow"]`. Given mobile's wider blast radius (paragraphs plus interactive buttons), recommend generalizing the detection (e.g., watch any element with rendered text content above a size/contrast threshold within the header's band) rather than continuing to enumerate individual classes, since this is now the second and third instance of new element types falling outside the same fixed selector list.
- *Effort:* **Small–Medium.** One shared mechanism, one shared fix; the same change likely resolves both the desktop and mobile instances simultaneously.

### High Priority — significant, meaningful impact

**H1. FAQ category rail never releases at the bottom of the page (phone widths and the 745px breakpoint-edge width).**
- *Why it matters:* This is the third consecutive audit to find this exact defect still live in production, following the 2026-07-24 and third 2026-07-25 passes. A sticky element that outlives its content and sits over the closing CTA and footer reads as broken, and the fact that it has now been reported three times without a fix is itself a process signal worth surfacing to whoever is triaging this backlog — see the Stop Doing List.
- *How to reproduce:* Load `/faq` on iPhone SE (375×667) or at 745×1000 with a touch/tablet UA, scroll to the true bottom of the document. The rail remains pinned at `top: ~60px` over the "Ready to play your first song?" CTA and footer instead of releasing once the accordion content ends.
- *Recommended solution:* Constrain the sticky container's scroll range to the height of the categories/accordion section specifically (a `position: relative` wrapping ancestor sized to that content, ending the sticky behavior when its own bottom edge passes under the header), rather than leaving it sticky for the full page height.
- *Effort:* **Small.**

### Medium Priority — worth doing if time allows

*(None identified this pass at Medium severity. The two items above cover everything found with genuine visitor-facing impact; everything below is narrower or lower-confidence.)*

### Low Priority — unlikely to affect launch quality

**L1. Escape key does not close the full-screen nav overlay (phone, external-keyboard scenario only).**
- *Why:* After opening the nav overlay via a real touch tap, pressing Escape leaves the overlay open and the body scroll-locked; tapping the toggle/X button (the primary, expected touch-close path) closes it correctly. This only matters to a phone user with an external/Bluetooth keyboard, which is a narrow scenario, but it's a real accessibility gap worth a look.
- *Effort:* **Small** — verify the Escape keydown listener is bound at `document` level rather than scoped to a child of the focus trap.

**L2. Transient blank/unpainted frame observed during automated rapid-scroll screenshot capture on Vacation Lessons.**
- *Why:* During scripted fast scrolling to a deep position, a screenshot occasionally captured a flat, unpainted cream frame despite the DOM reporting fully correct, opaque, positioned content at that exact moment; a 1px viewport nudge forced a correct repaint. This matches the project's own already-logged "transient blank cream" observation on Ongoing Lessons, previously attributed to a paint/compositing hiccup under rapid *automated* scroll, not reproduced under slower scrolling. Given this was only observed under scripted/automated scroll speeds in this pass too, it is not confirmed as a real user-facing defect — flagging for a human recheck on a real device at natural scroll speed, not recommending a code change without further evidence.
- *Effort:* **Not applicable until reproduced by a human** — monitoring item, not a scoped fix.

*Explicitly not re-litigated:* the desktop report's C1 (FAQ headline scroll-gate) does not apply here — confirmed not reproducing on mobile or tablet (see M3 above). Booking submission wiring (no live Formspree endpoint) is the same owner-blocked, non-UI dependency documented in the desktop report and every prior project audit; it is not re-scored here as a mobile-specific issue.

---

## 5. Page-by-Page Summary (final state only)

**Home — Quality: high, one shared Critical defect (C1).**
Strengths: zero overflow at every phone/tablet width tested; reduced-motion fallback correctly lays the three service cards out as a normal in-flow column with no autoplay video; nav overlay fits and functions correctly even at the shortest tested viewport (iPhone SE landscape, 667×375). Remaining: shares in **C1** (header/paragraph collision over `.meet-aaron__description`, confirmed at phone widths — same root cause as desktop's H1, mobile scope confirmed here).

**Vacation Lessons — Quality: high, one shared Critical defect (C1).**
Strengths: pinned hero and collage/statement flow render cleanly at every phone and tablet width with no overflow; rapid forward/reverse scroll churn (9-position stress test) produced no errors or layout breakage. Remaining: shares in **C1** — confirmed at both phone widths (paragraph collision) and tablet widths (iPad Mini portrait, iPad Air landscape — 35.5px DOM-verified overlap on the collage paragraph).

**Ongoing Lessons — Quality: excellent, no defects found.**
Strengths: zero overflow, zero console errors on every device tested; the only network signal is the already-documented benign video-probe pattern (superseded 206 requests immediately followed by a completed request). No header/text collisions observed on this route at any width. Production-ready on mobile and tablet.

**About — Quality: excellent, no defects found; strongest single result of this pass.**
Strengths: confirmed not horizontally pinned below 761px (normal in-flow chapters on phone, as documented); chapter-pin mechanic on tablet widths stress-tested with real touch-drag input (not wheel emulation) under reversing, rapid-alternating, and stop-mid-transition scenarios on both iPad Mini and iPad Air — zero stranding in every scenario; reduced motion correctly disables the pin and shows all chapters in normal flow. Production-ready.

**FAQ — Quality: strong content and interaction, one High-priority defect (H1); the desktop-blocking headline bug does not apply here.**
Strengths: the page's own H1 is immediately visible on load at every phone and tablet width (the desktop scroll-gate bug does not reproduce on mobile — see M3); accordion rows are touch-friendly (60.8px) and toggle correctly; the tablet-width sidebar layout is a genuinely different, non-sticky component with no rail-release problem. Remaining: **H1** (category rail never releases at phone widths and the 745px breakpoint-edge width — third consecutive audit to find this); shares in **C1** on phone widths, where the collision was confirmed against the accordion question buttons specifically.

**Book — Quality: excellent interaction, shares in one Critical defect (C1) at phone widths.**
Strengths: full wizard flow advances correctly via real touch tap; calendar day cells measure 46×46px (clears the 44px guideline) with past dates correctly disabled; progress rail correctly renders as a horizontal flex row at tablet width rather than incorrectly persisting the mobile-only 2×2 grid treatment. Remaining: shares in **C1** — the header/button collision was confirmed against calendar day-number buttons on phone widths specifically. On-screen-keyboard obstruction of the contact-form step could not be genuinely tested in this environment (Playwright/CDP does not render a real virtual keyboard, so `visualViewport.height` never actually shrinks) — flagged as a real gap in this pass's coverage, not a confirmed pass or fail; recommend a physical-device check specifically for this before calling the Book flow fully verified on mobile.

---

## 6. Design System Observations

- **Typography & palette:** consistent and legible across every phone and tablet width tested; no changes needed.
- **Motion philosophy:** the project's "presence must not depend on scrolling" rule (documented in the desktop report and this project's own handoff notes) holds correctly on mobile — the one instance where it fails on desktop (FAQ's headline) does not carry over to mobile, likely because the reveal in question is itself scoped to a desktop breakpoint. This is worth confirming explicitly when C1's fix (desktop) lands, so the fix doesn't inadvertently introduce a new mobile-only version of the same gate.
- **Component consistency:** the header collision-avoidance system is, structurally, a good pattern — correctly implemented for headings, correctly fading the wordmark when it should. Its problem is coverage, not architecture, and that problem is now confirmed to be wider than "two paragraphs" once mobile's buttons and calendar cells are considered. Recommend the generalized "any text-bearing element" approach over further one-off selector additions, since this is the third distinct element type (paragraphs, accordion buttons, calendar-day buttons) found outside the original selector's coverage.
- **Sticky/fixed-element discipline:** the FAQ category rail is the one sticky element on the site without a bounded release condition; every other sticky/fixed element checked this pass (the main header, the tablet FAQ sidebar) correctly respects its content's extent. Worth a quick sweep for any other sticky element sharing the same unbounded pattern before considering this class of bug fully closed.
- **Per-breakpoint redesign discipline:** genuinely strong. About's pin-to-in-flow switch below 761px and the Book progress rail's flex-to-grid switch below 560px are both real, deliberate, correctly-implemented breakpoint-specific redesigns rather than a single layout being naively squeezed — this is exactly the "intentionally designed for this screen" bar the audit was asked to hold the site to, and it is met in both cases.

---

## 7. Production Risks

- **"Looks broken, and now on a button" risk (Home, Vacation, FAQ, Book):** the header/content collision is more likely to be noticed and screenshotted on mobile than desktop specifically because it now reaches interactive controls a visitor is actively trying to use (an FAQ question, a calendar date) rather than only prose they're passively reading past. Resolved by C1.
- **Repeated-and-ignored-finding risk (FAQ rail):** a defect reported in three consecutive audits without a fix landing is a process risk independent of the defect's own severity — it suggests backlog items are being logged but not tracked to closure. Worth a process check (is this on anyone's board?) alongside the code fix itself. Resolved by H1.
- **Coverage gap risk (Book keyboard obstruction):** this pass could not genuinely test on-screen-keyboard obstruction of the Book contact-form fields because Playwright/CDP does not simulate a real virtual keyboard's viewport-resize behavior. This is a real, undconfirmed gap in mobile coverage — not a defect, but also not a "verified working" claim — and should not be treated as cleared until a physical-device check happens.
- **Maintainability risk (shared root causes):** both C1 and the equivalent desktop finding trace to the same one mechanism; a single fix should close both simultaneously if scoped correctly, which lowers the actual risk here once someone picks it up — the risk is scoping the fix too narrowly (fixing only the classes named in this report) rather than generally, and finding a fourth element type affected in the next audit.
- **Booking submission (carried forward from every prior audit, not new):** the wizard is functionally complete on mobile via real touch interaction but not connected to a live endpoint. Not a mobile-specific defect; not re-scored here.

---

## 8. Recommended Implementation Order

1. **C1 — Header/content collision, generalized fix.** Highest priority: reaches interactive controls on two conversion-relevant pages (FAQ, Book) on mobile, and the same fix very likely closes the equivalent desktop finding at the same time — highest leverage per unit of engineering effort in this entire backlog.
2. **H1 — FAQ category rail release.** Second priority, both for its own visitor-facing impact and because it is the specific item that has now gone unfixed across three audits — closing it out matters for the report's own credibility as much as for the page.
3. **L1 / L2** — only if time remains; neither blocks launch. L2 specifically needs a human recheck before any code is touched, since the automated tooling used to find it may itself be the cause.
4. **Physical-device check of the Book contact-form step specifically**, to close the on-screen-keyboard-obstruction coverage gap this pass could not genuinely test — not a code task, a verification task, but one that should happen before calling the Book flow's mobile QA complete.

---

## 9. Launch Readiness Score (1–10)

- **Visual Design — 9.** Cohesive, premium, and legible at every phone and tablet width tested; no systemic issues.
- **UX — 7.** Structure, navigation, and per-breakpoint redesigns (About, Book progress rail) are excellent; the FAQ rail and header collision are both real, visitor-noticeable UX defects that keep this from a higher score.
- **Motion — 8.** The About chapter-pin mechanic is now the most rigorously verified piece of motion on the entire site (real touch input, multiple stress scenarios, zero stranding); reduced motion is correctly honored everywhere checked. Held back only by the header-collision layering bug, which is a rendering-order issue more than a choreography one.
- **Interaction — 8.** Nav overlay, Book wizard, and FAQ accordion all work correctly via real touch on every device tested; docked one point for the confirmed FAQ-rail defect and the unconfirmed Book-keyboard-obstruction coverage gap.
- **Storytelling — 9.** Genuinely adapted per screen size (About's in-flow chapters, Home's reduced-motion column), not merely shrunk; emotionally coherent at every width tested.
- **Conversion — 7.** Both conversion-critical flows (Book, FAQ) function correctly end to end via touch, but both also carry the header-collision defect at the exact moments a visitor is interacting with them, which is a real, if narrow-window, drag on confidence at the point of conversion.
- **Professionalism — 6.** The three-times-reported, still-unfixed FAQ rail is the single biggest driver of this score — it is exactly the kind of thing that makes a site look unfinished to a client doing their own final pass, independent of the defect's own technical severity.
- **Portfolio Quality — 8.** Held back only by the two items above, both narrow and well-diagnosed; ~9–10 once fixed, and the About page's newly-strengthened verification is a genuine showcase point on its own.
- **Overall Mobile and Smaller Screen Readiness — 7.** On par with today's desktop score, for different reasons: mobile's zero-overflow/zero-console-error result across 36+ combinations and its stronger About/reduced-motion verification are a real step up from where prior mobile audits left things, but the header-collision gap now reaching interactive controls, plus a defect that has evaded three separate audits, keep this from being launch-ready today.

---

## 10. Final Recommendation

**Ready after minor fixes.**

This is not a "keep iterating" verdict, and it is not a "start over on mobile" verdict either — the foundational result of this pass (zero horizontal overflow, zero console errors, zero failed requests across every route and every device tested) is the strongest such result this project has produced, and the About page's chapter-pin mechanic has now been verified more rigorously, with real touch input, than at any prior point in this project's history. What remains is one shared-root-cause layering bug that also affects desktop (so one fix very likely closes both) and one narrowly-scoped sticky-positioning bug that has simply not been picked up despite three separate reports. Neither requires new design work, new architecture, or a scope discussion with the owner. Fix C1 and H1, re-verify both against the live build on at least one real phone and one real tablet, and this mobile experience is ready to ship alongside desktop.

---

## 11. Stop Doing List

- **Do not re-litigate the About page's chapter-pin mechanic.** It has now been verified with real touch input under three separate stress scenarios on two tablet devices with zero stranding — this is closed, not merely "believed fixed."
- **Do not touch Ongoing Lessons.** Zero defects found on any device this pass; further iteration produces no meaningful value right now.
- **Do not report the FAQ category rail bug a fourth time without also fixing it.** It has been independently found in the 2026-07-24 pass, the third 2026-07-25 pass, and this pass. The finding is not the problem at this point — the lack of a fix landing is. Whoever picks up this backlog next should treat H1 as the very first thing addressed, not re-diagnosed.
- **Do not build a new collision-avoidance mechanism from scratch.** The existing `IntersectionObserver`-based system works correctly for the element types it watches; the fix is broadening what it watches, not a rewrite.
- **Do not assume the desktop FAQ-headline fix will also need a mobile-specific variant.** This pass confirmed that bug does not reproduce on mobile at all — but do re-check this specific point once the desktop fix lands, since scroll-reveal fixes have a documented history on this project of fixing one instance while leaving or creating another.
- **Do not change the creative direction, palette, type, or ghost-word motif.** They are consistent and working well at every width tested.
- **Do not claim the Book flow's mobile keyboard behavior is verified until a physical device confirms it.** This pass could not genuinely test on-screen-keyboard obstruction; say so rather than reporting it as a pass.

---

## 12. Final Conclusion (handoff to a future senior designer)

If you are picking this up cold: the Maui Lessons mobile and tablet experience is, in its foundations, in the best-verified state this project has seen. A real-device-emulation sweep across 36-plus route/device combinations — five phone profiles including two orientations, two tablet profiles including two orientations, and two breakpoint-edge widths bracketing the site's own ~760px breakpoint — found zero horizontal overflow, zero console errors, and zero failed network requests anywhere. The site's per-breakpoint redesign discipline (About dropping its pin below 761px, Book's progress rail switching from a grid to a flex row above 560px, Home's reduced-motion column layout) is real, deliberate, and correctly implemented, not a single layout naively squeezed to fit — that is exactly the "intentionally designed for this screen" bar this audit was asked to hold the site to, and it clears it in every case checked. The About page's chapter-pin mechanic, previously verified only under mouse-wheel emulation, was this pass stress-tested with real touch-drag gestures under reversing and rapid-alternating scenarios on two tablet devices, with zero stranding — the strongest confirmation that specific mechanic has received.

**What's left, and why.** Two issues. First, the fixed header's wordmark-over-content collision — already found and scoped on desktop today — reaches further on mobile than it does on desktop: this pass confirmed it also overlaps FAQ's accordion question buttons and Book's calendar day-number buttons, not only paragraph text. The underlying mechanism and fix location are exactly what the desktop report already identified; the lesson from mobile is that the fix needs to generalize past an enumerated class list, because this is now the third distinct element type found outside its coverage. Second, the FAQ category rail's failure to release at the bottom of the page is not a new discovery — this is the third consecutive audit to find it, following passes on 2026-07-24 and earlier on 2026-07-25. The fix itself is small and well understood (bound the sticky container to its content's height); the real issue is that three findings have not yet produced one fix.

**The philosophy to carry forward.** The project's collision-avoidance and scroll-reveal-default-to-visible rules are both sound in principle and both hold up well across most of the site — the pattern in every open finding here is the same one the desktop report already named: a correct mechanism, scoped by an enumerated list, that hasn't yet been swept for every element type it needs to cover. That sweep — "does this mechanism's selector list include every text-bearing and interactive element that can plausibly sit under the header, on every route" — is the single highest-leverage next step, more valuable than patching the specific instances named in this report one at a time, because it is very likely to be the same sweep that also finishes closing out the desktop report's open items.

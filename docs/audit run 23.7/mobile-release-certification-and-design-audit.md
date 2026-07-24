# Mobile Release Certification & Design Audit

Project: Maui Lessons (Aaron Grzanich)
Scope: Mobile — first load through completion of the booking flow, all six routes evaluated as one product.
Date: 2026-07-24
Baseline: `docs/audit run 23.7/desktop-release-readiness.md` (2026-07-23) is treated as the current design baseline, per instruction. This report does not re-litigate desktop; it asks whether mobile carries the same craft and whether it is independently release-ready.
Other sources consulted: `qa-functional-report.md` and `qa-functional-report-mobile.md` (2026-07-20, prior desktop live pass and prior mobile static-code pass), `docs/ongoing-lessons-handoff.md`, `CLAUDE.md`.

---

## 0. Methodology — read this first

This audit combines three kinds of evidence, and each finding below is labeled with which kind produced it:

- **Live-verified (narrow viewport).** The production site (`https://karinrub.github.io/maui-lessons/`) was driven through a real Chromium browser, resized as narrow as this environment allows. That floor turned out to be **~500 CSS px wide** (`window.innerWidth` confirmed via script, not assumed) — narrow enough that the site's own `max-width: 760px` mobile stylesheet is active and `window.matchMedia('(max-width:760px)').matches` is `true`, but wider than every phone in the requested device matrix. Interaction (clicks, scroll ticks, keyboard) was real, not simulated; console and network logs were read directly from the live tab.
- **Live-verified (desktop viewport).** Interactions that are provably width-independent in the code (the nav overlay, the FAQ accordion, the booking wizard's state machine, the reveal-timing bugs) were also exercised at normal viewport width, because their behavior does not depend on layout width.
- **Code-audited.** Where neither of the above could reach (genuine phone widths, touch/momentum-scroll physics, device pixel ratio, Safari-specific behavior), findings are reasoned from the actual CSS/TS source — `@media` queries, `clamp()`/`vw` type scales, `matchMedia` branches, ARIA attributes — the same method the prior static mobile pass (`qa-functional-report-mobile.md`) used, extended here with live cross-checks wherever a live check was possible.

**The requested device matrix (iPhone SE, iPhone 15/16, iPhone 15/16 Pro Max, Pixel 8/9, Galaxy S24) could not be tested at each device's actual viewport width.** This environment's window-resize tool floors at ~500px regardless of the width requested (confirmed by requesting 393×852 and 375×667 and getting ~500px both times) — matching the exact limitation this project's own prior mobile audit already documented, and matching `CLAUDE.md`'s own tracked gap: *"Real-device mobile QA (narrow-viewport agents can't force `window.innerWidth` in this environment) — needs a human on a physical phone."* That gap is still open. This report does not paper over it with fabricated per-device screenshots; instead it (a) got as close to a real mobile rendering context as the tooling allows, (b) used that access to run genuine interaction/stress tests rather than only reading code, and (c) is explicit below about which findings are direct observation versus code inference. **A physical-device pass — even just one iPhone and one Android phone — remains a precondition for full confidence in this report's Release Certification**, and factors directly into the Final Recommendation.

One methodological note worth surfacing on its own: two separate times during this pass, a screenshot taken immediately after navigation or a scroll event showed blank/clipped content that **did not match the DOM** (computed `opacity:1`, correct `getBoundingClientRect()`, fully-loaded image). Both resolved on the next frame or the next scroll tick. These were treated as capture-timing artifacts of this tool, not site bugs, and are not reported as findings — every bug reported below was confirmed by inspecting computed styles/transforms in the live DOM, not by screenshot appearance alone.

---

## 1. Executive Summary

Mobile inherits the desktop baseline's real strengths — the same disciplined palette, type system, ghost-word motif, and a booking wizard whose state machine (step transitions, calendar, validation, summary) works correctly when driven by hand. It also inherits desktop's core storytelling structure faithfully: the mobile stylesheet is not a stripped-down afterthought, it's a second, deliberately-tuned layout with its own type scale, its own panel geometry on the pinned/scroll-driven sections, and in the About page's case its own hand-tuned travel-distance constant — evidence of real mobile-specific engineering effort, not just `@media` truncation.

That said, **this pass found a new, live-reproducible Critical bug that no prior audit (desktop or mobile) had caught**, and it sits in the site's single most technically ambitious component: at a real narrow, mobile-breakpoint-active viewport, a small, ordinary scroll gesture on the About page's horizontally-pinned biography — scroll down a little, then back up, the kind of hesitation a thumb makes on a touchscreen — can strand the chapter track at a non-snapped position between two chapters. The result is a fully blank cream screen with no content, no chapter number, no way to tell what happened, and it did not recover on its own after several seconds of no input; only further scrolling brought content back. This is squarely inside this audit's "Pass 4 — Stress Testing" mandate, and it is a first-impression-adjacent failure on the page carrying the site's strongest trust asset (Aaron's biography).

Separately, and unchanged from the desktop pass three days ago: the hero video (14.3 MB, uncompressed) **still never issues a network request** on the live site — confirmed directly in this pass's network log — which matters more on mobile than desktop, where cellular bandwidth and data cost are live variables, not conveniences. And the FAQ/Book hero headlines, whose "stuck invisible forever" bug the desktop audit flagged as Critical (C1) three days ago, are **improved but not resolved**: the code now carries a documented `immediateRender:false` + stall-fallback pattern, and live-testing confirms the FAQ heading does eventually self-resolve — but only after roughly **5–6 seconds** with zero interaction, during which a mobile visitor, whose narrow viewport shows little else on the page, sees a mostly-blank screen. That is a meaningfully better failure mode than "broken until you scroll," but it is not yet "no blank state," and on a small screen the blank state is proportionally more of what's visible.

**Would I certify this for production today? No — Needs Another Iteration**, not because the creative direction or the mobile-specific engineering effort is lacking (both are strong), but because this is the first pass that has ever actually driven the site at a real narrow width with real interaction, and it surfaced a genuine "the page goes blank and stays blank" bug on the first attempt at stress-testing the site's most complex component. That is not a signal to keep polishing; it's a signal that mobile has not yet had the verification desktop has had, and one more targeted fix-and-verify cycle — plus, critically, one real physical-device pass — is what stands between this and a confident release sign-off.

---

## 2. Design Assessment

**Visual quality — strong, consistent with desktop.** The mobile type scale is not a blind shrink: `clamp()` and `vw`-based sizing recalculates proportions per section rather than applying one global multiplier (confirmed in `StackedServicesDeck.css`, `Book.css`, `FaqSections.css`, `AaronStorySections.css`). The palette, the Fraunces/Cormorant pairing, and the recurring oversized ghost-word motif ("practice," "curious," the About chapter watermarks, the Book step numerals) all read identically to desktop at narrow width — nothing about the system falls apart or looks "web-safe default" on mobile.

**Originality and craftsmanship — evident, and this is the double-edged part of the finding above.** The About page's horizontally-pinned, direction-biased chapter snap is a genuinely ambitious, custom-built interaction — exactly the kind of thing that makes a portfolio piece stand out from template-driven competitors. It is also, per this pass, the piece most likely to break under ordinary mobile scroll behavior. The Ongoing Lessons "Practice Loop" opening (gold beat orbiting a circular lesson window, resolving into the hero) renders correctly at narrow width and is a strong, on-brand piece of motion design that survives the transition to mobile intact.

**Storytelling — intact where content renders, but time-to-content is a live variable now.** The emotional arc (vacation → ongoing → trust → book) reads the same on mobile as it does on desktop when a visitor scrolls at a normal pace. Where the arc is at risk is specifically at page-load and step-transition moments where a reveal animation gates first paint of the page's core message (the FAQ and Book hero headlines, discussed under Cross-Site Issues) — on mobile this costs proportionally more of the visible screen and more of a visitor's patience budget than the same delay does on a large desktop monitor with other content already in view.

**Emotional impact — undiminished by layout, at risk from the About-page failure mode.** A visitor who lands on the About page, gives it a light scroll, and gets a blank screen is not going to read that as "the site is thinking" — they're going to read it as "the site is broken," precisely at the page whose job is to build trust in Aaron as a real, careful teacher. This is the one place in the design where a bug directly undercuts the thing the design is trying to accomplish.

---

## 3. Release Assessment

**Reliability.** The booking wizard's underlying logic is sound and was verified end-to-end live: lesson-type selection auto-advances correctly, the calendar correctly disables past dates and marks today, date selection populates time slots, and hidden context fields carry the full selection forward (consistent with the desktop audit's findings — this logic is shared and width-independent). Where reliability breaks down is the About page's chapter-track stranding (Critical, below) and the still-nonfunctional hero video.

**Usability / touch interaction.** Interactive elements are generally comfortably sized: the FAQ accordion rows measure roughly 55px of vertical tap area at minimum (padding + text line height, computed from `FaqSections.css`), well past the 44px guideline. The hamburger menu button is `48×40px` (`.menu-toggle` in `index.css`) — 40px on the constrained axis is a shade under the common 44px touch-target guideline; low-severity given its generous horizontal room and corner position, but worth a one-line fix. The booking calendar's day cells are unmeasured at true phone width in this environment (aspect-ratio-driven, sized by a 7-column grid with no phone-specific override in `Book.css`) — code-computed estimate at a 375–390px viewport with the page's existing side padding puts each cell in the low-to-mid 40s of pixels, i.e. plausibly right at or just under the touch-target guideline. Flagged for live-device confirmation rather than asserted as broken.

**Responsiveness.** The site correctly activates its mobile stylesheet at the `760px` breakpoint (confirmed live), and every pinned/scroll-driven section carries mobile-specific geometry rather than reusing desktop values verbatim (confirmed in `AaronStorySections.css`, `WeeklyJourneySections.css`, `StackedServicesDeck.css`, `Book.css`). The one structural gap — carried over from the prior static mobile audit and still true of the current code — is the **761–900px band** (phone-landscape and most tablet-portrait widths), which receives full desktop layout including scroll-jacked pins, because the site uses a single `760/761px` breakpoint pair with no intermediate rule. This is real, but low-priority: portrait phone use is the dominant real-world case this device matrix represents, and closing that gap is a design decision (add a tablet breakpoint) the owner hasn't asked for.

**Production readiness.** Blocked by the two Critical items below, both of which are fixable without any redesign, and by the standing gap that this class of automated environment has never been able to verify true touch/momentum-scroll behavior or exact device rendering — which the About-page finding shows is not merely theoretical risk.

---

## 4. Strengths

The mobile stylesheet is deliberately authored per-section rather than being a single global shrink — every pinned/scroll component (`AaronStorySections`, `WeeklyJourneySections`, `StackedServicesDeck`, `VacationCinematicScene`, `Book`) carries its own `max-width:760px` block with real geometry decisions, not just font-size tweaks. The About page in particular has hand-tuned constants (`MOBILE_TRAVEL_SCALE`, a distinct pin-hold ratio, a documented touch-scroll stale-offset workaround) that read as the product of prior real debugging against mobile behavior, not a first attempt. The booking wizard's state management, validation, and calendar logic are solid and width-independent — confirmed working end-to-end live in this pass. `prefers-reduced-motion` handling remains thorough and consistent everywhere a scroll or entrance animation exists, mobile included. The FAQ accordion and its category-index touch targets are comfortably sized. The visual system (palette, type, ghost-word motif) survives the transition to narrow width with zero degradation.

---

## 5. Cross-Site Issues

**X1 — Reveal-on-arrival timing is inconsistent across routes, and mobile is more exposed to the slow cases than desktop was.** The desktop audit's C1 finding ("content stays invisible until a scroll fires the reveal") has been addressed with an `immediateRender:false` + stall-fallback pattern — confirmed in the source of `FaqSections.tsx` (question rows) and `Book.tsx` (hero headline, step titles), each carrying an explicit code comment about the fix. But the *page-level* hero headlines on FAQ and Book still take **1 to ~6 seconds** to resolve to a fully visible state after navigation, with no scroll required — live-measured: the FAQ headline was fully invisible at 3 seconds and fully visible at 6 seconds, self-resolving; the Book headline resolved naturally within about a second. That's a real improvement over "invisible forever," but it's an inconsistency: some entrances are near-instant, one is multi-second, and a visitor has no way to know the multi-second one isn't broken. On mobile, where the hero headline is most of what's on screen at first paint, this reads as a bigger gap than the same delay does on desktop.

**X2 — The hero video is still not a reliable element, and mobile raises the stakes.** Confirmed via a fresh live network-request capture on the production site: zero requests to any `.MP4`/`.mp4` asset on Home page load, over multiple checks. The owner's stated requirement (per the desktop audit) is that the video must *always* display; as of this pass it does not attempt to load at all in this environment. The asset itself is still the original 14.3 MB uncompressed file (confirmed via `du -h`); `ffmpeg` is available in this pass's environment (unlike the "not implemented" note in `CLAUDE.md`, which described a prior environment without it), so compression is achievable, though executing that fix was out of scope for an audit pass.

**X3 — Complex custom scroll/pin interactions have exactly one now-known failure mode, and it's the same shape as X1's root cause.** The About page's chapter-track stranding (Critical, Section 6) and the reveal-timing issue in X1 are both instances of the same underlying category of risk this project has already named in its own desktop backlog: *"anything that can become visible without a scroll must default to visible; scroll animation may enhance but must never gate presence."* The About-page bug is the same principle in a different shape — a custom scroll-position state machine that can land in an un-rendered gap between two valid states, rather than a `gsap` reveal that can land at `opacity:0`. Both are "the animation system's job is enhancement, not gatekeeping" violations. Fixing the About-page snap logic should be scoped with that shared principle in mind, the same way the FAQ/Booking fix was.

**X4 — Minor legibility/copy carryovers from desktop are identical on mobile.** The `AARON GRZANICH` wordmark over bright hero imagery (Home, Vacation, About) is low-contrast on mobile exactly as it was flagged on desktop — same asset, same treatment, no mobile-specific mitigation found in the CSS. The Book page's entrance headline, `"let's set up your lesson"`, is marked in its own source as a placeholder (`// Placeholder-friendly line only — real business voice TBD`) — this is not bracketed placeholder text of the kind `CLAUDE.md` explicitly forbids, but it is explicitly-labeled developer scaffolding still shipping in production, and on mobile it's the single largest, first thing a visitor reads on the page before any real content is visible.

---

## 6. Remaining Work

### Critical

**C1. About page: a small reversing scroll gesture can strand the horizontal chapter track on a blank, non-chapter-aligned frame with no automatic recovery.**
- *Observation:* At a real narrow (~500px, mobile-breakpoint-active) viewport, scrolling down a small amount and then back up by roughly the same amount — rather than returning the view to Chapter 1 as designed — left the page showing a fully blank cream screen. DOM inspection confirmed the four chapter panels were positioned at a non-chapter-aligned horizontal offset (panel boundaries mid-viewport, none centered), not hidden or errored — the track had simply stopped moving in a gap between chapters.
- *Evidence:* Live-reproduced twice in this pass. First occurrence: screenshot showed overlapping, partially-legible content from two chapters simultaneously mid-transition, then settled to fully blank and stayed blank through 2+ additional seconds of no input. `getBoundingClientRect()` on `.aaron-story__panel` elements confirmed the track transform (`matrix(1,0,0,1,-353.4,0)`) did not correspond to any chapter's snap target. Further scrolling (continued input) did successfully carry the track on to Chapter 2 content rendering correctly — so the failure is specifically "no automatic settle when input stops mid-travel," not a total component failure.
- *User impact:* This is the page carrying the site's single strongest trust asset (Aaron's 22-year, named, place-specific biography — explicitly protected as such in `CLAUDE.md`). A visitor who hits this state has no visual cue that anything is happening, no chapter indicator, no content — the honest read is "this page is broken," at exactly the moment the site is trying to build the credibility that supports booking. It directly damages trust and craftsmanship perception, and indirectly damages conversion (a visitor who bounces off a seemingly-broken About page doesn't reach Booking).
- *Counterargument:* This was produced with discrete, automated scroll-tick events, not genuine touch/momentum-scroll physics — real thumb-driven scrolling on an actual phone has different velocity and deceleration curves, and it's possible the site's Lenis-based smoothing behaves better (or differently) under true touch input than under this tool's synthetic ticks. It's also possible this specific down-then-up pattern is rarer on a phone (where scroll gestures tend to be more continuous, momentum-driven flicks) than it is with a trackpad or the automation used here. This is why the item is Critical rather than a hypothetical "flagged" item — it was directly observed and reproduced twice, not inferred — but it should be re-confirmed on a physical device before being treated as fully understood.
- *Tradeoffs:* Any fix (e.g., a forced-settle/snap-to-nearest-chapter safeguard when scroll input pauses mid-travel, or clamping the track's resting positions to only ever be valid chapter offsets) needs to preserve the "direction-biased, never yanks backward" feel `CLAUDE.md` describes as intentional — a naive fix that snaps aggressively on every scroll pause could undermine the smooth, considered feel that makes this component distinctive in the first place.
- *Severity:* **Required.**

**C2. Hero video still does not load or play on the live site; mobile raises the cost of that failure.**
- *Observation:* The Home page hero video issues zero network requests on load, confirmed via a fresh live capture in this pass (only the poster image and marketing assets load).
- *Evidence:* `read_network_requests` on a clean load of `https://karinrub.github.io/maui-lessons/` showed 22 requests, none to any video asset. The source file remains a 14.3 MB uncompressed `.MP4` (`assets/videos/aaron-ukelele-vid.MP4`, confirmed via `du -h`). This matches the desktop audit's C0c finding from three days ago and the July 20 desktop QA report's finding from before that — unresolved across two prior audit cycles.
- *User impact:* The owner has stated the video is a required, intended element that must always display. On mobile specifically, a 14 MB asset is a materially different cost than on desktop — cellular data caps, throttled connections, and lower-powered devices all make "silently never loads" more likely, not less, and a visitor never sees the one specific animated element the owner considers essential. This compounds rather than duplicates the desktop finding.
- *Counterargument:* The desktop audit's own working theory is that this is media-throttling specific to automated browser environments, not a real-user-facing bug — the owner reports the video plays for them. If that's correct, this item may already be a non-issue for real visitors, and the true remaining work is only the compression (a known, scoped, small-to-medium task) rather than a playback defect.
- *Tradeoffs:* None identified for compressing the asset; it is a straightforward, additive fix with no design cost.
- *Severity:* **Required** (carried forward from the desktop backlog's C0c, restated here because it directly affects mobile bandwidth economics and because `ffmpeg` — unavailable to a prior agent per `CLAUDE.md` — is confirmed available in this environment, removing the stated blocker to actually completing it).

### High Priority

**H1. Genuine device/touch QA has never been performed on this site, and this pass found a Critical bug on its first real attempt at narrow-viewport interaction testing.**
- *Observation:* This environment cannot force a true phone-width viewport (confirmed: resize requests for 393×852 and 375×667 both floored at ~500px) or simulate real touch/momentum-scroll physics. The one genuinely narrow, interactive pass this environment could produce surfaced C1 above on its first attempt.
- *Evidence:* `CLAUDE.md` already tracks this exact gap under "Not implemented yet": *"Real-device mobile QA... needs a human on a physical phone."* That note predates this audit; it remains accurate.
- *User impact:* Every finding in this report that required real narrow-width rendering carries residual uncertainty proportional to how different real touch input is from this environment's synthetic scroll events. Given that the one live narrow-viewport stress test performed here found a Critical bug, it would be a mistake to assume the rest of the site is clean at true phone widths simply because this pass didn't have time or tooling to test every interaction that way.
- *Counterargument:* A reasonable designer could argue this is process feedback, not a product defect, and doesn't belong in a product backlog. It's included here because the brief explicitly asks this report to state what stands between the current state and a confident "Ready for Production," and "never verified on the actual target hardware" is a genuine, material gap for that question specifically.
- *Tradeoffs:* None — this is a verification step, not a design change.
- *Severity:* **Required**, scoped as a precondition (one physical iPhone + one physical Android device, walking the same six routes and the booking flow) rather than a design task.

**H2. Touch target sizing is inconsistent at the margins.**
- *Observation:* The primary hamburger menu button (`.menu-toggle`) is 48px wide by 40px tall. The booking calendar's day cells have no phone-specific size override and are sized purely by a 7-column grid against the container's padding.
- *Evidence:* `.menu-toggle { width: 48px; height: 40px; }` in `src/index.css`. `.bwc-day { aspect-ratio: 1; }` inside a `grid-template-columns: repeat(7, 1fr)` container in `src/pages/Book.css`, with no `max-width:760px` override found for cell sizing. A rough code-side estimate at a 375–390px viewport with the page's existing side padding puts each day cell in the low-to-mid 40s of pixels — plausibly at or just under the common 44px guideline, not confirmed by live pixel measurement.
- *User impact:* The hamburger is a low-consequence tap target (isolated corner position, generous width compensates for the short height) — minor. The calendar, if genuinely undersized on the narrowest phones (iPhone SE-class, 375px), is higher-consequence: mis-tapping a date in a date-picker mid-booking is a more costly error than mis-tapping a menu icon, directly touching the Conversion category this audit is asked to weigh.
- *Counterargument:* 44px is a guideline, not a hard requirement, and `aspect-ratio`-driven grids that are "close" to the guideline at the narrowest supported width (320px floor) are common in date-picker patterns industry-wide; Apple's and Google's own calendar pickers run similarly tight at the smallest supported widths.
- *Tradeoffs:* Enlarging calendar cells on mobile without also increasing the day-grid's overall footprint would require either shrinking the weekday-label row further or adding vertical scroll to the calendar — both minor UX costs worth weighing against the tap-target gain.
- *Severity:* **Recommended** — confirm the calendar's true cell size on a real 375px device before deciding whether it needs a dedicated mobile size floor; fix the hamburger's height opportunistically if touching that file for other reasons.

### Medium Priority

**M1. Hero headline reveal timing is inconsistent across routes (1–6 seconds), and the slow case is worse on mobile.**
- *Observation:* FAQ's headline resolves in ~5–6 seconds after navigation with zero interaction; Book's resolves in roughly a second. Both are technically "presence doesn't depend on scroll" per the fix already documented in code, but the FAQ case still produces several seconds of a mostly-blank screen.
- *Evidence:* Live-timed in this pass: FAQ heading `opacity:1` in computed style at all times, but its inner text line held at a `translateY` offset (visually invisible) at 3 seconds, fully resolved at 6 seconds, self-triggered, no scroll input given. Book's equivalent resolved naturally within ~1 second on a fresh load.
- *User impact:* A visitor landing directly on `/faq` — plausible via search, a shared link, or the nav — sees a near-empty page for several seconds before its one-line value proposition appears. On mobile this is proportionally more of the visible screen than the same delay is on desktop.
- *Counterargument:* This may be an intentional, deliberately-paced entrance (consistent with the site's generally unhurried, "no-pressure" brand voice) rather than a bug; the fact that it *does* self-resolve without a stall-fallback intervening suggests the timeline is completing on its own schedule, not stalling.
- *Tradeoffs:* Shortening the delay risks undercutting a deliberate pacing choice if this was in fact intentional; the safer fix is confirming intent with whoever authored the FAQ entrance timeline, then either shortening it or leaving it as designed.
- *Severity:* **Recommended.**

**M2. Book page's hero headline is explicitly labeled placeholder copy in the source, still shipping in production.**
- *Observation:* `const ENTRANCE_HEADLINE = "let's set up your lesson"` is preceded by the comment `// Placeholder-friendly line only — real business voice TBD.`
- *Evidence:* `src/pages/Book.tsx`, line 51–52.
- *User impact:* On mobile this headline is the single largest, first-read element on the booking page — the page where a visitor commits to converting. It reads fine on its face, but it is explicitly not the intended final copy per the codebase's own record, and it's the one piece of hero copy on the site that doesn't carry the same considered, specific voice as About, FAQ, or Vacation's headlines.
- *Counterargument:* The line is genuinely fine as-is — it's warm, on-brand, grammatically simple — and "TBD" comments in source don't always mean the shipped value is actually wrong; it may just mean nobody has revisited it since it first tested well.
- *Tradeoffs:* None — this is a copy edit with no design or engineering cost.
- *Severity:* **Recommended.**

**M3. Wordmark legibility over bright hero imagery is unchanged from the desktop finding.**
- *Observation:* "AARON GRZANICH" renders at low contrast directly over the Home/Vacation/About hero photography, mobile included — same asset, same lack of scrim/veil treatment.
- *Evidence:* Confirmed visually at both desktop and narrow-viewport widths in this pass; matches the desktop audit's L1 finding verbatim.
- *User impact:* Minor brand-legibility nicety; the hamburger (the actually load-bearing nav affordance) remains clearly visible regardless.
- *Counterargument:* Desktop audit already scored this Low priority for the same reason it applies here — navigation is unaffected, and the veil that already exists once scrolled helps.
- *Tradeoffs:* None meaningful for a small contrast/weight nudge.
- *Severity:* **Recommended** (carried forward from desktop's L1; not elevated for mobile since the underlying cause and fix are identical).

### Low Priority / Preference

**L1. The 761–900px tablet/landscape-phone band still receives full desktop layout.**
- *Observation:* The site's single `760/761px` breakpoint pair means a phone rotated to landscape, or any tablet in portrait, gets unmodified desktop scroll-jacking and multi-column layout.
- *Evidence:* Confirmed at the code level across every pinned/grid component (`AaronStorySections.css`, `WeeklyJourneySections.css`, `StackedServicesDeck.css`, `VacationCinematicScene.css`, `Book.css`) — all key off the identical pair with no intermediate rule, matching the prior static mobile audit's finding exactly, still true of the current code.
- *User impact:* A narrower slice of real traffic than portrait-phone use; still a real gap for anyone rotating a phone mid-session or browsing on a tablet.
- *Counterargument:* Adding a tablet breakpoint is a design decision with real scope (new geometry decisions across five components), not a bug fix, and nothing in this audit's brief or the device matrix asks for tablet coverage.
- *Tradeoffs:* Meaningful engineering effort for a use case outside the requested device matrix.
- *Severity:* **Preference.**

**L2. Already-tracked Ongoing Lessons gaps are unchanged.**
- *Observation:* `docs/ongoing-lessons-handoff.md` already documents that the prerendered no-JS output bakes in the hidden Practice Loop opening state, that the live route has nested `main` landmarks and an initially-hidden H1 in the accessibility tree, and a 320×568 transition collision.
- *Evidence:* Not independently re-verified pixel-by-pixel in this pass (out of scope to duplicate an existing, current tracking document); cited here only so this report's "Remaining Work" list is complete and doesn't imply these are newly resolved.
- *User impact:* As previously documented.
- *Counterargument:* N/A — carried forward, not re-assessed.
- *Tradeoffs:* N/A.
- *Severity:* **Recommended** (per the existing handoff doc's own framing — see that document for detail; do not treat this report as having re-verified or re-scored it).

---

## 7. Mobile Readiness Scores (1–10)

- **Visual Design — 8.** The type scale, palette, and ghost-word motif survive narrow width with real per-section tuning, not a blind shrink. Not a 9 because the wordmark-contrast and placeholder-copy items are small but real polish gaps still visible at this width.
- **UX — 6.** The wizard and accordion are genuinely well-built and usable at narrow width. Held down hard by the About-page stranding — a UX failure mode (blank screen, no recovery cue) is about as bad as UX failures get, even if it's likely intermittent.
- **Touch Interaction — 6.** Most targets are comfortable (FAQ rows, wizard controls); the hamburger and calendar cells sit at or near the touch-target guideline rather than clearly above it, and no genuine touch-gesture testing has been possible in this environment — this score carries real uncertainty in the untested direction.
- **Motion Design — 6.** The Practice Loop and pinned panel choreography are original and rendered correctly at narrow width in this pass. Scored down specifically because the one complex custom scroll interaction this pass could stress-test (About) failed, and motion/scroll logic is exactly where the site's ambition and its risk are concentrated.
- **Storytelling — 7.** Intact wherever content actually renders; costed down for the same reasons as UX — a broken About page and a slow-appearing FAQ headline both interrupt the narrative at specific, high-trust moments.
- **Conversion — 6.** The booking flow itself works correctly end-to-end. Scored down because the two Critical items sit upstream of booking (a broken About page can cost a conversion before a visitor ever reaches Book) and because the calendar's touch-target uncertainty touches the conversion moment directly.
- **Performance Perception — 5.** The hero video's total silent failure to load — mobile's more bandwidth-conscious context makes this cost more, not less, than on desktop — plus the FAQ's multi-second blank-heading window are both perceived-performance problems independent of actual network speed.
- **Craftsmanship — 7.** The evident, hand-tuned mobile-specific engineering (About's travel-scale constant, the documented touch-scroll workaround, per-section CSS rather than global shrink) is real craftsmanship. Costed down because the one place that craftsmanship is most visible (About) is also where it currently breaks.
- **Portfolio Quality — 6.** Would be materially higher — this is genuinely ambitious, distinctive work — once C1 and C2 are resolved and the site has had one real physical-device pass; today, a portfolio reviewer scrolling on their own phone has a real chance of hitting the About-page bug within the first few interactions.
- **Production Readiness — 5.** Two Required items, one of them newly discovered and reproducible, plus a standing, unresolved "never tested on real hardware" gap that this pass's own findings suggest is not merely theoretical.

---

## 8. Final Recommendation

### Release Certification

**Needs Another Iteration.**

I would not approve this for production today. Not because the mobile experience is thin or under-built — it demonstrably is not, and the per-section mobile engineering effort is real and above-average for a project this size. The reason is narrower and more concrete: this pass is the first time anyone or anything has actually driven this site at a real narrow, interactive, mobile-breakpoint-active viewport, and on the very first stress-test of its most ambitious component, it produced a reproducible dead end — a blank screen with no content and no recovery. Pair that with a hero video the owner has called essential that still silently never loads, and the honest read is that mobile has not yet earned the confidence desktop has earned through its own audit-and-fix cycle. One iteration — fix C1 and C2, re-verify — is very plausibly all that stands between this and Ready for Production; this is not a "redesign" or "needs more design work" situation, it's a "fix two identified, scoped defects and then actually check on a real phone" situation.

### Design Certification

If there were one final iteration before launch, it should go to exactly two things, in this order: **(1) make the About page's chapter track structurally unable to rest in a non-chapter state** — whatever the input pattern, it should always settle on a fully-rendered chapter, the same "presence must never depend on the animation succeeding" principle already applied to FAQ and Booking, applied here to a position state machine instead of an opacity tween; and **(2) get the hero video actually loading** — compress the existing 14.3 MB source with the now-available `ffmpeg`, verify the request actually fires on a live network capture the way this audit just did, and confirm the owner's "always displays" requirement is genuinely met rather than assumed. Nothing else on this list would move the product meaningfully forward on its own; the touch-target and copy items are real but small, and the tablet-breakpoint gap is explicitly outside what this audit's evidence supports prioritizing.

---

## 9. Stopping Rule

Not yet — there is clear, specific, high-value work left, and it would be a mistake to call this finished before it's done. The two Critical items are both scoped and small-to-medium effort, not open-ended design problems, and fixing them is very likely to move Production Readiness from a 5 to something in the high 7s or 8s on its own. What would change this answer to "yes, diminishing returns" is completing that fix-and-verify cycle **and** finally closing the one gap that has outlived three separate audit passes now: an actual human, on an actual phone, walking the site end to end. Until that happens, every score and every "Confirmed" label in this report carries a residual asterisk that no amount of further automated re-testing in this environment can remove — which is itself the clearest signal that the next unit of effort belongs on a physical device, not in another round of code or emulated-viewport review.

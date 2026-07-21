# Functional QA Report — Mobile & Small Screens (Code-Level Review)
Maui Lessons · reviewed 2026-07-20

## Methodology note (read this first)

This report is **not** based on live rendering at mobile viewport sizes. The available browser-automation tools in this environment can resize the outer browser window, but the page's actual rendering viewport (`window.innerWidth`) stays locked at desktop width regardless — confirmed directly: after resizing to 390×844, `window.innerWidth` still read `1512` and `window.matchMedia('(max-width: 760px)').matches` returned `false`. There is no device-emulation tool available to force a genuine narrow viewport here. This matches a limitation the project's own `CLAUDE.md` already documents ("narrow-viewport agents can't force `window.innerWidth` in this environment... needs a human on a physical phone").

So instead of fabricating screenshots that would secretly still be desktop renders, this report is a **static code audit**: every `@media` query, every `matchMedia`/`innerWidth` check, every scroll-pinning (`pin: true`) usage, and every unclamped fixed-size value in the codebase was inventoried, then reasoned through against a set of real-world popular and rare screen sizes to predict where behavior likely diverges from what's intended. Findings below are labeled by confidence: **Confirmed** (directly verifiable from the code as written) vs. **Flagged for live verification** (a plausible risk inferred from the code that would need an actual device or browser devtools to confirm).

## Screen sizes reasoned against

| Category | Device class | CSS width × height | Falls into |
|---|---|---|---|
| Popular | Modern iPhone (12–15) | 390×844 | Mobile bucket (≤760px) |
| Popular | Budget/standard Android (Galaxy A/S) | 360×800 | Mobile bucket (≤760px) |
| Popular | Smaller iPhone (SE2/8) | 375×667 | Mobile bucket (≤760px) |
| Popular | iPad / most Android tablets, portrait | 768×1024 (also 820, 834) | **Just above** the 760/761px breakpoint |
| Popular | iPad, landscape | 1024×768 | Desktop bucket |
| Rare | Legacy/budget phone floor | 320×568 | Exactly at the sitewide `min-width: 320px` floor |
| Rare | Foldable cover screen (Galaxy Z Fold, etc.) | ~280–344 wide | **Below** the sitewide 320px floor |
| Rare | Phone rotated to landscape | ~812–932 × 375–430 | **Above** the 760/761px breakpoint despite being a phone |

The single most important structural fact driving this whole report: **the entire site uses one consistent breakpoint pair, `max-width: 760px` / `min-width: 761px`, with no intermediate tablet breakpoint.** That's good for consistency, but it means anything from 761px up to roughly 900–1024px — which covers nearly every tablet in portrait mode and every phone rotated to landscape — receives the exact same layout as a 1512px desktop monitor.

---

## Home (/)

**Load/render risk:**
- **Confirmed:** the hero pin (`OpeningScene`) and services-deck pin (`StackedServicesDeck`) are gated only by `prefers-reduced-motion`, not by viewport width — both scroll-jack identically on a 390px phone and a 1512px desktop. CSS supplies mobile-specific sizing at ≤760px (tagline font-size, arch width 260vw, deck padding/card grid rows), so on the popular phone sizes this should render as intended.
- **Confirmed:** at 768×1024 (iPad portrait) and any phone rotated to landscape (e.g. 844×390), the viewport width exceeds 760px, so none of the mobile CSS overrides apply — these devices get the full desktop tagline size, 145vw arch, and un-adjusted deck grid despite being touch-first, narrower-than-desktop devices.
- **Confirmed:** `StackedServicesDeck.css`'s decorative ambient blob has an unreduced `320px` floor via `clamp(320px, 46vw, 720px)` that isn't touched by the mobile media query — cosmetic only (it's `pointer-events:none` and clipped), not a functional risk.
- **Flagged for live verification:** on a landscape phone (~390px tall), the deck card's fixed grid-row floor (`minmax(150px, 42%)`, reduced to `118px/34%` only under the 760px query) combined with a very short viewport could compress the card's description text into a small area. Needs a manual check.

**Interaction risk:** Nav overlay and CTA links have no viewport-width-gated logic (`GlobalNavigation.tsx`'s reveal-radius calc scales continuously off `window.innerWidth`/`innerHeight`, no breakpoint branch) — no code-level reason to expect different interaction behavior at any size.

**Animation/scroll risk:** Both Home pins run unconditionally regardless of width. No code-level mobile fallback exists for the hero or deck pin the way Vacation Lessons has one (see below) — if scroll-jacking is going to feel heavy-handed on a touch device, Home is the most exposed page.

**Predicted risk level: Moderate** (tablet/landscape breakpoint mismatch; scroll-jacking has no mobile-specific escape hatch here the way it does on Vacation Lessons).

---

## Vacation Lessons (/tourist-lessons)

**Load/render risk:**
- **Confirmed — this is the best-handled mobile page in the codebase.** `VacationCinematicScene.tsx` explicitly detects desktop via `window.matchMedia('(min-width: 761px)')`, keeps it live-updated with a `MediaQueryListEvent` listener (so it correctly responds to resize/rotation, unlike two other components noted below), and **completely disables the scroll-jacked pin below 761px**, snapping straight to the fully-revealed end-state image instead. This is the one component that treats "mobile" as a first-class, dynamically-tracked state rather than a one-time read.
- **Confirmed:** at 768×1024 (iPad portrait), width 768 > 761, so this device is treated as "desktop" by this component's own internal check and gets the full pinned cinematic scroll-jack — the same just-over-the-line pattern as Home.
- **Flagged for live verification:** the pinned image frame's `min-height` is `620px` on desktop, reduced to `540px` only under the `max-width:760px` query. On a landscape phone (~375–430px tall), even the reduced 540px floor exceeds the actual viewport height, which could force extra scroll distance and visual overflow before the frame is fully in view.

**Interaction risk:** None identified beyond the above — CTAs and links carry no width-gated logic.

**Animation/scroll risk:** Lowest risk on the site for popular phone sizes specifically, since the pin is fully disabled there. Risk is concentrated in the 761–900px "tablet/landscape" gap, same as elsewhere.

**Predicted risk level: Low** for popular phone sizes; **Moderate** for tablet-portrait and landscape-phone widths.

---

## Ongoing Lessons (/weekly-lessons)

**Load/render risk:**
- **Confirmed:** the three-chapter horizontal journey pin (`WeeklyJourneySections.tsx`) runs on both mobile and desktop by design (gate is `prefers-reduced-motion` only, no width qualifier) — this matches the project's own documentation. A dedicated mobile CSS block (`max-width:760px and (prefers-reduced-motion: no-preference)`) supplies compact `flex: 0 0 88vw` panels specifically for this pinned mode, so popular phone sizes should render the intended compact version.
- **Confirmed:** at 768×1024, the same just-over-760px gap applies — this device would get the desktop panel geometry (`padding calc((100vw - min(72vw,880px))/2)`), not the compact mobile override, despite being a portrait tablet.
- **Flagged for live verification:** `WeeklyMonthRhythm.tsx` gates its horizontal spine-line draw animation with `window.matchMedia('(min-width:761px)').matches`, read once at effect setup with no listener found in the code for live viewport changes. Rotating a device across the 761px line mid-session may leave this animation in a stale state until the page reloads.

**Interaction risk:** The Pathways tab control and Book CTAs carry no width-specific logic — no code-level reason to expect different click/tab behavior at any size.

**Animation/scroll risk:** Same tablet/landscape gap pattern as Home; otherwise this is the page with the most deliberate, already-built mobile-specific pin geometry on the site.

**Predicted risk level: Low-to-Moderate** (solid mobile-specific CSS for popular sizes; same tablet-breakpoint gap as other pinned pages; one flagged non-reactive matchMedia check).

---

## About (/about)

**Load/render risk:**
- **Confirmed — the most heavily mobile-tuned pinned component in the codebase.** `AaronStorySections.tsx` has an explicit `isMobile` branch (`window.matchMedia('(max-width:760px)').matches`) driving distinct pin-hold ratio, horizontal-travel-distance scaling (`MOBILE_TRAVEL_SCALE = 1.85`), and chapter-snap timing, plus a mobile-specific scroll-position reset (`scrollTo(0,0)` + Lenis re-sync) explicitly commented as working around a touch-scroll stale-offset issue. This reads as a component that was already debugged against real mobile behavior at some point.
- **Flagged for live verification:** unlike `VacationCinematicScene`, this component's `isMobile` value appears to be read once via `matchMedia(...).matches` at effect setup, with no equivalent live-updating listener found in the inventory. Rotating a phone mid-session (e.g. 390×844 portrait → 844×390 landscape) could leave the pin running with stale mobile-tuned constants (or vice versa) against a now-different-width layout until the page is reloaded. This would need a live device test to confirm — it's a plausible gap, not a verified bug.
- **Confirmed:** at 768×1024, width 768 > 760 means this device misses the CSS block explicitly commented "Narrow screens: same horizontal chapter travel, compact panel layout" and instead uses the desktop `100vw`/`100vh` panel sizing — same cross-page breakpoint gap.

**Interaction risk:** The "magnetic" CTA hover effect is explicitly gated to `(pointer: fine)`, meaning it correctly does nothing on touch devices rather than misbehaving — a good defensive pattern.

**Animation/scroll risk:** Concentrated in the orientation-change scenario flagged above, plus the same tablet-breakpoint gap as other pinned pages.

**Predicted risk level: Moderate** (well-built for static popular-phone-portrait usage; the orientation-change gap and tablet-breakpoint mismatch are the open questions).

---

## FAQ (/faq)

**Load/render risk:**
- **Confirmed:** zero `pin: true` usage anywhere in `FaqSections.tsx` — every animation is a scrub or play-once reveal. This is structurally the lowest-risk page on the site for scroll-jacking-related mobile issues, at any screen size.
- **Confirmed:** this is the only component with a dedicated tablet-specific rule (`(min-width:761px) and (max-width:1140px)`, a decorative opacity tweak on the compass graphic) — the most conservative, deliberately tablet-aware styling on the site, though it's cosmetic rather than functional.
- **Carried over from the live desktop pass:** the stuck-near-invisible hero heading found on desktop is driven by a scroll-triggered opacity reveal that never fires until a scroll event occurs — nothing in this component's code ties that behavior to viewport width, so it should be assumed to reproduce identically at every popular and rare screen size, not just desktop.

**Interaction risk:** The accordion (click-to-expand, single-open behavior) has no width-gated logic — no code-level reason to expect it to behave differently on mobile.

**Predicted risk level: Moderate** — driven entirely by the pre-existing, width-independent stuck-heading bug rather than anything mobile-specific; otherwise this is the safest page on the site structurally.

---

## Book (/book)

**Load/render risk:**
- **Confirmed:** neither `Book.tsx` nor `BookingCalendar.tsx` contains any `matchMedia`/`innerWidth`/mobile branch — all responsiveness is CSS-only via `Book.css`'s `max-width:760px` query, which collapses the date/time grid to one column and wraps the summary row.
- **Confirmed:** at 768×1024, the same just-over-760px gap means this device gets the two-column desktop date/time grid rather than the intended single-column mobile layout.
- **Flagged for live verification:** the calendar's 7-column day-grid is the component on this page most likely to feel cramped at genuinely narrow widths (320–360px) — exact cell sizing wasn't confirmed in the CSS reviewed, so tap-target comfort at the narrow end would need a live check.
- **Carried over from the live desktop pass:** the missing scroll-to-top after clicking "Send booking request" has no width-gating anywhere in `Book.tsx`'s step-transition logic — it should be assumed to reproduce at every screen size, popular and rare alike, including on a phone where a confirmation screen appearing to do "nothing" is arguably more disorienting than on desktop.

**Interaction risk:** No mobile-specific interaction logic found; the wizard's step transitions and form fields carry no width branches.

**Predicted risk level: Moderate** — mostly driven by the two width-independent bugs carried over from the desktop pass, plus the standard tablet-breakpoint gap.

---

## Cross-page patterns

- **The single most consistent, code-confirmable mobile risk on the site:** any viewport between roughly 761px and 900–1024px — which covers nearly every tablet in portrait mode (iPad 768px, iPad Air 820px, iPad Pro 11" 834px, most Android tablets ~800px) and any phone rotated to landscape — receives the unmodified desktop layout, including scroll-jacked pins and multi-column grids, on Home, Vacation Lessons, Ongoing Lessons, About, and Book alike, because all five key off the identical `760`/`761px` pair with no intermediate tablet breakpoint.
- **Sitewide floor:** `html, body { min-width: 320px }` guarantees horizontal overflow/a forced scrollbar on anything narrower — relevant to the small-but-real population of foldable-phone cover screens (~280–344px) and any legacy sub-320px device, on every route equally.
- **Reduced-motion handling is thorough and consistent everywhere** — every scroll-scrubbed or pinned component checks it, and no gaps were found. This is the one area of the codebase with no code-level risk identified.
- **Two components determine mobile-vs-desktop via a one-time `matchMedia(...).matches` read with no confirmed live-update listener** (`AaronStorySections.tsx`'s `isMobile`, `WeeklyMonthRhythm.tsx`'s desktop spine-line gate) — in contrast to `VacationCinematicScene.tsx`, which explicitly listens for `MediaQueryListEvent` changes. This means orientation changes mid-session are a plausible (not confirmed) risk specifically on About and Ongoing Lessons.
- **Both bugs found during the live desktop pass (FAQ's stuck hero heading, Book's missing scroll-to-top after submit) are width-independent in the code** and should be assumed to affect every mobile and tablet size just as they did on desktop — they are not desktop-specific quirks.

## What would still need a live device or devtools

This audit can tell you *where the code branches* on screen size and *where it doesn't*, but it can't confirm actual rendered spacing, tap-target sizing, text wrapping, or real touch-gesture behavior (momentum scrolling interacting with the pinned sections, for instance). The items marked "Flagged for live verification" above are exactly the set I'd prioritize for a manual pass on a real phone/tablet or in browser devtools' device toolbar: the landscape-phone pinned-section height overflow (Home, Vacation), the 768px tablet breakpoint gap (all five pinned/grid pages), the orientation-change staleness on About and Ongoing Lessons, and calendar tap-target comfort at 320–360px on Book.

# Home Scroll Sequence Fix — Design

Date: 2026-07-02. Fixes the reverse-scroll gap between `OpeningScene` and `StackedServicesDeck` documented in `docs/HOMEPAGE_TRANSITION_AUDIT.md`.

Repository note: this project is now a local Git repository connected to `origin` at `https://github.com/karinrub/maui-lessons.git`. The connected GitHub Pages URL is `https://karinrub.github.io/maui-lessons/`. The deployment source path is `/Users/karinrubin/Developer/maui-lessons`.

## Root cause (from audit)

Two independently-owned `ScrollTrigger`s. Deck's pin creation was gated on an `data-intro-complete` DOM attribute observed via `MutationObserver`. `OpeningScene` called `ScrollTrigger.refresh()` synchronously before the deck's pin-spacer existed, caching hero's end-position against a shorter document than what existed a frame later. That mismatch is the gap on reverse scroll.

## Key realization

The hero's scrub geometry (`+=36%`) and deck's scrub geometry (`+=234%`) do not depend on the intro's autoplay video/tagline animation finishing — that's a separate, non-scroll-linked timeline (fixed durations, not `scrollTrigger`-bound) that plays while `body` scroll is locked. The only real dependency for *layout* is: both sections' DOM must be mounted. So both `ScrollTrigger`s can be created together, once, in a single deterministic pass — no waiting on an "intro complete" signal for pin creation.

## Architecture

New hook: `src/hooks/useHomeScrollSequence.ts`.

- Owns creation, pin/refresh, and teardown of the hero and deck `ScrollTrigger`s.
- Exposes a `registerHero(...)` / `registerDeck(...)` API. Each section calls its register function once its DOM refs are ready, passing:
  - `sectionRef`, `pinRef` (trigger/pin elements, as today)
  - `buildTimeline: () => gsap.core.Timeline` — returns a **paused**, scroll-trigger-less timeline containing that section's existing `.to()`/`.set()`/`.call()` animation steps (unchanged content, just no inline `scrollTrigger` option).
- Once both hero and deck have registered, the hook (in one synchronous pass):
  1. Creates the hero `ScrollTrigger` (`start: 'top top'`, `end: '+=36%'`, `pin`, `anticipatePin: 1`, `invalidateOnRefresh: true`, `onUpdate` scrubbing the hero's paused timeline via `tl.progress(self.progress)`).
  2. Creates the deck `ScrollTrigger` (`start: 'top top'`, `end: '+=234%'`, same pin options, same progress-driving `onUpdate`).
  3. Calls `ScrollTrigger.refresh()` exactly once.
- This is the single authoritative refresh call site for the hero+deck sequence. Neither component calls `ScrollTrigger.refresh()` itself for this pin geometry.
- Deck's separate (non-pinned) heading `ScrollTrigger` (`start: 'top bottom'`, `end: 'top top'`) is unrelated pin geometry — stays owned by `StackedServicesDeck` as today, unchanged.
- Cleanup: hook kills both `ScrollTrigger`s (and any it created) on unmount; components keep killing their own non-scroll-trigger timelines (intro timeline, focus-mode timeline) as today.

## What stays unchanged

- `OpeningScene`'s intro autoplay timeline (video fade-in/out, header reveal, tagline color stagger) — untouched, still fixed-duration `.call()`/`.to()` chain, still runs while scroll is locked.
- Video autoplay/mute/fallback state machine — untouched.
- Focus-mode zoom — untouched.
- Card-stack animation content and stack positions — untouched.
- Heading arch slide-in — untouched (separate ScrollTrigger, not part of the pin handoff).
- `prefersReducedMotion` branches — untouched; reduced-motion bypasses pinning entirely in both components already and does not call `registerHero`/`registerDeck`'s pinned path.
- `muteVideoFromScroll`'s direction-gated one-shot mute — untouched (audit: acceptable UX flourish, doesn't affect layout geometry).

## What gets removed

- `data-intro-complete` attribute on `.opening-scene`.
- `MutationObserver` in `StackedServicesDeck` watching that attribute.
- `markIntroComplete` no longer needs to trigger deck setup — it still exists only if hero's own animation logic needs the flag for non-layout purposes (mute gating, focus availability); if not needed elsewhere, remove it. (Confirmed: `introCompleteRef`/`introComplete` state is also read by `muteVideoFromScroll`'s guard — that stays, since it's a UX flourish gate, not a layout dependency. Only the DOM-attribute mirroring and the deck's observer are removed.)
- Deck's own `ScrollTrigger.refresh()` call inside `requestAnimationFrame` after `setupDeckTimeline`.
- Deck's `setupDeckTimeline` gating logic tied to intro completion (`document.querySelector('.opening-scene')`, observer wiring). Replaced by the hook's `registerDeck` call, invoked directly from an effect once deck's own refs are ready (no dependency on hero's readiness other than the hook waiting for both registrations before creating triggers).

## Why this eliminates the race instead of relocating it

The original bug was two different call sites computing document geometry at two different, loosely-ordered times. This design has exactly one call site (`useHomeScrollSequence`'s internal "both registered" branch) that creates *both* `ScrollTrigger`s and calls `refresh()` once, after both pin-spacers exist in the DOM in the same synchronous pass. There is no longer a second, independently-timed `refresh()` anywhere for this geometry, and no DOM-attribute/MutationObserver hop between the two components — so there's no window where one trigger's cached geometry can be stale relative to the other's actual spacer.

## Scope / non-goals

- No visual, copy, timing, or easing changes.
- No CSS hacks (negative margins, opacity/z-index masking) — fix is purely in ScrollTrigger ownership/sequencing.
- Mobile `svh` viewport-unit volatility (audit issue 5) is out of scope — orthogonal, pre-existing, not the reverse-scroll gap's root cause.

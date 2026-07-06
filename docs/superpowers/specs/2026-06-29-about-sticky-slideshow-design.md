# Design Spec: About Page — StickySlideshow

**Date:** 2026-06-29
**Status:** Approved

---

## Overview

A scroll-driven, full-bleed multi-panel section for the About page. Four panels reveal one at a time as the user scrolls. The section pins to the viewport for its entire scroll duration. No buttons, no carousel controls — scrolling is the only input. A vertical progress indicator on the right edge tracks position through the sequence.

---

## Files

| File | Action |
|---|---|
| `src/components/about/StickySlideshow.tsx` | New |
| `src/components/about/StickySlideshow.css` | New |
| `src/pages/About.tsx` | Updated — gallery `cp-section` removed, `<StickySlideshow />` inserted in its place |

---

## About.tsx Structure (after change)

1. Intro `cp-section` — **untouched**
2. Teaching Approach `cp-section` — **untouched**
3. `<StickySlideshow />` — **new, full-bleed** (replaces gallery)
4. CTA — **untouched**
5. Gallery `cp-section` — **removed**

---

## DOM Structure

```
<section ref={sectionRef} className="sticky-slideshow">        ← ScrollTrigger trigger
  <div ref={pinRef} className="sticky-slideshow__pin">         ← Pinned element (100svh)
    <div className="sticky-slideshow__panel" ...>               ← Panel 1–4, all absolutely stacked
      <div className="sticky-slideshow__image-col">
        <img ... />
      </div>
      <div className="sticky-slideshow__content-col">
        <p className="sticky-slideshow__counter">01</p>
        <div className="ph-lines"> ... </div>
      </div>
    </div>
    <div ref={indicatorRef} className="sticky-slideshow__indicator">
      <div className="sticky-slideshow__indicator-track">
        <div ref={markerRef} className="sticky-slideshow__indicator-marker" />
      </div>
    </div>
  </div>
</section>
```

---

## Container Breakout

The component lives inside `page-main` (max-width 1480px, centered). To reach full viewport width without touching `SiteLayout.tsx`:

```css
.sticky-slideshow {
  position: relative;
  left: 50%;
  width: 100vw;
  transform: translateX(-50%);
}
```

`left: 50%` moves the left edge to the center of `page-main`. `translateX(-50%)` pulls it back by half the viewport. Works regardless of parent max-width because it references `50vw`, not `50%`.

---

## Images (in panel order)

1. `assets/images/aaron-palms-beach-1.jpg`
2. `assets/images/aaron-playing-close-1.jpg`
3. `assets/images/aaron-teaching-tree-1.jpg`
4. `assets/images/aaron-portrait-1.jpeg`

Panel 1 image: `loading="eager"`. Panels 2–4: `loading="lazy"`. All: `decoding="async"`.

---

## Scroll Animation

**Library:** GSAP + ScrollTrigger. No Lenis (home-page-owned).

**Pattern:** Matches `OpeningScene.tsx` — `gsap.context()` wraps all wiring, cleanup via `ctx.revert()`.

**ScrollTrigger config:**
- `trigger`: outer `<section>`
- `pin`: inner `<div className="sticky-slideshow__pin">`
- `start`: `'top top'`
- `end`: `'+=300%'` (3 additional viewport-heights of scroll)
- `scrub`: `1`
- `anticipatePin`: `1`
- `invalidateOnRefresh`: `true`

**Initial state (via `gsap.set()` before timeline):**
- Panel 1: `opacity: 1, y: 0`
- Panels 2–4: `opacity: 0, y: 12`

**Timeline — 3 transitions across the 300% scroll budget:**

Each transition occupies one equal segment (~33% of total). Within each segment:
- Outgoing panel: `opacity 1 → 0` over ~15% of the segment
- Incoming panel simultaneously: `opacity 0 → 1`, `y: 12 → 0` over the same ~15%
- Hold: the remaining ~85% of the segment, new panel static

The `y: 12px` drift on enter applies only to the incoming panel. Outgoing panels fade in place, no translate.

**Marker:** Animated in the same scrubbed timeline, `top: 0% → 100%` of the track, continuous across all 3 transitions (no per-step snapping). Single `gsap.to()` spanning the full timeline duration.

---

## Panel Layout

### Desktop (> 760px)

Two-column CSS grid per panel:
- Left 60%: full-height image, `object-fit: cover`
- Right 40%: content area, vertically centered within the column

Content area contains:
- Counter: `01`–`04`, styled like `.cp-section-label` (small, muted, letter-spaced, uppercase)
- Heading placeholder: 2 `ph-line` elements
- Body placeholder: 3 `ph-line` elements

No card, no border, no background on the content area — reads against `#f5f0e7`.

### Mobile (≤ 760px)

- Image fills entire panel (`inset: 0`, `object-fit: cover`)
- Content sits over the image in the lower portion
- Upward gradient behind content: `rgba(31,29,24,0.52) → transparent`
- `ph-line` color lightened for legibility on dark gradient: `rgba(245,240,231,0.5)`

---

## Progress Indicator

Positioned inside the pinned div. Hidden on mobile and in reduced-motion mode.

```
position: absolute
right: clamp(1.25rem, 2.5vw, 2rem)
top: 50%
transform: translateY(-50%)
```

- **Track:** `2px` wide × `6rem` tall, `background: rgba(31,29,24,0.12)`
- **Marker:** `6px` diameter circle, centered on track horizontally, `background: rgba(31,29,24,0.55)`. Animated `top: 0% → 100%` of track in the GSAP timeline.

---

## Reduced-Motion Fallback

When `prefers-reduced-motion: reduce` matches:
- No `gsap.context()` is created
- No ScrollTrigger, no pinning, no opacity manipulation
- Panels render as normal block elements in document flow, each `min-height: 100svh`
- Desktop two-column layout still applies
- Progress indicator hidden
- Images and content fully visible at all times

The `usePrefersReducedMotion` hook is a local function in `StickySlideshow.tsx` (same implementation as `OpeningScene.tsx`). Not extracted to a shared file — the component stays self-contained.

---

## Accessibility

- Section has `aria-label="About Aaron slideshow"`
- Images have empty `alt=""` (decorative in this context — placeholder copy conveys the content)
- Progress indicator is `aria-hidden="true"`
- No scroll locking, no focus trapping (this is a passive scroll experience, not a modal)

---

## Dependencies

No new packages. Uses GSAP + ScrollTrigger already in the project.

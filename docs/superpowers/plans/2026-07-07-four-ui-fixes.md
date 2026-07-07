# Four UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four independent UI defects on the Maui Lessons site: cold-load flash of hero tagline/arch, hero video audio surviving route navigation, missing auto-advance on the booking datetime step, and a redesign of the "meet Aaron" ribbon (color, motion path, layout).

**Architecture:** No new dependencies, no new files. Each fix is a surgical edit to existing CSS/TSX in place. Fixes are independent of each other and can be done in any order; each is its own task with its own verification.

**Tech Stack:** Vite, React 19, TypeScript, GSAP 3 + ScrollTrigger, plain CSS (no CSS-in-JS).

## Global Constraints

- No new npm dependencies.
- Minimal, surgical changes only — don't restructure files beyond what's needed for each fix.
- Preserve existing `prefers-reduced-motion` behavior in every touched component.
- Do not invent business copy/content (not applicable to these four fixes, but keep in mind if touching nearby placeholder text).
- Run `npm run build` and `npm run lint` after all four fixes; both must pass.
- This project has no automated test suite — "tests" in this plan mean manual dev-server verification steps, not unit tests.

---

### Task 1: Fix cold-load flash of hero tagline/arch

**Files:**
- Modify: `src/components/home/OpeningScene.css`

**Interfaces:**
- Consumes: existing GSAP initial-state calls in `src/components/home/OpeningScene.tsx:651-656` (`gsap.set(tagline, { opacity: 0 })` where `tagline = taglineRef.current` → `.opening-scene__tagline`; `gsap.set(arch, { scaleY: 0.32, opacity: 0, transformOrigin: 'center bottom' })` where `arch = archRef.current` → `.opening-scene__arch`). These run inside a `useEffect` (not `useLayoutEffect`), so they execute after first paint — the root cause of the flash.
- Produces: no new interfaces; purely a CSS-default fix. Confirmed the reduced-motion effect at `OpeningScene.tsx:515-539` already forces `archRef`/`archTitleRef` to `autoAlpha: 1` and the existing reduced-motion CSS rule for `.opening-scene__arch` (`OpeningScene.css:245-254`) already sets `transform: none`, which will correctly cancel the new `scaleY(0.32)` default under reduced motion. The tagline is NOT included in that reduced-motion `gsap.set` call, so it needs its own reduced-motion CSS override.

- [ ] **Step 1: Add hidden CSS defaults for tagline and arch**

In `src/components/home/OpeningScene.css`, find the `.opening-scene__tagline` rule (currently lines 125-133):

```css
.opening-scene__tagline {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
```

Add `opacity: 0;` to it so it matches the JS initial state:

```css
.opening-scene__tagline {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
}
```

Then find the `.opening-scene__arch` rule (currently lines 159-174):

```css
.opening-scene__arch {
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 4;
  display: grid;
  align-content: center;
  justify-items: center;
  width: 145vw;
  height: clamp(240px, 36svh, 460px);
  padding-bottom: clamp(12px, 2svh, 28px);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background: var(--home-sage);
  transform: translateX(-50%);
  will-change: transform, opacity;
}
```

Add `opacity: 0;` and layer the initial `scaleY(0.32)` onto the existing `translateX(-50%)` transform (order matters: translate first, then scale, to match how GSAP would compose them), plus `transform-origin: center bottom;`:

```css
.opening-scene__arch {
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 4;
  display: grid;
  align-content: center;
  justify-items: center;
  width: 145vw;
  height: clamp(240px, 36svh, 460px);
  padding-bottom: clamp(12px, 2svh, 28px);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background: var(--home-sage);
  transform: translateX(-50%) scaleY(0.32);
  transform-origin: center bottom;
  opacity: 0;
  will-change: transform, opacity;
}
```

- [ ] **Step 2: Add reduced-motion override for the tagline**

Find the reduced-motion tagline rule (currently lines 228-232):

```css
.opening-scene.is-reduced-motion .opening-scene__tagline {
  position: relative;
  inset: auto;
  padding: clamp(2.5rem, 5vw, 4rem) 0;
}
```

Add `opacity: 1;` since the reduced-motion JS effect never sets tagline opacity:

```css
.opening-scene.is-reduced-motion .opening-scene__tagline {
  position: relative;
  inset: auto;
  padding: clamp(2.5rem, 5vw, 4rem) 0;
  opacity: 1;
}
```

Do not touch the existing `.opening-scene.is-reduced-motion .opening-scene__arch` rule (`OpeningScene.css:245-254`) — it already sets `transform: none;`, which cancels the new `scaleY(0.32)` default, and the reduced-motion JS effect already sets `autoAlpha: 1` (inline `opacity: 1`) on `archRef`, which wins over the stylesheet default regardless of specificity.

- [ ] **Step 3: Verify manually in the dev server**

Run: `npm run dev`

- Hard-refresh `/` several times (Cmd+Shift+R). Confirm no flash of the tagline text ("Learn your first ukulele song...") or the arch/"Choose your experience" title before the scroll-driven reveal.
- Open dev tools → Rendering → emulate `prefers-reduced-motion: reduce`, hard-refresh `/`. Confirm the tagline is visible immediately (no flash-hidden, no missing text) and the arch renders normally (not squished).
- Turn reduced motion back off, scroll down through the pinned hero sequence, confirm the tagline still fades in/out and the arch still grows in exactly as before (no regression to the scrubbed timeline, since GSAP's own `gsap.set` calls still run and simply match the CSS defaults now).

- [ ] **Step 4: Commit**

```bash
git add src/components/home/OpeningScene.css
git commit -m "fix: hide hero tagline/arch by default to prevent cold-load flash"
```

---

### Task 2: Stop hero video audio after route navigation

**Files:**
- Modify: `src/components/home/OpeningScene.tsx:733-745`

**Interfaces:**
- Consumes: `videoRef.current` (existing ref to the `<video>` element, declared at `OpeningScene.tsx:85`).
- Produces: no new interfaces.

- [ ] **Step 1: Add unconditional video pause/reset to the unmount cleanup effect**

In `src/components/home/OpeningScene.tsx`, find the effect at lines 733-745:

```tsx
useEffect(() => {
  const focusBackdrop = focusBackdropRef.current
  const frame = frameRef.current

  return () => {
    landscapeFadeRef.current?.kill()
    focusTimelineRef.current?.kill()
    gsap.set(focusBackdrop, { clearProps: 'all' })
    gsap.set(frame, { clearProps: 'position,top,left,width,height,zIndex,transform' })
    setHeaderSuppressed(false)
    restoreFocusScroll()
  }
}, [restoreFocusScroll, setHeaderSuppressed])
```

Capture `videoRef.current` at effect-setup time (same pattern already used for `focusBackdrop`/`frame` above it, so the cleanup doesn't read a possibly-null ref after unmount) and pause/reset it unconditionally in the cleanup:

```tsx
useEffect(() => {
  const focusBackdrop = focusBackdropRef.current
  const frame = frameRef.current
  const video = videoRef.current

  return () => {
    landscapeFadeRef.current?.kill()
    focusTimelineRef.current?.kill()
    gsap.set(focusBackdrop, { clearProps: 'all' })
    gsap.set(frame, { clearProps: 'position,top,left,width,height,zIndex,transform' })
    setHeaderSuppressed(false)
    restoreFocusScroll()

    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }
}, [restoreFocusScroll, setHeaderSuppressed])
```

This effect's cleanup only runs on unmount (its dependency array holds stable callbacks from `useCallback`, so it doesn't re-run mid-life), and pausing is unconditional — not gated behind `hasPlaybackStarted` or any mute/focus state — so audio stops the instant `OpeningScene` unmounts, regardless of what state playback was in.

- [ ] **Step 2: Verify manually in the dev server**

Run: `npm run dev`

- Load `/`, let the hero video autoplay (unmute it via the mute button if it started muted).
- Mid-playback, click a nav link to `/about` (or any other route).
- Confirm audio stops immediately with no residual sound bleeding into the new route.
- Repeat while in Focus Mode (click the video to zoom in), then navigate away mid-focus-mode — confirm audio still stops and no console errors appear (the existing cleanup already tears down focus-mode state, so pausing is just one more independent step in the same cleanup).
- Navigate back to `/` and confirm the hero video still autoplays/loops correctly on remount (unaffected — this only touches the unmount path).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/OpeningScene.tsx
git commit -m "fix: pause hero video on unmount so audio doesn't survive route navigation"
```

---

### Task 3: Auto-advance the booking datetime step

**Files:**
- Modify: `src/pages/Book.tsx`

**Interfaces:**
- Consumes: `data.date` and `data.timeSlot` (fields of `BookingData`, `Book.tsx:16-25`), `step` state, `goTo(next: StepId, updated?: Partial<BookingData>)` (`Book.tsx:231-256`).
- Produces: no new interfaces; internal `useEffect` only.

- [ ] **Step 1: Add the auto-advance effect**

In `src/pages/Book.tsx`, place a new `useEffect` after the existing step-transition effect (which ends at line 295, right before `function selectLessonType` at line 297). Import `useEffect` in the existing React import at the top of the file (currently `import { useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'` at line 1):

```tsx
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
```

Add a ref (next to the other refs near the top of the component, e.g. after `hasMountedRef` at line 95) to remember which `date|timeSlot` pair has already triggered an advance, so returning to this step via a "Change" link with untouched, already-advanced values doesn't immediately re-fire and bounce the user forward again:

```tsx
const lastAdvancedDatetimeRef = useRef<string | null>(null)
```

Add the effect:

```tsx
// Datetime is the one step with two required selections (date + time slot),
// so it can't auto-advance on a single onClick like the other steps do.
// Wait for both, then hold briefly so the user sees both selections
// highlighted before the panel transitions. Guarded by
// lastAdvancedDatetimeRef so that arriving here via a "Change" link with
// the same date/timeSlot as before (both already truthy) does not
// immediately re-fire — it only advances again once the pair actually
// changes from whatever last triggered an advance.
useEffect(() => {
  if (step !== 'datetime' || !data.date || !data.timeSlot) {
    return
  }

  const key = `${data.date}|${data.timeSlot}`

  if (lastAdvancedDatetimeRef.current === key) {
    return
  }

  const timeout = window.setTimeout(() => {
    lastAdvancedDatetimeRef.current = key
    goTo('contact')
  }, 500)

  return () => {
    window.clearTimeout(timeout)
  }
}, [step, data.date, data.timeSlot])
```

This effect only arms while `step === 'datetime'`; its cleanup clears the pending timeout whenever `step`, `data.date`, or `data.timeSlot` change — which covers navigating away via the "← Back" button, via a "Change" link jumping to a later step, or re-picking a different date/time before the 500ms elapses. The ref is only written inside the `setTimeout` callback (i.e. once the advance actually happens), never on every render, so it accurately reflects "the pair that was last auto-advanced on" rather than "the pair currently selected." `goTo` is stable across renders in the sense that it closes over `step`/`data` freshly each render (it's a plain function, not memoized), so calling it from this effect is safe and consistent with how `onClick` handlers already call it elsewhere in this file.

- [ ] **Step 2: Remove the redundant Continue button**

In the `datetime` step's footer (currently `Book.tsx:489-496`):

```tsx
<div className="bw-footer">
  <button type="button" className="bw-back" onClick={goBack}>
    ← Back
  </button>
  <button type="button" className="cp-button bw-cta" onClick={() => goTo('contact')}>
    Continue
  </button>
</div>
```

Remove the "Continue" button, keeping only "← Back":

```tsx
<div className="bw-footer">
  <button type="button" className="bw-back" onClick={goBack}>
    ← Back
  </button>
</div>
```

(No CSS change needed — `.bw-footer` in `src/pages/Book.css:577-582` is `display: flex; gap: 1.25rem` with no `justify-content: space-between`, and the `participants` step's footer already renders a lone "← Back" button the same way at `Book.tsx:449-454`, so a single-button footer is an already-supported layout.)

- [ ] **Step 3: Verify manually in the dev server**

Run: `npm run dev`

- Navigate to `/book`, pick a lesson type, (pick group size if vacation), reach the `datetime` step.
- Pick a date, then pick a time slot. Confirm the step auto-advances to `contact` about half a second after both are set, with no button click.
- From the `contact` step, click "Change" next to "Date" (or "Time") to jump back to `datetime`. Confirm the step still shows the previously chosen date/time, and **does not immediately auto-advance back to `contact`** just from arriving with already-set values (this is the re-entry bug the `lastAdvancedDatetimeRef` guard fixes — sit on the step for a few seconds without touching anything and confirm it does NOT bounce forward). Then confirm picking a new date or time slot still auto-advances after ~500ms.
- Click "← Back" from `datetime` to `participants`/`type` mid-timeout (pick date+slot, then immediately click Back before 500ms elapses) — confirm it does NOT still auto-advance to `contact` a moment later.
- Confirm the "Continue" button no longer appears on the `datetime` step.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Book.tsx
git commit -m "feat: auto-advance booking datetime step once date and time are chosen"
```

---

### Task 4: Redesign the "meet Aaron" ribbon (color, motion path, layout)

**Files:**
- Modify: `src/components/home/MeetAaron.tsx`
- Modify: `src/components/home/MeetAaron.css`

**Interfaces:**
- Consumes: `RIBBON_PATH_DESKTOP` / `RIBBON_PATH_MOBILE` (path `d` strings, `MeetAaron.tsx:16-22`), the existing textPath-tiling mechanism (`getTotalLength()`/`getComputedTextLength()`, `MeetAaron.tsx:132-136`), the existing `IntersectionObserver` play/pause gating (`MeetAaron.tsx:161-173`), `usePrefersReducedMotion` (existing hook), and the existing clip-path scroll-reveal on the portrait image (`MeetAaron.tsx:56-90`, untouched by this task).
- Produces: no new interfaces; same component/CSS file boundary.

- [ ] **Step 1: Replace the ribbon path constants with an eased-staircase zigzag**

In `src/components/home/MeetAaron.tsx`, replace lines 12-22:

```tsx
// Gentle hand-drawn double wave running left to right, touching both
// viewBox edges (x=0 and x=viewBox width) so the curve spans the section
// edge-to-edge with the svg stretched via preserveAspectRatio="none" —
// no inset margin, no letterboxed dead space on either side.
const RIBBON_PATH_DESKTOP =
  'M 0,150 C 192,60 364,40 557,90 C 750,140 878,170 1028,110 C 1114,80 1168,65 1200,55'

// Same shape, hand-tuned into a narrower viewBox so the wave ratio holds up
// at mobile widths instead of flattening into a straight line.
const RIBBON_PATH_MOBILE =
  'M 0,130 C 77,70 144,50 210,80 C 276,110 321,140 365,110 C 398,90 420,75 420,55'
```

with:

```tsx
// Repeating "eased staircase": each segment is a symmetric cubic-bezier
// S-curve whose control points sit at the segment's horizontal midpoint
// (one level with the start, one level with the end), which is what makes
// the curve flatten out (near-zero slope) right at each node and go
// steepest in the middle — the classic ease-in-out bezier construction.
// Six segments alternate top/bottom and land back on the starting level,
// so the path tiles seamlessly for the infinite marquee loop.
const RIBBON_PATH_DESKTOP =
  'M 0,40 C 100,40 100,180 200,180 C 300,180 300,40 400,40 C 500,40 500,180 600,180 C 700,180 700,40 800,40 C 900,40 900,180 1000,180 C 1100,180 1100,40 1200,40'

// Same construction, four segments across the narrower mobile viewBox.
const RIBBON_PATH_MOBILE =
  'M 0,30 C 52.5,30 52.5,170 105,170 C 157.5,170 157.5,30 210,30 C 262.5,30 262.5,170 315,170 C 367.5,170 367.5,30 420,30'
```

The rest of the component (`RIBBON_UNIT`, `RIBBON_SPEED_PX_PER_SEC`, the tiling/measuring effect at lines 97-179, the two `<svg>` blocks at lines 184-234) is unchanged — this task only swaps the path shape, not the mechanism.

- [ ] **Step 2: Give the ribbon a taller viewBox to fit the new amplitude**

The new desktop path uses y from 40 to 180 (needs ~220 of vertical room, matching the existing `viewBox="0 0 1200 220"` at `MeetAaron.tsx:185` — no change needed there). The new mobile path uses y from 30 to 170 (needs ~200, matching the existing `viewBox="0 0 420 200"` at `MeetAaron.tsx:211` — no change needed there either). Confirm both viewBox attributes are unchanged; the amplitude was chosen to fit them.

- [ ] **Step 3: Darken and enlarge the ribbon text**

In `src/components/home/MeetAaron.css`, find `.meet-aaron__ribbon-text` (currently lines 40-46):

```css
.meet-aaron__ribbon-text {
  font-family: "Fraunces", "Cormorant Garamond", Georgia, serif;
  font-style: normal;
  font-weight: 900;
  font-size: clamp(2.1rem, 4.6vw, 3.6rem);
  fill: rgba(23, 53, 42, 0.45);
}
```

Replace with a larger size and a mid-tone green (between `--home-sage` `#b8c8a0` and `--home-sage-ink` `#17352a`, weighted toward the darker end so it reads as bold texture, not a washed-out tint):

```css
.meet-aaron__ribbon-text {
  font-family: "Fraunces", "Cormorant Garamond", Georgia, serif;
  font-style: normal;
  font-weight: 900;
  font-size: clamp(3.2rem, 7vw, 6rem);
  fill: rgba(58, 90, 63, 0.62);
}
```

Then find the mobile override (currently lines 169-171):

```css
.meet-aaron__ribbon-text {
  font-size: clamp(1.5rem, 8vw, 2.4rem);
}
```

Replace with a proportionally larger mobile size:

```css
.meet-aaron__ribbon-text {
  font-size: clamp(2.2rem, 11vw, 3.6rem);
}
```

- [ ] **Step 4: Give the ribbon band more height for the bigger text**

In `src/components/home/MeetAaron.css`, find `.meet-aaron__ribbon` (currently lines 16-25):

```css
.meet-aaron__ribbon {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: clamp(120px, 16vw, 200px);
  overflow: visible;
  pointer-events: none;
}
```

Increase the height range so the bigger text (and the taller staircase amplitude) has room without clipping:

```css
.meet-aaron__ribbon {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: clamp(200px, 26vw, 340px);
  overflow: visible;
  pointer-events: none;
}
```

And the mobile override (currently lines 157-159):

```css
.meet-aaron__ribbon {
  height: clamp(90px, 26vw, 150px);
}
```

Replace with:

```css
.meet-aaron__ribbon {
  height: clamp(150px, 40vw, 260px);
}
```

- [ ] **Step 5: Restructure the layout so the portrait anchors bottom-left**

In `src/components/home/MeetAaron.css`, find `.meet-aaron` (currently lines 1-9):

```css
.meet-aaron {
  position: relative;
  z-index: 2;
  width: 100%;
  background: var(--home-sage);
  padding: clamp(48px, 8svh, 96px) clamp(16px, 4vw, 56px);
}
```

Give it enough reserved height for the bottom-left image to sit in without collapsing the section (the image no longer participates in normal flow sizing once it's positioned):

```css
.meet-aaron {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: clamp(560px, 62vw, 760px);
  background: var(--home-sage);
  padding: clamp(48px, 8svh, 96px) clamp(16px, 4vw, 56px);
}
```

Find `.meet-aaron__inner` (currently lines 52-62):

```css
.meet-aaron__inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(28px, 5vw, 72px);
  width: min(94vw, 1080px);
  margin: 0 auto;
  margin-top: clamp(24px, 5vw, 56px);
}
```

Replace the grid with a relative positioning context tall enough for the absolutely-positioned image, with the content card free-flowing at the top so it visually sits above/beside the ribbon and image:

```css
.meet-aaron__inner {
  position: relative;
  z-index: 2;
  width: min(94vw, 1080px);
  height: clamp(420px, 46vw, 600px);
  margin: 0 auto;
  margin-top: clamp(96px, 14vw, 180px);
}
```

Find `.meet-aaron__media` (currently lines 64-70):

```css
.meet-aaron__media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(23, 53, 42, 0.12);
}
```

Anchor it to the bottom-left of `.meet-aaron__inner`, keeping its own aspect ratio and the existing `will-change: clip-path` reveal on the child image untouched:

```css
.meet-aaron__media {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  width: clamp(240px, 34vw, 400px);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(23, 53, 42, 0.12);
}
```

Find `.meet-aaron__content` (currently lines 81-95) and give it a bounded width plus positioning toward the top-right of `.meet-aaron__inner`, above/beside the image, instead of a grid cell:

```css
.meet-aaron__content {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.8svh, 1.1rem);
  padding: clamp(28px, 4vw, 44px);
  border: 1px solid rgba(31, 29, 24, 0.1);
  border-radius: 20px;
  background: #fbf7ee;
  color: #1f1d18;
  text-decoration: none;
  box-shadow:
    0 1px 2px rgba(6, 18, 13, 0.15),
    0 30px 60px -32px rgba(6, 18, 13, 0.35);
  transition: box-shadow 0.24s ease, transform 0.24s ease;
}
```

becomes:

```css
.meet-aaron__content {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.8svh, 1.1rem);
  width: min(90vw, 420px);
  padding: clamp(28px, 4vw, 44px);
  border: 1px solid rgba(31, 29, 24, 0.1);
  border-radius: 20px;
  background: #fbf7ee;
  color: #1f1d18;
  text-decoration: none;
  box-shadow:
    0 1px 2px rgba(6, 18, 13, 0.15),
    0 30px 60px -32px rgba(6, 18, 13, 0.35);
  transition: box-shadow 0.24s ease, transform 0.24s ease;
}
```

(`.meet-aaron__content:hover`, `:focus-visible`, `.meet-aaron__description`, `.meet-aaron__cta*` rules at lines 97-146 are untouched — they don't reference layout/position.)

- [ ] **Step 6: Fix the mobile breakpoint for the new structure**

Find the mobile block (currently `MeetAaron.css:148-172`):

```css
@media (max-width: 760px) {
  .meet-aaron__inner {
    grid-template-columns: 1fr;
  }

  .meet-aaron__media {
    aspect-ratio: 16 / 10;
  }

  .meet-aaron__ribbon {
    height: clamp(90px, 26vw, 150px);
  }

  .meet-aaron__ribbon-svg--desktop {
    display: none;
  }

  .meet-aaron__ribbon-svg--mobile {
    display: block;
  }

  .meet-aaron__ribbon-text {
    font-size: clamp(1.5rem, 8vw, 2.4rem);
  }
}
```

Replace the now-obsolete `grid-template-columns: 1fr` and the aspect-ratio/height/font-size values already updated in Steps 3-4, with a stacked layout: content card first (in flow, full width), image below it at bottom-left of a shorter box:

```css
@media (max-width: 760px) {
  .meet-aaron__inner {
    display: flex;
    flex-direction: column;
    height: auto;
    margin-top: clamp(140px, 34vw, 220px);
  }

  .meet-aaron__content {
    position: static;
    width: 100%;
  }

  .meet-aaron__media {
    position: relative;
    left: auto;
    bottom: auto;
    width: 100%;
    aspect-ratio: 16 / 10;
    margin-top: clamp(20px, 5vw, 32px);
  }

  .meet-aaron__ribbon {
    height: clamp(150px, 40vw, 260px);
  }

  .meet-aaron__ribbon-svg--desktop {
    display: none;
  }

  .meet-aaron__ribbon-svg--mobile {
    display: block;
  }

  .meet-aaron__ribbon-text {
    font-size: clamp(2.2rem, 11vw, 3.6rem);
  }
}
```

(This makes `.meet-aaron__media` static/in-flow on mobile — same effect as the original stacked layout — while keeping it absolute/bottom-left on desktop per Step 5. The existing `will-change: clip-path` reveal animation on `.meet-aaron__media-image` in `MeetAaron.tsx:56-90` reads the element's own box regardless of how the parent positions it, so this reflow doesn't affect that ScrollTrigger.)

- [ ] **Step 7: Verify manually in the dev server**

Run: `npm run dev`

- Navigate to `/` and scroll to the "meet Aaron" section.
- Confirm the ribbon text is visibly larger than before and a clearly darker green than the `--home-sage` background — readable as bold texture, not a harsh high-contrast headline.
- Watch the ribbon motion for at least one full loop: confirm it moves through the new eased-staircase shape (steep drops/rises that flatten near each node) with no visible seam or jump where the path repeats.
- Confirm Aaron's portrait image sits at the bottom-left of the section on desktop width (≥761px), with the content card positioned near the top-right, not overlapping awkwardly.
- Resize to mobile width (≤760px, e.g. via dev tools device toolbar): confirm the content card appears first in flow, full-width, followed by the image below it, and the mobile SVG ribbon variant is the one rendering (not the desktop one).
- Emulate `prefers-reduced-motion: reduce`: confirm the ribbon text is static (no scrolling motion) and the portrait's clip-path reveal still shows the full image immediately (existing `gsap.set(image, { clipPath: 'inset(0% 0% 0% 0%)' })` path at `MeetAaron.tsx:56-58`, untouched).
- Scroll the image in and out of view (non-reduced-motion) to confirm the existing center-out clip-path reveal (`toggleActions: 'play none none reverse'`) still plays/reverses correctly — this task didn't touch that effect, but confirm the new absolute positioning didn't break its `ScrollTrigger.trigger: media` measurement.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/MeetAaron.tsx src/components/home/MeetAaron.css
git commit -m "redesign: bolder darker ribbon text, eased-staircase motion path, bottom-left portrait layout"
```

---

### Task 5: Final full-project verification

**Files:** none (verification only)

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: exits 0, no TypeScript or Vite errors.

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: exits 0, no reported issues (Oxlint).

- [ ] **Step 3: Report per-file changes**

Summarize, per file, what changed:
- `src/components/home/OpeningScene.css` — hidden CSS defaults for tagline/arch + reduced-motion tagline override (Task 1).
- `src/components/home/OpeningScene.tsx` — unmount cleanup now pauses/resets the hero video (Task 2).
- `src/pages/Book.tsx` — datetime step auto-advances via new `useEffect`; redundant Continue button removed (Task 3).
- `src/components/home/MeetAaron.tsx` — ribbon path constants replaced with eased-staircase zigzag (Task 4).
- `src/components/home/MeetAaron.css` — ribbon color/size/height enlarged, `.meet-aaron`/`.meet-aaron__inner`/`.meet-aaron__media`/`.meet-aaron__content`/mobile block restructured for bottom-left portrait layout (Task 4).

---

## Self-Review Notes

- **Spec coverage:** all four fixes from the brief have a task (Task 1-4), plus a final build/lint/report task (Task 5) matching the brief's closing instruction.
- **Placeholder scan:** no TBD/TODO/"add appropriate X" phrasing; every step has literal code.
- **Type/name consistency:** `videoRef`, `taglineRef`, `archRef`, `data.date`/`data.timeSlot`, `goTo`, `RIBBON_PATH_DESKTOP`/`RIBBON_PATH_MOBILE`, `.meet-aaron__inner`/`__media`/`__content` are all read from the actual current source and reused verbatim across steps — no renamed/invented identifiers.

# Weekly Circle-Lens Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the weekly journey’s rectangular image reveals with three brand-colored circle lenses that assemble during sticky scroll holds before revealing complete, uncropped photographs.

**Architecture:** Add a focused `WeeklyStepVisual` presentational component for rings and layered images. Keep Lenis and GSAP orchestration in `WeeklyJourneySections`, but replace its independent pin/travel/reveal triggers with one master timeline containing exact chapter holds and travel phases. Base CSS remains the complete vertical no-JS/reduced-motion experience; the horizontal class adds pinned positioning and animation preparation.

**Tech Stack:** React 19, TypeScript 6, CSS, GSAP 3 ScrollTrigger, Lenis, Vite asset URLs, Node test runner, Playwright visual QA.

## Global Constraints

- Preserve entrance copy, journey copy, closing copy, navigation, and route structure.
- Do not modify Meet Aaron or FAQ behavior.
- Use only `aaron-weekly-1.jpg`, `aaron-teaching-2.jpg`, and `aaron-weekly-2.jpg`.
- Every sharp image must remain fully visible with `object-fit: contain`.
- Horizontal scrolling remains active on motion-enabled desktop and mobile screens.
- Reduced motion and no-JS use complete vertical document flow.
- Do not commit, push, or deploy.

---

### Task 1: Lock semantic circle-lens structure with a failing test

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: source text from `WeeklyStepVisual.tsx`.
- Produces: regression coverage for three decorative rings, one hidden blurred image, and one semantic sharp image.

- [ ] **Step 1: Add a safe read for the new component**

```js
const visual = await readFile(
  new URL('../src/components/weekly/WeeklyStepVisual.tsx', import.meta.url),
  'utf8',
).catch(() => '')
```

- [ ] **Step 2: Add the failing regression test**

```js
test('renders a semantic circle lens with decorative rings and blur', () => {
  assert.equal(visual.match(/weekly-step__ring/g)?.length, 6)
  assert.match(visual, /weekly-step__ring--outer/)
  assert.match(visual, /weekly-step__ring--middle/)
  assert.match(visual, /weekly-step__ring--inner/)
  assert.match(visual, /className="weekly-step__image-blur"/)
  assert.match(visual, /aria-hidden="true"/)
  assert.match(visual, /className="weekly-step__image"/)
})
```

- [ ] **Step 3: Run the focused test and verify RED**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because `WeeklyStepVisual.tsx` does not exist.

---

### Task 2: Create the semantic circle-lens component

**Files:**
- Create: `src/components/weekly/WeeklyStepVisual.tsx`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `src`, `alt`, `width`, `height`, `loading`, and `ringColors`.
- Produces: `.weekly-step__visual`, three `.weekly-step__ring` elements, `.weekly-step__lens`, `.weekly-step__image-blur`, and `.weekly-step__image`.

- [ ] **Step 1: Create `WeeklyStepVisual.tsx`**

```tsx
import type { CSSProperties } from 'react'

export type WeeklyStepRingColors = {
  outer: string
  middle: string
  inner: string
}

type WeeklyStepVisualProps = {
  src: string
  alt: string
  width: number
  height: number
  loading: 'eager' | 'lazy'
  ringColors: WeeklyStepRingColors
}

type RingStyle = CSSProperties & {
  '--weekly-ring-outer': string
  '--weekly-ring-middle': string
  '--weekly-ring-inner': string
}

export default function WeeklyStepVisual({
  src,
  alt,
  width,
  height,
  loading,
  ringColors,
}: WeeklyStepVisualProps) {
  const style: RingStyle = {
    '--weekly-ring-outer': ringColors.outer,
    '--weekly-ring-middle': ringColors.middle,
    '--weekly-ring-inner': ringColors.inner,
  }

  return (
    <figure className="weekly-step__visual" style={style}>
      <span className="weekly-step__ring weekly-step__ring--outer" aria-hidden="true" />
      <span className="weekly-step__ring weekly-step__ring--middle" aria-hidden="true" />
      <span className="weekly-step__ring weekly-step__ring--inner" aria-hidden="true" />
      <span className="weekly-step__lens">
        <img
          className="weekly-step__image-blur"
          src={src}
          alt=""
          aria-hidden="true"
          loading={loading}
          decoding="async"
          width={width}
          height={height}
        />
        <img
          className="weekly-step__image"
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={loading === 'eager' ? 'high' : 'auto'}
          decoding="async"
          width={width}
          height={height}
        />
      </span>
    </figure>
  )
}
```

- [ ] **Step 2: Run the focused test and typecheck**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && npm run typecheck`

Expected: both exit 0.

---

### Task 3: Integrate three images and one sticky master timeline

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `WeeklyStepVisual`, three journey entries, current stage/track/spine markup, Lenis.
- Produces: a single pinned `master` timeline with exact chapter starts `0`, `1.55`, and `3.1`, total duration `4.3`, and track travel at `0.95` and `2.5`.

- [ ] **Step 1: Add and run the failing journey/timing test**

```js
test('holds three image chapters and reveals rings before each image', () => {
  assert.match(tsx, /import WeeklyStepVisual from '\.\/WeeklyStepVisual'/)
  assert.equal(tsx.match(/\bimage:/g)?.length, 3)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.match(tsx, /width: 698/)
  assert.match(tsx, /height: 920/)
  assert.match(tsx, /const CHAPTER_STARTS = \[0, 1\.55, 3\.1\]/)
  assert.match(tsx, /const CHAPTER_END = 4\.3/)
  assert.match(tsx, /getScrollDistance\(\) \* 1\.85/)
  assert.match(tsx, /window\.innerHeight \* 3\.6/)
  assert.match(tsx, /const imageAt = chapterAt \+ 0\.48/)
  assert.match(tsx, /const travelAt = chapterAt \+ 0\.95/)
  assert.match(tsx, /duration: 0\.6, ease: 'power2\.inOut'/)
  assert.match(tsx, /gestureOrientation: 'vertical'/)
})
```

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the third image and master chapter constants do not exist.

- [ ] **Step 2: Make all journey media explicit**

Import `WeeklyStepVisual` and `WeeklyStepRingColors`. Add:

```tsx
const weeklyPerformanceImage = new URL(
  '../../../assets/images/aaron-weekly-2.jpg',
  import.meta.url,
).href

const CHAPTER_STARTS = [0, 1.55, 3.1] as const
const CHAPTER_END = 4.3
```

Make `image`, `alt`, `loading`, `width`, `height`, and `ringColors` required on `JourneyStep`. Step 03 uses:

```tsx
image: weeklyPerformanceImage,
alt: 'Aaron teaching chord shapes to a student outdoors',
loading: 'lazy',
width: 698,
height: 920,
ringColors: {
  outer: 'rgba(111, 134, 90, 0.75)',
  middle: 'rgba(23, 53, 42, 0.72)',
  inner: 'rgba(211, 154, 66, 0.52)',
},
```

Step 01 uses:

```tsx
ringColors: {
  outer: 'rgba(211, 154, 66, 0.42)',
  middle: 'rgba(247, 216, 143, 0.64)',
  inner: 'rgba(184, 200, 160, 0.82)',
},
```

Step 02 uses:

```tsx
ringColors: {
  outer: 'rgba(245, 240, 231, 0.72)',
  middle: 'rgba(184, 200, 160, 0.82)',
  inner: 'rgba(111, 134, 90, 0.78)',
},
```

- [ ] **Step 3: Replace conditional figure markup**

```tsx
<WeeklyStepVisual
  src={step.image}
  alt={step.alt}
  loading={step.loading}
  width={step.width}
  height={step.height}
  ringColors={step.ringColors}
/>
```

- [ ] **Step 4: Replace independent pin, track, spine, and reveal triggers**

Keep Lenis setup and `getSectionTop`. Add:

```tsx
const getPinnedDistance = () =>
  Math.max(getScrollDistance() * 1.85, window.innerHeight * 3.6)

const master = gsap.timeline({
  scrollTrigger: {
    trigger: stage,
    start: () => getSectionTop(),
    end: () => getSectionTop() + getPinnedDistance(),
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
})
```

Initialize content, dots, numerals, rings, and lenses:

```tsx
gsap.set(spine, { scaleX: 0, transformOrigin: 'left center' })
panels.forEach((panel) => {
  gsap.set(panel.querySelector('.weekly-step__dot'), { scale: 0 })
  gsap.set(panel.querySelector('.weekly-step__numeral'), { autoAlpha: 0, y: 24 })
  gsap.set(panel.querySelector('.weekly-step__content'), { autoAlpha: 0, y: 22 })
  gsap.set(panel.querySelectorAll('.weekly-step__ring'), { scale: 0.72, autoAlpha: 0 })
  gsap.set(panel.querySelector('.weekly-step__lens'), {
    autoAlpha: 0,
    scale: 0.94,
    clipPath: 'circle(0% at 50% 50%)',
  })
})
```

For each panel:

```tsx
const chapterAt = CHAPTER_STARTS[index]
const imageAt = chapterAt + 0.48
const travelAt = chapterAt + 0.95
const rings = panel.querySelectorAll('.weekly-step__ring')
const innerRing = rings[2]
const middleRing = rings[1]
const outerRing = rings[0]
const lens = panel.querySelector('.weekly-step__lens')

master
  .to(panel.querySelector('.weekly-step__dot'), { scale: 1, duration: 0.12, ease: 'back.out(2)' }, chapterAt)
  .to(panel.querySelector('.weekly-step__numeral'), { autoAlpha: 0.16, y: 0, duration: 0.18, ease: 'power3.out' }, chapterAt)
  .to(panel.querySelector('.weekly-step__content'), { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out' }, chapterAt)
  .to(innerRing, { scale: 1, autoAlpha: 1, duration: 0.18, ease: 'power3.out' }, chapterAt)
  .to(middleRing, { scale: 1, autoAlpha: 1, duration: 0.18, ease: 'power3.out' }, chapterAt + 0.14)
  .to(outerRing, { scale: 1, autoAlpha: 1, duration: 0.18, ease: 'power3.out' }, chapterAt + 0.28)
  .to(lens, {
    autoAlpha: 1,
    scale: 1,
    clipPath: 'circle(72% at 50% 50%)',
    duration: 0.24,
    ease: 'power3.out',
  }, imageAt)

if (index < panels.length - 1) {
  master.to(track, {
    x: () => -panels[0].offsetWidth * (index + 1),
    duration: 0.6,
    ease: 'power2.inOut',
  }, travelAt)
  master.to(spine, {
    scaleX: (index + 1) / (panels.length - 1),
    duration: 0.6,
    ease: 'power2.inOut',
  }, travelAt)
}
```

Extend the final hold and clean up:

```tsx
const finalImageEnd = CHAPTER_STARTS[2] + 0.72
master.to(
  stage,
  { opacity: 1, duration: CHAPTER_END - finalImageEnd, ease: 'none' },
  finalImageEnd,
)

return () => {
  root.classList.remove('weekly-journey--horizontal')
  master.scrollTrigger?.kill()
  master.kill()
  gsap.ticker.remove(tick)
  lenis.destroy()
}
```

- [ ] **Step 5: Run focused test and typecheck**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && npm run typecheck`

Expected: both exit 0.

---

### Task 4: Build responsive ring and lens styling

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.css`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: markup from `WeeklyStepVisual` and `--weekly-ring-*` variables.
- Produces: completed base vertical visuals and horizontal desktop/mobile positioning.

- [ ] **Step 1: Add and run the failing lens-layout test**

```js
test('keeps complete images inside responsive ring geometry', () => {
  assert.match(css, /\.weekly-step__image\s*\{[^}]*object-fit: contain/s)
  assert.match(css, /\.weekly-step__ring--outer\s*\{[^}]*inset: 0/s)
  assert.match(css, /\.weekly-step__ring--middle\s*\{[^}]*inset: 10%/s)
  assert.match(css, /\.weekly-step__ring--inner\s*\{[^}]*inset: 20%/s)
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?--weekly-visual-x: 50%/)
})
```

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the rectangular media CSS has not been replaced.

- [ ] **Step 2: Replace rectangular media styles with base lens styles**

```css
.weekly-step__visual {
  position: relative;
  z-index: 1;
  width: min(100%, 22rem);
  aspect-ratio: 1;
  margin: 0 0 2rem;
}

.weekly-step__ring {
  position: absolute;
  z-index: 0;
  box-sizing: border-box;
  border-radius: 50%;
}

.weekly-step__ring--outer { inset: 0; border: clamp(0.55rem, 1vw, 0.9rem) solid var(--weekly-ring-outer); }
.weekly-step__ring--middle { inset: 10%; border: clamp(0.5rem, 0.9vw, 0.8rem) solid var(--weekly-ring-middle); }
.weekly-step__ring--inner { inset: 20%; border: clamp(0.45rem, 0.8vw, 0.7rem) solid var(--weekly-ring-inner); }

.weekly-step__lens { position: absolute; inset: 0; z-index: 1; display: block; }
.weekly-step__image-blur {
  position: absolute;
  inset: 20%;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  object-fit: cover;
  filter: blur(12px);
  opacity: 0.42;
  transform: scale(1.12);
}
.weekly-step__image {
  position: absolute;
  inset: 18%;
  width: 64%;
  height: 64%;
  object-fit: contain;
  border: 1px solid rgba(245, 240, 231, 0.68);
  filter: drop-shadow(0 1rem 1.5rem rgba(23, 53, 42, 0.2));
}
```

- [ ] **Step 3: Add horizontal positioning**

Set the desktop spine, dot, numeral, and content to `52%`. Position `.weekly-step__visual` absolutely at `top: clamp(4.75rem, 9vh, 5.5rem)`, diameter `clamp(17rem, 25vw, 22rem)`, and `left: var(--weekly-visual-x)`. Set panel centers to `38%`, `62%`, and `42%`.

- [ ] **Step 4: Add mobile positioning**

Inside the existing motion-enabled mobile query, restore spine/dot/content to `46%`, set every panel’s `--weekly-visual-x: 50%`, set `top: clamp(3.75rem, 8svh, 5rem)`, and set diameter `min(70vw, 17rem)`.

- [ ] **Step 5: Run focused test and production checks**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`, `npm run lint`, `npm run typecheck`, and `npm run build`.

Expected: all exit 0.

---

### Task 5: Rendered motion and accessibility QA

**Files:**
- Modify if required by QA: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify if required by QA: `src/components/weekly/WeeklyJourneySections.css`
- Modify if required by QA: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: live `/weekly-lessons` page.
- Produces: verified desktop, mobile, reverse-scroll, and reduced-motion behavior.

- [ ] **Step 1: Run Browser-first QA**

Test flow: `/weekly-lessons` loads → Step 01 rings complete before image → track holds → travel to Steps 02 and 03 repeats sequence → reverse scroll reverses correctly → closing section appears.

Use Browser/IAB first. If its runtime fails, use Playwright because fallback is approved in this plan and record the exact failure.

- [ ] **Step 2: Capture required states**

At 1440×900 and 390×844 capture each chapter after rings complete and after image completes. At 390×844 reduced motion, capture the static vertical lens.

- [ ] **Step 3: Inspect visual fidelity**

Use `view_image` on source photographs and final screenshots in the same pass. Check full subject visibility, circle containment, ring contrast, fixed-wordmark clearance, copy clipping, hold timing, travel timing, reverse behavior, and palette continuity.

- [ ] **Step 4: Run fresh final verification**

Run: `node --test test/*.test.mjs`, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`, and `git status --short`.

Expected: tests/lint/typecheck/build/diff check exit 0. Git status shows only local working-tree changes; no commit, push, or deployment occurs.

# About StickySlideshow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scroll-driven, full-bleed 4-panel sticky slideshow for the About page that pins to the viewport and crossfades between panels as the user scrolls.

**Architecture:** A `<section>` acts as the ScrollTrigger trigger (tall enough to create scroll distance); inside it, a pinned `<div>` holds 4 absolutely-stacked panels. A single GSAP scrubbed timeline drives opacity + y-translate crossfades between panels and animates a vertical progress marker. In reduced-motion mode, all GSAP wiring is skipped and panels render as normal block elements in document flow.

**Tech Stack:** GSAP 3 + ScrollTrigger (already in project), React 19, TypeScript 6, CSS (no new dependencies).

## Global Constraints

- No new npm dependencies — use only packages already in `package.json`
- `npm run lint` and `npm run build` must pass after every task
- All placeholder copy uses `ph-line` / `ph-lines` CSS primitives already defined in `src/index.css`
- `prefers-reduced-motion` must be handled: no pinning, no animation, panels in normal flow
- Full-bleed breakout must not touch `src/layout/SiteLayout.tsx` or any global layout rules
- Image paths are verbatim: `aaron-palms-beach-1.jpg`, `aaron-playing-close-1.jpg`, `aaron-teaching-tree-1.jpg`, `aaron-portrait-1.jpeg`
- `About.tsx`: only the gallery `cp-section` is removed; everything else is untouched

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `src/components/about/StickySlideshow.css` | Create | All layout, breakout, panel, indicator, mobile, and reduced-motion styles |
| `src/components/about/StickySlideshow.tsx` | Create | Component logic: panel data, refs, `usePrefersReducedMotion`, GSAP wiring, JSX |
| `src/pages/About.tsx` | Modify | Remove gallery `cp-section`, import and render `StickySlideshow` |

---

## Task 1: CSS — `StickySlideshow.css`

**Files:**
- Create: `src/components/about/StickySlideshow.css`

**Interfaces:**
- Produces: all class names consumed by `StickySlideshow.tsx` in Task 2

- [ ] **Step 1: Create the CSS file**

Create `src/components/about/StickySlideshow.css` with this exact content:

```css
/* ── Full-bleed breakout ── */
/*
  left: 50% moves the element's left edge to the center of page-main.
  translateX(-50%) pulls it back by half the viewport, landing the left
  edge at viewport left. Works regardless of the parent's max-width.
*/
.sticky-slideshow {
  position: relative;
  left: 50%;
  width: 100vw;
  transform: translateX(-50%);
}

/* ── Pin container ── */

.sticky-slideshow__pin {
  position: relative;
  height: 100svh;
  overflow: hidden;
}

/* ── Panels — absolutely stacked ── */

.sticky-slideshow__panel {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 60% 40%;
}

.sticky-slideshow__image-col {
  position: relative;
  overflow: hidden;
}

.sticky-slideshow__image-col img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.sticky-slideshow__content-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2rem, 5vw, 5rem);
  background: #f5f0e7;
}

.sticky-slideshow__counter {
  margin: 0 0 1.25rem;
  color: rgba(31, 29, 24, 0.38);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sticky-slideshow__content-col .ph-lines {
  margin-bottom: 1rem;
}

.sticky-slideshow__content-col .ph-lines:last-child {
  margin-bottom: 0;
}

/* ── Progress indicator ── */

.sticky-slideshow__indicator {
  position: absolute;
  right: clamp(1.25rem, 2.5vw, 2rem);
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
}

.sticky-slideshow__indicator-track {
  position: relative;
  width: 2px;
  height: 6rem;
  background: rgba(31, 29, 24, 0.12);
}

.sticky-slideshow__indicator-marker {
  position: absolute;
  top: 0;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(31, 29, 24, 0.55);
  transform: translate(-50%, -50%);
}

/* ── Reduced motion — panels in normal flow ── */

.sticky-slideshow--reduced .sticky-slideshow__pin {
  height: auto;
  overflow: visible;
}

.sticky-slideshow--reduced .sticky-slideshow__panel {
  position: relative;
  height: 100svh;
}

.sticky-slideshow--reduced .sticky-slideshow__indicator {
  display: none;
}

/* ── Mobile ── */

@media (max-width: 760px) {
  /* Image fills the full panel; content floats over it at the bottom */
  .sticky-slideshow__panel {
    display: block;
  }

  .sticky-slideshow__image-col {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .sticky-slideshow__content-col {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    justify-content: flex-end;
    background: linear-gradient(to top, rgba(31, 29, 24, 0.6) 0%, transparent 100%);
    padding: clamp(3rem, 8vw, 5rem) clamp(1.25rem, 5vw, 2rem) clamp(1.5rem, 5vw, 2.5rem);
  }

  .sticky-slideshow__content-col .ph-line {
    background: rgba(245, 240, 231, 0.4);
  }

  .sticky-slideshow__counter {
    color: rgba(245, 240, 231, 0.7);
  }

  .sticky-slideshow__indicator {
    display: none;
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0. No errors about missing files.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/StickySlideshow.css
git commit -m "feat: add StickySlideshow CSS"
```

---

## Task 2: Static component scaffold — `StickySlideshow.tsx`

**Files:**
- Create: `src/components/about/StickySlideshow.tsx`

**Interfaces:**
- Consumes: `StickySlideshow.css` (Task 1), `ph-line` / `ph-lines` from `src/index.css`, image assets under `assets/images/`
- Produces: `export default function StickySlideshow()` — a React component with no required props

This task creates the full component **without** GSAP. In this state, the animated mode renders all 4 panels stacked (visually broken but build-valid); the reduced-motion mode renders panels correctly in flow. Task 3 adds the GSAP wiring that makes the animated mode work.

- [ ] **Step 1: Create the component file**

Create `src/components/about/StickySlideshow.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import './StickySlideshow.css'

const img1 = new URL('../../../assets/images/aaron-palms-beach-1.jpg', import.meta.url).href
const img2 = new URL('../../../assets/images/aaron-playing-close-1.jpg', import.meta.url).href
const img3 = new URL('../../../assets/images/aaron-teaching-tree-1.jpg', import.meta.url).href
const img4 = new URL('../../../assets/images/aaron-portrait-1.jpeg', import.meta.url).href

type PanelData = {
  id: string
  counter: string
  src: string
}

const PANELS: PanelData[] = [
  { id: 'palms-beach', counter: '01', src: img1 },
  { id: 'playing-close', counter: '02', src: img2 },
  { id: 'teaching-tree', counter: '03', src: img3 },
  { id: 'portrait', counter: '04', src: img4 },
]

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    setPrefersReducedMotion(motionQuery.matches)

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches)
    }

    motionQuery.addEventListener('change', handleChange)

    return () => {
      motionQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

export default function StickySlideshow() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  const markerRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={sectionRef}
      className={`sticky-slideshow${prefersReducedMotion ? ' sticky-slideshow--reduced' : ''}`}
      aria-label="About Aaron slideshow"
    >
      <div ref={pinRef} className="sticky-slideshow__pin">
        {PANELS.map((panel, i) => (
          <div
            key={panel.id}
            className="sticky-slideshow__panel"
            ref={el => {
              panelRefs.current[i] = el
            }}
          >
            <div className="sticky-slideshow__image-col">
              <img
                src={panel.src}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
            <div className="sticky-slideshow__content-col">
              <p className="sticky-slideshow__counter">{panel.counter}</p>
              <div className="ph-lines">
                <div className="ph-line ph-line--long" />
                <div className="ph-line ph-line--med" />
              </div>
              <div className="ph-lines">
                <div className="ph-line ph-line--long" />
                <div className="ph-line ph-line--long" />
                <div className="ph-line ph-line--med" />
              </div>
            </div>
          </div>
        ))}

        <div className="sticky-slideshow__indicator" aria-hidden="true">
          <div className="sticky-slideshow__indicator-track">
            <div ref={markerRef} className="sticky-slideshow__indicator-marker" />
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify lint, typecheck, and build**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all three exit 0 with no errors or warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/StickySlideshow.tsx
git commit -m "feat: scaffold StickySlideshow static component"
```

---

## Task 3: GSAP scroll animation

**Files:**
- Modify: `src/components/about/StickySlideshow.tsx`

**Interfaces:**
- Consumes: `sectionRef`, `pinRef`, `panelRefs`, `markerRef` from Task 2; `prefersReducedMotion` from `usePrefersReducedMotion`
- Produces: scrubbed ScrollTrigger animation; no change to the exported API

**How the timeline works:**

```
scroll progress: 0 ──────────────────────────────────── 1
                 │ hold 1 │ 1→2 │ hold 2 │ 2→3 │ hold 3 │ 3→4 │ hold 4 │
HOLD = 0.75, FADE = 0.25
total duration = 4 × 0.75 + 3 × 0.25 = 3.75
marker top: 0% ──────────────────────────────────────── 100%
```

Each transition: outgoing panel `opacity 1→0`, incoming panel `opacity 0→1` + `y 12→0`, both over `FADE` duration, starting at the same time (`'<'` position offset).

- [ ] **Step 1: Add GSAP imports and plugin registration at module level**

Open `src/components/about/StickySlideshow.tsx`. Add these imports directly below the existing `import { useEffect, useRef, useState } from 'react'` line, and add `useLayoutEffect` to the React import:

```tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './StickySlideshow.css'

gsap.registerPlugin(ScrollTrigger)
```

- [ ] **Step 2: Add the `useLayoutEffect` animation block**

Inside the `StickySlideshow` function body, add this block immediately after the existing ref declarations and before the `return` statement:

```tsx
  useLayoutEffect(() => {
    if (prefersReducedMotion) return

    const section = sectionRef.current
    const pin = pinRef.current
    const marker = markerRef.current
    const panels = panelRefs.current

    if (!section || !pin || !marker || panels.some(p => p === null)) return

    const safePanels = panels as HTMLDivElement[]

    const ctx = gsap.context(() => {
      // Set initial opacity/position states before any scroll
      gsap.set(safePanels[0], { opacity: 1, y: 0 })
      gsap.set(safePanels.slice(1), { opacity: 0, y: 12 })

      const HOLD = 0.75
      const FADE = 0.25

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=300%',
          scrub: 1,
          pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Hold panel 1
      tl.to({}, { duration: HOLD })

      // Transition 1 → 2
      tl.to(safePanels[0], { opacity: 0, duration: FADE, ease: 'power1.inOut' })
        .to(safePanels[1], { opacity: 1, y: 0, duration: FADE, ease: 'power1.inOut' }, '<')

      // Hold panel 2
      tl.to({}, { duration: HOLD })

      // Transition 2 → 3
      tl.to(safePanels[1], { opacity: 0, duration: FADE, ease: 'power1.inOut' })
        .to(safePanels[2], { opacity: 1, y: 0, duration: FADE, ease: 'power1.inOut' }, '<')

      // Hold panel 3
      tl.to({}, { duration: HOLD })

      // Transition 3 → 4
      tl.to(safePanels[2], { opacity: 0, duration: FADE, ease: 'power1.inOut' })
        .to(safePanels[3], { opacity: 1, y: 0, duration: FADE, ease: 'power1.inOut' }, '<')

      // Hold panel 4
      tl.to({}, { duration: HOLD })

      // Marker travels top: 0% → 100% continuously across the full timeline.
      // tl.duration() is computed after all panel tweens are added (= 3.75).
      // Inserting at position 0 with that duration spans the entire timeline.
      tl.to(marker, { top: '100%', ease: 'none', duration: tl.duration() }, 0)
    }, section)

    return () => ctx.revert()
  }, [prefersReducedMotion])
```

- [ ] **Step 3: Verify lint, typecheck, and build**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all three exit 0 with no errors or warnings.

- [ ] **Step 4: Visual smoke test**

```bash
npm run dev
```

Navigate to `/about`. Scroll past the Teaching Approach section. Confirm:

- The section pins to the viewport
- Panel 1 (palms beach image, counter "01") is visible on entry
- Scrolling crossfades to panel 2, then 3, then 4 — each one drifts in slightly from below
- The vertical marker on the right edge travels downward as panels progress
- After panel 4, scrolling unpins and the page continues to the CTA

In a browser tab with `prefers-reduced-motion: reduce` enabled (DevTools → Rendering → Emulate CSS media feature):

- All 4 panels stack vertically, each full viewport height
- No pinning, no animation
- Indicator is hidden

- [ ] **Step 5: Commit**

```bash
git add src/components/about/StickySlideshow.tsx
git commit -m "feat: add GSAP scroll animation to StickySlideshow"
```

---

## Task 4: About.tsx integration

**Files:**
- Modify: `src/pages/About.tsx`

**Interfaces:**
- Consumes: `export default function StickySlideshow()` from `src/components/about/StickySlideshow.tsx`

**Current About.tsx structure:**
1. `cp-section` — About intro (portrait placeholder + two-col + headline) — **keep untouched**
2. `cp-section` — Teaching Approach — **keep untouched**
3. `cp-section` — Gallery (3 `ph-block` slots) — **remove entirely**
4. `cp-cta-section` — CTA — **keep untouched**

**Target About.tsx structure:**
1. `cp-section` — About intro — untouched
2. `cp-section` — Teaching Approach — untouched
3. `<StickySlideshow />` — new, in place of gallery
4. `cp-cta-section` — CTA — untouched

- [ ] **Step 1: Update About.tsx**

Replace the full contents of `src/pages/About.tsx` with:

```tsx
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import StickySlideshow from '../components/about/StickySlideshow'

export default function About() {
  useDocumentTitle('About Aaron | Maui Lessons')

  return (
    <>
      <section className="cp-section">
        <p className="cp-section-label">About</p>
        <div className="cp-two-col cp-two-col--wide-right">
          <div className="ph-block" style={{ height: 400 }}>Portrait</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>[Aaron's name / headline]</h1>
            <div className="ph-lines">
              <div className="ph-line ph-line--long" />
              <div className="ph-line ph-line--long" />
              <div className="ph-line ph-line--med" />
            </div>
          </div>
        </div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">Teaching Approach</p>
        <h2 className="cp-heading">[Section heading]</h2>
        <div className="cp-two-col">
          <div className="ph-lines">
            <div className="ph-line ph-line--long" />
            <div className="ph-line ph-line--long" />
            <div className="ph-line ph-line--med" />
          </div>
          <div className="ph-lines">
            <div className="ph-line ph-line--long" />
            <div className="ph-line ph-line--med" />
            <div className="ph-line ph-line--short" />
          </div>
        </div>
      </section>

      <StickySlideshow />

      <div className="cp-cta-section">
        <h2 className="cp-heading">[Call to action heading]</h2>
        <Link to="/book" className="cp-button">Book a Lesson</Link>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify lint, typecheck, and build**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all three exit 0 with no errors or warnings.

- [ ] **Step 3: Visual verification**

```bash
npm run dev
```

Navigate to `/about`. Confirm:

- Intro section (portrait placeholder + headline) is intact at the top
- Teaching Approach section is intact below it
- `StickySlideshow` appears below Teaching Approach, full-bleed (reaches both edges of the viewport)
- CTA appears below the slideshow after the pin releases
- No horizontal scrollbar

- [ ] **Step 4: Commit**

```bash
git add src/pages/About.tsx
git commit -m "feat: integrate StickySlideshow into About page"
```

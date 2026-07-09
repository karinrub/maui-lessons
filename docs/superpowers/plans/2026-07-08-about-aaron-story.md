# About Aaron Story — Horizontal Scroll Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `About.tsx` page with a horizontal-scroll, four-chapter story about Aaron built from real bio copy, using a GSAP horizontal pin/scrub mechanic and a new blur-to-focus text reveal idiom.

**Architecture:** One new component, `AaronStorySections`, owns the whole page body. It renders a pinned horizontal track of four `<article>` panels. `useLayoutEffect` + `gsap.matchMedia` wires: (a) a horizontal `xPercent` scrub tween on the track keyed to vertical scroll progress, driven by `ScrollTrigger`, active only at `min-width: 761px` with no-reduced-motion; (b) per-panel blur-to-focus text reveals scrubbed to each panel's approach into center; (c) a reduced-motion / mobile fallback that renders the same DOM as a plain vertical stack with simple fade-up reveals instead of pin/scrub.

**Tech Stack:** React 19 + TypeScript, GSAP 3 + `ScrollTrigger`, CSS (no new dependencies). Pattern reference: `src/components/tourist-lessons/VacationStorySections.tsx` (GSAP setup, `matchMedia`, reveal data-attributes) and `src/components/home/OpeningScene.tsx` (pin mechanics, reduced-motion split).

## Global Constraints

- No new npm dependencies — use GSAP + ScrollTrigger only (already installed).
- Sage color tokens: `--home-sage: #b8c8a0`, `--home-sage-ink: #17352a` (defined in `src/index.css`) — reuse these, do not hardcode new sage hex values except the existing gradient stops pattern (`#c2d0ab` / `#a7b98d`) already used in `VacationStorySections.css` for the sage panel gradient, which this page's sage panels should match for visual consistency.
- Mobile breakpoint: `max-width: 760px` (site convention, see `src/index.css`).
- Images: `assets/images/aaron-portrait-1.jpeg`, `assets/images/aaron-onlyMe.jpg`, `assets/images/aaron-teaching-tree-1.jpg` — exact filenames, confirmed on disk. Import via `new URL('../../../assets/images/<file>', import.meta.url).href` (matches `VacationStorySections.tsx` import pattern, three `../` levels up from `src/components/about/`).
- Copy sourced only from `inspo/aboutaaron.md`. Do not invent biographical facts.
- No unit test framework exists in this repo (`package.json` has no vitest/jest). Verification = `npm run build`, `npm run lint`, and manual browser check via the preview tool (per project CLAUDE.md).
- `prefers-reduced-motion: reduce` must fully bypass pin/scrub/blur — content visible and readable with no JS-driven motion blocking it.
- `About.tsx`'s existing `about-top-bush` decorative block (lines 13-15 of current file) is unrelated shipped work — keep it untouched, do not fold it into `AaronStorySections`.

---

## Task 1: Static panel markup + layout CSS (no motion)

**Files:**
- Create: `src/components/about/AaronStorySections.tsx`
- Create: `src/components/about/AaronStorySections.css`
- Modify: `src/pages/About.tsx`

**Interfaces:**
- Produces: default-exported React component `AaronStorySections` (no props), rendering a root `<div className="aaron-story" ref={rootRef}>` containing `.aaron-story__track` > four `.aaron-story__panel` elements (`data-panel-index="0..3"`), each with class modifier `aaron-story__panel--sage` on panels 2 and 4 (index 1 and 3).
- Consumes: nothing (leaf component, mirrors `VacationStorySections`).

This task builds the DOM and static (non-animated) CSS layout only — horizontal scroll track sized correctly, sage/off-white alternating backgrounds, images in place, mobile vertical stack via media query. Motion is added in later tasks.

- [ ] **Step 1: Write `AaronStorySections.tsx` with static panel content**

```tsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './AaronStorySections.css'

const portraitImage = new URL('../../../assets/images/aaron-portrait-1.jpeg', import.meta.url).href
const teachingTreeImage = new URL('../../../assets/images/aaron-teaching-tree-1.jpg', import.meta.url).href
const onlyMeImage = new URL('../../../assets/images/aaron-onlyMe.jpg', import.meta.url).href

const journeyBeats = [
  {
    id: 'illinois',
    numeral: '01',
    title: 'Illinois State University, 1999',
    body: 'Aaron picks up the guitar, enrolls in musical studies, and starts his first band — the beginning of a lifelong love of live performance.',
  },
  {
    id: 'asheville',
    numeral: '02',
    title: 'Asheville, North Carolina',
    body: 'At 23, private lessons in music theory and song development lead him to the mandolin and banjo, playing bluegrass style.',
  },
  {
    id: 'california',
    numeral: '03',
    title: 'College of San Mateo, California',
    body: 'At 24, he studies sound creation — sampling and synthesis, electronic music, and Afro-Latin percussion ensemble.',
  },
] as const

export default function AaronStorySections() {
  const rootRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={rootRef} className="aaron-story">
      <div className="aaron-story__track">
        {/* ── Chapter 1: Meet Aaron ── */}
        <article className="aaron-story__panel" data-panel-index="0" aria-label="Meet Aaron">
          <div className="aaron-story__panel-media">
            <img
              src={portraitImage}
              alt="Portrait of Aaron Grzanich holding a ukulele"
              width={900}
              height={1125}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="aaron-story__panel-copy">
            <p className="aaron-story__eyebrow">Your instructor</p>
            <h2 className="aaron-story__heading">Meet Aaron</h2>
            <p className="aaron-story__body">
              His goal is to help students feel comfortable with the ukulele, with a no-pressure
              approach — patient, unhurried, and focused on the joy of playing.
            </p>
          </div>
        </article>

        {/* ── Chapter 2: The mainland years ── */}
        <article
          className="aaron-story__panel aaron-story__panel--sage"
          data-panel-index="1"
          aria-label="Twenty-two years chasing music"
        >
          <div className="aaron-story__panel-copy aaron-story__panel-copy--wide">
            <h2 className="aaron-story__heading">Twenty-two years chasing music</h2>
            <ol className="aaron-story__beats">
              {journeyBeats.map((beat) => (
                <li key={beat.id} className="aaron-story__beat">
                  <span className="aaron-story__beat-numeral" aria-hidden="true">
                    {beat.numeral}
                  </span>
                  <h3 className="aaron-story__beat-title">{beat.title}</h3>
                  <p className="aaron-story__beat-body">{beat.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </article>

        {/* ── Chapter 3: The turning point ── */}
        <article
          className="aaron-story__panel"
          data-panel-index="2"
          aria-label="Then he found the ukulele"
        >
          <div className="aaron-story__panel-media">
            <img
              src={teachingTreeImage}
              alt="Aaron teaching a ukulele lesson outdoors under a tree"
              width={1000}
              height={750}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="aaron-story__panel-copy">
            <p className="aaron-story__eyebrow">Fort Collins, Colorado — age 35</p>
            <h2 className="aaron-story__heading">Then he found the ukulele</h2>
            <p className="aaron-story__body">
              He joins The Music District, a nonprofit music campus, working alongside industry
              professionals in workshops, production, and events. It's here he first studies the
              ukulele.
            </p>
            <p className="aaron-story__pull-line">His primary instrument and focus ever since.</p>
          </div>
        </article>

        {/* ── Chapter 4: Home in Maui ── */}
        <article
          className="aaron-story__panel aaron-story__panel--sage"
          data-panel-index="3"
          aria-label="Home in Maui"
        >
          <div className="aaron-story__panel-media">
            <img
              src={onlyMeImage}
              alt="Aaron Grzanich on Maui"
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="aaron-story__panel-copy">
            <p className="aaron-story__eyebrow">2023 — present</p>
            <h2 className="aaron-story__heading">Home in Maui</h2>
            <p className="aaron-story__body">
              Aaron moves to Maui to devote himself to traditional Hawaiian style and other ukulele
              music, teaching beginners of any age with the same patient, no-pressure approach. You
              can also catch him playing at Keolahou Church on Thursday nights.
            </p>
            <Link to="/book" className="aaron-story__cta">
              Book a Lesson
              <span className="aaron-story__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `AaronStorySections.css` — static layout, no animation**

```css
/* ── Aaron story: horizontal-scroll chapter sequence ──
   Track holds 4 full-viewport panels side by side. On desktop with motion
   allowed, Task 3 pins this section and scrubs the track horizontally. Here
   we lay out the panels so the page is fully readable with zero JS. */

.aaron-story {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--surface, #f7f3ea);
}

.aaron-story__track {
  display: flex;
  width: 100%;
  height: 100vh;
}

.aaron-story__panel {
  flex: 0 0 100vw;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  padding: clamp(2rem, 6vw, 5rem);
  box-sizing: border-box;
  background: #f7f3ea;
}

.aaron-story__panel--sage {
  background: linear-gradient(164deg, #c2d0ab 0%, var(--home-sage) 48%, #a7b98d 100%);
  color: var(--home-sage-ink);
}

/* Panel 2 has no media column — copy spans full width. */
.aaron-story__panel[data-panel-index='1'] {
  grid-template-columns: 1fr;
}

.aaron-story__panel-media {
  width: 100%;
  height: min(70vh, 640px);
  border-radius: 24px;
  overflow: hidden;
}

.aaron-story__panel-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.aaron-story__panel-copy {
  max-width: 34rem;
}

.aaron-story__panel-copy--wide {
  max-width: 52rem;
  margin: 0 auto;
}

.aaron-story__eyebrow {
  font: 500 0.85rem/1.4 'Inter', system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
  margin: 0 0 0.75rem;
}

.aaron-story__heading {
  font: 500 clamp(2rem, 4vw, 3.25rem)/1.1 'Fraunces', serif;
  font-style: italic;
  margin: 0 0 1.25rem;
}

.aaron-story__body {
  font: 400 1.05rem/1.6 'Inter', system-ui, sans-serif;
  margin: 0 0 1rem;
}

.aaron-story__pull-line {
  font: 400 1.25rem/1.4 'Cormorant Garamond', serif;
  font-style: italic;
  margin: 1.5rem 0 0;
}

.aaron-story__beats {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1.5rem, 3vw, 3rem);
}

.aaron-story__beat {
  display: flex;
  flex-direction: column;
}

.aaron-story__beat-numeral {
  font: 400 0.9rem/1 'Inter', system-ui, sans-serif;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.aaron-story__beat-title {
  font: 500 1.15rem/1.3 'Fraunces', serif;
  margin: 0 0 0.5rem;
}

.aaron-story__beat-body {
  font: 400 0.95rem/1.55 'Inter', system-ui, sans-serif;
  margin: 0;
}

.aaron-story__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: var(--home-sage-ink);
  color: #f7f3ea;
  font: 500 1rem/1 'Inter', system-ui, sans-serif;
  text-decoration: none;
}

.aaron-story__cta-arrow {
  transition: transform 0.2s ease;
}

.aaron-story__cta:hover .aaron-story__cta-arrow {
  transform: translateX(4px);
}

/* ── Mobile: vertical stack, no horizontal scroll ── */
@media (max-width: 760px) {
  .aaron-story__track {
    flex-direction: column;
    height: auto;
  }

  .aaron-story__panel {
    flex-basis: auto;
    width: 100%;
    height: auto;
    min-height: 100vh;
    grid-template-columns: 1fr;
    padding: 3rem 1.5rem;
  }

  .aaron-story__panel[data-panel-index='1'] {
    grid-template-columns: 1fr;
  }

  .aaron-story__beats {
    grid-template-columns: 1fr;
  }

  .aaron-story__panel-media {
    height: 50vh;
  }

  .aaron-story__panel-copy,
  .aaron-story__panel-copy--wide {
    max-width: none;
  }
}
```

- [ ] **Step 3: Rewrite `About.tsx` to use the new component**

Replace the full file content:

```tsx
import useDocumentTitle from '../hooks/useDocumentTitle'
import AaronStorySections from '../components/about/AaronStorySections'
import './About.css'

const topBushImage = new URL('../../assets/images/no_bacground_bush_2.png', import.meta.url).href

export default function About() {
  useDocumentTitle('About Aaron | Maui Lessons')

  return (
    <>
      <div className="about-top-bush" aria-hidden="true">
        <img src={topBushImage} alt="" />
      </div>

      <AaronStorySections />
    </>
  )
}
```

- [ ] **Step 4: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: both pass with no errors. `tsc -b` will fail loudly if the `journeyBeats` types or JSX are malformed — fix any reported errors before proceeding.

- [ ] **Step 5: Visual check via preview tool**

Start the dev server preview, navigate to `/about`, confirm: four panels render in DOM (desktop shows them side-by-side pre-motion since no pin/overflow-hidden scroll trickery yet — this is expected, motion comes in Task 2), sage panels 2 and 4 show the green gradient, all three images load, CTA link present in panel 4, no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/about/AaronStorySections.tsx src/components/about/AaronStorySections.css src/pages/About.tsx
git commit -m "feat(about): static four-chapter Aaron story layout"
```

---

## Task 2: Horizontal pin/scrub mechanic + reduced-motion/mobile split

**Files:**
- Modify: `src/components/about/AaronStorySections.tsx`
- Modify: `src/components/about/AaronStorySections.css`

**Interfaces:**
- Consumes: DOM structure from Task 1 (`.aaron-story`, `.aaron-story__track`, `.aaron-story__panel` with `data-panel-index`).
- Produces: nothing new consumed by later tasks structurally, but establishes `gsap.matchMedia` breakpoint groups (`'(prefers-reduced-motion: no-preference) and (min-width: 761px)'` for pin/scrub, unconditional group for reduced-motion-safe reveals) that Task 3 adds its own tweens into, inside the same `useLayoutEffect`.

This task makes the horizontal scroll actually pin and scrub. `ScrollTrigger.pin` fixes `.aaron-story` in the viewport while the vertical scroll distance (`end: '+=<n>%'`) is consumed to drive `xPercent` on `.aaron-story__track`.

- [ ] **Step 1: Register ScrollTrigger and add the pin/scrub effect**

In `AaronStorySections.tsx`, add imports and the effect:

```tsx
import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './AaronStorySections.css'

gsap.registerPlugin(ScrollTrigger)
```

Add inside the component, before the `return`:

```tsx
  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current

    if (!root || !track) {
      return
    }

    const mm = gsap.matchMedia(root)

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
      const panels = gsap.utils.toArray<HTMLElement>('.aaron-story__panel', root)
      const scrollDistance = track.scrollWidth - window.innerWidth

      const horizontalTween = gsap.to(track, {
        x: () => -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        horizontalTween.scrollTrigger?.kill()
        horizontalTween.kill()
      }
    })

    return () => {
      mm.revert()
    }
  }, [])
```

Add the ref and wire it to the track element:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
```

Change the track element to:

```tsx
      <div ref={trackRef} className="aaron-story__track">
```

- [ ] **Step 2: Update CSS so the pinned/scrubbed state has room to move**

The pin needs `.aaron-story` to have no fixed height constraint beyond its content — `ScrollTrigger.pin` handles the pinning itself, but `.aaron-story__track` must be wide enough to hold all panels side by side even though `.aaron-story` itself stays `100vh`. Update:

```css
.aaron-story {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--surface, #f7f3ea);
}

.aaron-story__track {
  display: flex;
  width: max-content;
  height: 100vh;
  will-change: transform;
}
```

(Removes the old fixed `height: 100vh` duplicate rule from `.aaron-story__track` — replace, don't duplicate — and changes `width: 100%` to `width: max-content` so the flex track actually extends past the viewport for the horizontal scrub to have distance to travel.)

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run lint`
Expected: pass.

- [ ] **Step 4: Visual check — desktop pin/scrub**

In preview tool, resize to desktop (1280x800), navigate to `/about`, scroll down through the page. Confirm: the About story section pins in place while scrolling, panels slide horizontally left as you scroll down, all four panels are reachable, page unpins and continues to footer after the last panel. Check `preview_console_logs` for errors.

- [ ] **Step 5: Visual check — reduced motion**

Use `preview_resize` with `colorScheme` unrelated — instead use `preview_eval` to check behavior: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` isn't directly settable via that tool, so instead verify via code review that the `mm.add` selector correctly excludes reduced-motion (already gated by `(prefers-reduced-motion: no-preference)` in the media query string — confirm no `ScrollTrigger`/pin logic runs outside that `mm.add` block by re-reading the diff).

- [ ] **Step 6: Visual check — mobile**

`preview_resize` to `mobile` preset (375x812), navigate to `/about`. Confirm: no horizontal pin/scrub happens (the `min-width: 761px` condition excludes it), panels render as a vertical stack per the Task 1 mobile CSS, page scrolls normally.

- [ ] **Step 7: Commit**

```bash
git add src/components/about/AaronStorySections.tsx src/components/about/AaronStorySections.css
git commit -m "feat(about): horizontal pin/scrub for chapter track"
```

---

## Task 3: Blur-to-focus text reveal + image scale-settle

**Files:**
- Modify: `src/components/about/AaronStorySections.tsx`
- Modify: `src/components/about/AaronStorySections.css`

**Interfaces:**
- Consumes: `panels` array and `mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', ...)` block from Task 2 — the blur-to-focus tweens are added inside that same callback, scoped per panel via `ScrollTrigger.containerAnimation` pointing at the horizontal tween.
- Produces: nothing consumed by later tasks (final animation layer).

Each panel's `.aaron-story__panel-copy` block starts blurred/scaled/faded and sharpens as the horizontal scrub carries that panel toward center. Because the panels move horizontally under a vertical scrollbar, the reveal `ScrollTrigger` for each panel must use `containerAnimation: horizontalTween` so its `start`/`end` are measured along the horizontal track rather than the page's vertical scroll.

- [ ] **Step 1: Add CSS starting state for blur-to-focus targets**

Append to `AaronStorySections.css`:

```css
.aaron-story__reveal {
  filter: blur(14px);
  opacity: 0;
  transform: scale(1.06);
}

.aaron-story__panel-media img {
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .aaron-story__reveal {
    filter: none;
    opacity: 1;
    transform: none;
  }

  .aaron-story__panel-media img {
    transform: none;
  }
}
```

- [ ] **Step 2: Mark the reveal targets in JSX**

Add `aaron-story__reveal` class to each panel's copy wrapper. Update each `<div className="aaron-story__panel-copy">` (and the `--wide` variant) to also include `aaron-story__reveal`, e.g.:

```tsx
<div className="aaron-story__panel-copy aaron-story__reveal">
```

```tsx
<div className="aaron-story__panel-copy aaron-story__panel-copy--wide aaron-story__reveal">
```

(Four occurrences total — one per panel.)

- [ ] **Step 3: Capture the horizontal tween and add per-panel scrub reveals**

In the `mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', ...)` callback from Task 2, after creating `horizontalTween`, add:

```tsx
      panels.forEach((panel) => {
        const revealTarget = panel.querySelector<HTMLElement>('.aaron-story__reveal')
        const image = panel.querySelector<HTMLImageElement>('.aaron-story__panel-media img')

        if (revealTarget) {
          gsap.fromTo(
            revealTarget,
            { filter: 'blur(14px)', autoAlpha: 0, scale: 1.06 },
            {
              filter: 'blur(0px)',
              autoAlpha: 1,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 75%',
                end: 'left 25%',
                scrub: true,
              },
            },
          )
        }

        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.08 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 90%',
                end: 'left 10%',
                scrub: true,
              },
            },
          )
        }
      })
```

Note: `panels` and `horizontalTween` are already in scope from Task 2's Step 1 — this code goes directly after the `horizontalTween` declaration and before the `return () => { horizontalTween.scrollTrigger?.kill(); ... }` cleanup line. Update that cleanup to also kill the new triggers:

```tsx
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        horizontalTween.kill()
      }
```

- [ ] **Step 4: Add a simple non-scrubbed fallback reveal for reduced-motion/mobile**

Outside the `min-width: 761px` matchMedia group (so it applies whenever motion is allowed, including mobile), add a second `mm.add` block for a lightweight fade-up — this keeps mobile/tablet from being fully static while avoiding the horizontal-scrub-specific mechanics:

```tsx
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.aaron-story__reveal', root),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.aaron-story__reveal',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          stagger: 0.1,
        },
      )
    })
```

Place this `mm.add` call before the `min-width: 761px` one. Since `gsap.matchMedia` groups are independent, on desktop both this and the horizontal-scrub group will attempt to animate `.aaron-story__reveal` — to avoid double-animating, scope this fallback to mobile only by changing its query to `'(prefers-reduced-motion: no-preference) and (max-width: 760px)'`.

- [ ] **Step 5: Verify build**

Run: `npm run build && npm run lint`
Expected: pass.

- [ ] **Step 6: Visual check — desktop blur-to-focus**

In preview tool at desktop size, scroll through `/about` slowly. Confirm: each panel's text starts blurred and scales/sharpens into focus as it approaches center, image scale-settles at the same time, scrolling backward reverses the blur (text re-blurs going the other direction — confirms `scrub: true` behavior, not a play-once trigger). Check `preview_console_logs` for errors, especially GSAP warnings about missing `containerAnimation` targets.

- [ ] **Step 7: Visual check — mobile fallback**

At mobile viewport, scroll `/about`. Confirm: text fades up into place once per panel (no blur, no horizontal motion), no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/about/AaronStorySections.tsx src/components/about/AaronStorySections.css
git commit -m "feat(about): blur-to-focus scrub reveal for chapter text and images"
```

---

## Task 4: Cleanup pass — old placeholder page removal check + full regression pass

**Files:**
- Review only (no new files expected, but modify `src/pages/About.css` if dead placeholder-specific rules are found).

**Interfaces:** None — verification task.

- [ ] **Step 1: Confirm no other file references the removed placeholder markup**

Run: `grep -rn "cp-section\|ph-block\|ph-lines\|ph-line" src/pages/About.tsx`
Expected: no output (About.tsx no longer uses these classes — Task 1 Step 3 already rewrote the file).

- [ ] **Step 2: Check for now-unused CSS in `About.css`**

Run: `cat src/pages/About.css 2>/dev/null || echo "no dedicated About.css — check src/index.css cp-* rules"`

If `About.css` exists and contains rules exclusively for the removed gallery/portrait placeholder blocks that no other page uses, note them but do not delete — `cp-section`, `ph-block`, etc. are shared primitives used by other placeholder pages (FAQ, Book, WeeklyLessons, TouristLessons pre-redesign). Confirm this with:

Run: `grep -rln "cp-section\|ph-block" src/pages/*.tsx`

Expected: other page files still appear (e.g. `FAQ.tsx`, `Book.tsx`, `WeeklyLessons.tsx`) — this confirms the shared CSS must stay untouched.

- [ ] **Step 3: Full build + lint pass**

Run: `npm run build && npm run lint && npm run typecheck`
Expected: all three pass with no errors or warnings.

- [ ] **Step 4: Full visual regression — desktop and mobile**

In preview tool:
1. Desktop (1280x800): load `/`, click through nav to `/about`, scroll full page top to bottom, confirm pin/scrub/blur-focus all work, confirm CTA link navigates to `/book`, confirm footer renders after the story section.
2. Mobile (375x812): repeat, confirm vertical stack, no horizontal scroll trap, all copy readable.
3. Check `preview_network` for any failed image loads (404s on the three image imports).
4. Check `preview_console_logs` level `error` — expect empty.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore(about): verify build/lint/typecheck pass for Aaron story page" --allow-empty
```

(Use `--allow-empty` only if Steps 1-4 found nothing to change — otherwise commit the actual fixes with a descriptive message instead.)

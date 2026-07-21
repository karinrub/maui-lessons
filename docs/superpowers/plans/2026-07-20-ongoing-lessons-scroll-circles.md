# Ongoing Lessons Scroll Circles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Ongoing Lessons trust strip with shared sage surfaces, add the approved two-photo hero collage, and make “Your First Month” a reversible scroll-driven horizontal circle story.

**Architecture:** `WeeklyJourneySections` keeps the content and animation ownership in one route-scoped component. A GSAP `matchMedia` block creates a pinned, scrubbed desktop timeline using explicit React refs; its cleanup reverts every transform and trigger. CSS supplies the static content-first mobile and reduced-motion layout, plus the shared sage visual system.

**Tech Stack:** React 19, TypeScript, GSAP 3 + ScrollTrigger, CSS, Node test runner, Vite.

## Global Constraints

- Use `--home-sage` and `--home-sage-ink`; remove the local `--weekly-sage` token.
- Use `aaron-teaching-2.jpg` and `aaron-weekly-2.jpg` in the hero collage.
- Remove the “Private lessons / Ukulele & guitar / Kihei / Wailea / From $35” strip and its markup.
- Pin and horizontally translate only at `min-width: 861px` with `prefers-reduced-motion: no-preference`.
- Every scroll-linked tween uses `ScrollTrigger.scrub`, so reverse scrolling restores the previous visual state.
- Keep first-month content in the DOM as an ordered list; mobile/reduced-motion layouts remain fully visible without animation.

---

### Task 1: Lock the approved page contract with a failing regression test

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: source text from `WeeklyJourneySections.tsx` and `WeeklyJourneySections.css`.
- Produces: executable assertions describing the hero assets, absent trust strip, reversible scroll setup, and non-animated fallback.

- [ ] **Step 1: Replace the legacy trust-strip assertions and add the scroll-story assertions**

```js
test('renders the approved conversion-first hero collage without the trust strip', () => {
  assert.match(tsx, /A rhythm, not a routine\./)
  assert.match(tsx, /aaron-teaching-2\.jpg/)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.match(tsx, /weekly-redesign__hero-image--primary/)
  assert.match(tsx, /weekly-redesign__hero-image--secondary/)
  assert.doesNotMatch(tsx, /Private lessons/)
  assert.doesNotMatch(tsx, /weekly-redesign__trust/)
})

test('drives first-month circles with a reversible desktop scroll timeline', () => {
  assert.match(tsx, /import gsap from 'gsap'/)
  assert.match(tsx, /import \{ ScrollTrigger \} from 'gsap\/ScrollTrigger'/)
  assert.match(tsx, /gsap\.matchMedia/)
  assert.match(tsx, /\(min-width: 861px\) and \(prefers-reduced-motion: no-preference\)/)
  assert.match(tsx, /pin: true/)
  assert.match(tsx, /pin: true,\s*scrub: true,/)
  assert.match(tsx, /monthStageRef/)
  assert.match(tsx, /monthTrackRef/)
  assert.match(tsx, /monthStationRefs/)
  assert.match(tsx, /ScrollTrigger\.refresh\(\)/)
})

test('keeps first-month circles accessible when animation is unavailable', () => {
  assert.match(tsx, /<ol className="weekly-redesign__timeline"/)
  assert.match(css, /@media \(max-width: 860px\), \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.weekly-redesign__timeline\s*\{\s*display: grid;/)
  assert.doesNotMatch(css, /--weekly-sage/)
  assert.match(css, /var\(--home-sage\)/)
})
```

- [ ] **Step 2: Run the focused regression test and verify expected RED output**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: the new hero/ScrollTrigger/fallback assertions fail because the component still renders a single old hero image, the trust strip, and a static timeline.

- [ ] **Step 3: Do not change production code in this task**

The red test is the contract for Tasks 2 and 3.

### Task 2: Build the content and reversible GSAP timeline

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`

**Interfaces:**
- Consumes: the four `monthBeats`, React refs, GSAP, ScrollTrigger, and global page assets.
- Produces: `.weekly-redesign__hero-image--primary`, `.weekly-redesign__hero-image--secondary`, `.weekly-redesign__month-stage`, `.weekly-redesign__timeline`, and four ref-addressable `.weekly-redesign__timeline-station` elements.

- [ ] **Step 1: Add the GSAP imports and register ScrollTrigger once**

```tsx
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
```

- [ ] **Step 2: Define the approved image assets and connect images to first-month beats**

```tsx
const heroTeachingImage = new URL('../../../assets/images/aaron-teaching-2.jpg', import.meta.url).href
const heroWeeklyImage = new URL('../../../assets/images/aaron-weekly-2.jpg', import.meta.url).href
const monthImages = [heroTeachingImage, heroWeeklyImage, heroTeachingImage, heroWeeklyImage] as const

const monthBeats = [
  { title: 'First chords', copy: 'Learn a few simple shapes and sound great right away.', symbol: '01', image: monthImages[0] },
  { title: 'First song', copy: 'Play your first complete song — yes, really.', symbol: '02', image: monthImages[1] },
  { title: 'Rhythm settles', copy: 'Lock in steady rhythm and start adding your style.', symbol: '03', image: monthImages[2] },
  { title: 'Play it through', copy: 'Put it all together and play with confidence.', symbol: '04', image: monthImages[3] },
] as const
```

- [ ] **Step 3: Add explicit refs and create the desktop-only scrub timeline**

```tsx
const monthStageRef = useRef<HTMLElement>(null)
const monthTrackRef = useRef<HTMLOListElement>(null)
const monthProgressFillRef = useRef<HTMLSpanElement>(null)
const monthStationRefs = useRef<Array<HTMLLIElement | null>>([])

useLayoutEffect(() => {
  const stage = monthStageRef.current
  const track = monthTrackRef.current
  if (!stage || !track) return

  const context = gsap.context(() => {
    const media = gsap.matchMedia()
    media.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      const stations = monthStationRefs.current.filter((station): station is HTMLLIElement => station !== null)
      const getDistance = () => Math.max(track.scrollWidth - stage.clientWidth, 1)

      gsap.set(monthProgressFillRef.current, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(stations, { transformOrigin: 'center center' })

      const travel = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => gsap.set(monthProgressFillRef.current, { scaleX: self.progress }),
        },
      })

      stations.forEach((station) => {
        gsap.fromTo(station, { autoAlpha: 0.42, scale: 0.78 }, {
          autoAlpha: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: { containerAnimation: travel, trigger: station, start: 'left 92%', end: 'center center', scrub: true },
        })
        gsap.to(station, {
          autoAlpha: 0.55,
          scale: 0.84,
          ease: 'none',
          scrollTrigger: { containerAnimation: travel, trigger: station, start: 'center center', end: 'right 8%', scrub: true },
        })
      })

      ScrollTrigger.refresh()
    })
    return () => media.revert()
  }, stage)

  return () => context.revert()
}, [])
```

- [ ] **Step 4: Replace the single hero figure, remove the trust section, and render the ref-addressable month stage**

```tsx
<div className="weekly-redesign__hero-art" aria-hidden="true">
  <span className="weekly-redesign__hero-ring weekly-redesign__hero-ring--one" />
  <span className="weekly-redesign__hero-ring weekly-redesign__hero-ring--two" />
  <figure className="weekly-redesign__hero-image weekly-redesign__hero-image--primary">
    <img src={heroTeachingImage} alt="" width="720" height="960" fetchPriority="high" />
  </figure>
  <figure className="weekly-redesign__hero-image weekly-redesign__hero-image--secondary">
    <img src={heroWeeklyImage} alt="" width="720" height="960" />
  </figure>
</div>

<section id="first-month" ref={monthStageRef} className="weekly-redesign__month weekly-redesign__month-stage" aria-labelledby="month-title">
  <div className="weekly-redesign__month-heading">
    <p>Your first month</p>
    <h2 id="month-title">Small steps. Real progress.</h2>
    <span>Here’s what it can look like.</span>
  </div>
  <div className="weekly-redesign__month-progress" aria-hidden="true"><span ref={monthProgressFillRef} /></div>
  <p className="weekly-redesign__month-cue" aria-hidden="true">Scroll to explore <Arrow /></p>
  <ol ref={monthTrackRef} className="weekly-redesign__timeline">
    {monthBeats.map((beat, index) => (
      <li key={beat.title} ref={(station) => { monthStationRefs.current[index] = station }} className="weekly-redesign__timeline-station">
        <span className="weekly-redesign__timeline-orbit" aria-hidden="true" />
        <figure className="weekly-redesign__timeline-image"><img src={beat.image} alt="" loading="lazy" /></figure>
        <span className="weekly-redesign__timeline-dot" aria-hidden="true">{index + 1}</span>
        <span className="weekly-redesign__timeline-symbol" aria-hidden="true">{beat.symbol}</span>
        <h3>{beat.title}</h3><p>{beat.copy}</p>
      </li>
    ))}
  </ol>
</section>
```

- [ ] **Step 5: Run the focused regression test and verify Task 2 is still RED only for CSS-specific assertions**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: component/source assertions pass; the shared sage and fallback CSS assertions still fail until Task 3.

### Task 3: Apply shared sage art direction and responsive fallback

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: the class names emitted in Task 2 and global `--home-sage`/`--home-sage-ink` custom properties.
- Produces: a dual-circle hero, sage pathway surface, pinned desktop first-month circle rail, and non-animated mobile/reduced-motion layout.

- [ ] **Step 1: Replace the local sage variable and route existing sage surfaces through the global token**

```css
.weekly-redesign {
  --weekly-paper: #f8f4eb;
  --weekly-paper-deep: #f1ebdf;
  --weekly-ink: var(--home-sage-ink);
  --weekly-gold: #cb9135;
}

.weekly-redesign__pathways {
  background: linear-gradient(164deg, #c2d0ab 0%, var(--home-sage) 48%, #a7b98d 100%);
}

.weekly-redesign__level-card {
  background: rgba(255, 252, 245, 0.74);
}
```

- [ ] **Step 2: Replace the old single-image hero styles with overlapping circles and sage orbit rings**

```css
.weekly-redesign__hero-image {
  position: absolute;
  overflow: hidden;
  border: 0.65rem solid rgba(248, 244, 235, 0.9);
  border-radius: 50%;
  background: var(--home-sage);
  box-shadow: 0 2.5rem 5rem -3.5rem rgba(12, 43, 32, 0.55);
}

.weekly-redesign__hero-image--primary { inset: 4% 5% 25% 8%; }
.weekly-redesign__hero-image--secondary { z-index: 2; right: 1%; bottom: 1%; width: 54%; aspect-ratio: 1; }
.weekly-redesign__hero-ring { border-color: color-mix(in srgb, var(--home-sage-ink) 62%, transparent); }
```

- [ ] **Step 3: Replace the static timeline with the circular horizontal desktop rail**

```css
.weekly-redesign__month-stage {
  position: relative;
  min-height: 100svh;
  overflow: clip;
  background: linear-gradient(164deg, #c2d0ab 0%, var(--home-sage) 48%, #a7b98d 100%);
}

.weekly-redesign__timeline {
  display: flex;
  align-items: center;
  width: max-content;
  gap: clamp(2rem, 6vw, 7rem);
  padding: clamp(2rem, 4vw, 4rem) max(12vw, 8rem);
  list-style: none;
}

.weekly-redesign__timeline::before { display: none; }
.weekly-redesign__timeline-station { position: relative; flex: 0 0 clamp(18rem, 30vw, 29rem); aspect-ratio: 1; padding: 1.4rem; border-radius: 50%; background: rgba(248, 244, 235, 0.94); text-align: center; }
.weekly-redesign__timeline-orbit { position: absolute; inset: -0.8rem; border: 1px solid rgba(23, 53, 42, 0.54); border-radius: inherit; }
.weekly-redesign__timeline-image { position: absolute; z-index: 0; inset: 32% 11% 11%; overflow: hidden; border-radius: 50%; }
.weekly-redesign__timeline-image img { width: 100%; height: 100%; object-fit: cover; }
.weekly-redesign__timeline-dot, .weekly-redesign__timeline-symbol, .weekly-redesign__timeline h3, .weekly-redesign__timeline p { position: relative; z-index: 1; }
.weekly-redesign__month-progress { position: absolute; z-index: 2; top: 50%; left: clamp(1rem, 3vw, 3rem); width: 2px; height: 8rem; background: rgba(23, 53, 42, 0.24); }
.weekly-redesign__month-progress span { display: block; width: 100%; height: 100%; background: var(--weekly-ink); transform: scaleY(0); transform-origin: top center; }
.weekly-redesign__month-cue { display: inline-flex; gap: 0.55rem; align-items: center; color: var(--weekly-ink); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
```

- [ ] **Step 4: Add the no-pin mobile and reduced-motion override**

```css
@media (max-width: 860px), (prefers-reduced-motion: reduce) {
  .weekly-redesign__month-stage { min-height: auto; overflow: visible; }
  .weekly-redesign__month-progress, .weekly-redesign__month-cue { display: none; }
  .weekly-redesign__timeline { display: grid; width: min(100%, 42rem); margin: 0 auto; padding: 0; gap: 1.5rem; transform: none !important; }
  .weekly-redesign__timeline-station { width: 100%; max-width: 23rem; margin: 0 auto; transform: none !important; opacity: 1 !important; }
  .weekly-redesign__hero-image--primary { inset: 2% 2% 28% 2%; }
  .weekly-redesign__hero-image--secondary { right: 0; bottom: 0; width: 57%; }
}
```

- [ ] **Step 5: Run the focused regression test and verify GREEN**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: all focused tests pass with no failures.

### Task 4: Validate motion, fallback, and production output

**Files:**
- Verify: `src/components/weekly/WeeklyJourneySections.tsx`
- Verify: `src/components/weekly/WeeklyJourneySections.css`
- Verify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: the completed route, test contract, local Vite server, and browser devtools.
- Produces: evidence that desktop forward/reverse scroll works, mobile/reduced motion remains content-first, and the build remains clean.

- [ ] **Step 1: Run source verification**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && npm run typecheck && npm run lint && npm run build && git diff --check`

Expected: seven or more passing focused subtests, zero type/lint errors, successful production build, and no whitespace errors.

- [ ] **Step 2: Inspect desktop and reverse scroll**

At 1440px, scroll into the first-month scene. Confirm the section pins, the four circle stations move left as scroll increases, the vertical progress fill advances, and scrolling upward restores station position/scale/opacity without jump or horizontal document overflow.

- [ ] **Step 3: Inspect mobile and reduced motion**

At 390px, confirm there is no pin and all four stations are visible in reading order. With reduced motion emulated, confirm the desktop viewport also shows the same static content and no animation styles are required to read it.

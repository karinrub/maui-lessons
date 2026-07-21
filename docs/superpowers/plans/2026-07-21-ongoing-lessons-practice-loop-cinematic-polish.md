# Ongoing Lessons Practice Loop Cinematic Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/weekly-lessons` into a reversible cinematic scroll experience led by the approved Practice Loop, a polished rising graph, intentional media sizing, and a compact Home-style finale/footer.

**Architecture:** Keep the route composition unchanged and rebuild the existing `WeeklyJourneySections` component as one semantic page with section-local GSAP timelines created by one `gsap.matchMedia(root)` lifecycle. Desktop uses pinned Practice Loop and graph chapters; mobile keeps the Practice Loop pin but renders the graph in normal flow. Static CSS is always readable, while `useLayoutEffect` applies motion start states only when reduced motion is not requested.

**Tech Stack:** React 19, TypeScript 6, React Router 7, GSAP 3 with ScrollTrigger and MotionPathPlugin, CSS, Node test runner, Playwright browser QA.

## Global Constraints

- Keep `GlobalNavigation`, its menu icon, route-level header behavior, and navigation CSS unchanged.
- Keep `WeeklyLessons.tsx` unchanged.
- Keep the current factual copy, lesson video, five approved photographs, `/tourist-lessons` cross-link, and `/book` CTA destination.
- All storytelling motion is scroll-scrubbed and reversible; do not use one-time `toggleActions`.
- Do not create a Lenis instance, custom wheel listener, or React state update in any scroll callback.
- Do not add dependencies.
- Reduced-motion and no-JavaScript output is fully visible normal document flow.
- Desktop graph pinning requires both `min-width: 761px` and `min-height: 680px`; all mobile and short-height layouts use the normal-flow graph.
- Do not modify or stage unrelated untracked files.

---

## File structure

- Modify `src/components/weekly/WeeklyJourneySections.tsx`: semantic markup, local helpers, media metadata, and all section-local GSAP timelines.
- Modify `src/components/weekly/WeeklyJourneySections.css`: static layout, Practice Loop artwork, responsive geometry, graph polish, reduced-motion fallback, and Home-style footer.
- Modify `test/weekly-rhythm-faithful.test.mjs`: static source contract for structure, assets, motion ownership, responsive fallbacks, footer, and unchanged navigation.
- Modify `CLAUDE.md`: update only the Ongoing Lessons source-map paragraph after implementation matches the new architecture.
- Do not create new route component files.

---

### Task 1: Establish the semantic and static page contract

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: existing media URLs, `Link`, `usePrefersReducedMotion`, and shared CSS variables.
- Produces: stable `.weekly-redesign` chapter markup and the final readable static layout consumed by all later motion tasks.

- [ ] **Step 1: Replace obsolete hero and one-time reveal assertions with a failing semantic contract.**

Add focused tests equivalent to:

```js
test('renders the approved Practice Loop opening with one semantic hero title', () => {
  assert.match(tsx, /weekly-redesign__opening/)
  assert.match(tsx, /weekly-redesign__opening-stage/)
  assert.match(tsx, /weekly-redesign__loop-rings/)
  assert.match(tsx, /Begin again\./)
  assert.match(tsx, /Practice becomes/)
  assert.match(tsx, /Progress happens on repeat\./)
  assert.equal((tsx.match(/<h1/g) ?? []).length, 1)
  assert.match(tsx, /aria-hidden="true"/)
})

test('keeps intrinsic media geometry and a strict resolved contact sheet', () => {
  assert.match(tsx, /width=\{720\}\s+height=\{960\}/)
  assert.match(tsx, /width=\{698\}\s+height=\{920\}/)
  assert.match(tsx, /preload="metadata"/)
  assert.match(tsx, /poster=\{weeklyHeroImageOne\}/)
  assert.match(css, /\.weekly-redesign__resolved-media/)
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
})

test('keeps global navigation outside the weekly component boundary', () => {
  assert.doesNotMatch(tsx, /GlobalNavigation|site-header|weekly-redesign__site-nav/)
  assert.match(layout, /<GlobalNavigation isSuppressed=\{isHome && isHeaderSuppressed\} \/>/)
})
```

- [ ] **Step 2: Run the focused test and confirm red state.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`
Expected: FAIL on missing Practice Loop markup, media dimensions, and new footer contract.

- [ ] **Step 3: Replace the existing hero with the semantic Practice Loop/static resolved hero scaffold.**

Use one opening section with decorative scene text and one real H1:

```tsx
function StaffMark({ className = '' }: { className?: string }) {
  return (
    <span className={`weekly-redesign__staff-mark ${className}`.trim()} aria-hidden="true">
      <i /><i /><i /><i /><i />
    </span>
  )
}

<section className="weekly-redesign__opening" aria-labelledby="weekly-redesign-title">
  <div className="weekly-redesign__opening-stage">
    <span className="weekly-redesign__ghost-word weekly-redesign__ghost-word--practice" aria-hidden="true">
      practice
    </span>
    <div className="weekly-redesign__loop-system" aria-hidden="true">
      <span className="weekly-redesign__loop-rings">
        <i /><i /><i />
      </span>
      <span className="weekly-redesign__loop-dot" />
      <span className="weekly-redesign__loop-open-arc" />
      <StaffMark className="weekly-redesign__loop-staff" />
    </div>
    <p className="weekly-redesign__loop-begin" aria-hidden="true">Begin again.</p>
    <p className="weekly-redesign__loop-transition" aria-hidden="true">
      Practice becomes <em>progress.</em>
    </p>
    <div className="weekly-redesign__resolved-hero weekly-redesign__container">
      <div className="weekly-redesign__resolved-copy">
        <h1 id="weekly-redesign-title">
          <span>Progress happens</span>
          <span>on repeat.</span>
        </h1>
        <p className="weekly-redesign__hero-lede">
          Private ukulele and guitar lessons on Maui, shaped around whoever&apos;s in front of him — not a level chart.
        </p>
      </div>
      <div className="weekly-redesign__resolved-media">
        <figure className="weekly-redesign__hero-video-frame">
          <video
            src={weeklySectionVideo}
            poster={weeklyHeroImageOne}
            width={1920}
            height={1080}
            preload="metadata"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Lesson footage — silent clip, low-fi"
          />
          <figcaption>Lesson footage — silent clip, low-fi</figcaption>
        </figure>
        <div className="weekly-redesign__contact-sheet">
          <ImageFigure src={weeklyHeroImageOne} caption="Aaron teaching outdoors" width={720} height={960} eager />
          <ImageFigure src={weeklyHeroImageTwo} caption="Aaron guiding a lesson by the ocean" width={698} height={920} eager />
        </div>
      </div>
    </div>
  </div>
</section>
```

Extend `ImageFigure` with exact intrinsic properties:

```tsx
function ImageFigure({ src, caption, width, height, eager = false, className = '' }: {
  src: string
  caption: string
  width: number
  height: number
  eager?: boolean
  className?: string
}) {
  return (
    <figure className={`weekly-redesign__photo ${className}`.trim()}>
      <img
        src={src}
        alt={caption}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
```

- [ ] **Step 4: Build the final-state static CSS before adding animation.**

Implement these exact layout contracts:

```css
.weekly-redesign__container { width: min(100% - 44px, 1240px); }
.weekly-redesign__opening-stage { position: relative; min-height: 100svh; overflow: hidden; }
.weekly-redesign__resolved-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(560px, 1.1fr);
  align-items: center;
  min-height: 100svh;
  gap: clamp(2.5rem, 5vw, 5rem);
  padding-block: clamp(7rem, 12svh, 10rem) clamp(4rem, 8svh, 7rem);
}
.weekly-redesign__resolved-media { display: grid; gap: 12px; }
.weekly-redesign__hero-video-frame video { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.weekly-redesign__contact-sheet { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.weekly-redesign__contact-sheet img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; }
.weekly-redesign__loop-system,
.weekly-redesign__loop-begin,
.weekly-redesign__loop-transition { display: none; }
```

At `max-width: 900px`, stack `.weekly-redesign__resolved-hero`; at `max-width: 760px`, use `width: min(100% - 36px, 1240px)` and keep full-width video plus the two-column portrait row.

The hidden Practice Loop elements are an intentional static baseline. Task 2 uses `gsap.set` to display those exact nodes before creating the motion timeline. Reduced-motion and failed-JavaScript states therefore show only the final readable hero.

- [ ] **Step 5: Run the focused test.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`
Expected: the semantic/static tests pass; later motion/footer tests may remain red.

- [ ] **Step 6: Commit the static foundation.**

```bash
git add test/weekly-rhythm-faithful.test.mjs src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css
git commit -m "feat(weekly): build Practice Loop foundation"
```

---

### Task 2: Implement the reversible Practice Loop engine

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: Task 1 opening selectors, `usePrefersReducedMotion`, GSAP, ScrollTrigger, and `weeklySectionVideo`.
- Produces: a desktop/mobile reversible opening timeline with no header mutation.

- [ ] **Step 1: Add a failing motion-ownership test.**

```js
test('uses one reversible matchMedia lifecycle for the Practice Loop', () => {
  assert.match(tsx, /MotionPathPlugin/)
  assert.match(tsx, /gsap\.matchMedia\(root\)/)
  assert.match(tsx, /isDesktop: '\(min-width: 761px\).*min-height: 680px/)
  assert.match(tsx, /isMobile: '\(max-width: 760px\)/)
  assert.match(tsx, /scrub:\s*1(?:\.0)?/)
  assert.match(tsx, /pin:\s*openingStage/)
  assert.match(tsx, /mm\.revert\(\)/)
  assert.doesNotMatch(tsx, /toggleActions:/)
  assert.doesNotMatch(tsx, /new Lenis|addEventListener\(['"]wheel/)
  assert.match(tsx, /new IntersectionObserver/)
})
```

- [ ] **Step 2: Run the focused test and confirm it fails.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`
Expected: FAIL because the current code uses one-time reveal logic and no MotionPathPlugin.

- [ ] **Step 3: Register MotionPathPlugin and replace the old effect with one matchMedia lifecycle.**

```tsx
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

useLayoutEffect(() => {
  const root = rootRef.current
  if (!root || prefersReducedMotion) return

  const mm = gsap.matchMedia(root)
  mm.add(
    {
      isDesktop: '(min-width: 761px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',
      isMobile: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
      isShort: '(min-width: 761px) and (max-height: 679px) and (prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const { isMobile, isShort } = context.conditions as {
        isDesktop: boolean
        isMobile: boolean
        isShort: boolean
      }
      const opening = root.querySelector<HTMLElement>('.weekly-redesign__opening')
      const openingStage = root.querySelector<HTMLElement>('.weekly-redesign__opening-stage')
      if (!opening || !openingStage) return

      const loop = buildPracticeLoopTimeline(root)
      ScrollTrigger.create({
        id: 'weekly-practice-loop',
        trigger: opening,
        start: 'top top',
        end: () => `+=${window.innerHeight * (isMobile ? 1.25 : isShort ? 1.05 : 1.6)}`,
        animation: loop,
        pin: openingStage,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })
    },
  )
  return () => mm.revert()
}, [prefersReducedMotion])
```

- [ ] **Step 4: Implement `buildPracticeLoopTimeline` with explicit labelled phases.**

```tsx
function buildPracticeLoopTimeline(root: HTMLElement) {
  const q = gsap.utils.selector(root)
  const stage = q('.weekly-redesign__opening-stage')[0] as HTMLElement
  const loopSystem = q('.weekly-redesign__loop-system')[0] as HTMLElement
  const videoFrame = q('.weekly-redesign__hero-video-frame')[0] as HTMLElement
  const getVideoStart = () => {
    const stageRect = stage.getBoundingClientRect()
    const loopRect = loopSystem.getBoundingClientRect()
    const videoRect = videoFrame.getBoundingClientRect()
    const loopCenterX = loopRect.left - stageRect.left + loopRect.width / 2
    const loopCenterY = loopRect.top - stageRect.top + loopRect.height / 2
    const videoCenterX = videoRect.left - stageRect.left + videoRect.width / 2
    const videoCenterY = videoRect.top - stageRect.top + videoRect.height / 2
    return {
      x: loopCenterX - videoCenterX,
      y: loopCenterY - videoCenterY,
      scale: Math.min(loopRect.width, loopRect.height) / videoRect.height,
    }
  }
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  tl.addLabel('still', 0)
    .set(q('.weekly-redesign__loop-system'), { display: 'block' })
    .set(q('.weekly-redesign__loop-begin, .weekly-redesign__loop-transition'), { display: 'block' })
    .set(q('.weekly-redesign__resolved-copy, .weekly-redesign__contact-sheet'), { autoAlpha: 0 })
    .set(videoFrame, {
      x: () => getVideoStart().x,
      y: () => getVideoStart().y,
      scale: () => getVideoStart().scale,
      clipPath: 'circle(38% at 50% 50%)',
      transformOrigin: 'center center',
    })
    .set(q('.weekly-redesign__loop-transition'), { autoAlpha: 0, y: 24 })
    .to(q('.weekly-redesign__loop-dot'), {
      motionPath: { path: q('.weekly-redesign__orbit-path')[0], align: q('.weekly-redesign__orbit-path')[0], alignOrigin: [0.5, 0.5] },
      duration: 0.28,
    }, 0.2)
    .to(q('.weekly-redesign__loop-rings'), { scale: 1.06, duration: 0.28 }, 0.2)
    .to(q('.weekly-redesign__loop-begin'), { autoAlpha: 0, y: -18, duration: 0.12 }, 0.28)
    .to(q('.weekly-redesign__loop-transition'), { autoAlpha: 1, y: 0, duration: 0.16 }, 0.32)
    .to(q('.weekly-redesign__loop-rings'), { autoAlpha: 0, scale: 1.18, duration: 0.2 }, 0.48)
    .to(q('.weekly-redesign__loop-open-arc'), { autoAlpha: 1, rotate: 18, duration: 0.22 }, 0.48)
    .to(q('.weekly-redesign__loop-staff'), { autoAlpha: 1, x: 0, duration: 0.24 }, 0.52)
    .to(q('.weekly-redesign__loop-transition'), { autoAlpha: 0, y: -20, duration: 0.14 }, 0.66)
    .to(q('.weekly-redesign__resolved-copy, .weekly-redesign__contact-sheet'), { autoAlpha: 1, duration: 0.18 }, 0.72)
    .fromTo(q('.weekly-redesign__resolved-copy > *'), { y: 34 }, { y: 0, duration: 0.24, stagger: 0.035 }, 0.72)
    .to(videoFrame, { x: 0, y: 0, scale: 1, clipPath: 'inset(0% round 8px)', duration: 0.28 }, 0.72)
    .to(q('.weekly-redesign__ghost-word--practice'), { xPercent: -10, duration: 1 }, 0)
  return tl
}
```

Create a hidden SVG `.weekly-redesign__orbit-path` matching the outer loop; the path is decorative and `aria-hidden`.

- [ ] **Step 5: Add CSS start/final geometry without hiding static content by default.**

Keep final-state CSS readable. Only JS-set GSAP transforms create the start state. Center rings with `clamp(230px, 32vw, 420px)` desktop and `min(72vw, 320px)` mobile. Keep the ring system below the fixed header safe area using `top: max(88px, 11svh)`.

- [ ] **Step 6: Pause the decorative video outside the opening chapter.**

Add `useEffect` to the React import and add a media-lifecycle effect independent from the scroll timelines:

```tsx
useEffect(() => {
  const video = rootRef.current?.querySelector<HTMLVideoElement>('.weekly-redesign__hero-video-frame video')
  if (!video) return
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    },
    { rootMargin: '25% 0px', threshold: 0.01 },
  )
  observer.observe(video)
  return () => observer.disconnect()
}, [])
```

- [ ] **Step 7: Run focused tests and typecheck.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && npm run typecheck`
Expected: both commands exit `0`.

- [ ] **Step 8: Commit the opening engine.**

```bash
git add test/weekly-rhythm-faithful.test.mjs src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css
git commit -m "feat(weekly): choreograph Practice Loop entrance"
```

---

### Task 3: Polish facts, location media, and teacher chapter

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: Task 2 `gsap.matchMedia` callback and static chapter selectors.
- Produces: intentional media geometry and reversible non-pinned timelines for facts, location, teacher, and cross-link.

- [ ] **Step 1: Add failing geometry and motion tests.**

```js
test('sizes downstream media from source aspect ratios', () => {
  assert.match(tsx, /width=\{2200\}\s+height=\{1467\}/)
  assert.match(tsx, /width=\{1467\}\s+height=\{2200\}/)
  assert.match(tsx, /width=\{1153\}\s+height=\{1153\}/)
  assert.match(css, /\.weekly-redesign__location-photo img[^}]*aspect-ratio:\s*16 \/ 9/s)
  assert.match(css, /\.weekly-redesign__teaching-photo img[^}]*aspect-ratio:\s*1/s)
})

test('uses reversible section timelines instead of collage parallax', () => {
  assert.match(tsx, /weekly-facts-score/)
  assert.match(tsx, /weekly-teacher-score/)
  assert.match(tsx, /scrub:\s*0\.8/)
  assert.doesNotMatch(tsx, /data-vacation-parallax|collage|pull-quote/)
})
```

- [ ] **Step 2: Run the focused test and confirm red state.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`
Expected: FAIL on missing intrinsic downstream sizes and section timeline IDs.

- [ ] **Step 3: Pass intrinsic dimensions into each downstream `ImageFigure`.**

```tsx
<ImageFigure className="weekly-redesign__location-photo" src={maipoinaLocationImage} caption="Photo: Maipoina Beach Park, one of the regular lesson spots" width={2200} height={1467} />
<ImageFigure className="weekly-redesign__fretboard-photo" src={fretboardImage} caption="Photo: hands on the fretboard" width={1467} height={2200} />
<ImageFigure className="weekly-redesign__teaching-photo" src={teachingImage} caption="Photo: Aaron teaching a lesson" width={1153} height={1153} />
```

- [ ] **Step 4: Replace fixed downstream heights with aspect-ratio geometry.**

```css
.weekly-redesign__location-photo { width: 100%; transform-origin: center; }
.weekly-redesign__location-photo img { aspect-ratio: 16 / 9; object-fit: cover; object-position: 50% 68%; }
.weekly-redesign__fretboard-photo img { aspect-ratio: 2 / 3; object-fit: cover; }
.weekly-redesign__teaching-photo { width: min(100%, 480px); justify-self: end; }
.weekly-redesign__teaching-photo img { aspect-ratio: 1; object-fit: cover; }
```

- [ ] **Step 5: Add one reversible timeline per editorial chapter inside the matchMedia callback.**

```tsx
gsap.timeline({
  scrollTrigger: {
    id: 'weekly-facts-score',
    trigger: q('.weekly-redesign__facts')[0],
    start: 'top 86%',
    end: 'bottom 28%',
    scrub: 0.8,
  },
})
  .fromTo(q('.weekly-redesign__fact-list li'), { y: 34, autoAlpha: 0.35 }, { y: -12, autoAlpha: 1, stagger: 0.08 }, 0)
  .fromTo(q('.weekly-redesign__location-photo'), { scale: 0.9, y: 38 }, { scale: 1, y: -18 }, 0.15)
  .fromTo(q('.weekly-redesign__location-photo img'), { yPercent: -4, scale: 1.06 }, { yPercent: 4, scale: 1 }, 0.15)

gsap.timeline({
  scrollTrigger: {
    id: 'weekly-teacher-score',
    trigger: q('.weekly-redesign__teacher')[0],
    start: 'top 88%',
    end: 'bottom 24%',
    scrub: 0.8,
  },
})
  .fromTo(q('.weekly-redesign__teacher-copy'), { x: -42, autoAlpha: 0.45 }, { x: 12, autoAlpha: 1 }, 0)
  .fromTo(q('.weekly-redesign__teacher-copy strong'), { y: 28, scale: 0.82 }, { y: -8, scale: 1 }, 0.08)
  .fromTo(q('.weekly-redesign__teaching-photo'), { x: 46, scale: 0.94 }, { x: -10, scale: 1 }, 0)
```

Add a small `y: 14` to `y: -10` scrub for `.weekly-redesign__cross-link p` with no pin.

- [ ] **Step 6: Run focused tests and CSS diff check.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && git diff --check`
Expected: both exit `0`.

- [ ] **Step 7: Commit editorial chapter polish.**

```bash
git add test/weekly-rhythm-faithful.test.mjs src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css
git commit -m "feat(weekly): animate editorial lesson chapters"
```

---

### Task 4: Rebuild the graph as the rising cinematic chapter

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: Task 2 matchMedia conditions and the existing `progression` copy array.
- Produces: desktop pinned graph and mobile/short-height normal-flow graph, both reversible.

- [ ] **Step 1: Add failing graph-contract tests.**

```js
test('builds a rising graph with one active travelling dot', () => {
  assert.match(tsx, /weekly-redesign__progress-graphic/)
  assert.match(tsx, /weekly-redesign__progress-active-dot/)
  assert.match(tsx, /weekly-redesign__progress-path/)
  assert.match(tsx, /weekly-redesign__progress-milestone/g)
  assert.match(tsx, /id: 'weekly-progress-desktop'/)
  assert.match(tsx, /id: 'weekly-progress-mobile'/)
  assert.match(tsx, /pin:\s*progressStage/)
  assert.match(tsx, /motionPath:/)
  assert.match(tsx, /y:\s*-64/)
})

test('does not pin the graph on mobile or short-height screens', () => {
  assert.match(tsx, /if \(isDesktop\)/)
  assert.match(tsx, /weekly-progress-mobile/)
  assert.doesNotMatch(css, /@media \(max-width: 760px\)[\s\S]*position:\s*sticky/)
})
```

- [ ] **Step 2: Run the focused test and confirm red state.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`
Expected: FAIL because the existing graph has three static dots and one-time reveal logic.

- [ ] **Step 3: Restructure the heading and graph markup.**

```tsx
<h2 id="weekly-progression-title" className="weekly-redesign__progress-heading">
  <span>Same instrument.</span>
  <span>A different player,</span>
  <span>every year.</span>
</h2>
<div className="weekly-redesign__progress-stage">
  <div className="weekly-redesign__progression-layout">
    <div className="weekly-redesign__chart">
      <div className="weekly-redesign__progress-graphic" aria-hidden="true">
        <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--one" />
        <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--two" />
        <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--three" />
        <svg viewBox="0 0 860 360">
          <path className="weekly-redesign__progress-path" d="M54 286 C190 286 218 244 330 232 C470 216 502 144 620 132 C716 122 740 74 812 52" />
        </svg>
        <span className="weekly-redesign__progress-active-dot" />
      </div>
      {progression.map((item, index) => (
        <article key={item.title} className={`weekly-redesign__progress-milestone weekly-redesign__progress-milestone--${index + 1}`}>
          <span className="weekly-redesign__progress-dot" aria-hidden="true" />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
    <ImageFigure
      className="weekly-redesign__fretboard-photo"
      caption="Photo: hands on the fretboard"
      src={fretboardImage}
      width={1467}
      height={2200}
    />
  </div>
</div>
```

- [ ] **Step 4: Implement the desktop pinned graph timeline.**

```tsx
if (isDesktop) {
  const progressStage = q('.weekly-redesign__progress-stage')[0] as HTMLElement
  const path = q('.weekly-redesign__progress-path')[0] as SVGPathElement
  const pathLength = path.getTotalLength()
  const progressTl = gsap.timeline({ defaults: { ease: 'none' } })
  progressTl
    .set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
    .fromTo(q('.weekly-redesign__progress-graphic'), { y: 76 }, { y: -64, duration: 1 }, 0)
    .to(path, { strokeDashoffset: 0, duration: 0.82 }, 0.06)
    .to(q('.weekly-redesign__progress-active-dot'), {
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
      duration: 0.82,
    }, 0.06)
    .fromTo(q('.weekly-redesign__progress-milestone'), { autoAlpha: 0.34, y: 36 }, { autoAlpha: 1, y: 0, stagger: 0.2, duration: 0.22 }, 0.12)
    .fromTo(q('.weekly-redesign__fretboard-photo img'), { yPercent: -4, scale: 1.06 }, { yPercent: 4, scale: 1, duration: 1 }, 0)

  ScrollTrigger.create({
    id: 'weekly-progress-desktop',
    trigger: progressStage,
    start: 'top top',
    end: () => `+=${window.innerHeight * 1.65}`,
    animation: progressTl,
    pin: progressStage,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  })
}
```

- [ ] **Step 5: Implement the mobile/short-height normal-flow graph timeline.**

```tsx
if (!isDesktop) {
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'weekly-progress-mobile',
      trigger: q('.weekly-redesign__chart')[0],
      start: 'top 82%',
      end: 'bottom 28%',
      scrub: 0.8,
    },
  })
    .fromTo(q('.weekly-redesign__mobile-progress-line'), { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top' }, 0)
    .fromTo(q('.weekly-redesign__progress-active-dot'), { y: 0 }, { y: () => (q('.weekly-redesign__chart')[0] as HTMLElement).offsetHeight - 24 }, 0)
    .fromTo(q('.weekly-redesign__progress-milestone'), { autoAlpha: 0.45, x: 20 }, { autoAlpha: 1, x: 0, stagger: 0.24 }, 0)
}
```

Add `.weekly-redesign__mobile-progress-line` only for normal-flow markup/CSS. No `position: sticky` or graph pin exists below the desktop condition.

- [ ] **Step 6: Polish graph CSS and protect card/photo boundaries.**

Use a desktop chart height of approximately `560px`, keep milestone widths under `28%`, place the third milestone no farther right than `68%`, and set the graph/photo grid to `minmax(0, 1fr) minmax(320px, 0.38fr)`. Mobile switches to a vertical line with `padding-left: 40px`; all articles are relative and visible by default.

- [ ] **Step 7: Run focused tests and typecheck.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && npm run typecheck`
Expected: both exit `0`.

- [ ] **Step 8: Commit the graph chapter.**

```bash
git add test/weekly-rhythm-faithful.test.mjs src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css
git commit -m "feat(weekly): animate rising learning graph"
```

---

### Task 5: Replace the oversized close with the Home-style footer

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: existing `/book` route, shared palette/grain variables, and `SiteLayout`'s existing omission of `SiteFooter` on `/weekly-lessons`.
- Produces: compact finale with CTA, footer navigation, copyright, and reversible scroll choreography.

- [ ] **Step 1: Add a failing footer contract.**

```js
test('uses the compact Home-style finale as the weekly footer', () => {
  assert.match(tsx, /Footer navigation/)
  assert.match(tsx, /to="\/"[^>]*>Home</)
  assert.match(tsx, /to="\/tourist-lessons"[^>]*>Vacation Lessons</)
  assert.match(tsx, /to="\/about"[^>]*>About</)
  assert.match(tsx, /to="\/faq"[^>]*>FAQ</)
  assert.match(tsx, /Book a Lesson/)
  assert.match(tsx, /weekly-redesign__finale-copyright/)
  assert.doesNotMatch(css, /\.weekly-redesign__finale \{[^}]*min-height:\s*100svh/s)
  assert.match(tsx, /id: 'weekly-finale-score'/)
})
```

- [ ] **Step 2: Run the focused test and confirm red state.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`
Expected: FAIL because the current finale omits nav/copyright, uses a text link CTA, and is `100svh`.

- [ ] **Step 3: Replace finale markup with the Home structure and weekly copy.**

```tsx
<footer className="weekly-redesign__finale" aria-label="Book ongoing lessons">
  <div className="weekly-redesign__finale-arch" aria-hidden="true" />
  <div className="weekly-redesign__finale-inner">
    <h2 id="weekly-finale-title">Make it a habit.</h2>
    <p>One lesson a week, for as long as it keeps being useful.</p>
    <Link to="/book" className="weekly-redesign__finale-cta">
      Book a Lesson <span aria-hidden="true">→</span>
    </Link>
    <nav className="weekly-redesign__finale-links" aria-label="Footer navigation">
      <Link to="/">Home</Link>
      <Link to="/tourist-lessons">Vacation Lessons</Link>
      <Link to="/about">About</Link>
      <Link to="/faq">FAQ</Link>
    </nav>
    <p className="weekly-redesign__finale-copyright">© {new Date().getFullYear()} Maui Lessons</p>
  </div>
  <div className="weekly-redesign__grain" aria-hidden="true" />
</footer>
```

- [ ] **Step 4: Mirror Home finale geometry without importing its component.**

```css
.weekly-redesign__finale {
  position: relative;
  overflow: hidden;
  margin-top: -2px;
  padding: 0 clamp(16px, 4vw, 56px) clamp(40px, 6svh, 72px);
  background: linear-gradient(180deg, #fbf7ee 0 3px, #0d2018 3px);
  color: #f8f4eb;
}
.weekly-redesign__finale-arch {
  position: relative;
  left: 50%;
  width: 145vw;
  height: clamp(120px, 18svh, 230px);
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
  background: #fbf7ee;
  transform: translateX(-50%);
}
.weekly-redesign__finale-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.2rem, 3svh, 2rem);
  width: min(94vw, 1080px);
  margin: clamp(48px, 8svh, 96px) auto 0;
  text-align: center;
}
```

Copy the Home pill CTA, link, focus, and copyright treatment using weekly-scoped class names.

- [ ] **Step 5: Add reversible footer choreography inside the matchMedia callback.**

```tsx
gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: {
    id: 'weekly-finale-score',
    trigger: q('.weekly-redesign__finale')[0],
    start: 'top 92%',
    end: 'top 34%',
    scrub: 0.8,
  },
})
  .fromTo(q('.weekly-redesign__finale h2'), { scale: 0.9, y: 34 }, { scale: 1, y: 0 }, 0)
  .fromTo(q('.weekly-redesign__finale-inner > p'), { autoAlpha: 0.35, y: 26 }, { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.1)
  .fromTo(q('.weekly-redesign__finale-cta'), { autoAlpha: 0.35, y: 28 }, { autoAlpha: 1, y: 0 }, 0.18)
  .fromTo(q('.weekly-redesign__finale-links a'), { autoAlpha: 0.35, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.045 }, 0.28)
```

- [ ] **Step 6: Run focused tests and typecheck.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs && npm run typecheck`
Expected: both exit `0`.

- [ ] **Step 7: Commit the footer.**

```bash
git add test/weekly-rhythm-faithful.test.mjs src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css
git commit -m "feat(weekly): add Home-style lesson footer"
```

---

### Task 6: Integrated responsive QA, motion tuning, and documentation

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: all completed chapters and repository scripts.
- Produces: verified responsive route, reduced-motion fallback, accurate source map, and final evidence.

- [ ] **Step 1: Add final resilience assertions before browser tuning.**

```js
test('keeps reduced motion fully visible and removes cinematic pinning', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.weekly-redesign__resolved-hero[^}]*opacity:\s*1/s)
  assert.match(css, /\.weekly-redesign__progress-milestone[^}]*opacity:\s*1/s)
  assert.match(tsx, /if \(!root \|\| prefersReducedMotion\)\s*\{?\s*return/)
})

test('preserves section order and excludes rejected mechanics', () => {
  const opening = tsx.indexOf('weekly-redesign__opening')
  const facts = tsx.indexOf('weekly-redesign__facts')
  const progression = tsx.indexOf('weekly-redesign__progression')
  const teacher = tsx.indexOf('weekly-redesign__teacher')
  const crossLink = tsx.indexOf('weekly-redesign__cross-link')
  const finale = tsx.indexOf('weekly-redesign__finale')
  assert.ok(opening < facts && facts < progression && progression < teacher && teacher < crossLink && crossLink < finale)
  assert.doesNotMatch(tsx, /cadence|highlightDay|day-picker|collage|pull-quote/i)
})
```

- [ ] **Step 2: Run the complete automated baseline.**

Run: `npm run typecheck && npm run lint && npm run build && node --test test/*.test.mjs`
Expected: every command exits `0`; fix source/test issues before browser QA.

- [ ] **Step 3: Start the development server and capture desktop checkpoints.**

Run: `npm run dev -- --host 127.0.0.1 --port 5180`
Inspect `/weekly-lessons` at `1440×900`, `1280×800`, and `1024×768`.

At each viewport capture:

- Practice Loop at scroll progress `0`, `0.28`, `0.64`, and `1`
- the same positions while scrolling backward
- all three graph milestones in both directions
- teacher chapter and footer

Expected: no jump at pin release, no stale pin spacer, no header/menu mutation, and no horizontal overflow.

- [ ] **Step 4: Exercise the unchanged menu interaction on the weekly route.**

Open the global menu from the top of `/weekly-lessons`, verify exactly one menu button, visible overlay content, Escape/close behavior, focus restoration, and restored page scrolling.

Expected: behavior matches the other routes; no weekly code queries or changes the header.

- [ ] **Step 5: Capture tablet/mobile checkpoints.**

Inspect `768×1024`, `390×844`, `375×667`, `360×640`, and `320×568`.

Expected:

- Practice Loop remains centered below the unchanged nav.
- The resolved hero is text → full-width video → two-column portraits.
- Facts are readable rows.
- Graph is normal flow with a reversible vertical line/dot and no pin.
- Teacher image is square/near-square.
- Footer links wrap without clipping.
- No address-bar-height scroll trap or horizontal overflow.

- [ ] **Step 6: Verify reduced motion at desktop and mobile.**

Emulate `prefers-reduced-motion: reduce` at `1440×900` and `390×844`.

Expected: no pin spacers, hidden content, orbit, clip animation, line draw, or parallax; final hero and all graph cards are visible in normal order.

- [ ] **Step 7: Tune only evidence-backed mismatches.**

Maintain a short mismatch ledger during QA. Restrict fixes to observed clipping, pacing, media crop, card overlap, contrast, pin release, or responsive geometry problems. Re-run the exact viewport/checkpoint that exposed each issue after editing.

- [ ] **Step 8: Update the Ongoing Lessons source-map paragraph in `CLAUDE.md`.**

Replace the current Ongoing paragraph with:

```markdown
- Ongoing: `src/components/weekly/WeeklyJourneySections.tsx` is the self-contained Ongoing Lessons cinematic page. Its signature is the reversible Practice Loop opening: a gold beat orbits a restrained circular lesson window, the loop opens into staff lines, and the composition resolves into the semantic hero. Section-local GSAP/ScrollTrigger timelines animate the facts/location, a pinned desktop rising graph (normal-flow vertical graph on mobile/short-height screens), teacher chapter, cross-link, and Home-style finale/footer. `GlobalNavigation` is unchanged. All media carries intrinsic dimensions, all storytelling reverses on upward scroll, and `usePrefersReducedMotion()` leaves final content static and fully visible. Guarded by `test/weekly-rhythm-faithful.test.mjs`.
```

- [ ] **Step 9: Run fresh final verification.**

Run: `npm run typecheck && npm run lint && npm run build && node --test test/*.test.mjs && git diff --check`
Expected: every command exits `0` with zero test failures and no whitespace errors.

- [ ] **Step 10: Review the final diff and commit integration polish.**

Run: `git diff --stat && git status --short`
Expected: only weekly component/CSS, weekly test, and `CLAUDE.md` are modified; existing unrelated untracked files remain untouched.

```bash
git add src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css test/weekly-rhythm-faithful.test.mjs CLAUDE.md
git commit -m "feat(weekly): finish cinematic lesson journey"
```

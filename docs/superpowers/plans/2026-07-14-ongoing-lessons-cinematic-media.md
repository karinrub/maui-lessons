# Ongoing Lessons Cinematic Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/weekly-lessons` a cinematic, student-centred music journey: compact silent video, interactive skill imagery, one editorial teaching-image bridge, and a compact horizontal “How it works” score.

**Architecture:** `SkillLevelSection` keeps the useful three-level selector and owns all opening/level/bridge media. `WeeklyJourneySections` owns the three-step desktop horizontal score plus static mobile/reduced-motion fallback. Existing close CTA remains structurally and visually unchanged. No new Lenis instance; GSAP + ScrollTrigger only.

**Tech Stack:** React 19, TypeScript, Vite 8, GSAP 3 + ScrollTrigger, existing local JPEG/MP4 assets, Node built-in test runner, Oxlint.

## Global Constraints

- Use only repository media. No generated or stock assets.
- Keep weekly video compact, silent, muted, looping, `playsInline`, and non-essential; provide an existing-image poster.
- Use `assets/images/aaron-teaching-2.jpg` exactly once as editorial bridge.
- Preserve all current factual copy, level labels/content, location copy, CTA behavior, and close section.
- Preserve `max-width: 760px` breakpoint. Under mobile or reduced motion, no pinning, horizontal translation, or scroll-linked bridge transform.
- Do not add Lenis, a carousel, a chapter counter, snapping, full-screen portrait panels, or decorative gold to timeline.
- Run `node --test test/weekly-lessons-media.test.mjs`, `npm run build`, `npm run lint`, and `npm run typecheck` before final commit.

---

### Task 1: Lock media architecture with source-level regression checks

**Files:**
- Create: `test/weekly-lessons-media.test.mjs`

**Interfaces:**
- Consumes: source files under `src/components/weekly/`.
- Produces: Node test coverage for approved media ownership and desktop-score constraints.

- [ ] **Step 1: Write failing test**

Create `test/weekly-lessons-media.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const skillSource = await readFile(
  new URL('../src/components/weekly/SkillLevelSection.tsx', import.meta.url),
  'utf8',
)
const journeySource = await readFile(
  new URL('../src/components/weekly/WeeklyJourneySections.tsx', import.meta.url),
  'utf8',
)
const journeyCss = await readFile(
  new URL('../src/components/weekly/WeeklyJourneySections.css', import.meta.url),
  'utf8',
)

test('keeps weekly video compact and supplies poster fallback', () => {
  assert.match(skillSource, /poster=\{teachingPoster\}/)
  assert.match(skillSource, /className="skill-intro__clip"/)
  assert.match(skillSource, /autoPlay/)
  assert.match(skillSource, /muted/)
  assert.match(skillSource, /playsInline/)
})

test('uses teaching image once as editorial bridge', () => {
  assert.match(skillSource, /aaron-teaching-2\.jpg/)
  assert.match(skillSource, /className="skill-bridge"/)
  assert.match(skillSource, /ref=\{bridgeRef\}/)
})

test('uses compact horizontal score without Lenis or chapter UI', () => {
  assert.match(journeySource, /weekly-rhythm__stage/)
  assert.match(journeySource, /weekly-rhythm__track/)
  assert.match(journeySource, /getScrollDistance/)
  assert.doesNotMatch(journeySource, /from 'lenis'/)
  assert.doesNotMatch(journeySource, /chapter|snap/i)
  assert.match(journeyCss, /@media \(min-width: 761px\)/)
})
```

- [ ] **Step 2: Run test; confirm expected red state**

Run:

```bash
node --test test/weekly-lessons-media.test.mjs
```

Expected: failing assertions because poster/bridge/stage/track do not exist yet.

### Task 2: Build compact video fallback and teaching-image bridge

**Files:**
- Modify: `src/components/weekly/SkillLevelSection.tsx`
- Modify: `src/components/weekly/SkillLevelSection.css`

**Interfaces:**
- Consumes: existing `prefersReducedMotion`, existing weekly MP4, and `assets/images/aaron-teaching-2.jpg`.
- Produces: `teachingPoster`, `teachingBridgeImage`, `bridgeRef`, and a single `skill-bridge` section after `skill-section`.

- [ ] **Step 1: Add media constants and bridge ref**

Add imports/constants near existing weekly media declarations:

```ts
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const teachingPoster = new URL('../../../assets/images/aaron-teaching-1.jpg', import.meta.url).href
const teachingBridgeImage = new URL('../../../assets/images/aaron-teaching-2.jpg', import.meta.url).href
```

Add ref beside the other element refs:

```ts
const bridgeRef = useRef<HTMLElement>(null)
```

- [ ] **Step 2: Add bridge motion effect**

Before `handleTabKeyDown`, add effect which leaves static image under reduced motion and creates only local ScrollTrigger drift otherwise:

```ts
useLayoutEffect(() => {
  const bridge = bridgeRef.current
  const image = bridge?.querySelector<HTMLImageElement>('.skill-bridge__image')
  if (!bridge || !image) return

  if (prefersReducedMotion) {
    gsap.set(image, { clearProps: 'transform' })
    return
  }

  const context = gsap.context(() => {
    gsap.fromTo(
      image,
      { yPercent: -5, scale: 1.08 },
      {
        yPercent: 5,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: bridge,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      },
    )
  }, bridge)

  return () => context.revert()
}, [prefersReducedMotion])
```

- [ ] **Step 3: Wire poster and bridge markup**

Add `poster={teachingPoster}` to current `<video>`. After the closing `</div>` for `.skill-section`, before fragment close, add:

```tsx
<section ref={bridgeRef} className="skill-bridge" aria-label="A lesson in progress">
  <figure className="skill-bridge__figure">
    <div className="skill-bridge__frame">
      <img
        className="skill-bridge__image"
        src={teachingBridgeImage}
        alt="Aaron teaching a student during a music lesson"
        loading="lazy"
      />
    </div>
  </figure>
</section>
```

- [ ] **Step 4: Add compact bridge styling**

Append these scoped rules before the existing mobile media query:

```css
.skill-bridge {
  position: relative;
  margin: clamp(3.5rem, 8vw, 7rem) auto clamp(1rem, 3vw, 2.5rem);
  width: min(100%, 980px);
}

.skill-bridge__figure { margin: 0; }

.skill-bridge__frame {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: clamp(18px, 2.4vw, 34px);
  box-shadow: 0 30px 70px -40px rgba(13, 32, 24, 0.65);
}

.skill-bridge__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 44%;
  will-change: transform;
}
```

Add mobile rule:

```css
.skill-bridge { margin-top: clamp(2.75rem, 12vw, 4rem); }
.skill-bridge__frame { aspect-ratio: 4 / 3; }
```

- [ ] **Step 5: Run regression test; confirm green**

Run:

```bash
node --test test/weekly-lessons-media.test.mjs
```

Expected: video and bridge assertions pass; horizontal-score assertion still fails.

### Task 3: Replace vertical timeline with compact horizontal score

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: existing `steps`, title entrance, close-section quote/CTA animation.
- Produces: `.weekly-rhythm__band`, `.weekly-rhythm__head`, `.weekly-rhythm__stage`, `.weekly-rhythm__track`, and panel-width scroll travel.

- [ ] **Step 1: Replace desktop vertical timeline setup**

In desktop `matchMedia` block, select stage/track/spine. Compute travel from first panel width. Set dots/numerals/content hidden, then create separate pin, x-translation, spine, and reveal ScrollTriggers:

```ts
const stage = root.querySelector<HTMLElement>('.weekly-rhythm__stage')
const track = root.querySelector<HTMLElement>('.weekly-rhythm__track')
const spine = root.querySelector<HTMLElement>('.weekly-rhythm__spine-line')
const panels = gsap.utils.toArray<HTMLElement>('.weekly-step', root)
if (!stage || !track || !spine || panels.length === 0) return

const getScrollDistance = () => panels[0].offsetWidth * (panels.length - 1)
const HOLD_RATIO = 0.3
const getSectionTop = () => {
  const spacer = stage.parentElement?.classList.contains('pin-spacer') ? stage.parentElement : stage
  return spacer.getBoundingClientRect().top + window.scrollY
}
```

Create pin from `getSectionTop()` through `getScrollDistance() * (1 + HOLD_RATIO)`. Create translation and spine tweens over exact travel only, each with `scrub: 1` and `invalidateOnRefresh: true`. Create one reveal timeline tied to same travel; each panel reveals dot with `back.out(2)`, numeral to `autoAlpha: 0.16`, and content with `power3.out` at `i / (panels.length - 1) * 0.9`. Do not import Lenis or add snap/count behavior.

- [ ] **Step 2: Keep title/close motion; remove mobile timeline motion**

Keep existing non-reduced title and close animations. Delete current mobile step-reveal `matchMedia` block so mobile uses fully readable CSS state without JS. Leave reduced-motion outside all timeline setup.

- [ ] **Step 3: Replace timeline markup only**

Inside `weekly-rhythm`, replace current eyebrow/title/steps siblings with:

```tsx
<div className="weekly-rhythm__band" aria-hidden="true" />
<div className="weekly-rhythm__head">
  <p className="weekly-rhythm__eyebrow">How it works</p>
  <h2 className="weekly-rhythm__title">
    <span className="weekly-rhythm__title-mask">
      <span className="weekly-rhythm__title-line">A rhythm,</span>
    </span>
    <span className="weekly-rhythm__title-mask">
      <span className="weekly-rhythm__title-line weekly-rhythm__title-line--em">
        not a routine.
      </span>
    </span>
  </h2>
</div>
<div className="weekly-rhythm__stage">
  <span className="weekly-rhythm__spine-line" aria-hidden="true" />
  <ol className="weekly-rhythm__track">
    {steps.map((step) => (
      <li key={step.id} className="weekly-step">
        <span className="weekly-step__numeral" aria-hidden="true">
          {step.numeral}
        </span>
        <span className="weekly-step__dot" aria-hidden="true" />
        <div className="weekly-step__content">
          <h3 className="weekly-step__title">{step.title}</h3>
          <p className="weekly-step__body">{step.body}</p>
        </div>
      </li>
    ))}
  </ol>
</div>
```

Keep all step copy, headings, decorative `aria-hidden`, and deep-green close markup unchanged.

- [ ] **Step 4: Rebuild rhythm base CSS as vertical fallback**

Replace only `.weekly-rhythm*` and `.weekly-step*` rules above `.weekly-close` with vertical base rules for `.weekly-rhythm__band`, `__head`, `__stage`, `__track`, `__spine-line`, and `.weekly-step`. Base is no-JS/mobile/reduced-motion vertical flow. Keep all `.weekly-close*` rules byte-for-byte unchanged.

- [ ] **Step 5: Add desktop score CSS**

At `@media (min-width: 761px)`, establish:

```css
.weekly-rhythm__stage {
  height: min(78svh, 720px);
  overflow: hidden;
  background: linear-gradient(180deg, #9aac81 0%, #93a778 48%, #8aa06f 100%);
}
.weekly-rhythm__track {
  flex-flow: row nowrap;
  height: 100%;
  gap: 0;
  padding-inline: calc((100vw - min(72vw, 880px)) / 2);
}
.weekly-step { flex: 0 0 min(72vw, 880px); height: 100%; }
```

Position horizontal spine/dots at `46%`, then place ghost numeral and copy beneath it. Use same ink, alpha, type, shadow, and ghost-number roles defined in current styles. Do not make stage 100vh or use portrait media panels.

- [ ] **Step 6: Run regression test; confirm green**

Run:

```bash
node --test test/weekly-lessons-media.test.mjs
```

Expected: all three assertions pass.

### Task 4: Verify source, interaction, responsive motion, and visual quality

**Files:**
- Modify: none unless QA finds an issue.

- [ ] **Step 1: Run static checks**

Run:

```bash
node --test test/weekly-lessons-media.test.mjs
npm run build
npm run lint
npm run typecheck
```

Expected: all exit 0.

- [ ] **Step 2: Run desktop browser QA**

Open `/weekly-lessons` in browser at 1440px wide. Confirm compact video frame, tab selection and arrow-key navigation, bridge crop drift, timeline panel movement/spine reveals/final hold, close CTA, and no horizontal page overflow.

- [ ] **Step 3: Run mobile and reduced-motion QA**

At 390px wide, confirm vertical content and no overflow. Emulate `prefers-reduced-motion: reduce`, reload, and confirm bridge is static and timeline has no pin/translation while all copy remains visible.

- [ ] **Step 4: Compare accepted direction and render**

Use `view_image` on supplied design reference and latest browser screenshot. Check: compact video, no duplicate About-style chapter behavior, existing media roles, bridge image only once, typography/palette, and horizontal-score density. Fix material drift before commit.

- [ ] **Step 5: Commit focused changes**

```bash
git add test/weekly-lessons-media.test.mjs src/components/weekly/SkillLevelSection.tsx src/components/weekly/SkillLevelSection.css src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css
git commit -m "feat(weekly): add cinematic media rhythm"
```

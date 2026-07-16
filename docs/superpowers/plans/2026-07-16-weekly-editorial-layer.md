# Weekly Editorial Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a title lede plus two editorial sections (skill pathways, month rhythm) to /weekly-lessons between the pinned journey and the close, per `docs/superpowers/specs/2026-07-16-weekly-editorial-layer-design.md`.

**Architecture:** Two new self-contained components (`WeeklyPathways`, `WeeklyMonthRhythm`) rendered by `WeeklyJourneySections` between `.weekly-rhythm` and `.weekly-close`; each owns its CSS file and its GSAP reveal inside a `gsap.matchMedia` reduced-motion branch, guarded by the shared `playIfInView` util. The entrance lede rides the existing intro/exit timelines.

**Tech Stack:** React 19, TypeScript, GSAP 3 + ScrollTrigger, plain CSS files, `node --test` regex-on-source tests (existing `test/weekly-rhythm-faithful.test.mjs` pattern).

## Global Constraints

- Copy for the three levels verbatim from `levels` in `src/components/weekly/SkillLevelSection.tsx` (questions, headings, bodies, bullets).
- No new images, fonts, or dependencies. No changes to journey pin numbers (`CHAPTER_STARTS`, `CHAPTER_END`, 1.3×/2.6× distances) or close section.
- Exactly one `<h1>` on the page (the existing entrance title); new sections use `<h2>`.
- Palette/typography: forest ink `rgba(23, 53, 42, …)`, Fraunces display serif, uppercase eyebrows with `letter-spacing: 0.18em`, gold accent `#d39a42` reserved for arrows/warm accents, `clamp()` sizing, breakpoint `max-width: 760px`.
- Every play-once ScrollTrigger reveal is guarded with `playIfInView` from `src/utils/playIfInView.ts`.
- Reduced motion: sections render in flow, fully visible, no triggers.
- CTA language stays "Book a Lesson".

---

### Task 1: Entrance lede

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx` (h1 block ~line 382; intro timeline ~line 112; exit `transition` ~line 133)
- Modify: `src/components/weekly/WeeklyJourneySections.css` (after `.weekly-entrance__title` rules)
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: existing `.weekly-entrance__content` intro/exit timelines.
- Produces: `.weekly-entrance__lede` element inside `.weekly-entrance__content`.

- [ ] **Step 1: Write the failing test** — add to the existing `test()` list:

```js
test('entrance carries a descriptive lede', () => {
  const tsx = read('src/components/weekly/WeeklyJourneySections.tsx')
  assert.match(tsx, /weekly-entrance__lede/)
  assert.match(tsx, /build week over week/)
})
```

- [ ] **Step 2: Run** `node --test test/weekly-rhythm-faithful.test.mjs` — expect the new test FAILS (`weekly-entrance__lede` not found).

- [ ] **Step 3: Implement.** In the JSX, after the closing `</h1>`:

```tsx
<p className="weekly-entrance__lede">
  Private ukulele and guitar lessons that build week over week — whether you’ve called
  Maui home for years or you’re here for a long stay.
</p>
```

In the intro timeline (desktop no-preference branch), after the title lines tween:

```ts
.fromTo(
  root.querySelector('.weekly-entrance__lede'),
  { autoAlpha: 0, y: 18 },
  { autoAlpha: 1, y: 0, duration: 0.7 },
  0.55,
)
```

(The lede sits inside `content`, so the existing exit scrub already carries it out.)

CSS, after the title rules — also nudge the content block toward optical center by reducing the `bottom` offset (`clamp(13rem, 25vh, 17rem)` → `clamp(15rem, 34vh, 22rem)`) so headline + lede sit near mid-viewport instead of hugging the fold:

```css
.weekly-entrance__lede {
  max-width: 44ch;
  margin: 1.4rem 0 0;
  color: rgba(31, 29, 24, 0.66);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.15rem, 1.6vw, 1.45rem);
  font-style: italic;
  line-height: 1.5;
}
```

Reduced-motion branch needs no change (content renders in flow, visible).

- [ ] **Step 4: Run** the test file — expect PASS (all tests).
- [ ] **Step 5: Commit** `feat(weekly): add entrance lede`.

### Task 2: WeeklyPathways component

**Files:**
- Create: `src/components/weekly/WeeklyPathways.tsx`
- Create: `src/components/weekly/WeeklyPathways.css`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx` (render between `</section>` of `.weekly-rhythm` and `.weekly-close`)
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `playIfInView(animation, el)` from `src/utils/playIfInView.ts`; `usePrefersReducedMotion` hook.
- Produces: `<WeeklyPathways />` (no props), section class `weekly-pathways`.

- [ ] **Step 1: Failing test:**

```js
test('pathways section revives skill levels as accessible tabs', () => {
  const tsx = read('src/components/weekly/WeeklyPathways.tsx')
  assert.match(tsx, /role="tablist"/)
  assert.match(tsx, /aria-selected/)
  assert.match(tsx, /Just starting out/)
  assert.match(tsx, /First chords and basic strumming, from zero/)
  assert.match(tsx, /Guidance shaped by twenty-two years in music/)
  const page = read('src/components/weekly/WeeklyJourneySections.tsx')
  assert.match(page, /<WeeklyPathways \/>/)
})
```

- [ ] **Step 2: Run tests** — FAIL (file missing).
- [ ] **Step 3: Implement** `WeeklyPathways.tsx` — copy the `levels` data (question/heading/body/bullets only; drop image fields) verbatim from `SkillLevelSection.tsx`. Component skeleton:

```tsx
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import playIfInView from '../../utils/playIfInView'
import './WeeklyPathways.css'

gsap.registerPlugin(ScrollTrigger)

type PathwayId = 'beginner' | 'intermediate' | 'advanced'

const pathways: { id: PathwayId; numeral: string; label: string; question: string; heading: string; body: string; bullets: string[] }[] = [
  /* verbatim from SkillLevelSection levels[] */
]

export default function WeeklyPathways() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<PathwayId>('beginner')
  const rootRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const baseId = useId()
  const activePathway = pathways.find((p) => p.id === active) ?? pathways[0]

  const selectByOffset = (offset: number) => {
    const index = pathways.findIndex((p) => p.id === active)
    const next = pathways[(index + offset + pathways.length) % pathways.length]
    setActive(next.id)
    tabRefs.current[pathways.indexOf(next)]?.focus()
  }

  /* entrance reveal: one timeline (rule scaleX + rows/panel stagger),
     play-once trigger 'top 82%', guarded by playIfInView(root). */
  /* panel crossfade on `active` change: gsap.fromTo(panelRef.current,
     { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 }) —
     skipped entirely when prefersReducedMotion. */

  return (
    <section ref={rootRef} className="weekly-pathways" aria-labelledby={`${baseId}-title`}>
      <div className="weekly-pathways__inner">
        <span className="weekly-pathways__rule" aria-hidden="true" />
        <p className="weekly-pathways__eyebrow">Where you begin</p>
        <h2 id={`${baseId}-title`} className="weekly-pathways__title">Find your starting point</h2>
        <p className="weekly-pathways__lede">Lessons meet your level from the first strum — pick the door that sounds like you.</p>
        <div className="weekly-pathways__grid">
          <div className="weekly-pathways__tabs" role="tablist" aria-label="Skill level">
            {pathways.map((p, i) => (
              <button key={p.id} ref={(el) => { tabRefs.current[i] = el }} type="button" role="tab"
                id={`${baseId}-tab-${p.id}`} aria-selected={active === p.id}
                aria-controls={`${baseId}-panel`} tabIndex={active === p.id ? 0 : -1}
                className={`weekly-pathways__tab${active === p.id ? ' is-active' : ''}`}
                onClick={() => setActive(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); selectByOffset(1) }
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); selectByOffset(-1) }
                }}>
                <span className="weekly-pathways__tab-numeral" aria-hidden="true">{p.numeral}</span>
                <span className="weekly-pathways__tab-label">{p.label}</span>
                <span className="weekly-pathways__tab-question">{p.question}</span>
              </button>
            ))}
          </div>
          <div ref={panelRef} role="tabpanel" id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${activePathway.id}`} className="weekly-pathways__panel">
            <span className="weekly-pathways__watermark" aria-hidden="true">{activePathway.numeral}</span>
            <h3 className="weekly-pathways__heading">{activePathway.heading}</h3>
            <p className="weekly-pathways__body">{activePathway.body}</p>
            <ul className="weekly-pathways__bullets">
              {activePathway.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <Link to="/book" className="weekly-pathways__cta">
              Book a Lesson <span className="weekly-pathways__cta-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

CSS: cream band, top hairline `1px solid rgba(23, 53, 42, 0.16)`, two-column grid `minmax(0, 0.9fr) minmax(0, 1.4fr)` ≥761px collapsing to single column ≤760px with tabs as horizontal pill row; tab rows hairline-separated, active row gold-tinted left rule; watermark = absolute Fraunces italic `clamp(9rem, 18vw, 15rem)` at `rgba(23, 53, 42, 0.07)`; bullets as hairline-ruled rows; gold arrow on CTA (`#d39a42`).

Render `<WeeklyPathways />` in `WeeklyJourneySections.tsx` directly after the `.weekly-rhythm` section.

- [ ] **Step 4: Run tests** — PASS. Manually confirm in dev: click + ArrowRight/Left swap panel; focus visible.
- [ ] **Step 5: Commit** `feat(weekly): add skill pathway selector`.

### Task 3: WeeklyMonthRhythm component

**Files:**
- Create: `src/components/weekly/WeeklyMonthRhythm.tsx`
- Create: `src/components/weekly/WeeklyMonthRhythm.css`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx` (render after `<WeeklyPathways />`)
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `playIfInView`, `usePrefersReducedMotion`.
- Produces: `<WeeklyMonthRhythm />` (no props), section class `weekly-month`.

- [ ] **Step 1: Failing test:**

```js
test('month rhythm lays four beats on a spine', () => {
  const tsx = read('src/components/weekly/WeeklyMonthRhythm.tsx')
  assert.match(tsx, /A month in rhythm/)
  assert.match(tsx, /weekly-month__beat/)
  assert.match(tsx, /The song is yours/)
  const page = read('src/components/weekly/WeeklyJourneySections.tsx')
  assert.match(page, /<WeeklyMonthRhythm \/>/)
})
```

- [ ] **Step 2: Run tests** — FAIL (file missing).
- [ ] **Step 3: Implement.** Data: the four beats from the spec (week labels + copy, verbatim). Markup: eyebrow "A typical first month", h2 "A month in rhythm", framing line "Every student moves differently — a first month often sounds like this.", then `ol.weekly-month__spine` with a `span.weekly-month__line` + four `li.weekly-month__beat` (dot, `h3` week label, copy). Motion (no-preference branch): line `scaleX` 0→1 scrubbed (`start: 'top 78%'`, `end: 'top 30%'`), dots + beats staggered play-once reveal guarded with `playIfInView`; final dot carries `weekly-month__dot--gold`. Reduced motion: static, line full width. CSS: horizontal 4-column grid over the line ≥761px; ≤760px vertical spine (line becomes `scaleY`, left-aligned, beats stacked with left padding).
- [ ] **Step 4: Run tests** — PASS.
- [ ] **Step 5: Commit** `feat(weekly): add month-in-rhythm strip`.

### Task 4: Verification & deploy

**Files:**
- Modify: none (verification only) — fix regressions where found.

- [ ] **Step 1:** `npm run typecheck && npm run lint && node --test test/weekly-rhythm-faithful.test.mjs` — all pass.
- [ ] **Step 2:** `npm run build && npm run prerender && npm run check:seo` — all pass; weekly route still exactly one `<h1>`.
- [ ] **Step 3:** Playwright against production preview (port 5198): lede visible at load; journey pin distance unchanged (~3008px spacer at 1280×720); pathway click + ArrowRight swaps panel text; month beats visible after scroll; mobile 390×844 no horizontal overflow; reduced-motion pass: 0 pin-spacers (journey pin off), pathways + month visible and static.
- [ ] **Step 4:** Commit any fixes; push to `main`; after Pages deploy, re-run the Playwright pass against the live URL.

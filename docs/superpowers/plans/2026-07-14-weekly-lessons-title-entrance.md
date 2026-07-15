# Ongoing Lessons Title Entrance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the empty 46vh prelude with a text-led, full-viewport entrance using “A rhythm, not a routine.” as the visible page `<h1>`.

**Architecture:** `WeeklyJourneySections` will render a dedicated entrance before the existing timeline. Base CSS provides a static cream-to-sage entrance; GSAP adds entry and scroll-transition motion only when motion is allowed. The existing horizontal timeline, vertical fallback, Lenis integration, and close remain structurally unchanged.

**Tech Stack:** React 19, TypeScript, GSAP + ScrollTrigger, Lenis, scoped CSS, Node test runner, Playwright browser QA.

## Global Constraints

- Preserve all existing timeline step copy, horizontal travel math, spine behavior, and close content.
- Use the existing `How it works` label and `A rhythm,` / `not a routine.` title only; add no visible copy or imagery.
- Desktop entrance is `100svh`; mobile entrance is approximately `75svh`.
- The entrance title is the route's single visible `<h1>`.
- Under reduced motion, the entrance and vertical timeline remain fully readable with no pinning or required-content fading.
- Use existing cream, sage, deep-green, Fraunces, and Inter tokens only.

---

### Task 1: Lock the entrance structure with a failing test

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: source text from `WeeklyJourneySections.tsx` and `.css`.
- Produces: regression coverage for the visible `<h1>`, removal of the empty prelude, entrance heights, and preserved timeline mechanics.

- [ ] **Step 1: Replace the prelude assertion with entrance assertions**

```js
assert.match(tsx, /className="weekly-entrance"/)
assert.match(tsx, /<h1 className="weekly-entrance__title">/)
assert.doesNotMatch(tsx, /weekly-rhythm__prelude/)
assert.match(css, /min-height: 100svh/)
assert.match(css, /min-height: 75svh/)
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the current page still renders `weekly-rhythm__prelude` and the title as an `<h2>` inside the timeline.

### Task 2: Build the static entrance and preserve the timeline

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: the existing title text and site typography/palette variables.
- Produces: `.weekly-entrance`, `.weekly-entrance__content`, `.weekly-entrance__label`, `.weekly-entrance__title`, `.weekly-entrance__title-line`, and `.weekly-entrance__sage`.

- [ ] **Step 1: Replace the empty prelude and timeline heading with the entrance**

```tsx
<section className="weekly-entrance" aria-labelledby="weekly-entrance-title">
  <div className="weekly-entrance__sage" aria-hidden="true" />
  <div className="weekly-entrance__content">
    <p className="weekly-entrance__label">How it works</p>
    <h1 id="weekly-entrance-title" className="weekly-entrance__title">
      <span className="weekly-entrance__title-mask"><span className="weekly-entrance__title-line">A rhythm,</span></span>
      <span className="weekly-entrance__title-mask"><span className="weekly-entrance__title-line weekly-entrance__title-line--em">not a routine.</span></span>
    </h1>
  </div>
</section>
```

Remove `weekly-rhythm__prelude` and `weekly-rhythm__head`; leave the timeline stage, panels, spine, and close markup unchanged.

- [ ] **Step 2: Add the desktop and mobile entrance layout**

```css
.weekly-entrance { position: relative; min-height: 100svh; overflow: hidden; background: #f5f0e7; }
.weekly-entrance__content { position: absolute; left: 50%; bottom: clamp(7rem, 15vh, 11rem); width: min(100%, 1280px); transform: translateX(-50%); padding: 0 clamp(1.5rem, 4vw, 3rem); }
.weekly-entrance__sage { position: absolute; inset: auto 0 0; height: 38%; transform-origin: bottom; background: linear-gradient(180deg, rgba(160,178,135,0), #a0b287); }
@media (max-width: 760px) { .weekly-entrance { min-height: 75svh; } }
```

Reuse the existing title typography and indentation. Set `.weekly-rhythm` top padding to `0` so the entrance releases directly into the full-viewport stage.

- [ ] **Step 3: Run the focused test and confirm GREEN**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: all focused tests pass.

### Task 3: Add entrance motion with reduced-motion fallback

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`

**Interfaces:**
- Consumes: entrance selectors from Task 2 and the component's existing `gsap.matchMedia(root)` lifecycle.
- Produces: a once-only label/title rise and a scroll-scrubbed title lift/sage rise, reverted by `mm.revert()`.

- [ ] **Step 1: Add motion only for `prefers-reduced-motion: no-preference`**

```ts
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const entrance = root.querySelector<HTMLElement>('.weekly-entrance')
  const lines = gsap.utils.toArray<HTMLElement>('.weekly-entrance__title-line', root)
  const label = root.querySelector<HTMLElement>('.weekly-entrance__label')
  const sage = root.querySelector<HTMLElement>('.weekly-entrance__sage')
  if (!entrance || !label || !sage || lines.length === 0) return

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo(label, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 })
    .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 0.85, stagger: 0.12 }, 0.08)

  gsap.timeline({ scrollTrigger: { trigger: entrance, start: 'top top', end: 'bottom top', scrub: 0.8 } })
    .to(lines, { yPercent: -22, autoAlpha: 0.12, ease: 'none' }, 0)
    .fromTo(sage, { scaleY: 0.45 }, { scaleY: 1, ease: 'none' }, 0)
})
```

- [ ] **Step 2: Run the focused test**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: all tests pass.

### Task 4: Verify, commit, merge, and deploy

**Files:**
- Verify: `src/components/weekly/WeeklyJourneySections.tsx`
- Verify: `src/components/weekly/WeeklyJourneySections.css`
- Verify: `test/weekly-rhythm-faithful.test.mjs`

- [ ] **Step 1: Run automated verification**

```bash
node --test test/weekly-rhythm-faithful.test.mjs
npm run build
npm run lint
npm run typecheck
npm run check:seo
```

Expected: every command exits 0; `/weekly-lessons` reports exactly one `<h1>`.

- [ ] **Step 2: Browser QA**

At 1600×1000, verify the first viewport contains the full title, the sage transition is visible near the bottom, scroll leads into panel 01, and the existing timeline/close remain unchanged. At 390×844 and desktop reduced motion, verify one `<h1>`, three readable steps, no pin spacer, and no horizontal overflow.

- [ ] **Step 3: Commit**

```bash
git add src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css test/weekly-rhythm-faithful.test.mjs
git commit -m "feat(weekly): add title-led entrance"
```

- [ ] **Step 4: Merge to main and deploy**

Merge the verified branch into `main`, rerun the full verification suite, push `main`, and monitor the GitHub Pages workflow until it completes successfully.

# Weekly Lessons Mobile Horizontal Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing pinned, vertical-scroll-driven horizontal lesson journey run on phones and smaller screens.

**Architecture:** Reuse the existing GSAP/ScrollTrigger timeline at every motion-enabled viewport width. Add a runtime class while the animation is active so base CSS remains the vertical no-JavaScript and reduced-motion fallback, then layer mobile horizontal sizing on the existing desktop composition.

**Tech Stack:** React 19, TypeScript, GSAP ScrollTrigger, Lenis, CSS media queries, Node test runner, Playwright.

## Global Constraints

- Mobile input remains vertical touch scrolling; do not create a swipe carousel.
- Preserve desktop behavior, copy, entrance, close section, progress spine, reveals, and final-panel hold.
- At widths of 760px and below, use a `100svh` stage and `88vw` panels.
- Reduced-motion and no-JavaScript layouts remain vertical and unpinned.
- Keep all changes local. Do not commit, push, or deploy without explicit user instruction.

---

### Task 1: Lock the responsive interaction contract

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: source text from `WeeklyJourneySections.tsx` and `WeeklyJourneySections.css`
- Produces: regression assertions for the all-width motion query, runtime horizontal class, `100svh` mobile stage, and `88vw` mobile panels

- [ ] **Step 1: Write the failing assertions**

```js
assert.match(
  tsx,
  /mm\.add\('\(prefers-reduced-motion: no-preference\)', \(\) => \{\s+const stage/,
)
assert.match(tsx, /weekly-journey--horizontal/)
assert.match(css, /height: 100svh/)
assert.match(css, /flex: 0 0 88vw/)
assert.match(css, /gap: 0/)
```

Keep the existing assertion for the desktop-only entrance animation. The new assertion specifically requires the journey callback to omit the width restriction.

- [ ] **Step 2: Run the focused test and confirm RED**

Run `node --test test/weekly-rhythm-faithful.test.mjs`.

Expected: failure because the journey still requires `min-width: 761px` and mobile horizontal declarations do not exist.

---

### Task 2: Reuse the pinned journey on mobile

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `.weekly-rhythm__stage`, `.weekly-rhythm__track`, `.weekly-rhythm__spine-line`, `.weekly-step`, and the existing GSAP travel/reveal timelines
- Produces: `.weekly-journey--horizontal`, applied only while the all-width no-preference matchMedia callback is active

- [ ] **Step 1: Enable the journey callback at every motion-enabled width**

Use this callback opening:

```ts
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const stage = root.querySelector<HTMLElement>('.weekly-rhythm__stage')
  const track = root.querySelector<HTMLElement>('.weekly-rhythm__track')
  const spine = root.querySelector<HTMLElement>('.weekly-rhythm__spine-line')
  const panels = gsap.utils.toArray<HTMLElement>('.weekly-step', root)
  if (!stage || !track || !spine || panels.length === 0) return

  root.classList.add('weekly-journey--horizontal')
```

Keep the entrance animation at `min-width: 761px`. Use this journey cleanup:

```ts
return () => {
  root.classList.remove('weekly-journey--horizontal')
  gsap.ticker.remove(tick)
  lenis.destroy()
}
```

- [ ] **Step 2: Scope the current horizontal CSS to the runtime class**

Change the query to `@media (prefers-reduced-motion: no-preference)` and prefix its seven selectors:

```css
.weekly-journey--horizontal .weekly-rhythm__stage
.weekly-journey--horizontal .weekly-rhythm__spine-line
.weekly-journey--horizontal .weekly-rhythm__track
.weekly-journey--horizontal .weekly-step
.weekly-journey--horizontal .weekly-step__dot
.weekly-journey--horizontal .weekly-step__numeral
.weekly-journey--horizontal .weekly-step__content
```

Do not alter the declarations inside those selectors.

- [ ] **Step 3: Add the mobile horizontal overrides after the existing mobile fallback**

```css
@media (max-width: 760px) and (prefers-reduced-motion: no-preference) {
  .weekly-journey--horizontal .weekly-rhythm__stage {
    height: 100svh;
    margin: 0;
    margin-left: calc(50% - 50vw);
  }

  .weekly-journey--horizontal .weekly-rhythm__track {
    gap: 0;
    padding-right: 6vw;
    padding-left: 6vw;
  }

  .weekly-journey--horizontal .weekly-step {
    flex: 0 0 88vw;
  }

  .weekly-journey--horizontal .weekly-step__dot {
    top: 46%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .weekly-journey--horizontal .weekly-step__numeral,
  .weekly-journey--horizontal .weekly-step__content {
    width: 82%;
  }
}
```

The base and existing `max-width: 760px` rules remain the vertical fallback when the runtime class is absent.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run `node --test test/weekly-rhythm-faithful.test.mjs`.

Expected: 3 tests pass and 0 fail.

---

### Task 3: Verify behavior and regressions

**Files:**
- Verify: `src/components/weekly/WeeklyJourneySections.tsx`
- Verify: `src/components/weekly/WeeklyJourneySections.css`
- Verify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: local Vite server at `http://localhost:5173/weekly-lessons`
- Produces: evidence that vertical scrolling drives horizontal movement without overflow or reduced-motion regressions

- [ ] **Step 1: Run static verification**

Run these commands independently:

```bash
node --test test/weekly-rhythm-faithful.test.mjs
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Run rendered phone and small-tablet checks**

At `390x844` and `760x900`, verify:

```text
.weekly-journey--horizontal is present
stage height equals the small viewport height
document horizontal overflow equals 0
vertical scroll changes .weekly-rhythm__track transform
all three panel titles become visible during the pinned journey
the close section follows the final hold
console contains no application errors
```

- [ ] **Step 3: Run desktop and reduced-motion checks**

At `1440x900`, confirm existing pinned horizontal behavior remains. At `390x844` with reduced motion enabled, confirm `.weekly-journey--horizontal` is absent, the track remains a vertical column, and all three steps are readable without pinning.

- [ ] **Step 4: Review the final local diff**

Run these commands independently:

```bash
git diff --check
git diff -- src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css test/weekly-rhythm-faithful.test.mjs
git status --short
```

Expected: only the approved weekly journey files plus the local spec and plan are changed by this task; pre-existing `OpeningScene` changes remain untouched. Do not stage or commit.

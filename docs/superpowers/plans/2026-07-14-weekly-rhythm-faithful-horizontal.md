# Weekly Rhythm Faithful Horizontal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Ongoing Lessons page body with the supplied full-viewport horizontal timeline and Claude close sequence.

**Architecture:** `WeeklyLessons` renders only `WeeklyJourneySections`; the existing skill-level component is removed from this route. `WeeklyJourneySections` owns the source-faithful timeline and close. Its base CSS remains the accessible vertical flow; a desktop motion media-query turns the timeline into a `100vh` horizontal stage. GSAP/ScrollTrigger and the existing Lenis dependency drive desktop scroll; `gsap.matchMedia` tears them down on resize and route change.

**Tech Stack:** React 19, TypeScript, Vite, GSAP + ScrollTrigger, Lenis, CSS.

## Global Constraints

- Change only `src/pages/WeeklyLessons.tsx`, `src/components/weekly/WeeklyJourneySections.tsx`, `src/components/weekly/WeeklyJourneySections.css`, and a focused test.
- Replace `weekly-close` with the Claude source's visible markup, styling, copy strings, and animation-free treatment.
- Preserve the three supplied step strings exactly.
- Use `min-width: 761px`; at `max-width: 760px` and under reduced motion, render the normal vertical unpinned list.
- Desktop stage is exactly `100vh`; panels are `min(72vw, 880px)`; hold ratio is `0.3`; spine and dots sit at `46%` stage height.
- Travel is `panels[0].offsetWidth * (panels.length - 1)`, never `scrollWidth`.
- Do not add media, cards, colours, dependencies, or controls.
- Remove `SkillLevelSection` from the page route; do not edit the component itself.

---

### Task 1: Add executable source-lock tests

**Files:**
- Create: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: source text from the two WeeklyJourneySections files.
- Produces: static regression checks for the exact desktop layout, motion mechanics, and accessible fallback.

- [ ] **Step 1: Write the failing test**

```js
test('locks the handoff horizontal stage and fallback', () => {
  assert.match(tsx, /import Lenis from 'lenis'/)
  assert.match(tsx, /const HOLD_RATIO = 0\.3/)
  assert.match(tsx, /panels\[0\]\.offsetWidth \* \(n - 1\)/)
  assert.match(tsx, /new Lenis\(/)
  assert.match(css, /height: 100vh/)
  assert.match(css, /flex: 0 0 min\(72vw, 880px\)/)
  assert.match(css, /@media \(min-width: 761px\)/)
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.doesNotMatch(page, /SkillLevelSection/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the existing vertical implementation lacks the horizontal stage, Lenis integration, and source-lock selectors.

### Task 2: Replace the page composition and desktop timeline mechanics

**Files:**
- Modify: `src/pages/WeeklyLessons.tsx:1-22`
- Modify: `src/components/weekly/WeeklyJourneySections.tsx:1-263`

**Interfaces:**
- Consumes: `weekly-rhythm__stage`, `weekly-rhythm__track`, `weekly-rhythm__spine-line`, and `.weekly-step` CSS selectors.
- Produces: the Claude-only page body and desktop-only pinned horizontal scroll behavior.

- [ ] **Step 1: Remove `SkillLevelSection` from the route**

```tsx
export default function WeeklyLessons() {
  return <WeeklyJourneySections />
}
```

- [ ] **Step 2: Replace the timeline DOM only**

```tsx
<div className="weekly-rhythm__stage">
  <span className="weekly-rhythm__spine-line" aria-hidden="true" />
  <ol className="weekly-rhythm__track">{/* the existing steps map */}</ol>
</div>
```

- [ ] **Step 3: Implement the supplied desktop GSAP block**

```ts
const getScrollDistance = () => panels[0].offsetWidth * (n - 1)
const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), gestureOrientation: 'vertical', syncTouch: true })
const HOLD_RATIO = 0.3
```

Create a pin from `getSectionTop()` to `getSectionTop() + distance * 1.3`, linear track/spine scroll triggers over travel only, and scrub-tied reveals at `0`, `0.45`, and `0.9`. Return the Lenis/ticker cleanup from the desktop matchMedia callback.

- [ ] **Step 4: Replace the close JSX with Claude's source**

Use its quote as one Fraunces italic paragraph, then the exact prompt, Kihei/Wailea/Maipoina note, cream booking CTA, and FAQ link. Do not retain the current masked quote or grain element.

- [ ] **Step 5: Keep the fallback unmodified in behavior**

Do not create mobile or reduced-motion triggers. Base markup and CSS must leave all three steps readable.

- [ ] **Step 6: Run the focused test**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: PASS.

### Task 3: Replace the timeline and close CSS exactly

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.css:1-344`

**Interfaces:**
- Consumes: the Task 2 class names.
- Produces: base vertical flow plus exact desktop `100vh` horizontal stage.

- [ ] **Step 1: Preserve base vertical selectors**

Implement the handoff's `.weekly-rhythm__band`, `__head`, `__stage`, `__track`, and step styles for readable no-JS/reduced-motion flow.

- [ ] **Step 2: Add the desktop source-locked styles**

```css
@media (min-width: 761px) {
  .weekly-rhythm__stage { height: 100vh; width: 100%; overflow: hidden; }
  .weekly-rhythm__track { flex-direction: row; padding-left: calc((100vw - min(72vw, 880px)) / 2); padding-right: calc((100vw - min(72vw, 880px)) / 2); }
  .weekly-step { flex: 0 0 min(72vw, 880px); height: 100%; }
}
```

Keep the desktop stage rule under `prefers-reduced-motion: no-preference` so reduced-motion desktop uses the base vertical layout.

- [ ] **Step 3: Replace `.weekly-close` with Claude's source treatment**

Use the prototype's rounded deep-green radial gradient, text-centred layout, quote and CTA typography, cream CTA surface, and no grain overlay.

- [ ] **Step 4: Run the focused test**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: PASS.

### Task 4: Verify behavior and visual fidelity

**Files:**
- Verify: `src/components/weekly/WeeklyJourneySections.tsx`
- Verify: `src/components/weekly/WeeklyJourneySections.css`
- Verify: `test/weekly-rhythm-faithful.test.mjs`

- [ ] **Step 1: Run automated checks**

Run:

```bash
node --test test/weekly-rhythm-faithful.test.mjs
npm run build
npm run lint
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 2: Browser-check desktop scroll states**

Capture the stage at initial, mid-travel, and end-hold positions. Verify the stage fills the viewport; panel 01, 02, and 03 each centre in turn; the horizontal spine draws; and the final beat rests during the hold.

- [ ] **Step 3: Browser-check fallback states**

At 390px width and at desktop reduced motion, verify a vertical readable list, no pin spacers, no horizontal overflow, and all three step bodies present.

- [ ] **Step 4: Commit implementation**

```bash
git add src/pages/WeeklyLessons.tsx src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css test/weekly-rhythm-faithful.test.mjs
git commit -m "feat(weekly): restore faithful horizontal rhythm"
```

# Codebase Health Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair all code-owned audit findings while keeping the existing booking UI and deferring any external booking delivery.

**Architecture:** Preserve `SiteLayout` as the sole document-level landmark owner and retain the active weekly journey. Delete unreachable alternatives instead of silently swapping the weekly page design. Make animation cleanup and breakpoint behavior locally cancellable; no global scroll resets may occur in media-query setup.

**Tech Stack:** React 19, TypeScript, React Router 7, GSAP/ScrollTrigger, Vite, Node test runner, Oxlint.

## Global Constraints

- Do not alter booking-page appearance, labels, flow, or confirmation wording.
- Do not connect the form to Formspree, email, a CRM, or any external service.
- Do not invent business availability, pricing, contact details, or booking policies.
- Preserve existing uncommitted weekly and About work unless the task explicitly replaces the affected behavior.

---

### Task 1: Repair ongoing-page document semantics and footer contract

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx:183-335`
- Modify: `src/layout/SiteLayout.tsx:82-85`
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `SiteLayout` owns the sole `<main>` landmark.
- Produces: `WeeklyJourneySections` renders a section-level wrapper and its own `.weekly-close` footer navigation when shared footer suppression remains enabled.

- [ ] **Step 1: Write the failing tests**

```js
test('keeps the layout as the sole main landmark and restores the weekly footer band', () => {
  assert.doesNotMatch(tsx, /<main className="weekly-redesign">/)
  assert.match(tsx, /<footer className="weekly-redesign__footer">/)
  assert.match(tsx, /<Link to="\/">Home<\/Link>/)
  assert.match(tsx, /© \{new Date\(\)\.getFullYear\(\)\} Maui Lessons/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the weekly component currently returns `<main>` and has no footer.

- [ ] **Step 3: Implement the minimal change**

```tsx
<section className="weekly-redesign">
  {/* existing route content */}
  <footer className="weekly-redesign__footer">
    <nav aria-label="Footer navigation">
      <Link to="/">Home</Link>
      <Link to="/tourist-lessons">Vacation Lessons</Link>
      <Link to="/about">About</Link>
      <Link to="/faq">FAQ</Link>
      <Link to="/book">Book a Lesson</Link>
    </nav>
    <p>© {new Date().getFullYear()} Maui Lessons</p>
  </footer>
</section>
```

Add the matching CSS to the active weekly stylesheet; retain `SiteLayout` footer suppression only after this component supplies equivalent navigation.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: PASS.

### Task 2: Make weekly tabs satisfy their ARIA contract

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx:227-275`
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: every `role="tab"` exposes `aria-controls={panelId}`.
- Produces: a matching `role="tabpanel"` with that ID exists for every level; inactive panels are hidden, not omitted.

- [ ] **Step 1: Write the failing test**

```js
test('keeps every controlled weekly level panel in the DOM', () => {
  assert.doesNotMatch(tsx, /\{isActive \? \(/)
  assert.match(tsx, /hidden=\{!isActive\}/)
  assert.match(tsx, /id=\{panelId\}/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because inactive panels are conditionally absent.

- [ ] **Step 3: Implement the minimal change**

```tsx
<div id={panelId} role="tabpanel" aria-labelledby={tabId} hidden={!isActive}>
  <h3>{level.headline}</h3>
  <p>{level.detail}</p>
  <ul>{level.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
  <Link to={`/book?type=ongoing&level=${level.id}`}>{level.cta} <Arrow /></Link>
</div>
```

Keep the selected-state styling on the associated card; use `level`, not `activeLevel`, inside each panel.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: PASS.

### Task 3: Make booking transitions cancellable without changing the UI

**Files:**
- Modify: `src/pages/Book.tsx:229-235,348-384,448-452`
- Create: `test/booking-transition.test.mjs`

**Interfaces:**
- Consumes: `goTo(next, updated?)` remains the step navigation API.
- Produces: `transitionFallbackRef: React.MutableRefObject<number | null>` and `clearTransitionFallback(): void` prevent stale fallback callbacks.

- [ ] **Step 1: Write the failing test**

```js
test('clears the prior transition fallback before scheduling another step transition', () => {
  assert.match(source, /const transitionFallbackRef = useRef<number \| null>\(null\)/)
  assert.match(source, /function clearTransitionFallback\(\)/)
  assert.match(source, /clearTransitionFallback\(\)\n\s*transitionRef\.current\?\.kill\(\)/)
  assert.match(source, /transitionFallbackRef\.current = window\.setTimeout\(advance, 800\)/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/booking-transition.test.mjs`

Expected: FAIL because no fallback timer ref exists.

- [ ] **Step 3: Implement the minimal change**

```ts
const transitionFallbackRef = useRef<number | null>(null)

function clearTransitionFallback() {
  if (transitionFallbackRef.current !== null) {
    window.clearTimeout(transitionFallbackRef.current)
    transitionFallbackRef.current = null
  }
}
```

Call `clearTransitionFallback()` before killing/starting transitions, set the ref when scheduling `advance`, clear it inside `advance`, and clear it in the layout-effect cleanup and a component-unmount effect.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/booking-transition.test.mjs`

Expected: PASS.

### Task 4: Preserve reading position across animation breakpoints

**Files:**
- Modify: `src/components/about/AaronStorySections.tsx:117-123`
- Modify: `src/components/tourist-lessons/useVacationSceneProgress.ts:59-64`
- Create: `test/scroll-position-regression.test.mjs`

**Interfaces:**
- Consumes: each component creates a GSAP/Lenis sequence after its media-query condition becomes true.
- Produces: no sequence setup calls `window.scrollTo`; ScrollTrigger refreshes itself from the present scroll position.

- [ ] **Step 1: Write the failing test**

```js
test('does not reset document scroll while setting up responsive animated scenes', () => {
  assert.doesNotMatch(about, /window\.scrollTo\(/)
  assert.doesNotMatch(vacationProgress, /window\.scrollTo\(/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/scroll-position-regression.test.mjs`

Expected: FAIL with both source files containing `window.scrollTo`.

- [ ] **Step 3: Implement the minimal change**

Remove the About mobile `window.scrollTo` and `lenis.scrollTo(0)` calls. Remove the Vacation `window.scrollTo` call. Preserve the existing `ScrollTrigger.refresh()` scheduling.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/scroll-position-regression.test.mjs`

Expected: PASS.

### Task 5: Delete unreachable code and unused deployable assets

**Files:**
- Delete: `src/components/weekly/WeeklyPathways.tsx`
- Delete: `src/components/weekly/WeeklyPathways.css`
- Delete: `src/components/weekly/WeeklyMonthRhythm.tsx`
- Delete: `src/components/weekly/WeeklyMonthRhythm.css`
- Delete: `src/components/weekly/WeeklyStepVisual.tsx`
- Modify: `src/styles/mauiPalette.ts:28-40`
- Delete: `public/icons.svg`
- Delete: `assets/images/aaron-bookingForm.jpg`
- Delete: `assets/images/aaron-palms-beach-1.jpg`
- Delete: `assets/images/aaron-playing-2.jpg`
- Delete: `assets/images/aaron-weekly-1.jpg`
- Delete: `assets/images/canopy-bright-1.jpg`
- Delete: `assets/images/canopy-dense-1.jpg`
- Delete: `assets/images/canopy-sky-1.jpg`
- Create: `test/dead-code-regression.test.mjs`

**Interfaces:**
- Consumes: active weekly route imports only `WeeklyJourneySections`.
- Produces: no active source or public-file reference depends on the deleted files; `mauiPalette.ts` exposes only `MAUI_STOPS`, `MauiStop`, and `toGlslVec3`.

- [ ] **Step 1: Write the failing test**

```js
test('does not retain retired weekly component entry points or unused CSS palette exports', async () => {
  await assert.rejects(readFile(new URL('../src/components/weekly/WeeklyPathways.tsx', import.meta.url)))
  assert.doesNotMatch(palette, /toCssRgb|MAUI_PALETTE_CSS_VARS/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/dead-code-regression.test.mjs`

Expected: FAIL because the retired files and exports still exist.

- [ ] **Step 3: Implement the minimal change**

Delete only the listed files, remove `toCssRgb` and `MAUI_PALETTE_CSS_VARS`, and correct the palette file comment to describe shader consumers only. Confirm every deleted asset has no live import before removal.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/dead-code-regression.test.mjs`

Expected: PASS.

### Task 6: Harden WebGL initialization and cleanup

**Files:**
- Modify: `src/components/NavGradient.tsx:113-167`
- Modify: `src/components/home/HomeAmbientBackground.tsx:109-199`
- Create: `test/webgl-lifecycle.test.mjs`

**Interfaces:**
- Consumes: each canvas receives a `WebGLRenderingContext`.
- Produces: `compileShader(gl, type, source): WebGLShader | null`, `createProgram(gl): WebGLProgram | null`, and cleanup that calls `deleteBuffer`, `deleteProgram`, and `deleteShader` for successful initialization.

- [ ] **Step 1: Write the failing test**

```js
test('validates WebGL programs and releases GPU allocations on unmount', () => {
  for (const source of [navGradient, ambient]) {
    assert.match(source, /getShaderParameter\(.*COMPILE_STATUS/)
    assert.match(source, /getProgramParameter\(.*LINK_STATUS/)
    assert.match(source, /deleteBuffer\(/)
    assert.match(source, /deleteProgram\(/)
    assert.match(source, /deleteShader\(/)
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/webgl-lifecycle.test.mjs`

Expected: FAIL because neither component validates nor deletes GPU resources.

- [ ] **Step 3: Implement the minimal change**

Compile each shader with a checked helper; delete and return `null` on failure. Link with a checked helper; delete the program and both shaders on failure. If initialization fails, return from the effect and leave the existing CSS/background fallback visible. On cleanup, remove listeners/tickers, then delete buffer, program, and both shaders.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/webgl-lifecycle.test.mjs`

Expected: PASS.

### Task 7: Document deferred booking delivery and refresh health documentation

**Files:**
- Modify: `README.md:5-30`
- Modify: `docs/maui-lessons-codebase-audit.md:18-36`
- Modify: `maui-lessons-seo-task-list.md:49,142`
- Create: `test/documentation-health.test.mjs`

**Interfaces:**
- Consumes: booking UI stays unchanged and external delivery remains owner-blocked.
- Produces: documentation names the complete local verification commands, the deferred booking-delivery behavior, current lint status, and the active weekly footer implementation.

- [ ] **Step 1: Write the failing test**

```js
test('documents deferred booking delivery and current verification commands', () => {
  assert.match(readme, /npm run lint/)
  assert.match(readme, /npm run typecheck/)
  assert.match(readme, /booking submission is intentionally not connected/)
  assert.doesNotMatch(previousAudit, /lint command cannot currently be used as a meaningful project quality gate/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/documentation-health.test.mjs`

Expected: FAIL because the README and historical audit do not contain current statements.

- [ ] **Step 3: Implement the minimal change**

Document `npm run lint`, `npm run typecheck`, `node --test test/*.test.mjs`, `npm run build`, `npm run check:seo`, and `npm run prerender`. State plainly that booking confirmation does not deliver data and must not be considered a completed integration. Mark the old lint claim as resolved/historical and update the weekly-footer reference.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/documentation-health.test.mjs`

Expected: PASS.

### Task 8: Complete verification

**Files:**
- Test: all `test/*.test.mjs`

- [ ] **Step 1: Run static and unit verification**

Run: `npm run lint && ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json && node --test test/*.test.mjs`

Expected: all commands exit 0.

- [ ] **Step 2: Build and verify production SEO/prerender paths**

Run: `npm run build && npm run check:seo && npm run prerender`

Expected: all six routes pass one-H1/image-alt checks and six static HTML snapshots are produced.

- [ ] **Step 3: Run browser checks**

Use a local production preview to confirm all six routes load, `/weekly-lessons` has one `main`, a visible footer with six navigation links, all weekly tabs point to existing panels, navigation remains at the same vertical position after a desktop/mobile breakpoint change, and rapid booking navigation does not apply an obsolete step transition.

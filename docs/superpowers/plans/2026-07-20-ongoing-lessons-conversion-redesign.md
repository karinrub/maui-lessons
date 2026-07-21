# Ongoing Lessons Conversion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scroll-only Ongoing Lessons journey with the approved conversion-first design: editorial hero, trust strip, skill pathway cards, and a concise four-step first-month timeline.

**Architecture:** Keep `WeeklyJourneySections` as the route-level composition, but remove its GSAP/Lenis-only content structure. Reuse the existing lesson photographs and route links; use local React state for the selected level. The new page receives its visual rules from one page-scoped CSS file and remains legible without JavaScript-driven reveal states.

**Tech Stack:** React 19, TypeScript, React Router, CSS, Node test runner, Vite.

## Global Constraints

- Preserve `/weekly-lessons`, its SEO metadata, and the existing global navigation.
- Use only owner-supplied image assets already in `src/assets/images/`.
- Preserve accessible tab semantics and keyboard behavior for skill-level selection.
- Keep all essential copy visible without scrolling animation and respect `prefers-reduced-motion`.
- Do not edit unrelated user changes in `src/index.css`, `WeeklyMonthRhythm.tsx`, or About-page files.

---

### Task 1: Lock the new page contract with a focused test

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `WeeklyJourneySections` markup and `WeeklyJourneySections.css` class names.
- Produces: regression coverage for hero CTAs, trust strip, pathway switcher, and four milestone timeline.

- [ ] **Step 1: Write the failing test**

```js
test('renders the conversion-first ongoing lessons experience', () => {
  assert.match(tsx, /Choose your path/)
  assert.match(tsx, /Private lessons/)
  assert.match(tsx, /Your first month/)
  assert.match(tsx, /First chords/)
  assert.doesNotMatch(tsx, /new Lenis\(/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the new copy and conversion structure do not exist yet.

- [ ] **Step 3: Implement the new page composition**

Replace the animated journey with semantic hero, trust, pathway, and timeline sections. Use `<button>` controls with `role="tab"`, `aria-selected`, and arrow-key navigation.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: PASS with all checks green.

### Task 2: Build the responsive visual system

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: existing image paths, React Router `Link`, and page-wide brand fonts.
- Produces: responsive Ongoing Lessons page with CSS classes prefixed `weekly-redesign`.

- [ ] **Step 1: Implement the hero and trust strip**

Render the approved copy, a `Choose your path` anchor that targets the pathways section, a secondary first-month link, and the four proof points: Private lessons, Ukulele & guitar, Kihei / Wailea, From $35.

- [ ] **Step 2: Implement level cards and interactive detail area**

Render Beginner, Intermediate, and Advanced as accessible tabs. Keep Beginner selected by default and update heading, descriptive copy, and benefits when the selected tab changes.

- [ ] **Step 3: Implement the four-beat timeline and closing CTA**

Render First chords, First song, Rhythm settles, and Play it through as a horizontal rail that collapses to an ordered vertical list on small screens.

- [ ] **Step 4: Add responsive CSS and motion guards**

Match the approved palette: ivory paper, forest ink, muted sage, ochre accent. Use editorial display type, pill CTAs, an organic photo frame with concentric rings, and mobile-first wrapping with no horizontal overflow.

### Task 3: Verify behavior and rendering

**Files:**
- Test: `test/weekly-rhythm-faithful.test.mjs`

- [ ] **Step 1: Run static checks**

Run: `npm run typecheck && npm run lint && npm run build && node --test test/weekly-rhythm-faithful.test.mjs`

Expected: all commands exit 0.

- [ ] **Step 2: Validate the rendered route**

Run the local Vite server and inspect `/weekly-lessons` at desktop and mobile widths. Confirm page identity, visible hero CTA, pathway selection state change, no console errors, and no overflow.

- [ ] **Step 3: Compare against the accepted mockup**

Compare the accepted mockup and browser screenshots for hero composition, palette, CTA hierarchy, photo/ring treatment, card state, timeline, and mobile collapse. Correct any material mismatch before handoff.

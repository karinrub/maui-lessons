# Ongoing Lessons Foundation Implementation Plan

> **HISTORICAL — SHIPPED, THEN SUPERSEDED.** `caf3493` implemented this
> placeholder/metronome foundation. The Practice Loop redesign later replaced
> it and is now on `main` through `43e4132`. Do not execute this plan; use
> `docs/ongoing-lessons-handoff.md` for the current page.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the abandoned Vacation-like Ongoing Lessons implementation with the approved metronome/staff-line page foundation, using placeholders for every media slot.

**Architecture:** Keep `/weekly-lessons` routed through the existing `WeeklyLessons.tsx` entry and retain one self-contained `WeeklyJourneySections` component with its adjacent CSS. The component owns static semantic sections, a reusable local image placeholder, and a one-time GSAP progression reveal; no real weekly images, scheduling state, or additional route components are introduced.

**Tech Stack:** React 19, TypeScript, React Router, GSAP + ScrollTrigger, CSS, Node test runner.

## Global Constraints

- Do not modify routes, global navigation, shared layout, assets, or unrelated pages.
- Use existing `--home-sage`, `--home-sage-ink`, `--maui-gold`, and `--grain-url` tokens.
- Exclude the cadence strip, its schedule copy, weekday controls, and `highlightDay` behavior.
- Every former image slot remains a labelled dashed placeholder; do not import real images.
- Respect `usePrefersReducedMotion()` with a fully visible static fallback.
- Keep the cross-link at `/tourist-lessons` and the finale CTA at `/book`.

---

### Task 1: Define the route contract first

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `WeeklyLessons.tsx`, `WeeklyJourneySections.tsx`, `WeeklyJourneySections.css`, and `SiteLayout.tsx` as static source text.
- Produces: a test contract for the metronome/staff foundation and absence of the rejected content.

- [ ] **Step 1: Replace assertions for the abandoned pinned-photo/collage/timeline page with the new contract.** Assert the hero, facts band, rising chart, teacher section, cross-link, finale, six placeholders, placeholder-only media policy, and the absence of cadence, real weekly-image imports, and old Vacation-derived class names.

- [ ] **Step 2: Run the focused test before implementation.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because the current component still renders the discarded pinned-photo/collage/pull-quote implementation.

### Task 2: Rebuild the Ongoing Lessons page foundation

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: `usePrefersReducedMotion`, `playIfInView`, `Link`, the CSS variables from `src/index.css`, and the test selectors from Task 1.
- Produces: one `<main className="weekly-redesign">` with stable semantic sections and a local `ImagePlaceholder` helper.

- [ ] **Step 1: Remove all prior hero, collage, quote, numbered-spine, photo-import, and footer-nav markup/styles from the component boundary.**

- [ ] **Step 2: Render the approved hero, facts band, progression chart, teacher, cross-link, and finale in that order.** Include the exact approved copy, reusable dashed image placeholders, staff-line motif, metronome, ghost words, rising three-point chart, arch, and text-link CTA.

- [ ] **Step 3: Add scoped responsive CSS for desktop and narrow screens.** The chart stacks in document order on narrow screens while remaining fully visible; all placeholder frames retain captions.

- [ ] **Step 4: Add a one-time chart reveal with GSAP/ScrollTrigger.** Animate line, dots, and cards only when reduced motion is disabled; use `playIfInView` and `toggleActions: 'play none none none'`.

- [ ] **Step 5: Run the focused test after implementation.**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: PASS.

### Task 3: Document and verify the integrated route

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the completed component structure from Task 2.
- Produces: an accurate Ongoing Lessons Source Map entry and verification evidence.

- [ ] **Step 1: Update only the Ongoing Source Map paragraph in `CLAUDE.md` to describe the staff/metronome/rising-chart foundation and placeholders.**

- [ ] **Step 2: Run repository verification.**

Run: `npm run typecheck && npm run lint && npm run build && node --test test/*.test.mjs`

Expected: every command exits 0.

- [ ] **Step 3: Run the local app and inspect `/weekly-lessons` at desktop and mobile widths.** Confirm the page has no media requests for weekly photos, no cadence/day-picker, all sections flow in order, and the other routes still load.

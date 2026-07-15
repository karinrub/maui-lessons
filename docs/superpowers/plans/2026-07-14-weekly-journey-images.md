# Weekly Journey Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Weave the two approved lesson photographs into Steps 01 and 02 of the existing horizontal Ongoing Lessons journey.

**Architecture:** Extend the existing immutable `steps` data with optional media metadata, render one semantic figure only when media is present, and animate those figures inside the existing GSAP reveal timeline. Add a single responsive media component family in the existing stylesheet so desktop, mobile, no-JS, and reduced-motion modes share the same markup.

**Tech Stack:** React 19, TypeScript, CSS, GSAP ScrollTrigger, Vite asset URLs, Node test runner.

## Global Constraints

- Preserve the current page structure, copy, palette, footer, and horizontal interaction.
- Use only `assets/images/aaron-weekly-1.jpg` and `assets/images/aaron-teaching-2.jpg`.
- Keep Step 03 image-free.
- Do not tint the images or add card UI.
- Respect `prefers-reduced-motion`.
- Do not commit, push, or deploy.

---

### Task 1: Lock the approved media structure

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: `WeeklyJourneySections.tsx` and `WeeklyJourneySections.css` as source text.
- Produces: regression assertions for the two approved assets, semantic figures, image accessibility/loading attributes, and shared media styling.

- [ ] **Step 1: Write the failing test**

Add a test that asserts both image filenames appear once in the journey component, Step 03 has no `image` metadata, figures and descriptive alt text are rendered, the first image uses eager loading, the second uses lazy loading, and `.weekly-step__media` has a stable aspect ratio plus reduced-motion coverage.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: FAIL because neither approved media asset is present in `WeeklyJourneySections.tsx`.

### Task 2: Implement editorial media inside the journey

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: optional `image`, `alt`, and `loading` metadata on the existing `steps` entries.
- Produces: `.weekly-step__media`, `.weekly-step__image`, and `.weekly-step--has-media` markup/styles used by the journey animation.

- [ ] **Step 1: Add media metadata and semantic markup**

Create Vite URLs for the two assets, attach `aaron-weekly-1.jpg` to Step 01 and `aaron-teaching-2.jpg` to Step 02, and conditionally render:

```tsx
{step.image && (
  <figure className="weekly-step__media">
    <img
      className="weekly-step__image"
      src={step.image}
      alt={step.alt}
      loading={step.loading}
      decoding="async"
    />
  </figure>
)}
```

- [ ] **Step 2: Add the shared responsive media treatment**

Use a stable portrait editorial frame, `overflow: hidden`, subtle sage border/shadow, and `object-fit: cover`. Position it opposite the copy on desktop and above the copy on mobile while keeping both inside each horizontal viewport.

- [ ] **Step 3: Extend the existing GSAP reveal**

Initialize only present media with `autoAlpha`, `y`, and `scale`, then reveal it at the same panel timing as its copy. Animate the inner image with a restrained opposing vertical shift so it reads as parallax without changing the track movement.

- [ ] **Step 4: Run the focused test**

Run: `node --test test/weekly-rhythm-faithful.test.mjs`

Expected: all focused tests PASS.

### Task 3: Verify production and visual behavior

**Files:**
- Modify if required by visual QA: `src/components/weekly/WeeklyJourneySections.css`

**Interfaces:**
- Consumes: the completed journey component at `/weekly-lessons`.
- Produces: verified desktop, mobile, and reduced-motion presentation with no clipping or unintended copy changes.

- [ ] **Step 1: Run static verification**

Run: `npm run lint`, `npm run typecheck`, `npm run build`, and `node --test test/weekly-rhythm-faithful.test.mjs`.

Expected: all commands exit 0.

- [ ] **Step 2: Inspect the live page**

Use the built-in browser first. If its automation runtime is unavailable, use Playwright against the existing Vite server and record that fallback. Verify 1440×900, 390×844, and reduced-motion modes.

- [ ] **Step 3: Capture and inspect screenshots**

Capture Steps 01 and 02 at desktop and mobile sizes. Inspect the accepted source photographs and final renders with `view_image`, checking crop, copy legibility, frame scale, motion progression, palette continuity, and Step 03’s intentional breathing room.

- [ ] **Step 4: Confirm Git remains local**

Run: `git status --short`

Expected: implementation files are modified locally; no commit, push, or deployment occurs.

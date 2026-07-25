# Launch Readiness Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove current audit blockers while preserving cinematic visual direction.

**Architecture:** Keep existing GSAP/React structure. Expand shared header collision detection to text-bearing interactive/content elements; bound FAQ phone rail to FAQ shelf; preserve visible-by-default FAQ heading. Add browser regression validation for audited paths.

**Tech Stack:** React 19, TypeScript, Vite, GSAP/ScrollTrigger, Playwright.

## Global Constraints

- Preserve Maui brand, existing copy, and cinematic motion.
- Never gate meaningful content on scroll animation.
- Honor reduced motion and keyboard access.
- No new runtime dependency.

---

### Task 1: Shared header collision and Escape behavior

**Files:**
- Modify: `src/components/GlobalNavigation.tsx`
- Test: `scripts/check-launch-readiness.mjs`

- [ ] Write browser assertions for paragraph, accordion, and calendar collisions and Escape closure.
- [ ] Run `npm run test:launch`; expected failure: wordmark remains visible over at least one audited target.
- [ ] Expand collision observer targets to semantic text-bearing content and controls outside header; register document Escape listener while overlay is open.
- [ ] Rerun `npm run test:launch`; expected: collision and Escape assertions pass.

### Task 2: FAQ first paint and rail containment

**Files:**
- Modify: `src/components/faq/FaqSections.tsx`
- Modify: `src/components/faq/FaqSections.css`
- Test: `scripts/check-launch-readiness.mjs`

- [ ] Write browser assertions for zero-scroll visible heading and phone rail release before closing CTA.
- [ ] Run `npm run test:launch`; expected failure: phone rail overlaps closing CTA.
- [ ] Keep FAQ heading enhancement visible-by-default; bound mobile sticky rail to shelf content.
- [ ] Rerun `npm run test:launch`; expected: both assertions pass.

### Task 3: Full readiness verification

**Files:**
- Modify: `CLAUDE.md`

- [ ] Run typecheck, lint, launch browser checks, build, and SEO check.
- [ ] Verify representative desktop and mobile rendered routes, nav Escape, booking progression, motion, media readiness, and no overflow.
- [ ] Record validated findings and external booking endpoint limitation in `CLAUDE.md`.

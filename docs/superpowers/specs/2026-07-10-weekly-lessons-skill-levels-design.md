# Design Spec: Ongoing Lessons — Intro + Skill-Level Section

**Date:** 2026-07-10
**Status:** Approved

---

## Overview

New intro block plus a tabbed skill-level section for the Ongoing Lessons page (`WeeklyLessons.tsx`), showing that Aaron teaches all levels — Beginner, Intermediate, Advanced — without reusing patterns already used elsewhere on the site (no cards, no horizontal scroll).

**Scope:** this spec covers only the page intro and the skill-level tab section. It replaces the current placeholder heading (`[Page heading]`) and the "Skill Levels" `cp-grid--3` card block in `WeeklyLessons.tsx`. "How It Works", "Pricing", and the booking CTA sections are untouched — future work.

Available media for this section: `assets/images/aaron-weekly-1.jpg`, `assets/images/aaron-weekly-2.jpg`, `assets/videos/aaron-weekly-section.mp4`. All three are lower quality than other site assets. Real image/video assignment into the tab placeholders happens after this layout ships (see Open Items).

---

## Files

| File | Action |
|---|---|
| `src/components/weekly/SkillLevelSection.tsx` | New |
| `src/components/weekly/SkillLevelSection.css` | New |
| `src/pages/WeeklyLessons.tsx` | Edited — placeholder heading + "Skill Levels" grid block removed, replaced with intro block + `<SkillLevelSection />`. Remaining sections (How It Works, Video, Pricing, CTA) unchanged. |

Reference implementations to follow for code patterns (GSAP + ScrollTrigger, reduced-motion handling, line-by-line text reveal): `src/components/home/OpeningScene.tsx`.

---

## 1. Intro block

Sits above the tab section, inside `WeeklyLessons.tsx` (or as the top of `SkillLevelSection`).

```tsx
<div className="skill-intro">
  <p className="skill-intro__label">Ongoing Lessons</p>
  <h1 className="skill-intro__title">[Dramatic title line 1]<br/>[line 2]</h1>
  <p className="skill-intro__text">[Background paragraph about Aaron's teaching — TODO]</p>
</div>
```

- Title: large dramatic typography, Fraunces italic, homepage-scale treatment.
- Text: short paragraph giving background on Aaron/his teaching. All copy is TODO placeholder — do not invent factual business details (per `CLAUDE.md`).
- **Entrance animation:** line-by-line reveal, triggered on scroll-into-view (IntersectionObserver or ScrollTrigger `start: top 80%`), not on page load — the page transition and route entry already provide a load-in moment. Each line fades + slides up in sequence, matching the easing/rhythm of the `OpeningScene` tagline reveal.
- **Reduced motion:** lines appear immediately, no stagger, no transform.

---

## 2. Skill-level tab section

### Tabs

- Horizontal row of three labels: Beginner, Intermediate, Advanced.
- Active tab marked with an animated underline that slides to the active label's position/width (GSAP, computed from the button's bounding rect).
- Real tab semantics: `role="tablist"`, buttons with `aria-selected`, `role="tabpanel"` on the panel, arrow-key navigation between tabs.
- State: local `useState<'beginner' | 'intermediate' | 'advanced'>('beginner')` inside `SkillLevelSection` — no routing/URL involvement.

### Panel

- Full width, sits below the tab row.
- Content crossfades on tab change: GSAP fade-out of old content, fade-in of new (~200–300ms), no horizontal or vertical slide.
- **Reduced motion:** instant swap, no crossfade; underline jumps instead of sliding.

### Per-tab layout (each level laid out differently)

- **Beginner:** placeholder image block on the left, headline + text on the right (roughly 50/50 split).
- **Intermediate:** headline + text on top, placeholder image block full-width below.
- **Advanced:** large placeholder image block, text anchored/overlaid at the bottom-left of it.

All placeholder blocks use the existing `ph-block`-style gray placeholder primitive, sized per layout, `aria-hidden` until real media is assigned. All headline/body text per tab is TODO placeholder copy.

### Mobile (`≤760px`)

- Tab row stays horizontal (three short labels fit).
- All three panel layouts collapse to the same stacked pattern: text above, placeholder image block below — the desktop asymmetry is not preserved on small screens.

---

## 3. Video placement — open implementation decision

`aaron-weekly-section.mp4` is used elsewhere on this page as a full-width, muted/looped, no-controls editorial breather — not tied to any specific skill-level tab. Exact position (between intro and tabs, vs. between tabs and "How It Works") is decided during implementation, once the page's visual rhythm is visible in the browser. This is a deliberate deferred call, not an unresolved requirement — implementation must land on one of the two positions and should note the choice in the PR/commit.

---

## 4. Accessibility & motion summary

- Tabs: `role="tablist"` / `role="tab"` / `aria-selected` / `role="tabpanel"`, keyboard arrow-key navigation.
- `prefers-reduced-motion`: intro lines appear without stagger; tab crossfade becomes an instant swap; underline jumps rather than animates.
- Placeholder image blocks: `aria-hidden="true"` until real images with proper alt text are assigned.

---

## 5. Testing

- `npm run build` and `npm run lint` after implementation.
- Manual browser QA: tab click and keyboard navigation, crossfade transition, reduced-motion fallback (both intro and tab section), mobile stacking behavior at the 760px breakpoint.

---

## Open Items (post-ship, not blocking this spec)

- Assign `aaron-weekly-1.jpg` / `aaron-weekly-2.jpg` into two of the three tab placeholders once layout/motion is validated in-browser (per-tab layout was designed before media assignment, deliberately).
- Decide final position of `aaron-weekly-section.mp4` (see section 3).
- Replace all TODO/placeholder copy (intro title/text, per-tab headline/body) with real content.

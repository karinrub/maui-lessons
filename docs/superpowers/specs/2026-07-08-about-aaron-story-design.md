# Design Spec: About Page — Aaron Story (horizontal scroll)

**Date:** 2026-07-08
**Status:** Approved
**Supersedes:** `2026-06-29-about-sticky-slideshow-design.md` (never implemented — no `StickySlideshow` component exists in the codebase). This spec replaces the entire `About.tsx` page, not just its gallery section.

---

## Overview

Full rebuild of the About page as a horizontal-scroll, chapter-based story about Aaron, told chronologically. Vertical page scroll drives horizontal panel movement (pin + scrub), one chapter per panel, four chapters total. Sage green is used as a full-bleed alternating background, structural rather than decorative. Text motion uses a new site idiom — scrub-tied blur-to-focus — distinct from patterns already used on Home and Vacation Lessons.

All existing placeholder content in `About.tsx` (bracketed copy, `ph-block`/`ph-line` placeholder primitives, `cp-section` scaffolding) is removed and replaced.

Source copy: `inspo/aboutaaron.md` (Aaron's bio text, Kupono Music Studios website + Facebook, plus the Keolahou Church detail).

---

## Files

| File | Action |
|---|---|
| `src/components/about/AaronStorySections.tsx` | New |
| `src/components/about/AaronStorySections.css` | New |
| `src/pages/About.tsx` | Rewritten — all placeholder sections removed, replaced with `<AaronStorySections />`. `about-top-bush` decoration kept as-is (unrelated, already shipped). |

Reference implementations to follow for code patterns (GSAP + ScrollTrigger + `matchMedia`, reduced-motion handling, reveal data-attributes): `src/components/tourist-lessons/VacationStorySections.tsx`, `src/components/home/OpeningScene.tsx`.

---

## Structure: Four Chapters

Horizontal-scroll section, pinned for its full scroll duration. Each chapter is one 100vw panel. Panels alternate background: off-white / sage / off-white / sage.

### 1. Meet Aaron (off-white)
- Eyebrow: "Your instructor"
- Headline: "Meet Aaron"
- Image: `aaron-portrait-1`, large
- Body: short "no pressure" teaching promise line (adapted from source: *"His goal is to help students feel comfortable with the ukulele, with a no-pressure approach."*)

### 2. Twenty-two years chasing music (sage)
- Headline: "Twenty-two years chasing music"
- Typographic-led, no image (or small inset only)
- Condensed journey copy as numbered sub-beats (`01/02/03` style, matching Vacation page's numeral convention):
  - **01** — Illinois State University, 1999: picks up guitar, first band, live performance.
  - **02** — Asheville, NC, age 23: mandolin and banjo, bluegrass style.
  - **03** — College of San Mateo, CA, age 24: sound creation, sampling/synthesis, electronic music, Afro-Latin percussion.

### 3. Then he found the ukulele (off-white)
- Headline: "Then he found the ukulele"
- Image: `aaron-teaching-tree-1`
- Body: Colorado, age 35 — The Music District (Fort Collins), works with industry professionals in workshops/production/events, first studies ukulele there.
- Pull line: "His primary instrument and focus ever since." (8 years, per source)

### 4. Home in Maui (sage)
- Headline: "Home in Maui"
- Image: `aaron-onlyMe`
- Body: moved to Maui in 2023, devoted to traditional Hawaiian style and other ukulele styles; teaching philosophy — patient, no-pressure, welcomes beginners of any age.
- Small credibility detail: Aaron plays at Keolahou Church on Thursday nights.
- CTA: "Book a Lesson" → `/book`

---

## Motion

### Horizontal scroll mechanic
- GSAP + `ScrollTrigger`, `pin: true` on the section, matching the vertical-pin pattern already used in `OpeningScene.tsx` and `VacationCinematicScene.tsx` but on the horizontal axis (`xPercent` tween on a track element driven by scroll progress, `end: '+=<n>%'` sized to total horizontal travel).
- Scrubbed (`scrub: true` or a small scrub value), not a fixed timeline — position tracks scroll position bidirectionally.

### Text reveal — blur-to-focus (new idiom, not reused from other pages)
- Chapter headline + body start at `filter: blur(Npx)`, `scale(1.06)`, reduced opacity.
- As the horizontal scrub carries the panel toward center, these interpolate to `blur(0)`, `scale(1)`, full opacity.
- Tied to scrub progress (not a play-once `toggleActions` trigger) — reverses cleanly when the user scrolls backward through a chapter.
- Panel 2's numbered sub-beats keep a simpler fade/stagger-up entrance (secondary content, shouldn't compete with the chapter headline's blur-focus motion).
- Images use a plain scale-settle on entry (e.g. `scale(1.08) → scale(1)`), no clip-path wipe — clip-path reveal is reserved for the Vacation page's idiom, not reused here.

### Reduced motion
- `prefers-reduced-motion: reduce`: no pin, no horizontal scrub, no blur/scale. Chapters render as a normal vertical stack, text fully visible at rest — same fallback convention as `OpeningScene` and `VacationStorySections`.

### Mobile (`max-width: 760px`)
- No horizontal pin (avoids the well-known mobile horizontal-scroll-hijack UX problem).
- Chapters stack vertically, one per section.
- Blur-to-focus reveal still applies, but triggered by each chapter's vertical scroll position instead of horizontal scrub progress.

---

## Out of scope

- No new images beyond the three specified (`aaron-portrait-1`, `aaron-onlyMe`, `aaron-teaching-tree-1`).
- No new copy beyond what's sourced from `inspo/aboutaaron.md` — do not invent additional biographical claims.
- Gallery section, teaching-approach placeholder section, and portrait-placeholder markup from the old `About.tsx` are deleted, not migrated.

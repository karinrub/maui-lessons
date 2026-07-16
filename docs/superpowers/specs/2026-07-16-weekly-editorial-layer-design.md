# Weekly (Ongoing Lessons) editorial layer — design

Date: 2026-07-16. Status: approved (direction + content blocks chosen by owner-side reviewer in session; photos-in-pathways dropped during design, see Pathways section).

## Problem

/weekly-lessons is the thinnest story route: title entrance → three pinned chapters → close CTA. The title viewport is ~60% empty above the fold, and the page jumps from "how it works" straight to the booking CTA with no depth for a visitor deciding whether ongoing lessons fit them. An external review also asked for "filters" (subject/progress) — an LMS pattern that doesn't fit a marketing page for one teacher; the intent (help visitors self-select a starting point) does fit.

## Goals

- Fill the title viewport's dead upper half with a real page description.
- Add two content sections between the journey and the close: skill-level pathways (interactive) and a month-in-rhythm cadence strip.
- No invented business facts: all pathway copy revived verbatim from the shipped-then-dropped `SkillLevelSection.tsx`; cadence copy stays a qualitative teaching arc (no promises, prices, or policies).
- Keep the existing journey pin, close section, palette, ghost motif, and CTA language untouched.

## Non-goals

- No changes to journey mechanics, chapter copy, or close section.
- No pricing/testimonial/FAQ-teaser blocks (offered, declined this round).
- No new photos (see Pathways), no new dependencies.

## Page structure (after)

1. `weekly-entrance` — existing, densified: content block optically centered; new `weekly-entrance__lede` paragraph (2 lines) under the h1, joining the entrance stagger and the exit scrub. Lede copy: "Private ukulele and guitar lessons that build week over week — whether you've called Maui home for years or you're here for a long stay." (mirrors the FAQ reassurance line's framing; locations already appear in this page's close.)
2. `weekly-rhythm` — untouched.
3. **NEW** `weekly-pathways` — "Find your starting point."
4. **NEW** `weekly-month` — "A month in rhythm."
5. `weekly-close` — untouched.

## Pathways section (`weekly-pathways`)

- Cream band, hairline top rule, eyebrow label + h2 ("Find your starting point"), one-line lede.
- Layout ≥761px: two columns. Left: three selector rows (radiogroup-free tabs): ghost numeral 01/02/03 + level label + the level's `question` line as whisper text. Right: swap panel with `heading`, `body`, three `bullets` as hairline-ruled rows, gold-arrow "Book a Lesson" link to /book, and an oversized low-alpha Fraunces-italic numeral watermark behind (site ghost motif). No photos — the original SkillLevelSection images either already appear in the journey chapters above or repeat the same setting; a typographic panel avoids duplicate imagery and added payload.
- ≤760px: selector rows become a horizontal pill row above the stacked panel.
- Copy source: `levels` array in `src/components/weekly/SkillLevelSection.tsx` (Beginner "Just starting out", Intermediate "Building real skill", Advanced "Refining your sound" — questions, bodies, bullets verbatim). After this ships, `SkillLevelSection.tsx/.css` and their now-unreferenced images are deletable dead code (follow-up, not this change).
- Semantics: `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, roving tabindex, Left/Right (and Up/Down) arrow keys move selection; panel labelled by active tab. Selecting swaps content with a short crossfade (`autoAlpha`/`y` ~0.35s); instant swap under reduced motion.
- Entrance: section reveals once on scroll (rule draws, rows stagger) via a play-once trigger guarded with `playIfInView`.

## Month section (`weekly-month`)

- Reuses the journey's spine language: horizontal progress line + four dots, line color warming toward gold at week 4 (the `--weekly-warm` device).
- Four beats, copy (qualitative, no commitments):
  1. Week one — "First song foundations. A few chords, a simple strum, something that already sounds like music."
  2. Week two — "Chords into changes. The shapes you know start moving — slowly, then smoothly."
  3. Week three — "Rhythm settles in. Strumming patterns click, and practice starts feeling like playing."
  4. Week four — "The song is yours. You play it start to finish — and pick what's next."
- Heading: eyebrow + h2 ("A month in rhythm"), one framing line making clear it's a typical arc, not a syllabus ("Every student moves differently — a first month often sounds like this.").
- Desktop: four columns over the spine; the line draws with a scrubbed ScrollTrigger while dots pop in sequence. ≤760px: vertical spine left, beats stacked. Reduced motion: fully static, line at full width.

## Motion, accessibility, performance

- All new reveals: existing GSAP + `ScrollTrigger` with `toggleActions: 'play none none none'` guarded by `src/utils/playIfInView.ts`; scrubbed line-draw for the month spine only.
- Reduced motion: both sections render in-flow, fully visible, no triggers (matchMedia branch, same pattern as the journey).
- No new h1 (stays the entrance title); new sections use h2 + h3 beats.
- No new images, fonts, or dependencies; route already lazy-loaded. Expected JS/CSS delta: a few KB in the WeeklyLessons chunk.

## Test criteria

- `test/weekly-rhythm-faithful.test.mjs` extended: pathways markup (tablist, three tabs, verbatim beginner bullet), month markup (four beats), lede present, existing assertions unchanged.
- Behavior (Playwright, production build): title viewport shows lede at load; pathway tab click and ArrowRight swap panel content; month beats visible after scroll; reduced-motion pass shows both sections static and visible; mobile 390px stacks without horizontal overflow; journey pin distances unchanged.
- Gates: typecheck, lint, build, prerender, check:seo (h1 count stays 1, no missing alt) all pass.

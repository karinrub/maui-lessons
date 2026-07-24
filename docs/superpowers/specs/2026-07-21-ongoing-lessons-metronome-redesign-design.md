# Ongoing Lessons redesign — "practice" concept (2026-07-21)

> **HISTORICAL — SHIPPED, THEN SUPERSEDED.** This spec produced the `caf3493`
> placeholder/metronome foundation. The approved Practice Loop implementation
> replaced it and is now on `main` through `43e4132`. Use
> `docs/ongoing-lessons-handoff.md` and the Practice Loop spec for current
> behavior.

## Status and why this doc exists

The current `WeeklyJourneySections.tsx`/`.css` on disk is a Vacation-Lessons-mirrored implementation (pinned photo-dissolve hero, sage-panel photo collage with a floating ghost word, full-bleed pull-quote band) built from an earlier prompt. That direction was rejected: it read as a reskin of Vacation Lessons rather than a page with its own identity.

This spec replaces that implementation entirely. It is based on an approved external design concept (a Claude Design prototype, reviewed and approved by the site owner with one exclusion — see "Excluded section" below). **Discard the current pinned-hero/collage/pull-quote implementation and its CSS. Build from this spec instead.**

This page's own visual idea, distinct from every other route on the site: a **metronome / music-staff motif** — thin horizontal "staff lines" as a recurring eyebrow icon, a small swinging-metronome graphic in the hero, and a **rising line-chart** (not a numbered spine, not a photo carousel) for the progress section. Vacation Lessons owns pinned-photo-hero + collage + pull-quote. Home owns the stacked-card deck. About owns the horizontal pinned chapters. FAQ owns the accordion + compass. Book owns the hairline-row wizard. This page should look like it belongs to the same family (same color tokens, same serif/sans pairing, same restrained gold-accent-as-CTA idiom) without borrowing any of those specific mechanics.

## Excluded section — do not build this

The approved design included a "cadence strip" between the facts band and the progression section:

> "The method is simple — same day, every week. This student's is every Thursday." followed by a row of seven circular day-of-week toggles (M T W T F S S) with one day highlighted gold.

**Leave this section out entirely.** It implies a specific scheduling feature (per-student assigned lesson day) that doesn't exist as real product functionality yet, and reads as a claim/feature promise rather than description. Do not build the day-picker, do not build the "same day, every week" line, and do not carry over the `highlightDay` prop concept.

## Page structure, top to bottom

### 1. Hero

- Eyebrow row: a small icon of five thin horizontal lines (a music-staff mark, gold `#b87d2c`, low opacity ~0.55) next to the label "ONGOING LESSONS" (uppercase, small, bold, gold, letter-spacing ~0.18em).
- An oversized, very low-opacity (~0.07) italic Fraunces ghost word, "practice", positioned behind/above the headline — same ghost-word idiom used elsewhere on the site (Home's "experiences", FAQ's rotating word, Book's numeral watermark), just this page's own word.
- H1, italic Cormorant Garamond, semibold: **"Progress happens on repeat."**
- Lede paragraph, sans body: **"Private ukulele and guitar lessons on Maui, shaped around whoever's in front of him — not a level chart."**
- Below that, a horizontal row containing:
  - A small metronome graphic (a dark triangular base + a thin gold needle) with a gentle swinging animation (rotate between roughly -14deg and +14deg, ease-in-out, ~2.4s loop) — skip the animation entirely under `prefers-reduced-motion`.
  - Two image placeholders side by side (see "Image placeholders" section below): one captioned "Lesson footage — silent clip, low-fi" (styled as a dark video-style placeholder with a centered play-triangle icon), one captioned "Photo: the coast near Kīhei".

### 2. Facts band

- Full-bleed sage green (`#b8c8a0`) section with the fine grain texture overlay already used sitewide (`--grain-url`), low opacity, multiply blend.
- Eyebrow: staff-line icon + "THE BASICS" (same treatment as hero eyebrow, but ink-colored `#17352a` at low opacity instead of gold, since this band's own background is already sage/warm).
- Four facts in a single horizontal row (wrap to fewer columns on narrow viewports), separated by thin vertical hairline dividers, italic Cormorant Garamond, semibold, ~21px:
  1. "Private, one-on-one lessons"
  2. "Ukulele or guitar"
  3. "Weekly, across Kīhei, Wailea & Maipoina Beach Park"
  4. "From $35 for a 30-minute lesson"
- Below the facts, one full-width image placeholder captioned "Photo: Maipoina Beach Park, one of the regular lesson spots".

### 3. Progression section

- Cream background, matching the page's base paper color.
- Oversized ghost word "onward" (same treatment as hero's "practice"), positioned upper-right this time.
- Eyebrow: staff-line icon (gold) + "HOW IT DEVELOPS".
- H2, italic Cormorant Garamond: **"Same instrument. A different player, every year."**
- The centerpiece: a **rising line chart**, not a numbered spine and not a photo carousel. A smooth curve drawn left-to-right across faint horizontal hairline guide lines, rising in three stages (like a line trending upward), with a small gold dot at each of three points along the rise. Each dot pairs with a short text card (title + one-sentence description) positioned near it, at increasing height as the line rises:
  1. **"First chords, real songs"** — "You're playing actual songs from day one — not drills building toward some future payoff."
  2. **"Reading & understanding"** — "As the songs get harder, you start reading music and learning why the instrument works the way it does."
  3. **"Refining your style"** — "Technique sharpens, and your own voice on the instrument starts to come through."
- On scroll into view (once, not reversible — this is a one-time reveal, not a scrubbed animation): the line draws in, then each dot pops in (scale from 0.3 to 1) staggered, then each card fades up (opacity + translateY) staggered shortly after its dot. Respect `prefers-reduced-motion`: render everything in its final state with no animation.
- Beside the chart, one image placeholder captioned "Photo: hands on the fretboard".
- This content is grounded in the FAQ's existing approved answer about how ongoing lessons work (first chords → reading music → refining personal style) — don't invent a different progression narrative.

### 4. Teacher section

- Background: the warm cream-tan `#f1ebdf` already used elsewhere on the site for alternating sections.
- Eyebrow: staff-line icon (gold) + "WHO YOU'RE LEARNING FROM".
- One sentence, italic Cormorant Garamond, with two inline numerals set in oversized italic Fraunces, gold, at roughly 1.5x the surrounding text size: **"Aaron has taught guitar and ukulele on Maui for `22` years. For the last `8`, ukulele has been the focus."**
- Beside the text, one image placeholder captioned "Photo: Aaron teaching a lesson".

### 5. Cross-link

- A single centered, thin section: italic Cormorant Garamond, muted, **"Just on Maui for a week or two? There's a page for that — [Vacation Lessons]"** (linked to `/tourist-lessons`).

### 6. Finale

- A small dome/arch transition (the same "bulge" shape used at Home's and Vacation's finale, just shorter — about 64px tall) leading into a dark ink (`#0d2018`) full-bleed section with the sitewide fine grain texture overlay.
- Oversized ghost word "begin" at the bottom of the dark section, low opacity, warm tan/gold tint rather than the page's usual ink-on-cream ghost color (it needs to read against the dark background).
- H2, italic Cormorant Garamond, cream-colored: **"Make it a habit."**
- Lede: **"One lesson a week, for as long as it keeps being useful."**
- CTA: a single text link (not a pill button — this page's finale is deliberately quieter than Home/Vacation's boxed CTA), gold-colored, underlined, with a trailing arrow: **"Start lessons →"**, linking to `/book`. This is an intentional deviation from the sitewide "Book a Lesson" pill-button convention — confirm with the site owner before generalizing this pattern elsewhere, but ship it as specified here.
- Small caps location line beneath, low-opacity cream: **"MAUI LESSONS — KĪHEI · WAILEA · MAIPOINA BEACH PARK"**.
- No footer nav links in this finale (unlike Home's and Vacation's finale bands) — this page's closing section is intentionally simpler. Do not add the four-link footer nav here.

## Image placeholders

The user wants placeholders, not real photos, at this stage. Build a small reusable placeholder component (e.g. `ImagePlaceholder`) used everywhere an `image-slot` appears above:

- A light dashed border box (`border: 1px dashed rgba(23, 53, 42, 0.3)` or similar), muted fill matching the section's background, rounded corners (~6–8px) to match the site's existing image corner radius conventions.
- A simple generic image icon centered (a basic inline SVG picture-frame icon is fine — no need to source an icon library for this).
- A one-line caption below the box, in the site's existing photo-caption style (small italic Cormorant Garamond, muted) — e.g. "Photo: the coast near Kīhei". Use the exact caption text specified per placeholder above; these captions double as the brief for whoever sources the real photos later.
- Do not wire these to any real image import — no `assets/images/*.jpg` references. Keep every image slot a pure placeholder until real photos are supplied.

## Technical constraints (match existing codebase conventions)

- Single component + single CSS file, same architecture as every other page section: `src/components/weekly/WeeklyJourneySections.tsx` + `WeeklyJourneySections.css`, rendered by `src/pages/WeeklyLessons.tsx`. No new sub-components split out unless genuinely warranted (the `ImagePlaceholder` component is the one reasonable exception).
- Colors: reuse the shared tokens already defined in `src/index.css` (`--home-sage`, `--home-sage-ink`, `--maui-gold`, `--grain-url`) rather than re-declaring hex values, except where a color is genuinely unique to this page (e.g. the tan `#f1ebdf` teacher-section background, which already exists as `--weekly-paper-deep` or similar in the current file — check before adding a new variable).
- Type: Cormorant Garamond italic for headlines/body-serif moments (matches the rest of this page's established type system), Fraunces italic for ghost words and the oversized inline numerals (matches sitewide ghost-word idiom), Inter for eyebrow labels and any plain sans body copy.
- Motion: GSAP + ScrollTrigger, gated behind `usePrefersReducedMotion()`, using `playIfInView` for anything that could already be in the viewport on load (this page's sections are far enough down that this is a safety net, not a certainty). The progression chart's reveal is a one-time forward animation (`toggleActions: 'play none none none'`), not the reversible scroll behavior used elsewhere on this page previously — there's no scroll-reversal requirement in this design.
- Accessibility: real `<h1>`/`<h2>` hierarchy, `alt=""` or a real description on any eventual image (placeholders can use empty alt since they carry no content yet), keep the FAQ-sourced facts as real text (not just decorative), and provide a static, fully-visible fallback under `prefers-reduced-motion` and on narrow viewports per the site's existing pattern (see `WeeklyJourneySections.css`'s existing mobile and reduced-motion media queries for the pattern to follow).

## Verification

- Rewrite `test/weekly-rhythm-faithful.test.mjs` to match this structure (it currently locks in the Vacation-mirrored implementation being replaced — every assertion referencing `hero-media`, `collage-panel`, `collage-ghost`, `quote-word`, the cadence/day-picker, etc. needs to change).
- Run `npm run build`, `npm run lint`, `npm run typecheck`, and `node --test test/*.test.mjs` — all must pass clean before considering this done.
- Update `CLAUDE.md`'s Source Map entry for Ongoing Lessons once this ships, describing the metronome/staff-line/rising-chart structure actually in place (the current entry describes the Vacation-mirrored version being replaced).

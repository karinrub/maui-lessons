# Ongoing Lessons editorial rise design

## Goal

Polish the Ongoing Lessons page so its motion has a composed, premium rhythm.
The “Small steps. Real progress.” title should arrive as a memorable focal point
without making the horizontal first-month story heavier or less responsive.

## Motion direction

Use an editorial rise rather than a zoom or wipe:

- The “Your first month” eyebrow fades up first.
- “Small steps.” and “Real progress.” each sit in their own clipping mask and
  rise into place with a short overlap.
- The supporting italic sentence follows after the title has settled.
- The entrance plays when the month scene comes into view and reverses cleanly
  when the reader scrolls back above its trigger.
- The movement uses transform and opacity only. It does not animate layout,
  color, or the circular lesson cards.

## Scroll and performance

- Keep one pinned `ScrollTrigger` for the horizontal track, its snap points,
  progress rail, and active-card state. Do not add per-card triggers.
- Use a separate lightweight trigger only for the heading entrance.
- Cache the progress-rail setter and update React state only when the focused
  beat index actually changes.
- Keep the current two-times travel multiplier, pin anticipation, and
  non-inertial snap so the user has breathing room at every beat and reverse
  scroll remains direct.

## Structure and accessibility

- Preserve the existing `<h2 id="month-title">` and wrap only its visual lines
  in presentational masks/spans. The full title remains a single readable text
  node for assistive technology.
- Keep the ordered lesson beats, active `aria-current="step"`, visible progress
  rail, and shared site navigation untouched.
- At widths at or below 860px, and under reduced motion, show the title and
  lesson stations immediately in their static vertical layout. No pinning,
  masks, or hidden text are required to read the section.

## Verification

- Regression checks prove the title contains two editorial lines, the desktop
  entrance uses one reversible heading trigger, the horizontal story retains
  its single pinned track, and the static fallback remains visible.
- Browser QA verifies the title arrives in line order, active beats remain
  centered after snapping, reverse scrolling restores the prior focused beat,
  and there are no relevant console errors.
- Run focused tests, production build, and `git diff --check` before handoff.

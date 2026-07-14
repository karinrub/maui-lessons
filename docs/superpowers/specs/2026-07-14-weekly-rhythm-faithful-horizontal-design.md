# Ongoing Lessons: faithful horizontal rhythm replacement

## Source of truth

`/Users/karinrubin/Downloads/Shared file instructions-handoff.zip`, specifically
`shared-file-instructions/project/WeeklyRhythm.dc.html` and the supplied handoff
files. The July 14 screen recording confirms this full-viewport treatment.

## Scope

Replace the entire `/weekly-lessons` page body with the Claude prototype's
timeline and close sequence.

Do not change:

- The page route, global header, global footer, palette, type system, or dependencies.

Remove from the route:

- `SkillLevelSection`, including its existing video, tabs, images, and all related page body content.

Render in this order:

1. The Claude `weekly-rhythm` timeline.
2. The Claude `weekly-close` section, matching its visible copy, background, CTA, and spacing.

## Desktop behavior (min-width: 761px, motion allowed)

- Use a `100vh` sage-gradient stage, pinned for horizontal travel plus a 30% end hold.
- Place three `min(72vw, 880px)` step panels on one non-wrapping horizontal track.
- Start with panel 01 centered. Page scroll moves the track by `panelWidth * (count - 1)`; do not use `scrollWidth`.
- Draw a horizontal spine at 46% stage height. It scales left-to-right with travel.
- Reveal each beat at scrub progress 0, 0.45, and 0.9: dot pop, ghost numeral to opacity 0.16, then copy rise.
- Use Lenis driven by GSAP's ticker, matching the supplied design. Clean up Lenis, ticker, tweens, and triggers through `gsap.matchMedia` teardown.
- Use numeric, pin-spacer-aware ScrollTrigger start/end calculations and `invalidateOnRefresh: true`.

## Mobile and reduced motion

- At max-width 760px, and whenever reduced motion is requested, use the design's normal vertical, unpinned list.
- Show all three steps in document flow. No horizontal translation, pinning, or hidden steps.

## Visual lock

- Preserve the supplied text exactly.
- Preserve the cream/sage/deep-green palette and Fraunces/Inter typography.
- Keep the oversized Fraunces italic ghost numerals at opacity 0.16.
- Add no cards, gold decoration, new controls, media, copy, or image sections.
- Do not retain the current page's intro, skill-level selector, bridge image, or its alternate close treatment.

## Verification

- Compare desktop start, middle, and final-hold states to the supplied recording and handoff source.
- Check mobile and reduced-motion vertical fallback.
- Confirm no overflow, stale pins, Lenis instances, or trigger artifacts after resize/route changes.

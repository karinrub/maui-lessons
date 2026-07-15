# Weekly Lessons Mobile Horizontal Scroll

## Goal

Extend the existing desktop horizontal lesson journey to phones and smaller screens. Mobile users continue scrolling vertically while the journey pins and its three steps travel horizontally, matching the desktop interaction.

## Interaction

- Run the existing GSAP/ScrollTrigger horizontal journey at every viewport width when reduced motion is not requested.
- Keep vertical touch gestures as the input; do not introduce a swipe carousel or horizontal page scrolling.
- Preserve the existing progress spine, step reveals, final-panel hold, Lenis smoothing, and close-section handoff.
- Use the current vertical timeline as the no-JavaScript and reduced-motion fallback.

## Responsive Layout

- Keep the desktop stage and panel dimensions unchanged.
- On screens at or below 760px, use a `100svh` pinned stage.
- Give mobile panels an `88vw` basis with centered track gutters, keeping each step readable while allowing a subtle preview of adjacent space.
- Retain the horizontal spine and centered dots. Size and position numerals and copy for the narrower panel without changing their content.
- Do not alter the entrance or closing section as part of this change.

## Accessibility and Resilience

- Respect `prefers-reduced-motion: reduce` by leaving the timeline vertical and unpinned.
- Keep all content in document order and readable when JavaScript is unavailable.
- Prevent horizontal document overflow outside the pinned stage.

## Verification

- Add a regression assertion that the horizontal animation is no longer limited to widths above 760px.
- Verify vertical-scroll-driven horizontal progress at phone, small-tablet, and desktop widths.
- Verify the reduced-motion layout remains vertical.
- Check for clipped text, page-level horizontal overflow, scroll traps, and runtime errors.

## Delivery Constraint

Keep all changes local. Do not commit, push, or deploy without explicit user instruction.

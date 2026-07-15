# Weekly Lessons Cinematic Color Progression

## Goal

Turn the weekly lessons page into one continuous cinematic color journey: warm ivory at the entrance, luminous sage through the lesson timeline, moss at the final step, and the home page’s tan-and-deep-ink finale. Remove visible color seams while preserving the approved entrance and horizontal journey.

## Scoped Palette

Define page-scoped color variables in `WeeklyJourneySections.css`:

- Warm ivory: `#f6f0e5`
- Sunlit cream: `#fbf7ee`
- Eucalyptus mist: `#d7dfc5`
- Luminous sage: `#b4c69d`
- Mid sage: `#98ad7f`
- Moss: `#71875f`
- Home tan: existing `--home-tan` (`#dcb877`)
- Forest: `#254630`
- Deep forest: `#0e2118`
- Maui gold glow: `rgba(198, 148, 78, 0.16)`
- Forest ink: `#17352a`

These variables remain local to `.weekly-journey` and do not alter other routes.

## Entrance

- Replace the flat cream with layered radial gradients: a restrained gold warmth near the upper area and a very soft green bloom near the lower edge.
- Match the bottom of the entrance gradient exactly to the first timeline sage so the boundary disappears.
- Keep the current title composition and rise animation.
- Increase the “How it works” and title contrast slightly against the evolving background.

## Horizontal Journey

- Use a wide multi-stop background gradient sized larger than the viewport.
- Synchronize its horizontal background position with the existing pinned travel: step one is luminous sage, step two moves through balanced olive-sage, and step three settles into moss.
- Preserve the current track, panel sizing, spine, dots, reveals, mobile horizontal behavior, and final hold.
- Refine spine, dot halo, body copy, and ghost-number colors so they remain legible throughout the full progression.
- On reduced motion, show the same palette as a static vertical gradient without scroll-driven color movement.

## Exact Home Finale Replacement

- Remove the current weekly closing section, including its “Nobody learns a song...” quote, location note, FAQ link, and CTA.
- Do not render the generic `SiteFooter` on the weekly route.
- Render the existing `HomeFinale` component as the weekly page ending, unchanged in visible content and styling.
- Preserve the exact home finale tan arch, “Ready to play your first song?” line, booking button, navigation links, grain, CTA animation, and copyright.
- Remove weekly-route bottom shell spacing so the final moss field meets the tan arch without a cream gap.
- Tune the final journey moss to hand naturally into `--home-tan`; do not restyle `HomeFinale` itself.

## Fixed Header Contrast

- Scope header colors to the weekly route.
- Use forest ink for the menu control and wordmark over the light entrance and sage timeline.
- Transition both to warm cream as `HomeFinale` reaches the fixed header.
- Restore normal global header colors when leaving the weekly route.
- The open fullscreen navigation retains its existing colors.

## Motion and Accessibility

- Reuse the current GSAP matchMedia lifecycle and ScrollTrigger positions.
- Color movement is scrubbed with the same timeline distance as the horizontal journey.
- Header color changes follow the `HomeFinale` boundary.
- Under `prefers-reduced-motion: reduce`, keep the background static and switch the header colors instantly at the closing boundary instead of tweening them.
- Maintain readable contrast and zero page-level horizontal overflow at desktop, tablet, and phone widths.

## Verification

- Add source-lock assertions for scoped palette variables, oversized journey background, synchronized background-position tween, exact `HomeFinale` reuse, generic-footer suppression, and weekly header state.
- Check the entrance, all three timeline steps, and `HomeFinale` at `390x844`, `760x900`, and `1440x900`.
- Confirm the old weekly close and generic footer are absent and the home finale appears exactly once.
- Confirm header contrast over both light and dark regions.
- Confirm reduced-motion remains static and readable.
- Run focused tests, lint, build, and rendered browser QA.

## Delivery Constraint

Keep all changes local and uncommitted. Do not push or deploy without explicit user instruction.

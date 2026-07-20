# Ongoing Lessons scroll circles design

## Goal

Turn the “Your First Month” section into a tactile, scroll-driven horizontal story that gives prospective students a concrete, memorable sense of weekly progress.

## Hero

- Replace the single weekly lesson photo with a two-image circular collage using `assets/images/aaron-teaching-2.jpg` and `assets/images/aaron-weekly-2.jpg`.
- Keep the existing warm-paper hero, Cormorant display title, deep-sage CTA, gold details, and shared navigation.
- Frame the two images with lightweight sage orbit rings; the imagery remains decorative because the hero copy already communicates the lesson offer.

## First-month scroll story

- Keep the first-month heading and four existing progression beats.
- On viewports at least 861px wide and when motion is allowed, pin the section while its four circular stations travel horizontally across the viewport as the user scrolls vertically.
- Animate the stations from the right edge into a centered active position and then toward the left edge. The same GSAP timeline is driven by `ScrollTrigger.scrub`, so scrolling upward reverses every transform, opacity, and scale exactly.
- Give each station a layered circular treatment: concentric sage/cream outlines, a gold number marker, the beat title and copy, and an image crop. The active station is largest and fully opaque; adjacent stations remain partially visible to signal more content.
- Include a visible “Scroll to explore” cue and a progress rail whose fill follows the timeline.
- On screens at or below 860px, and for `prefers-reduced-motion: reduce`, do not pin or horizontally translate. Render the four stations in a conventional, fully visible vertical sequence.

## Technical approach

- Keep the feature self-contained in `WeeklyJourneySections.tsx` and `WeeklyJourneySections.css`.
- Use the project’s existing GSAP + `ScrollTrigger` stack and follow the About page’s `gsap.context`, `matchMedia`, `ScrollTrigger.refresh`, and cleanup pattern.
- Add explicit refs for the first-month stage, horizontal track, progress fill, and each station. Do not attach global query selectors.
- Ensure dynamic scroll distance is based on the actual horizontal overflow and remeasured during refresh.

## Accessibility and resilience

- The four lesson beats remain ordered list content in the DOM and readable without JavaScript.
- Decorative photos use empty `alt` text; the existing text supplies the content.
- Preserve keyboard access to lesson-level tabs and all booking links.
- Ensure the pinned desktop scene does not create horizontal document overflow.

## Verification

- Add focused regression checks for the two hero image assets, the removed trust strip, the ScrollTrigger/matchMedia/reverse-scrub setup, and the reduced-motion fallback.
- Run the focused test, typecheck, lint, production build, and `git diff --check`.
- Inspect desktop, mobile, reverse-scroll, and reduced-motion behavior in the browser.

# Ongoing Lessons title entrance

## Goal

Replace the empty 46vh cream prelude with an intentional text-led entrance that
flows directly into Claude's existing horizontal timeline.

## Scope

Change only the entrance and its transition into `weekly-rhythm`. Preserve the
approved horizontal timeline panels, spine, copy, sage palette, close section,
global header, and global footer.

## First viewport

- Use a `100svh` cream entrance on desktop.
- Keep the existing `How it works` label.
- Use `A rhythm,` / `not a routine.` as the visible page `<h1>`.
- Set the title in the existing Fraunces italic style, anchored in the lower-left
  third of the site's content rail. Indent the second line as it is today.
- Let the existing sage gradient begin near the bottom of the entrance so the
  transition into the timeline reads as one continuous field.
- Add no imagery, new copy, controls, badges, or decorative objects.

## Motion

- On entry, reveal the label and two title lines with the site's restrained
  staggered rise.
- As the reader scrolls through the end of the entrance, lift and soften the
  title while the sage field rises into the viewport.
- After the entrance releases, pin the existing full-viewport horizontal
  timeline exactly as currently implemented.
- Do not repeat the label or title inside the pinned timeline.
- Use GSAP and ScrollTrigger only for the entrance transition; retain the
  timeline's existing Lenis integration.

## Responsive and accessibility behavior

- On mobile, use an approximately `75svh` static entrance followed by the
  existing vertical timeline.
- Under `prefers-reduced-motion: reduce`, show a static entrance and the existing
  vertical timeline. Do not pin, translate, or fade required content.
- The visible entrance title provides the route's single `<h1>` and resolves the
  SEO deployment failure without hidden or duplicate headings.

## Verification

- Desktop first viewport contains the label and complete title with intentional
  spacing; no empty white block remains.
- Scroll transition leads continuously from cream to sage and into panel 01.
- Desktop timeline and close remain visually unchanged after the entrance.
- Mobile and reduced-motion layouts contain one `<h1>`, all three steps, no pin
  spacers, and no horizontal overflow.
- `npm run check:seo`, build, lint, typecheck, and focused tests pass before the
  deployment is pushed.

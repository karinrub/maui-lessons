# Ongoing Lessons shared sage design

## Goal

Bring the Ongoing Lessons route into the site's shared sage-green visual language while preserving the current conversion-first hierarchy, accessible level selector, and warm editorial tone.

## Visual system

- Use the global `--home-sage` token (`#b8c8a0`) as the page's sole sage surface token. Do not retain the local `--weekly-sage` color.
- Keep the hero on warm paper so the first sage surface has a clear visual entrance.
- Change the “Find your starting point” pathway section to a full-width sage band. Keep its selectable cards on warm cream surfaces, with deep sage ink for text and borders.
- Give the trust strip a very light sage-tinted background, without reducing copy contrast.
- Add subtle sage treatment to the hero art frame and the first-month timeline background; these remain secondary to the image, headings, and gold progress line.
- Keep selected tabs, primary CTAs, and the final CTA in deep sage ink. Keep gold as the interaction and timeline accent.

## Behavior and accessibility

- Preserve the existing tablist keyboard behavior and link destinations exactly as they are.
- Maintain visible focus rings and contrast-safe hover/focus states on sage surfaces.
- Preserve the current responsive hierarchy: a single-column card stack on small screens and no horizontal overflow.

## Implementation boundaries

- Scope production changes to `src/components/weekly/WeeklyJourneySections.css`.
- Extend `test/weekly-rhythm-faithful.test.mjs` to guard use of the shared sage token and absence of the obsolete local sage token.
- Do not modify page markup, routing, global palette values, or unrelated worktree changes.

## Verification

- Run the focused weekly regression test, typecheck, lint, production build, and `git diff --check`.
- Visually inspect the route at desktop and 390px mobile widths for shared-header integrity, sage balance, contrast, and horizontal overflow.

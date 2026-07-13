# Addendum: Ambient Sage Wash for `/book`

Date: 2026-07-12
Applies on top of `2026-07-12-booking-wizard-redesign-prompt.md` and the
approved spec that followed it.

## Why

The redesigned wizard is currently pure cream/ink — clean, but disconnected
from `--home-sage` (#b8c8a0), which is the shared handoff color tying the
Home hero arch into the services deck, and reappears as the About/FAQ/
Vacation "resting" tone elsewhere on the site. Booking should feel like it's
part of the same material system, not a separate cream-only page.

## Direction (confirmed)

Add a subtle ambient sage wash to the page background — not a solid sage
panel, not a new boxed section. A soft gradient tint, same idiom as the
existing white radial wash already on `body` in `index.css`
(`radial-gradient(circle at 50% 0%, rgba(255,255,255,0.48), transparent
34rem)`), just recolored toward sage and scoped to `/book`.

## Implementation notes for Claude Code

- Scope this to `.bw` (the booking root), not global `body` — other routes
  keep their current wash.
- Use `--home-sage` at low alpha (start around 0.12–0.18 and tune by eye),
  radiating from the top of the page (behind the hero headline) and fading
  to transparent well before the option rows start — the rail/content area
  should still read as cream once you're a couple of steps down.
- Consider a second, fainter sage bloom near the bottom of the page (behind
  the footer band) so the page "resolves" into sage the way Home resolves
  from its arch into the sage services deck — optional, only if it doesn't
  compete with the confirmation step's watermark numeral.
- No hard edges, no `border`, no distinct "panel" div — this is a background
  gradient on the existing root element, layered under the grain texture
  (`--grain-url`) if that's already applied at this level, same as other
  sections do.
- Verify: the wash must stay well under the contrast needed for ink text and
  the gold rail fill to remain legible — check against
  `--home-sage-ink` body copy and the gold hairlines at both the top (near
  full wash strength) and where it fades.
- Reduced-motion / print: this is static CSS, not a tween, so no branching
  needed — just make sure it doesn't rely on scroll-linked opacity (keep it
  a fixed gradient, not a GSAP scrub, to match the "page now scrolls
  normally" simplification already made).

## Non-goals

- Do not reintroduce a solid sage panel/card behind any step content — that
  recreates the "boxed" problem this redesign just removed.
- Do not change gold's role (still reserved for active rail fill, selection,
  hover-arrow, focus states).

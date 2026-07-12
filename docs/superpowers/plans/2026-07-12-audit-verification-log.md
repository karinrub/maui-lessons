# Audit Verification Log — 2026-07-12 (local, `npm run dev`, Playwright)

Verifies the claims in `maui-lessons-design-audit.md` against the local tree at the Task 7 checkpoint. Live re-verification against the deployed URL is logged at the bottom (Task 13).

## Task 2 — hero video stall (audit §11, Critical)

| Scenario | Result |
|---|---|
| Normal desktop (1400px) | PASS — header opacity 1 after intro, video readyState 4, tagline opacity reaches 1 (scrollY≈500), fades by ≈800, arch opacity 1, deck pin-spacer present |
| Stall: `**/*.MP4` aborted, 390px and 500px | PASS — header opacity 1 (class `site-header`, no `is-suppressed`) within 3s, landscape 1, frame 0 (video hidden), tagline opacity 1 → 0, arch 1, hero AND deck pin-spacers created, menu → FAQ navigates. Only console error is the deliberately blocked MP4 request |
| Slow load: video delayed 6s (loads after the 3s timeout) | PASS — pins created at timeout, video later reaches readyState 4, frame fades to opacity 1, both pins survive (no effect re-run teardown), tagline still opacity 1 at scrollY 480 |
| Reduced motion | PASS — `is-reduced-motion` class, 0 pin-spacers, tagline/arch opacity 1 in flow, body overflow visible, 0 console errors, 3s timer a no-op |

Remaining caveat (audit's own): confirm once on a physical phone on cellular data.

## Task 7 — P0/P1 claims (all six routes, 1400px)

### One `<h1>` per route + alt text (audit P0)

| Route | `<h1>` count | `<img>` count | missing alt |
|---|---|---|---|
| `/` | 1 | 5 | none |
| `/tourist-lessons` | 1 | 4 | none |
| `/weekly-lessons` | 1 | 1 | none |
| `/about` | 1 | 3 | none |
| `/faq` | 1 | 0 | none |
| `/book` | 1 | 0 | none |

PASS. (Audit had found 0 `<h1>` and 4/5 missing alt on the deployed build.)

### Footer standardized (audit P0)

All six routes render a footer: `.site-footer` (5 links: Vacation/Ongoing/About/FAQ/Book + copyright) on the five non-home routes, and the equivalent `home-finale__links` band (4 links + copyright; the Book destination is the finale's primary CTA button immediately above) on `/`. The audit's "three variants" state is gone. PASS.

### Meeting location (audit P0)

"Maipoina Beach Park" present on `/tourist-lessons` (finale note, near CTA), `/weekly-lessons` (close note), and in the FAQ "Where do lessons happen?" answer. PASS.

### Placeholder copy eliminated

No `[TODO`, `[Placeholder`, or bracketed placeholder text anywhere in the DOM on any route (checked via `textContent`, which includes pre-reveal hidden elements). Testimonial sections are hidden until real quotes exist. PASS.

### Interactions (audit §11 desktop matrix)

- Book wizard end-to-end: type → group → calendar (past dates disabled; enabled day selected) → hour slot → auto-advance → editable details → confirm summary. PASS.
- Ghost-numeral step indicator on `/book`: `.bw-progress-numeral` renders Fraunces italic, amber active state `rgba(214,158,84,0.72)`. PASS.
- Weekly skill tabs: Intermediate click swaps to "Building real skill" content. PASS.
- FAQ accordion: `aria-expanded` false → true on click. PASS.

### Ghost motif on FAQ (audit §8 claim, independently re-verified)

`.faq-shelf__ghost` ("curious"): Fraunces italic, `rgba(23,53,42,0.05)`, 224px — same family, style, ink hue, and near-identical alpha as the home deck's `.stacked-services-deck__ghost` ("experiences", `rgba(23,53,42,0.06)`, 280px). Same device, not an unrelated treatment. PASS.

### Task 5/6 spot checks

- Vacation pre-scroll hero: scrim opacity 1 at top, headline opacity 0.62 cream over darkened sky (screenshot-reviewed, clearly readable); scrim opacity 0 and headline ink `rgb(39,37,32)` in the framed state. PASS.
- Gold CTA arrows: `/` and `/tourist-lessons` `rgb(184,125,44)`; `/weekly-lessons`, `/faq`, `/about` `rgb(214,158,84)`. PASS.
- Repeated-photo grade: deck card 3 image `sepia(0.3) saturate(0.8) contrast(1.05)`, `object-position 50% 30%`; Vacation instance untreated. PASS.
- Deck pin trimmed to `+=260%`: at ~2.55 viewport-heights into the pin, card 1 opacity 0 (exited) and card 3 at front (scale ≈1). Full swap completes. PASS.

## Task 8 — keyboard / reduced-motion / About transition

(appended after Task 8 run)

## Task 13 — live re-verification

(appended after deploy)

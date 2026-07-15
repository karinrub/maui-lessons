# Weekly Journey Polish — Design Spec

Date: 2026-07-15. Follows the 2026-07-15 design review of the Ongoing Lessons circle-lens journey. Scope pre-approved by owner: "fix all findings, optimize scroll logic, keep horizontal on mobile."

## Goals

Fix the review findings on `WeeklyJourneySections` while keeping the horizontal pinned journey on both desktop and mobile:

1. **Neighbor bleed** — orphaned text/ring fragments from the previous step visible at panel edges during and after travel.
2. **Dead-frame during travel** — outgoing panel slides off while incoming content is still hidden; viewport goes mostly empty mid-transition.
3. **Off-brand step typography** — step titles render in Inter; site display type is Fraunces.
4. **Spine overrun** — the progress line extends past the final dot's resting position.
5. **Image treatment** — `object-fit: contain` + blurred duplicate creates halo edges and costs an extra filtered layer per step.
6. **Perf budget** — excess `will-change` layers, blur filter, over-long pin distance.
7. **Composition** — content block always centered while the visual alternates, so the asymmetry reads accidental; bottom-heavy dead space.

## Decisions

### Timeline (WeeklyJourneySections.tsx)

- Keep `CHAPTER_STARTS = [0, 1.55, 3.1]`, `CHAPTER_END = 4.3`, `travelAt = chapterAt + 0.95`, travel duration 0.6.
- **Pre-seeded arrivals:** for steps after the first, all reveal beats shift 0.35 units early (`revealAt = chapterAt − 0.35`), so the incoming step blooms while it travels into view. Step 1 keeps `revealAt = 0`.
- **Graceful exits:** at each `travelAt`, the outgoing step's numeral, visual, and content fade out (`autoAlpha: 0, x: −36`, 0.45 units, `power2.in`). This also eliminates neighbor bleed — off-chapter panels are invisible, so no masking hack is needed.
- **Travel ease:** `power2.inOut` → `expo.inOut` (snappier chapter feel).
- **Ring cascade:** inner ring gets `back.out(1.4)` overshoot; middle/outer keep `power3.out`.
- **Lens reveal:** clip-path aperture only (`circle(0% → 72%)`, `power2.out`); drop the scale tween on the lens. The image inside gets a slow Ken-Burns settle (`scale 1.08 → 1`, linear, running from the reveal to the end of the chapter).
- **Dot pulse:** after landing, the spine dot pulses once (`scale 1 → 1.22 → 1` keyframes) — metronome beat, on-theme for "find your rhythm."
- **Warm color drift:** a gold-tinted overlay (`.weekly-rhythm__stage::after`, opacity driven by `--weekly-warm`) scrubs from 0 → 1 between chapter 2 and the final image, so step 3 ("hear it add up") lands warmer — foreshadows the gold Book CTA.
- **Pin distance:** `max(distance × 1.6, innerHeight × 3.1)` (was 1.85 / 3.6) — same choreography, less scroll tax.
- **Spine sizing:** spine width is computed in JS so `scaleX: 1` terminates exactly at the final dot's resting x (which equals the first dot's initial x, since panels are equal width). Recomputed on `refreshInit`.
- The final hold uses an empty tween (`master.to({}, …)`) instead of the no-op `stage` opacity tween.

### Layout / CSS

- `--weekly-copy-x` per step positions numeral + content opposite the visual (desktop: 57% / 43% / 56% against visuals at 38% / 62% / 42%); mobile forces both back to 50%.
- Step titles: Fraunces, `clamp(1.7rem, 2.6vw, 2.3rem)`, weight 500, tighter leading — applied in the base rule so mobile/reduced-motion match.
- Ghost numeral shifted `−0.35em` left of the copy block in horizontal mode for clearance from the title.
- `will-change` trimmed to rings/lens (`transform, opacity`, plus `clip-path` on the lens) and the track; removed from title/body/numeral.

### Images (WeeklyStepVisual.tsx)

- Blur underlay `<img>` deleted (removes three decoded + filtered layers).
- Main image: `object-fit: cover` with a per-step `imagePosition` prop (`object-position`) for art-directed crops.

### Out of scope

- No focus-jump handler: step panels contain no focusable elements, so `focusin` can never fire inside the pin (unlike About, whose panels contain links).
- No AVIF/WebP re-encode of the step JPEGs (asset pipeline task).
- Reduced-motion path unchanged: vertical in-flow timeline.

## Testing

- `test/weekly-rhythm-faithful.test.mjs` updated to lock the new constants (1.6/3.1 pin distance, `revealAt` lead, exit tweens, cover crop, no blur layer, Fraunces title).
- Verify: `node --test`, `npm run build`, `npm run lint`, `npm run typecheck`, plus live browser pass (desktop 1440×900 + mobile 390×844) with screenshots of each chapter and mid-travel.

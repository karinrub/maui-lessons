# Weekly Circle-Lens Journey Design

## Goal

Turn each Ongoing Lessons horizontal panel into a deliberate scroll chapter: concentric brand-colored rings assemble while the panel holds, then the panel image appears inside the completed circle. Preserve the page entrance, copy, timeline, closing section, and horizontal direction.

## Visual progression

Each panel gets one circle lens above the timeline spine and one image:

1. **Start where you are** — `aaron-weekly-1.jpg`; warm gold `rgba(211, 154, 66, 0.42)` outer ring, pale sand `rgba(247, 216, 143, 0.64)` middle ring, light sage `rgba(184, 200, 160, 0.82)` inner ring.
2. **Find your rhythm** — `aaron-teaching-2.jpg`; cream `rgba(245, 240, 231, 0.72)` outer ring, light sage `rgba(184, 200, 160, 0.82)` middle ring, olive `rgba(111, 134, 90, 0.78)` inner ring.
3. **Hear it add up** — `aaron-weekly-2.jpg`; olive `rgba(111, 134, 90, 0.75)` outer ring, deep moss `rgba(23, 53, 42, 0.72)` middle ring, muted gold `rgba(211, 154, 66, 0.52)` inner ring.

The sequence moves from warm and approachable, through growth, into a deeper performance-oriented finish. Ring colors use existing Maui Lessons colors with enough contrast against the sage stage.

## Circle and image treatment

- Each visual contains three concentric solid-border rings based on the Meet Aaron and FAQ circle systems.
- Rings remain behind the photograph and never cover faces, hands, or instruments.
- The center is a circular lens with a quiet, blurred cover version of the same photograph filling its background.
- Outer, middle, and inner rings use `0%`, `10%`, and `20%` insets. Their responsive border widths are `clamp(0.55rem, 1vw, 0.9rem)`, `clamp(0.5rem, 0.9vw, 0.8rem)`, and `clamp(0.45rem, 0.8vw, 0.7rem)`.
- The blurred circular background uses `20%` inset, `filter: blur(12px)`, `scale: 1.12`, and `opacity: 0.42`.
- A sharp foreground copy sits at `18%` inset and uses `object-fit: contain`. This safe box keeps even the square photograph’s corners inside the outer circle, so the complete source image remains visible without cropped people or instruments.
- The foreground image has no color tint. Any unused space is filled by the soft background copy and the panel’s inner-ring shade.
- The lens uses a restrained shadow and thin cream edge. No card container, caption, or new visible copy is added.
- Desktop lens diameter: `clamp(17rem, 25vw, 22rem)`.
- Mobile lens diameter: `min(70vw, 17rem)` so the image, spine, numeral, title, and body fit within one viewport.

## Scroll choreography

Use one GSAP master timeline for pinning, horizontal travel, ring assembly, image reveal, and the final rest. This prevents several independent ScrollTriggers from drifting apart.

Each chapter follows the same sequence:

1. Panel arrives centered and horizontal movement pauses.
2. Inner, middle, then outer ring scales from `0.72` to `1` and fades to full opacity.
3. After all three rings finish, the sharp image reveals from the center and settles from `0.94` to `1` scale.
4. The completed visual holds briefly with no horizontal movement.
5. The track travels to the next panel with a smooth, non-bouncy ease.

Timeline units are exact: each chapter reveals its content over `0.18`; inner ring runs from `0`–`0.18`, middle from `0.14`–`0.32`, outer from `0.28`–`0.46`, image from `0.48`–`0.72`, and the completed chapter holds through `0.95`. Travel to the next panel runs from `0.95`–`1.55`. Chapter starts are `0`, `1.55`, and `3.1`; the third chapter holds through total time `4.3`.

The image must not begin before the outer ring completes. Reverse scrolling reverses the same sequence. The third panel receives the longer `3.82`–`4.3` final hold before the closing section.

Pinned scroll distance is `Math.max(getScrollDistance() * 1.85, window.innerHeight * 3.6)`. This keeps the three holds readable on wide desktop screens and narrow mobile screens without making either version excessively fast.

## Component architecture

- Create `WeeklyStepVisual.tsx` as a focused presentational component.
- It receives image source, alt text, intrinsic dimensions, loading priority, and per-step color variables.
- It renders three decorative rings, one blurred decorative image marked `aria-hidden`, and one semantic sharp image.
- `WeeklyJourneySections.tsx` keeps journey data, Lenis integration, GSAP orchestration, and the horizontal track.
- `WeeklyJourneySections.css` owns the shared lens geometry, ring palettes, responsive layout, and reduced-motion state.

## Data and image behavior

- Add the `698×920` `aaron-weekly-2.jpg` photograph to Step 03 with alt text “Aaron teaching chord shapes to a student outdoors.”
- Step 01 stays eager/high-priority because it is the first pinned visual.
- Steps 02 and 03 remain lazy-loaded.
- All sharp images include intrinsic width and height to avoid layout shift.
- Decorative blurred copies use empty alt text and `aria-hidden="true"`.

## Responsive behavior

- Desktop alternates lens centers at `38%`, `62%`, and `42%` of each panel for Steps 01–03. The `top` position stays below the fixed wordmark.
- Mobile centers each lens within its panel. No edge clipping is allowed at any hold point.
- Horizontal scrolling remains active on motion-enabled mobile screens.
- Touch scrolling must remain vertical; Lenis continues using `gestureOrientation: 'vertical'` and `syncTouch: true`.

## Reduced motion and no-JS fallback

- `prefers-reduced-motion: reduce` keeps the existing vertical document flow.
- All rings and images render fully assembled with no transforms, blur animation, opacity animation, pinning, or horizontal travel.
- The sharp image remains fully visible and readable in each static lens.
- Without JS, base CSS also displays completed visuals in vertical flow.

## Accessibility

- Rings and blurred image copies are decorative and hidden from assistive technology.
- Each sharp image has descriptive alt text.
- Existing headings, list semantics, copy, links, and reading order stay unchanged.
- Motion never flashes and does not autoplay independently of scroll.

## Verification

- Regression tests lock three image sources, three circle-lens instances, three rings per instance, ring-before-image timeline ordering, sticky holds, vertical touch behavior, and reduced-motion fallback.
- Run all Node tests, lint, typecheck, build, and `git diff --check`.
- Render `/weekly-lessons` at 1440×900 and 390×844 with normal motion, plus 390×844 with reduced motion.
- Inspect each chapter at arrival, completed-circle, completed-image, and travel states.
- Confirm images load, complete subjects remain visible, the wordmark stays clear, copy does not clip, circles stay inside the viewport, horizontal travel pauses during each hold, reverse scrolling works, and no relevant console errors appear.

## Constraints

- Do not change entrance copy, journey copy, closing copy, navigation, or route structure.
- Do not change Meet Aaron or FAQ behavior; reuse their visual grammar only.
- Do not add new assets beyond the existing three photographs.
- Do not commit, push, or deploy unless the user explicitly requests it.

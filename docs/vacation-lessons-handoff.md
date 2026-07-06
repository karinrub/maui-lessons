# Vacation Lessons Handoff

## Repository Status

This project is now connected to Git.

- Local branch: `main`
- Remote: `origin` -> `https://github.com/karinrub/maui-lessons.git`
- GitHub Pages URL: `https://karinrub.github.io/maui-lessons/`
- Deployment source path: `/Users/karinrubin/Developer/maui-lessons`

The remote repository is the intended home for this local project. See `docs/GIT_AND_DEPLOYMENT.md` before publishing changes.

## Current State

The `/tourist-lessons` page has a scroll-driven cinematic scene that transitions Aaron's hero image into a resolved editorial composition.

Current architecture:

- Route/page: `/tourist-lessons`
- Main scene files:
  - `src/components/tourist-lessons/VacationCinematicScene.tsx`
  - `src/components/tourist-lessons/VacationSceneLayers.tsx`
  - `src/components/tourist-lessons/VacationCinematicScene.css`
  - `src/components/tourist-lessons/vacationSceneConfig.ts`
  - `src/components/tourist-lessons/useVacationSceneProgress.ts`
- The scene still uses:
  - one `ScrollTrigger.create(...)`
  - one normalized progress value from `0` to `1`
  - CSS-variable-driven visual state
  - the existing `VacationImageLayer`
  - the existing `VacationHeadlineLayer`
- Mobile uses the resolved non-pinned state.
- Reduced motion resolves statically and skips pinning.

## Implemented So Far

### Phase 1

Stabilized the cinematic scene contract.

- Replaced the desktop query with a real breakpoint: `(min-width: 761px)`.
- Preserved the Aaron image mechanism.
- Preserved the single desktop/tablet ScrollTrigger.
- Preserved normalized progress and CSS variable state.
- Mobile and reduced motion receive `getVacationSceneVisualState(1)`.

### Phase 2 Canopy Work

Canopy/environment exploration happened, then was explicitly removed.

Important current state:

- No canopy renders on `/tourist-lessons`.
- No `VacationEnvironmentLayer` is currently rendered.
- No canopy CSS selectors should remain active.
- Do not reintroduce canopy unless the user explicitly asks.
- Canopy assets remain in the project and must not be deleted.

### Editorial Composition Phase

A first production-shaped editorial composition structure was added.

Component:

- `VacationEditorialComposition` in `VacationSceneLayers.tsx`

Current intent:

- This is not a prototype wrapper.
- It is the first permanent composition structure.
- The temporary content inside it will later be replaced with production photos/copy.

Current placeholders:

- Abstract editorial memory fragments generated in CSS.
- Desktop/tablet supporting-copy regions with temporary neutral text.
- Generic editorial micro-headings.
- No CTA placeholder.
- No final copy.
- No real lesson photos.
- No gallery/card/masonry/carousel behavior.

Visual-state additions:

- `editorialCompositionProgress` in `VacationSceneVisualState`
- CSS variable: `--vac-editorial-composition-progress`
- Driven from the same normalized scroll progress.

## Last Verified Checks

The following passed after the editorial composition phase:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

Browser QA completed before the latest requested architectural correction:

- Desktop: composition visible, pinned scene active, no canopy, no horizontal overflow.
- Tablet: composition visible, pinned scene active, no canopy, no horizontal overflow.
- Mobile: non-pinned resolved scene, memory fragments visible, no horizontal overflow.

## Current Blocking Issue

The current implementation is architecturally wrong at the exit from the pinned scene.

User-rejected behavior:

- Content after the cinematic scene appears to scroll underneath the pinned Aaron image/headline/editorial composition.
- The pinned scene reads like a floating overlay while later page content moves behind it.

Required behavior:

- The pinned sequence should temporarily control the viewport.
- At the end of the pinned scroll, ScrollTrigger should release naturally.
- The resolved editorial composition should become the first completed block of the normal page.
- All following content must start below the resolved composition in normal document flow.
- Nothing should ever render behind the Aaron image, headline, or editorial composition after release.

The user explicitly rejected workaround fixes:

- Do not add white overlays.
- Do not solve with z-index.
- Do not hide later content behind masks.
- Do not delay later content visibility.
- Do not absolutely position later sections lower.
- Do not use fake spacing as a visual patch.

## Likely Root Cause To Inspect

Inspect how `VacationCinematicScene` participates in document flow while GSAP pins `.vacation-cinematic-scene__pin`.

Likely files to inspect:

- `src/components/tourist-lessons/VacationCinematicScene.tsx`
- `src/components/tourist-lessons/VacationCinematicScene.css`
- `src/components/tourist-lessons/useVacationSceneProgress.ts`
- the parent `/tourist-lessons` page component that renders content after `VacationCinematicScene`

Things to verify:

- Whether the scene root has enough real document height after pinning.
- Whether GSAP pin spacing is being applied to the correct element.
- Whether the pinned element is inside a wrapper that prevents normal post-pin flow.
- Whether full-bleed styling on `.vacation-cinematic-scene` (`left: 50%`, `width: 100vw`, `margin-left: -50vw`, `overflow: clip`) interacts badly with the pin spacer.
- Whether subsequent content is structurally adjacent to the pinned/spacer element or visually slipping behind it.

The fix should correct the document-flow contract, not mask the overlap.

## Design Principle To Preserve

Primary principle:

> The page should never feel like elements are being added. It should feel like the composition is resolving into the page itself.

Current experience model:

1. Cinematic opening
2. Resolved editorial composition
3. Normal page continuation growing naturally out of that composition

The visitor should not perceive separate sections or a floating scene.

## Do Not Change Without Explicit Request

- Do not redesign the Aaron image.
- Do not rewrite `VacationImageLayer`.
- Do not redesign headline behavior.
- Do not introduce a second ScrollTrigger.
- Do not add another progress/observer system.
- Do not add Framer Motion or dependencies.
- Do not re-add canopy.
- Do not add real lesson photos.
- Do not add final supporting copy.
- Do not add CTA.
- Do not change route/nav/footer/shared layout.

## Immediate Next Task

Fix the pinned-scene exit architecture.

Acceptance criteria:

- At the final scroll state, the editorial composition is fully resolved.
- When the pin releases, the resolved composition behaves as the top block of the normal document.
- Following page content begins below the resolved composition.
- No content scrolls behind the Aaron image/headline/composition.
- The transition is seamless enough that the visitor cannot identify where the cinematic scene ends and the page itself begins.
- Mobile remains non-pinned.
- Reduced motion remains static and safe.
- No horizontal overflow.

Run after implementation:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

Browser QA:

- Desktop: scroll through pin release and confirm following content starts below composition.
- Tablet: same.
- Mobile: no pinning and no overflow.
- Reduced motion: no ScrollTrigger/pinning.

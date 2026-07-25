export const vacationSceneImage = new URL(
  '../../../assets/images/aaron-pause.jpg',
  import.meta.url,
).href

export type VacationSceneVisualState = {
  progress: number
  compositionProgress: number
  surfaceProgress: number
  environmentProgress: number
  frameScale: number
  imageScale: number
  frameRadius: number
  stageBgProgress: number
  headlineProgress: number
  headlineScale: number
  headlineOpacity: number
  headlineX: number
  headlineY: number
  headlineTracking: number
  headlineColorProgress: number
  headlineColorR: number
  headlineColorG: number
  headlineColorB: number
}

export const vacationSceneScroll = {
  desktopQuery: '(min-width: 761px)',
  scrollDistance: '+=250%',
  /* A phone screen is roughly half as tall as a laptop's is wide, so 250%
     of it bought the same handful of composition changes across what felt
     like three screens of scrolling with nothing new arriving. */
  mobileScrollDistance: '+=160%',
} as const

export const vacationSceneImageConfig = {
  width: 2200,
  height: 1467,
  desktopObjectPosition: '50% 48%',
  mobileObjectPosition: '50% 46%',
} as const

const visualStateRange = {
  frameScaleStart: 1,
  frameScaleEnd: 0.72,
  imageScaleStart: 1,
  imageScaleEnd: 1.18,
  frameRadiusStart: 0,
  frameRadiusEnd: 30,
} as const

function clampProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 1)
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

function smoothstep(progress: number) {
  return progress * progress * (3 - 2 * progress)
}

function progressThroughRange(progress: number, start: number, end: number) {
  if (end === start) {
    return progress >= end ? 1 : 0
  }

  return clampProgress((progress - start) / (end - start))
}

// The static, non-scrubbing rest state. Reduced motion only — the scene pins
// and scrubs at every width, mobile included (see
// test/vacation-mobile-cinematic.test.mjs, which pins that contract down; an
// earlier version of this comment claimed mobile stayed static and was
// wrong). getVacationSceneVisualState(1)
// is deliberately NOT reused here — it's the raw end-of-scrub curve, and its
// values overshoot past the intended "settled" look (headline scale 1.17,
// frame scale 0.72) because on desktop that overshoot is a passing frame the
// scrub immediately carries past, never a resting state. Rendered statically,
// that overshoot reads as broken proportions instead of a composed hero.
export function getVacationSceneSettledState(): VacationSceneVisualState {
  return {
    progress: 1,
    compositionProgress: 1,
    surfaceProgress: 1,
    environmentProgress: 1,
    // 1, not a further scale-down: the settled CSS layout (VacationCinematicScene.css
    // .is-mobile-scene / .is-reduced-motion) already sizes the frame directly
    // via width/height, in normal flow — an extra transform-scale here would
    // shrink that correctly-sized frame again, leaving gutter around it.
    frameScale: 1,
    imageScale: 1.12,
    frameRadius: 26,
    stageBgProgress: 1,
    headlineProgress: 1,
    headlineScale: 1,
    headlineOpacity: 1,
    headlineX: 0,
    headlineY: 0,
    headlineTracking: 0,
    headlineColorProgress: 1,
    headlineColorR: 31,
    headlineColorG: 29,
    headlineColorB: 24,
  }
}

export type VacationSceneVisualOptions = {
  /* Phones only. The headline crosses from cream-over-scrim to ink-over-
     photo, and the readability scrim fades with it. Every point in between
     is mid-grey type over a half-lifted scrim — fine as a passing frame on
     a desktop scrub, but on a phone the headline is 12.8vw tall and the
     crossing spanned ~460px of scroll, i.e. half a screen of headline you
     could not read. Compressing it to a short band keeps both readable end
     states and makes the change between them a moment rather than a phase. */
  compactHeadlineColorTransition?: boolean
}

export function getVacationSceneVisualState(
  progress: number,
  options: VacationSceneVisualOptions = {},
): VacationSceneVisualState {
  const safeProgress = clampProgress(progress)
  const softenedProgress = smoothstep(safeProgress)
  const surfaceProgress = smoothstep(progressThroughRange(safeProgress, 0.08, 0.82))
  const environmentProgress = smoothstep(progressThroughRange(safeProgress, 0.32, 1))
  // Phases front-loaded (2026-07-15 polish): the headline reaches its
  // settled, fully legible state by ~60% of the pin instead of 80–100%,
  // so the readable state dominates the scrub and the in-between scramble
  // stays brief.
  const headlineQuietProgress = smoothstep(progressThroughRange(safeProgress, 0, 0.14))
  const headlineBuildProgress = smoothstep(progressThroughRange(safeProgress, 0.14, 0.4))
  const headlineDominanceProgress = smoothstep(progressThroughRange(safeProgress, 0.4, 0.62))
  const headlineSettleProgress = smoothstep(progressThroughRange(safeProgress, 0.62, 0.85))
  const headlineProgress = smoothstep(progressThroughRange(safeProgress, 0.1, 0.62))
  const headlineColorProgress = options.compactHeadlineColorTransition
    ? smoothstep(progressThroughRange(safeProgress, 0.48, 0.57))
    : 0.04 +
      headlineBuildProgress * 0.28 +
      headlineDominanceProgress * 0.62 +
      headlineSettleProgress * 0.06

  return {
    progress: safeProgress,
    compositionProgress: softenedProgress,
    surfaceProgress,
    environmentProgress,
    frameScale: lerp(
      visualStateRange.frameScaleStart,
      visualStateRange.frameScaleEnd,
      softenedProgress,
    ),
    imageScale: lerp(
      visualStateRange.imageScaleStart,
      visualStateRange.imageScaleEnd,
      softenedProgress,
    ),
    frameRadius: lerp(
      visualStateRange.frameRadiusStart,
      visualStateRange.frameRadiusEnd,
      softenedProgress,
    ),
    stageBgProgress: softenedProgress,
    headlineProgress,
    headlineScale:
      0.78 +
      headlineQuietProgress * 0.04 +
      headlineBuildProgress * 0.16 +
      headlineDominanceProgress * 0.18 +
      headlineSettleProgress * 0.01,
    // Floor raised 0.62 → 0.72: the headline never drops below comfortably
    // readable, even at the very start of the scrub.
    headlineOpacity:
      0.72 +
      headlineQuietProgress * 0.08 +
      headlineBuildProgress * 0.14 +
      headlineDominanceProgress * 0.06,
    headlineX: 0,
    headlineY: 0,
    headlineTracking: Math.max(
      0,
      0.055 -
        headlineQuietProgress * 0.008 -
        headlineBuildProgress * 0.026 -
        headlineDominanceProgress * 0.019 -
        headlineSettleProgress * 0.002,
    ),
    headlineColorProgress,
    headlineColorR: lerp(245, 31, headlineColorProgress),
    headlineColorG: lerp(240, 29, headlineColorProgress),
    headlineColorB: lerp(231, 24, headlineColorProgress),
  }
}

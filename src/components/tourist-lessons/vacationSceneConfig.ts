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

export function getVacationSceneVisualState(progress: number): VacationSceneVisualState {
  const safeProgress = clampProgress(progress)
  const softenedProgress = smoothstep(safeProgress)
  const surfaceProgress = smoothstep(progressThroughRange(safeProgress, 0.08, 0.82))
  const environmentProgress = smoothstep(progressThroughRange(safeProgress, 0.32, 1))
  const headlineQuietProgress = smoothstep(progressThroughRange(safeProgress, 0, 0.2))
  const headlineBuildProgress = smoothstep(progressThroughRange(safeProgress, 0.2, 0.55))
  const headlineDominanceProgress = smoothstep(progressThroughRange(safeProgress, 0.55, 0.8))
  const headlineSettleProgress = smoothstep(progressThroughRange(safeProgress, 0.8, 1))
  const headlineProgress = smoothstep(progressThroughRange(safeProgress, 0.12, 0.82))
  const headlineColorProgress =
    0.04 +
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
    headlineOpacity:
      0.3 +
      headlineQuietProgress * 0.08 +
      headlineBuildProgress * 0.32 +
      headlineDominanceProgress * 0.3,
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

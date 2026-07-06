export type AtmosphericPalette = {
  shadow: string
  deep: string
  canopy: string
  palm: string
  mist: string
  accent: string
  accentSoft: string
  grainLight: string
  grainDark: string
  lightingWarm: string
  lightingCool: string
  lightingVeil: string
  distortionBand: string
  distortionGlow: string
}

export type AtmosphericAnimationConfig = {
  overscan: string
  baseDuration: string
  grainDuration: string
  lightingDuration: string
  distortionDuration: string
  baseOpacity: string
  grainOpacity: string
  lightingOpacity: string
  distortionOpacity: string
}

export const touristLessonsAtmospherePalette: AtmosphericPalette = {
  shadow: '#06110C',
  deep: '#0D2419',
  canopy: '#164231',
  palm: '#2A5B49',
  mist: '#55765E',
  accent: '#A89B63',
  accentSoft: 'rgba(168, 155, 99, 0.055)',
  grainLight: 'rgba(255, 255, 255, 0.18)',
  grainDark: 'rgba(0, 0, 0, 0.16)',
  lightingWarm: 'rgba(168, 155, 99, 0.16)',
  lightingCool: 'rgba(85, 118, 94, 0.18)',
  lightingVeil: 'rgba(255, 255, 255, 0.06)',
  distortionBand: 'rgba(255, 255, 255, 0.07)',
  distortionGlow: 'rgba(255, 255, 255, 0.045)',
}

export const defaultAtmosphereAnimation: AtmosphericAnimationConfig = {
  overscan: 'max(18vw, 180px)',
  baseDuration: '78s',
  grainDuration: '137s',
  lightingDuration: '103s',
  distortionDuration: '149s',
  baseOpacity: '0.58',
  grainOpacity: '0.055',
  lightingOpacity: '0.22',
  distortionOpacity: '0.12',
}

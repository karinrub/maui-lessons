import type { CSSProperties } from 'react'
import {
  defaultAtmosphereAnimation,
  touristLessonsAtmospherePalette,
  type AtmosphericAnimationConfig,
  type AtmosphericPalette,
} from './atmosphericBackgroundConfig'
import './AtmosphericBackground.css'

type AtmosphericBackgroundProps = {
  palette?: AtmosphericPalette
  animation?: AtmosphericAnimationConfig
  className?: string
}

type AtmosphericBackgroundStyle = CSSProperties & {
  '--atm-shadow': string
  '--atm-deep': string
  '--atm-canopy': string
  '--atm-palm': string
  '--atm-mist': string
  '--atm-accent': string
  '--atm-accent-soft': string
  '--atm-grain-light': string
  '--atm-grain-dark': string
  '--atm-lighting-warm': string
  '--atm-lighting-cool': string
  '--atm-lighting-veil': string
  '--atm-distortion-band': string
  '--atm-distortion-glow': string
  '--atm-overscan': string
  '--atm-base-duration': string
  '--atm-grain-duration': string
  '--atm-lighting-duration': string
  '--atm-distortion-duration': string
  '--atm-base-opacity': string
  '--atm-grain-opacity': string
  '--atm-lighting-opacity': string
  '--atm-distortion-opacity': string
}

function getAtmosphericStyle(
  palette: AtmosphericPalette,
  animation: AtmosphericAnimationConfig,
): AtmosphericBackgroundStyle {
  return {
    '--atm-shadow': palette.shadow,
    '--atm-deep': palette.deep,
    '--atm-canopy': palette.canopy,
    '--atm-palm': palette.palm,
    '--atm-mist': palette.mist,
    '--atm-accent': palette.accent,
    '--atm-accent-soft': palette.accentSoft,
    '--atm-grain-light': palette.grainLight,
    '--atm-grain-dark': palette.grainDark,
    '--atm-lighting-warm': palette.lightingWarm,
    '--atm-lighting-cool': palette.lightingCool,
    '--atm-lighting-veil': palette.lightingVeil,
    '--atm-distortion-band': palette.distortionBand,
    '--atm-distortion-glow': palette.distortionGlow,
    '--atm-overscan': animation.overscan,
    '--atm-base-duration': animation.baseDuration,
    '--atm-grain-duration': animation.grainDuration,
    '--atm-lighting-duration': animation.lightingDuration,
    '--atm-distortion-duration': animation.distortionDuration,
    '--atm-base-opacity': animation.baseOpacity,
    '--atm-grain-opacity': animation.grainOpacity,
    '--atm-lighting-opacity': animation.lightingOpacity,
    '--atm-distortion-opacity': animation.distortionOpacity,
  }
}

export default function AtmosphericBackground({
  palette = touristLessonsAtmospherePalette,
  animation = defaultAtmosphereAnimation,
  className,
}: AtmosphericBackgroundProps) {
  const classNames = ['atmospheric-background', className].filter(Boolean).join(' ')

  return (
    <div className={classNames} style={getAtmosphericStyle(palette, animation)} aria-hidden="true">
      <div className="atmospheric-background__layer atmospheric-background__base" />
      <div className="atmospheric-background__layer atmospheric-background__grain" />
      <div className="atmospheric-background__layer atmospheric-background__lighting" />
      <div className="atmospheric-background__layer atmospheric-background__distortion" />
    </div>
  )
}

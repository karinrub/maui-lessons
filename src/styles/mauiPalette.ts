/*
  Single source of truth for the five-stop Maui palette.

  These values were hand-tuned in the NavGradient WebGL shader (deep jungle
  shadow → emerald → tropical green → teal-green → warm amber-gold sunset).
  NavGradient injects them into GLSL via toGlslVec3(); the booking wizard
  reads the same stops as CSS custom properties via MAUI_PALETTE_CSS_VARS.
  Edit the stops here — never re-hardcode them in a shader or stylesheet.
*/

export const MAUI_STOPS = {
  shadow: [0.022, 0.07, 0.058], // near-black teal shadow
  emerald: [0.038, 0.145, 0.105], // deep emerald
  jungle: [0.052, 0.255, 0.19], // tropical green (Maui jungle)
  bay: [0.065, 0.365, 0.292], // teal-green (Maui bays)
  amber: [0.72, 0.49, 0.175], // warm amber-gold (sunset / site accent)
} as const

export type MauiStop = keyof typeof MAUI_STOPS

export function toGlslVec3(stop: MauiStop): string {
  const [r, g, b] = MAUI_STOPS[stop]
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`
}

export function toCssRgb(stop: MauiStop, alpha = 1): string {
  const [r, g, b] = MAUI_STOPS[stop].map((channel) => Math.round(channel * 255))
  return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const MAUI_PALETTE_CSS_VARS = {
  '--maui-shadow': toCssRgb('shadow'),
  '--maui-emerald': toCssRgb('emerald'),
  '--maui-jungle': toCssRgb('jungle'),
  '--maui-bay': toCssRgb('bay'),
  '--maui-amber': toCssRgb('amber'),
  '--maui-amber-soft': toCssRgb('amber', 0.32),
  '--maui-amber-faint': toCssRgb('amber', 0.14),
} as const

/*
  Single source of truth for the five-stop Maui palette.

  These values were hand-tuned in the NavGradient WebGL shader (deep jungle
  shadow → emerald → tropical green → teal-green → warm amber-gold sunset).
  NavGradient and HomeAmbientBackground inject them into GLSL via
  toGlslVec3(). Edit the stops here — never re-hardcode them in a shader.
*/

export const MAUI_STOPS = {
  shadow: [0.022, 0.07, 0.058], // near-black teal shadow
  emerald: [0.038, 0.145, 0.105], // deep emerald
  jungle: [0.052, 0.255, 0.19], // tropical green (Maui jungle)
  bay: [0.065, 0.365, 0.292], // teal-green (Maui bays)
  // Exactly #b87d2c (184/255, 125/255, 44/255) — must match --maui-gold in
  // src/index.css so the shader's sunset stop and the CSS accent are one hue.
  amber: [0.7216, 0.4902, 0.1725], // warm amber-gold (sunset / site accent)
} as const

export type MauiStop = keyof typeof MAUI_STOPS

export function toGlslVec3(stop: MauiStop): string {
  const [r, g, b] = MAUI_STOPS[stop]
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`
}

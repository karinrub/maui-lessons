import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const hook = readFileSync(
  new URL('../src/components/tourist-lessons/useVacationSceneProgress.ts', import.meta.url),
  'utf8',
)
const sceneCss = readFileSync(
  new URL('../src/components/tourist-lessons/VacationCinematicScene.css', import.meta.url),
  'utf8',
)
const indexCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

test('vacation hero scrub is disabled only for reduced motion, not mobile width', () => {
  assert.match(hook, /if \(\s*prefersReducedMotion\s*\)/)
  assert.doesNotMatch(hook, /!isDesktop\s*\|\|\s*prefersReducedMotion/)
})

test('mobile vacation route stays full bleed inside global mobile shell rules', () => {
  assert.match(
    indexCss,
    /@media \(max-width: 760px\)[\s\S]*\.route-shell--cinematic\s*\{\s*padding:\s*0;/,
  )
  assert.match(
    indexCss,
    /@media \(max-width: 760px\)[\s\S]*\.page-main--cinematic\s*\{\s*margin-top:\s*0;/,
  )
})

test('mobile vacation scene is not styled as static settled reduced-motion layout', () => {
  assert.doesNotMatch(
    sceneCss,
    /\.vacation-cinematic-scene\.is-reduced-motion,\s*\.vacation-cinematic-scene\.is-mobile-scene/,
  )
  assert.doesNotMatch(
    sceneCss,
    /\.is-mobile-scene \.vacation-cinematic-scene__pin[\s\S]*height:\s*auto/,
  )
})

test('mobile vacation headline keeps fixed alignment through scroll scrub', () => {
  const mobileHeadline = sceneCss.match(
    /@media \(max-width: 760px\)[\s\S]*?\.vacation-cinematic-scene__headline\s*\{(?<rules>[\s\S]*?)\n  \}/,
  )?.groups?.rules

  assert.ok(mobileHeadline)
  assert.match(mobileHeadline, /letter-spacing:\s*0;/)
  assert.match(mobileHeadline, /transform:\s*translate3d\(/)
  assert.doesNotMatch(mobileHeadline, /scale\(var\(--vac-headline-scale\)\)/)
})

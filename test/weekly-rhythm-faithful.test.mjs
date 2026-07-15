import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(new URL('../src/pages/WeeklyLessons.tsx', import.meta.url), 'utf8')
const tsx = await readFile(
  new URL('../src/components/weekly/WeeklyJourneySections.tsx', import.meta.url),
  'utf8',
)
const css = await readFile(
  new URL('../src/components/weekly/WeeklyJourneySections.css', import.meta.url),
  'utf8',
)

test('renders Claude’s standalone Ongoing Lessons page body', () => {
  assert.doesNotMatch(page, /SkillLevelSection/)
  assert.match(page, /<WeeklyJourneySections\s*\/>/)
})

test('locks the handoff horizontal stage and travel mechanics', () => {
  assert.match(tsx, /import Lenis from 'lenis'/)
  assert.match(tsx, /weekly-rhythm__stage/)
  assert.match(tsx, /weekly-rhythm__prelude/)
  assert.match(tsx, /weekly-rhythm__track/)
  assert.match(tsx, /const HOLD_RATIO = 0\.3/)
  assert.match(tsx, /panels\[0\]\.offsetWidth \* \(n - 1\)/)
  assert.match(tsx, /new Lenis\(/)
  assert.match(tsx, /gestureOrientation: 'vertical'/)
})

test('locks the full viewport desktop layout and vertical fallback', () => {
  assert.match(css, /height: 100vh/)
  assert.match(css, /margin-left: calc\(50% - 50vw\)/)
  assert.match(css, /flex: 0 0 min\(72vw, 880px\)/)
  assert.match(css, /@media \(min-width: 761px\) and \(prefers-reduced-motion: no-preference\)/)
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.match(css, /background: radial-gradient\(130% 100% at 50% 22%/)
})

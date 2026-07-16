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
const visual = await readFile(
  new URL('../src/components/weekly/WeeklyStepVisual.tsx', import.meta.url),
  'utf8',
).catch(() => '')
const layout = await readFile(
  new URL('../src/layout/SiteLayout.tsx', import.meta.url),
  'utf8',
)

test('renders Claude’s standalone Ongoing Lessons page body', () => {
  assert.doesNotMatch(page, /SkillLevelSection/)
  assert.match(page, /<WeeklyJourneySections\s*\/>/)
})

test('locks the handoff horizontal stage and travel mechanics', () => {
  assert.match(tsx, /import Lenis from 'lenis'/)
  assert.match(tsx, /weekly-rhythm__stage/)
  assert.match(tsx, /className="weekly-entrance"/)
  assert.match(tsx, /<h1 id="weekly-entrance-title" className="weekly-entrance__title">/)
  assert.doesNotMatch(tsx, /weekly-rhythm__prelude/)
  assert.match(tsx, /weekly-rhythm__track/)
  assert.match(tsx, /const getPinnedDistance/)
  assert.match(tsx, /panels\[0\]\.offsetWidth \* \(n - 1\)/)
  assert.match(tsx, /new Lenis\(/)
  assert.match(tsx, /gestureOrientation: 'vertical'/)
  assert.match(
    tsx,
    /mm\.add\('\(prefers-reduced-motion: no-preference\)', \(\) => \{\s+const stage/,
  )
  assert.match(tsx, /weekly-journey--horizontal/)
})

test('locks the full viewport desktop layout and vertical fallback', () => {
  assert.match(css, /height: 100vh/)
  assert.match(css, /min-height: 100svh/)
  assert.match(css, /min-height: 75svh/)
  assert.match(css, /margin-left: calc\(50% - 50vw\)/)
  assert.match(css, /flex: 0 0 min\(72vw, 880px\)/)
  assert.match(
    tsx,
    /mm\.add\('\(prefers-reduced-motion: no-preference\) and \(min-width: 761px\)', \(\) => \{\s+const entrance/,
  )
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/)
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.match(css, /height: 100svh/)
  assert.match(css, /flex: 0 0 88vw/)
  assert.match(css, /gap: 0/)
})

test('closes with the home-finale footer treatment, no cream strip below', () => {
  assert.match(css, /\.weekly-close__arch\s*\{[^}]*border-radius: 0 0 50% 50% \/ 0 0 100% 100%/s)
  assert.match(css, /\.weekly-close__arch\s*\{[^}]*background: #8aa06f/s)
  assert.match(css, /\.weekly-close\s*\{[^}]*#0d2018/s)
  assert.match(css, /calc\(-1 \* clamp\(34px, 4vw, 64px\)\)/)
  assert.match(css, /\.weekly-close__grain\s*\{[^}]*var\(--grain-url\)/s)
  assert.match(tsx, /className="weekly-close__links"/)
  assert.match(tsx, /className="weekly-close__copyright"/)
  assert.match(layout, /isHome \|\| isWeeklyLessons \? null : <SiteFooter \/>/)
})

test('weaves the three approved lesson images into the journey', () => {
  assert.equal(tsx.match(/aaron-weekly-1\.jpg/g)?.length, 1)
  assert.equal(tsx.match(/aaron-teaching-2\.jpg/g)?.length, 1)
  assert.equal(tsx.match(/aaron-weekly-2\.jpg/g)?.length, 1)
  assert.equal(tsx.match(/\bimage: weekly/g)?.length, 3)

  assert.match(tsx, /<WeeklyStepVisual/)
  assert.match(tsx, /alt: 'Aaron guiding a young ukulele student through a lesson outdoors'/)
  assert.match(tsx, /alt: "A small group practicing guitar together during Aaron's lesson"/)
  assert.match(tsx, /alt: 'Aaron teaching chord shapes to a student outdoors'/)
  // All three images load eagerly: lazy images sit horizontally offscreen in
  // the pinned track and decode too late during travel.
  assert.equal(tsx.match(/loading: 'eager',/g)?.length, 3)
  assert.doesNotMatch(tsx, /loading: 'lazy',/)
  assert.match(tsx, /width: 720/)
  assert.match(tsx, /height: 960/)
  assert.match(tsx, /width: 698/)
  assert.match(tsx, /height: 920/)
})

test('renders a semantic circle lens with decorative rings and a cover crop', () => {
  assert.equal(visual.match(/weekly-step__ring/g)?.length, 6)
  assert.match(visual, /weekly-step__ring--outer/)
  assert.match(visual, /weekly-step__ring--middle/)
  assert.match(visual, /weekly-step__ring--inner/)
  assert.doesNotMatch(visual, /weekly-step__image-blur/)
  assert.match(visual, /aria-hidden="true"/)
  assert.match(visual, /className="weekly-step__image"/)
  assert.match(visual, /objectPosition: imagePosition/)
})

test('holds three image chapters and reveals rings before each image', () => {
  assert.match(tsx, /import WeeklyStepVisual[^\n]*from '\.\/WeeklyStepVisual'/)
  assert.equal(tsx.match(/\bimage: weekly/g)?.length, 3)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.match(tsx, /width: 698/)
  assert.match(tsx, /height: 920/)
  assert.match(tsx, /const CHAPTER_STARTS = \[0, 1\.55, 3\.1\]/)
  assert.match(tsx, /const CHAPTER_END = 4\.15/)
  assert.match(tsx, /getScrollDistance\(\) \* 1\.3/)
  assert.match(tsx, /window\.innerHeight \* 2\.6/)
  assert.match(tsx, /const revealAt = index === 0 \? chapterAt : chapterAt - 0\.35/)
  assert.match(tsx, /const imageAt = revealAt \+ 0\.24/)
  assert.match(tsx, /const travelAt = chapterAt \+ 0\.95/)
  assert.match(tsx, /duration: 0\.6,\s+ease: 'expo\.inOut'/)
  assert.match(tsx, /gestureOrientation: 'vertical'/)
})

test('dissolves the outgoing step and pre-seeds the incoming one', () => {
  assert.match(tsx, /autoAlpha: 0, xPercent: -8, duration: 0\.45, ease: 'power2\.in'/)
  assert.match(tsx, /'--weekly-warm': 1/)
  assert.match(tsx, /const sizeSpine = /)
  assert.match(tsx, /ScrollTrigger\.addEventListener\('refreshInit', sizeSpine\)/)
  assert.match(tsx, /ScrollTrigger\.removeEventListener\('refreshInit', sizeSpine\)/)
  assert.match(tsx, /keyframes: \[/)
})

test('keeps art-directed crops inside responsive ring geometry', () => {
  assert.match(css, /\.weekly-step__image\s*\{[^}]*object-fit: cover/s)
  assert.match(css, /\.weekly-step__ring--outer\s*\{[^}]*inset: 0/s)
  assert.match(css, /\.weekly-step__ring--middle\s*\{[^}]*inset: 10%/s)
  assert.match(css, /\.weekly-step__ring--inner\s*\{[^}]*inset: 20%/s)
  assert.match(css, /\.weekly-step__lens\s*\{[^}]*inset: 18%/s)
  assert.doesNotMatch(css, /weekly-step__image-blur/)
  assert.match(css, /width: clamp\(17rem, 25vw, 22rem\)/)
  assert.match(css, /width: min\(70vw, 17rem\)/)
  assert.match(
    css,
    /@media \(max-width: 760px\) and \(prefers-reduced-motion: no-preference\)[\s\S]*?--weekly-visual-x: 50%/,
  )
})

test('sets the display face and deliberate copy offsets', () => {
  assert.match(
    css,
    /\.weekly-step__title\s*\{[^}]*font-family: 'Fraunces', Georgia, serif/s,
  )
  assert.match(css, /--weekly-copy-x: 57%/)
  assert.match(css, /--weekly-copy-x: 43%/)
  assert.match(css, /--weekly-copy-x: 56%/)
  assert.match(
    css,
    /@media \(max-width: 760px\) and \(prefers-reduced-motion: no-preference\)[\s\S]*?--weekly-copy-x: 50%/,
  )
  assert.match(css, /opacity: var\(--weekly-warm, 0\)/)
})

test('syncs each text layer to its matching ring reveal', () => {
  assert.match(
    tsx,
    /gsap\.set\(panel\.querySelector\('\.weekly-step__title'\), \{ autoAlpha: 0, y: 16 \}\)/,
  )
  assert.match(
    tsx,
    /gsap\.set\(panel\.querySelector\('\.weekly-step__body'\), \{ autoAlpha: 0, y: 12 \}\)/,
  )
  assert.doesNotMatch(
    tsx,
    /gsap\.set\(panel\.querySelector\('\.weekly-step__content'\), \{ autoAlpha: 0/,
  )
  assert.match(
    tsx,
    /panel\.querySelector\('\.weekly-step__title'\),\s+\{ autoAlpha: 1, y: 0, duration: 0\.18, ease: 'power3\.out' \},\s+revealAt/,
  )
  assert.match(
    tsx,
    /panel\.querySelector\('\.weekly-step__body'\),\s+\{ autoAlpha: 1, y: 0, duration: 0\.18, ease: 'power3\.out' \},\s+revealAt \+ 0\.14/,
  )
})

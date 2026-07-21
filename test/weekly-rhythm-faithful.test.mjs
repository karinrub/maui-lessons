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
const layout = await readFile(new URL('../src/layout/SiteLayout.tsx', import.meta.url), 'utf8')

test('keeps the dedicated Ongoing Lessons route', () => {
  assert.match(page, /<WeeklyJourneySections\s*\/>/)
  assert.match(page, /Ongoing Lessons \| Maui Lessons/)
})

test('renders the approved conversion-first hero collage without the trust strip', () => {
  assert.match(tsx, /A rhythm, not a routine\./)
  assert.match(tsx, /Choose your path/)
  assert.match(tsx, /See how the first month works/)
  assert.match(tsx, /aaron-teaching-2\.jpg/)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.match(tsx, /weekly-redesign__hero-image--primary/)
  assert.match(tsx, /weekly-redesign__hero-image--secondary/)
  assert.doesNotMatch(tsx, /Private lessons/)
  assert.doesNotMatch(tsx, /weekly-redesign__trust/)
})

test('uses the shared site navigation instead of a route-specific header', () => {
  assert.doesNotMatch(tsx, /weekly-redesign__site-nav/)
  assert.match(layout, /<GlobalNavigation isSuppressed=\{isHome && isHeaderSuppressed\} \/>/)
  assert.doesNotMatch(css, /\.weekly-redesign\s*\{[^}]*margin-top:/s)
})

test('uses the site title and content font stacks throughout the page', () => {
  assert.match(css, /font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif/)
  assert.match(css, /font-family: Inter, ui-sans-serif, system-ui, sans-serif/)
  assert.doesNotMatch(css, /Fraunces/)
})

test('renders an accessible selected-level interface with booking links', () => {
  assert.match(tsx, /role="tablist"/)
  assert.match(tsx, /role="tab"/)
  assert.match(tsx, /aria-selected/)
  assert.match(tsx, /onKeyDown/)
  assert.match(tsx, /Beginner/)
  assert.match(tsx, /Intermediate/)
  assert.match(tsx, /Advanced/)
  assert.match(tsx, /Book a beginner lesson/)
})

test('renders a concise four-beat first-month circle story', () => {
  assert.match(tsx, /Your first month/)
  assert.match(tsx, /First chords/)
  assert.match(tsx, /First song/)
  assert.match(tsx, /Rhythm settles/)
  assert.match(tsx, /Play it through/)
  assert.match(tsx, /weekly-redesign__timeline/)
  assert.match(tsx, /weekly-redesign__timeline-station/)
  assert.match(tsx, /Scroll to explore/)
})

test('gives every first-month circle one clear number and a readable copy surface', () => {
  assert.match(tsx, /String\(index \+ 1\)\.padStart\(2, '0'\)/)
  assert.doesNotMatch(tsx, /weekly-redesign__timeline-symbol/)
  assert.doesNotMatch(tsx, /symbol: '0[1-4]'/)
  assert.match(tsx, /weekly-redesign__timeline-copy/)
  assert.match(css, /\.weekly-redesign__timeline-copy\s*\{[^}]*background: rgba\(248, 244, 235, 0\.9\)/s)
})

test('drives first-month circles with a reversible desktop scroll timeline', () => {
  assert.doesNotMatch(tsx, /new Lenis\(/)
  assert.match(tsx, /import gsap from 'gsap'/)
  assert.match(tsx, /import \{ ScrollTrigger \} from 'gsap\/ScrollTrigger'/)
  assert.match(tsx, /gsap\.matchMedia/)
  assert.match(tsx, /\(min-width: 861px\) and \(prefers-reduced-motion: no-preference\)/)
  assert.match(tsx, /pin: true/)
  assert.match(tsx, /pin: true,\s*scrub: true,/)
  assert.match(tsx, /const STICKY_SCROLL_MULTIPLIER = 2/)
  assert.match(tsx, /snap:\s*\{[\s\S]*snapTo: 1 \/ \(monthBeats\.length - 1\)/)
  assert.match(tsx, /setActiveMonthIndex/)
  assert.match(tsx, /weekly-redesign__timeline-station\$\{isActive \? ' is-active' : ''\}/)
  assert.doesNotMatch(tsx, /containerAnimation/)
  assert.match(tsx, /monthStageRef/)
  assert.match(tsx, /monthTrackRef/)
  assert.match(tsx, /ScrollTrigger\.refresh\(\)/)
  assert.match(css, /\.weekly-redesign__timeline-station\.is-active\s*\{/)
})

test('keeps first-month circles accessible when animation is unavailable', () => {
  assert.match(tsx, /<ol[^>]*className="weekly-redesign__timeline"/)
  assert.match(css, /@media \(max-width: 860px\), \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.weekly-redesign__timeline\s*\{\s*display: grid;/)
  assert.match(
    css,
    /\.weekly-redesign__month-stage\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/s,
  )
  assert.match(
    css,
    /\.weekly-redesign__timeline-image::after\s*\{[^}]*rgba\(248, 244, 235, 0\.9\)/s,
  )
  assert.doesNotMatch(css, /--weekly-sage/)
  assert.match(css, /var\(--home-sage\)/)
})

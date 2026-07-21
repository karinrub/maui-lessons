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

test('uses a title-free practice hero with the supplied lesson video', () => {
  assert.match(tsx, /Progress happens on repeat\./)
  assert.match(tsx, /weekly-redesign__staff-mark/)
  assert.match(tsx, /weekly-redesign__ghost-word/)
  assert.match(tsx, /practice/)
  assert.doesNotMatch(tsx, /ONGOING LESSONS/)
  assert.doesNotMatch(tsx, /weekly-redesign__metronome/)
  assert.match(tsx, /aaron-weekly-section\.mp4/)
  assert.match(tsx, /autoPlay muted loop playsInline/)
  assert.match(tsx, /weekly-redesign__hero-photo-pair/)
  assert.match(tsx, /weekly-redesign__hero-content/)
  assert.match(tsx, /aaron-weekly-1\.jpg/)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.doesNotMatch(tsx, /Photo placeholder — vertical/)
  assert.doesNotMatch(tsx, /className="weekly-redesign__hero-media"/)
  assert.doesNotMatch(tsx, /weekly-redesign__collage/)
  assert.doesNotMatch(tsx, /weekly-redesign__quote/)
  assert.match(css, /\.weekly-redesign__hero-content \{\s+display: grid;/)
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) auto/)
  assert.match(css, /\.weekly-redesign__hero-video \{\s+width: min\(280px, calc\(50vw - 54px\)\);/)
  assert.match(css, /\.weekly-redesign__hero-video video \{\s+display: block;\s+width: 100%;\s+height: 157px;/)
})

test('renders the approved foundation sections in page order', () => {
  const hero = tsx.indexOf('className="weekly-redesign__hero"')
  const facts = tsx.indexOf('className="weekly-redesign__facts"')
  const progression = tsx.indexOf('className="weekly-redesign__progression"')
  const teacher = tsx.indexOf('className="weekly-redesign__teacher"')
  const crossLink = tsx.indexOf('className="weekly-redesign__cross-link"')
  const finale = tsx.indexOf('className="weekly-redesign__finale"')

  assert.ok(hero < facts && facts < progression && progression < teacher && teacher < crossLink && crossLink < finale)
  assert.match(tsx, /THE BASICS/)
  assert.match(tsx, /HOW IT DEVELOPS/)
  assert.match(tsx, /WHO YOU(?:'|&apos;)RE LEARNING FROM/)
  assert.match(tsx, /Make it a habit\./)

  const factsSection = tsx.slice(facts, progression)
  assert.doesNotMatch(factsSection, /<StaffMark\s*\/>/)
})

test('keeps the approved fact and progression copy as real text', () => {
  assert.match(tsx, /Private, one-on-one lessons/)
  assert.match(tsx, /Ukulele or guitar/)
  assert.match(tsx, /Weekly, across Kīhei, Wailea & Maipoina Beach Park/)
  assert.match(tsx, /From \$35 for a 30-minute lesson/)
  assert.match(tsx, /First chords, real songs/)
  assert.match(tsx, /Reading & understanding/)
  assert.match(tsx, /Refining your style/)
  assert.match(tsx, /weekly-redesign__progress-line/)
  assert.match(tsx, /weekly-redesign__progress-dot/)
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) minmax\(280px, 0\.42fr\)/)
  assert.match(css, /\.weekly-redesign__fretboard-photo img \{\s+height: clamp\(360px, 42vw, 520px\)/)
})

test('uses the supplied lesson photographs in every weekly media slot', () => {
  const placeholders = tsx.match(/<ImagePlaceholder/g) ?? []
  assert.equal(placeholders.length, 0)
  assert.match(tsx, /aaron-weekly-1\.jpg/)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.match(tsx, /Photo: Maipoina Beach Park, one of the regular lesson spots/)
  assert.match(tsx, /Photo: hands on the fretboard/)
  assert.match(tsx, /Photo: Aaron teaching a lesson/)
  assert.match(tsx, /aaron-personal-branding-isa-danzig-photography-2-2\.jpg/)
  assert.match(tsx, /aaron-bookingForm\.jpg/)
  assert.match(tsx, /aaron-teaching-2\.jpg/)
  assert.match(tsx, /<img src=\{src\} alt=\{caption\}/)
  assert.match(css, /\.weekly-redesign__location-photo \{\s+width: min\(100%, 720px\);\s+margin-left: auto;/)
  assert.match(css, /object-position: 50% 72%/)
  assert.match(css, /\.weekly-redesign__hero-photo-pair \.weekly-redesign__photo img \{\s+height: 170px;/)
})

test('excludes the unavailable cadence feature entirely', () => {
  assert.doesNotMatch(tsx, /same day, every week/i)
  assert.doesNotMatch(tsx, /highlightDay/)
  assert.doesNotMatch(tsx, /cadence/i)
  assert.doesNotMatch(tsx, /day-picker/i)
})

test('keeps the requested links and the intentionally simple finale', () => {
  assert.match(tsx, /to="\/tourist-lessons"/)
  assert.match(tsx, /to="\/book"/)
  assert.match(tsx, /Start lessons/)
  assert.doesNotMatch(tsx, /Footer navigation/)
  assert.match(tsx, /MAUI LESSONS — KĪHEI · WAILEA · MAIPOINA BEACH PARK/)
})

test('uses a one-time, reduced-motion-safe progression reveal', () => {
  assert.match(tsx, /import gsap from 'gsap'/)
  assert.match(tsx, /usePrefersReducedMotion/)
  assert.match(tsx, /playIfInView/)
  assert.match(tsx, /toggleActions: 'play none none none'/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('keeps the progression and finale visually clean', () => {
  const progressionStart = tsx.indexOf('className="weekly-redesign__progression"')
  const teacherStart = tsx.indexOf('className="weekly-redesign__teacher"')
  const finaleStart = tsx.indexOf('className="weekly-redesign__finale"')
  const progressionSection = tsx.slice(progressionStart, teacherStart)
  const finaleSection = tsx.slice(finaleStart)

  assert.doesNotMatch(progressionSection, /<StaffMark\s*\/>/)
  assert.match(css, /\.weekly-redesign__chart \{\s+position: relative;\s+min-height: 430px;/)
  assert.match(css, /stroke-width: 2\.5/)
  assert.match(css, /\.weekly-redesign__hero-photo-pair \.weekly-redesign__photo figcaption \{\s+display: none;/)
  assert.doesNotMatch(finaleSection, /begin/)
  assert.match(css, /\.weekly-redesign__finale \{\s+position: relative;\s+min-height: 100svh;/)
  assert.doesNotMatch(css, /weekly-redesign__ghost-word--begin/)
})

test('uses the shared site navigation without altering other routes', () => {
  assert.doesNotMatch(tsx, /weekly-redesign__site-nav/)
  assert.match(layout, /<GlobalNavigation isSuppressed=\{isHome && isHeaderSuppressed\} \/>/)
  assert.match(layout, /const isCinematic = isTouristLessons \|\| isAbout \|\| isWeeklyLessons/)
})

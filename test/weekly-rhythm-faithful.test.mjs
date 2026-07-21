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

test('renders the approved Practice Loop opening with one semantic hero title', () => {
  assert.match(tsx, /weekly-redesign__opening/)
  assert.match(tsx, /weekly-redesign__opening-stage/)
  assert.match(tsx, /weekly-redesign__loop-rings/)
  assert.match(tsx, /Begin again\./)
  assert.match(tsx, /Practice becomes/)
  assert.match(tsx, /Progress happens<\/span>\s*<span>on repeat\./)
  assert.equal((tsx.match(/<h1/g) ?? []).length, 1)
  assert.match(tsx, /aria-hidden="true"/)
})

test('keeps intrinsic media geometry and a strict resolved contact sheet', () => {
  assert.match(tsx, /width=\{720\}\s+height=\{960\}/)
  assert.match(tsx, /width=\{698\}\s+height=\{920\}/)
  assert.match(tsx, /preload="metadata"/)
  assert.match(tsx, /poster=\{weeklyHeroImageOne\}/)
  assert.match(css, /\.weekly-redesign__resolved-media/)
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
})

test('keeps global navigation outside the weekly component boundary', () => {
  assert.doesNotMatch(tsx, /GlobalNavigation|site-header|weekly-redesign__site-nav/)
  assert.match(layout, /<GlobalNavigation isSuppressed=\{isHome && isHeaderSuppressed\} \/>/)
})

test('renders the approved foundation sections in page order', () => {
  const opening = tsx.indexOf('className="weekly-redesign__opening"')
  const facts = tsx.indexOf('className="weekly-redesign__facts"')
  const progression = tsx.indexOf('className="weekly-redesign__progression"')
  const teacher = tsx.indexOf('className="weekly-redesign__teacher"')
  const crossLink = tsx.indexOf('className="weekly-redesign__cross-link"')
  const finale = tsx.indexOf('className="weekly-redesign__finale"')

  assert.ok(opening < facts && facts < progression && progression < teacher && teacher < crossLink && crossLink < finale)
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
  assert.match(tsx, /src=\{src\}/)
  assert.match(tsx, /alt=\{caption\}/)
  assert.match(css, /\.weekly-redesign__location-photo \{\s+width: min\(100%, 720px\);\s+margin-left: auto;/)
  assert.match(css, /object-position: 50% 72%/)
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

test('keeps the progression and finale visually clean', () => {
  const progressionStart = tsx.indexOf('className="weekly-redesign__progression"')
  const teacherStart = tsx.indexOf('className="weekly-redesign__teacher"')
  const finaleStart = tsx.indexOf('className="weekly-redesign__finale"')
  const progressionSection = tsx.slice(progressionStart, teacherStart)
  const finaleSection = tsx.slice(finaleStart)

  assert.doesNotMatch(progressionSection, /<StaffMark\s*\/>/)
  assert.match(css, /\.weekly-redesign__chart \{\s+position: relative;\s+min-height: 430px;/)
  assert.match(css, /stroke-width: 2\.5/)
  assert.doesNotMatch(finaleSection, /begin/)
  assert.match(css, /\.weekly-redesign__finale \{\s+position: relative;\s+min-height: 100svh;/)
  assert.doesNotMatch(css, /weekly-redesign__ghost-word--begin/)
})

test('keeps the cinematic route classification without altering other routes', () => {
  assert.match(layout, /const isCinematic = isTouristLessons \|\| isAbout \|\| isWeeklyLessons/)
})

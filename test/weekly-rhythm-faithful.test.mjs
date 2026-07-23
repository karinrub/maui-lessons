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

function collectCustomerFacingOngoingCopy(source) {
  const dataLiterals = [...source.matchAll(/const (?:facts|progression) = \[([\s\S]*?)\] as const/g)]
    .flatMap((block) => [...block[1].matchAll(/(['"])([\s\S]*?)\1/g)])
    .map((match) => match[2])
  const componentStart = source.indexOf('export default function WeeklyJourneySections()')
  const componentSource = source.slice(componentStart)
  const jsxStart = componentSource.lastIndexOf('\n  return (')

  assert.ok(componentStart >= 0, 'WeeklyJourneySections component not found')
  assert.ok(jsxStart >= 0, 'WeeklyJourneySections rendered JSX not found')

  const renderedJsx = componentSource.slice(jsxStart)

  return [
    ...dataLiterals,
    ...[...renderedJsx.matchAll(/>([^<]+)</g)].map((match) => match[1]),
    ...[...renderedJsx.matchAll(/caption\s*=\s*(["'])([\s\S]*?)\1/g)].map((match) => match[2]),
    ...[...renderedJsx.matchAll(/aria-label\s*=\s*(["'])([\s\S]*?)\1/g)].map((match) => match[2]),
  ]
}

function assertCustomerFacingOngoingCopyIsDashFree(source) {
  for (const copy of collectCustomerFacingOngoingCopy(source)) {
    assert.doesNotMatch(copy, /[-–—]/, `dash character found in: ${copy.trim()}`)
  }
}

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

test('uses one reversible matchMedia lifecycle for the Practice Loop', () => {
  assert.match(tsx, /MotionPathPlugin/)
  assert.match(tsx, /gsap\.matchMedia\(root\)/)
  assert.match(tsx, /isDesktop: '\(min-width: 761px\).*min-height: 680px/)
  assert.match(tsx, /isMobile: '\(max-width: 760px\)/)
  assert.match(tsx, /scrub:\s*1(?:\.0)?/)
  assert.match(tsx, /pin:\s*openingStage/)
  assert.match(tsx, /mm\.revert\(\)/)
  assert.doesNotMatch(tsx, /toggleActions:/)
  assert.doesNotMatch(tsx, /new Lenis|addEventListener\(['"]wheel/)
  assert.match(tsx, /new IntersectionObserver/)
})

test('keeps intrinsic media geometry and a strict resolved contact sheet', () => {
  assert.match(tsx, /width=\{720\}\s+height=\{960\}/)
  assert.match(tsx, /width=\{698\}\s+height=\{920\}/)
  assert.match(tsx, /preload="metadata"/)
  assert.match(tsx, /poster=\{weeklyHeroImageOne\}/)
  assert.match(css, /\.weekly-redesign__resolved-media/)
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(css, /\.weekly-redesign__hero-video-frame video \{[\s\S]*?width: 100%;\s+height: auto;/)
  assert.match(css, /\.weekly-redesign__contact-sheet img \{[\s\S]*?width: 100%;\s+height: auto;/)
})

test('initializes a caption-free Practice Loop aperture before its trigger enters', () => {
  assert.match(
    tsx,
    /<figure className="weekly-redesign__hero-video-figure">\s*<div className="weekly-redesign__hero-video-frame">[\s\S]*?<\/div>\s*<figcaption>/,
  )

  const initialFrameSet = tsx.indexOf('gsap.set(videoFrame')
  const practiceTimeline = tsx.indexOf("const tl = gsap.timeline({ defaults: { ease: 'none' } })")
  assert.ok(initialFrameSet >= 0 && initialFrameSet < practiceTimeline)
  assert.equal((tsx.match(/\.set\(\s*videoFrame/g) ?? []).length, 2)
})

test('keeps the video aperture position refresh-safe inside the scrubbed timeline', () => {
  // The one-time gsap.set() before the timeline only prevents an initial-paint
  // flash; it never re-runs. invalidateOnRefresh only recomputes function-based
  // values that belong to the ScrollTrigger's own animation, so the x/y/scale
  // offset must also be set inside the timeline itself (not only eagerly) or a
  // resize/font-load refresh leaves the video mis-centered in the loop window.
  const stillLabel = tsx.indexOf("tl.addLabel('still', 0)")
  const repetitionLabel = tsx.indexOf(".addLabel('repetition', 0.2)")
  assert.ok(stillLabel >= 0 && repetitionLabel > stillLabel)
  const stillPhase = tsx.slice(stillLabel, repetitionLabel)
  assert.match(stillPhase, /\.set\(\s*videoFrame,\s*\{\s*x:\s*\(\)\s*=>\s*getVideoStart\(\)\.x/)
})

test('sizes downstream media from source aspect ratios', () => {
  assert.match(tsx, /width=\{2200\}\s+height=\{1467\}/)
  assert.match(tsx, /width=\{1467\}\s+height=\{2200\}/)
  assert.match(tsx, /width=\{1153\}\s+height=\{1153\}/)
  assert.match(css, /\.weekly-redesign__photo img \{[\s\S]*?width: 100%;\s+height: auto;/)
  assert.match(css, /\.weekly-redesign__location-photo img[^}]*aspect-ratio:\s*16 \/ 9/s)
  assert.match(css, /\.weekly-redesign__teaching-photo img[^}]*aspect-ratio:\s*1/s)
})

test('uses reversible section timelines instead of collage parallax', () => {
  assert.match(tsx, /weekly-facts-score/)
  assert.match(tsx, /weekly-teacher-score/)
  assert.match(tsx, /scrub:\s*0\.8/)
  assert.match(css, /\.weekly-redesign__teacher-copy strong[^}]*display:\s*inline-block/s)
  assert.doesNotMatch(tsx, /data-vacation-parallax|collage|pull-quote/)
})

test('keeps global navigation outside the weekly component boundary', () => {
  assert.doesNotMatch(tsx, /GlobalNavigation|site-header|weekly-redesign__site-nav/)
  assert.match(layout, /<GlobalNavigation isSuppressed=\{isHome && isHeaderSuppressed\} \/>/)
})

test('renders the approved local student chapters in page order', () => {
  const opening = tsx.indexOf('className="weekly-redesign__opening"')
  const facts = tsx.indexOf('className="weekly-redesign__facts"')
  const audience = tsx.indexOf('className="weekly-redesign__audience"')
  const progression = tsx.indexOf('className="weekly-redesign__progression"')
  const weeklyLesson = tsx.indexOf('className="weekly-redesign__weekly-lesson"')
  const teacher = tsx.indexOf('className="weekly-redesign__teacher"')
  const crossLink = tsx.indexOf('className="weekly-redesign__cross-link"')
  const finale = tsx.indexOf('className="weekly-redesign__finale"')

  assert.ok(
    opening < facts &&
      facts < audience &&
      audience < progression &&
      progression < weeklyLesson &&
      weeklyLesson < teacher &&
      teacher < crossLink &&
      crossLink < finale,
  )
  assert.match(tsx, /A PLACE TO BEGIN/)
  assert.match(tsx, /Lessons for every stage of learning\./)
  assert.match(tsx, /Adults and returning players/)
  assert.match(tsx, /Younger students and their parents/)
  assert.match(tsx, /YOUR WEEKLY LESSON/)
  assert.match(tsx, /Each week starts where the last one ended\./)
  assert.match(tsx, /WHO YOU ARE LEARNING FROM/)

  const factsSection = tsx.slice(facts, audience)
  assert.doesNotMatch(factsSection, /<StaffMark\s*\/>/)
})

test('lays out the local student chapters responsively and keeps them visible without motion', () => {
  assert.match(
    css,
    /\.weekly-redesign__audience-intro \{[\s\S]*?grid-template-columns:\s*minmax\(0, 0\.9fr\) minmax\(320px, 0\.7fr\);/,
  )
  assert.match(
    css,
    /\.weekly-redesign__weekly-lesson-layout \{[\s\S]*?grid-template-columns:\s*minmax\(0, 0\.9fr\) minmax\(320px, 0\.7fr\);/,
  )
  assert.match(
    css,
    /@media \(max-width: 760px\) \{[\s\S]*?\.weekly-redesign__audience-intro,[\s\S]*?\.weekly-redesign__weekly-lesson-layout \{[\s\S]*?grid-template-columns:\s*1fr;/,
  )
  assert.match(
    css,
    /@media \(max-width: 760px\) \{[\s\S]*?\.weekly-redesign__audience-grid \{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\.weekly-redesign__audience-grid article,[\s\S]*?\.weekly-redesign__audience-grid article:first-child \{[\s\S]*?border-right:\s*0;/,
  )
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.weekly-redesign__audience-intro > \*,[\s\S]*?\.weekly-redesign__audience-grid article,[\s\S]*?\.weekly-redesign__weekly-lesson-layout > \* \{[\s\S]*?opacity:\s*1 !important;[\s\S]*?visibility:\s*visible !important;[\s\S]*?transform:\s*none !important;/,
  )
})

test('keeps new local student chapters out of GSAP hidden-state tweens', () => {
  const interactionStart = tsx.indexOf('const mm = gsap.matchMedia')
  const interactionEnd = tsx.indexOf('\n    return (', interactionStart)
  const interactionSource = tsx.slice(interactionStart, interactionEnd)

  assert.ok(interactionStart >= 0 && interactionEnd > interactionStart)
  assert.doesNotMatch(interactionSource, /weekly-redesign__audience/)
  assert.doesNotMatch(interactionSource, /weekly-redesign__weekly-lesson/)
})

test('keeps approved facts and progression copy as real text', () => {
  assert.match(tsx, /Private lessons with Aaron/)
  assert.match(tsx, /Ukulele or guitar/)
  assert.match(tsx, /Weekly lessons in Kīhei, Wailea, and at Maipoina Beach Park/)
  assert.match(tsx, /Rates start at \$35 for a 30 minute lesson/)
  assert.match(tsx, /First chords, real songs/)
  assert.match(tsx, /Reading and understanding/)
  assert.match(tsx, /Technique and your own style/)
  assert.match(tsx, /weekly-redesign__progress-path/)
  assert.match(tsx, /weekly-redesign__progress-dot/)
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) minmax\(320px, 0\.38fr\)/)
  assert.match(css, /\.weekly-redesign__fretboard-photo img \{\s+aspect-ratio: 2 \/ 3;/)
})

test('uses supported teacher experience copy', () => {
  assert.match(tsx, /Aaron brings <strong>22 years<\/strong> of making, studying, and performing music/)
  assert.match(tsx, /primary instrument and focus for the last <strong>eight years<\/strong>/)
  assert.doesNotMatch(tsx, /taught guitar and ukulele on Maui for/)
  assert.doesNotMatch(page, /over twenty years teaching music/)
})

test('keeps customer facing Ongoing Lessons copy free of dash characters', () => {
  assertCustomerFacingOngoingCopyIsDashFree(tsx)
})

test('the dash-free copy collector detects a dash in a facts data literal', () => {
  assert.throws(
    () => assertCustomerFacingOngoingCopyIsDashFree(tsx.replace('Private lessons with Aaron', 'Private-lessons with Aaron')),
    /dash character found in: Private-lessons with Aaron/,
  )
})

test('the dash-free copy collector detects a dash in multiline JSX text', () => {
  assert.throws(
    () => assertCustomerFacingOngoingCopyIsDashFree(tsx.replace('Some students', 'Some-students')),
    /dash character found in: Some-students/,
  )
})

test('the dash-free copy collector detects a dash in a caption attribute', () => {
  assert.throws(
    () => assertCustomerFacingOngoingCopyIsDashFree(tsx.replace('caption="Hands on the fretboard"', 'caption="Hands-on the fretboard"')),
    /dash character found in: Hands-on the fretboard/,
  )
})

test('the dash-free copy collector detects a dash in an aria-label attribute', () => {
  assert.throws(
    () => assertCustomerFacingOngoingCopyIsDashFree(tsx.replace('aria-label="Footer navigation"', 'aria-label="Footer-navigation"')),
    /dash character found in: Footer-navigation/,
  )
})

test('builds a rising graph with one active travelling dot', () => {
  assert.match(tsx, /weekly-redesign__progress-graphic/)
  assert.match(tsx, /weekly-redesign__progress-active-dot/)
  assert.match(tsx, /weekly-redesign__progress-path/)
  assert.match(tsx, /weekly-redesign__progress-milestone/g)
  assert.match(tsx, /id: 'weekly-progress-desktop'/)
  assert.match(tsx, /id: 'weekly-progress-mobile'/)
  assert.match(tsx, /pin:\s*progressStage/)
  assert.match(tsx, /motionPath:/)
  assert.match(tsx, /y:\s*-64/)
})

test('does not pin the graph on mobile or short-height screens', () => {
  assert.match(tsx, /if \(isDesktop\)/)
  assert.match(tsx, /weekly-progress-mobile/)
  assert.match(css, /padding:\s*0 4px 0 40px/)
  assert.doesNotMatch(css, /@media \(max-width: 760px\)[\s\S]*position:\s*sticky/)
})

test('keeps milestone headings contained in the narrow pinned graph', () => {
  const narrowPinnedStart = css.indexOf(
    '@media (min-width: 761px) and (max-width: 920px) and (min-height: 680px)',
  )
  const narrowPinnedEnd = css.indexOf('@media', narrowPinnedStart + 1)
  const narrowPinned = css.slice(narrowPinnedStart, narrowPinnedEnd)

  assert.ok(narrowPinnedStart >= 0)
  assert.match(narrowPinned, /grid-template-columns: minmax\(0, 1fr\) minmax\(240px, 0\.36fr\)/)
  assert.match(narrowPinned, /\.weekly-redesign__progress-milestone h3 \{[\s\S]*font-size: 1\.18rem;/)
  assert.match(narrowPinned, /overflow-wrap: normal;\s+word-break: normal;/)
})

test('uses the supplied lesson photographs in every weekly media slot', () => {
  const placeholders = tsx.match(/<ImagePlaceholder/g) ?? []
  assert.equal(placeholders.length, 0)
  assert.match(tsx, /aaron-weekly-1\.jpg/)
  assert.match(tsx, /aaron-weekly-2\.jpg/)
  assert.match(tsx, /Maipoina Beach Park, one of the regular lesson spots/)
  assert.match(tsx, /Hands on the fretboard/)
  assert.match(tsx, /Aaron teaching a lesson/)
  assert.doesNotMatch(tsx, /Lesson footage — silent clip, low-fi/)
  assert.doesNotMatch(tsx, /Photo:/)
  assert.match(tsx, /aaron-personal-branding-isa-danzig-photography-2-2\.jpg/)
  assert.match(tsx, /aaron-bookingForm\.jpg/)
  assert.match(tsx, /aaron-teaching-2\.jpg/)
  assert.match(tsx, /src=\{src\}/)
  assert.match(tsx, /alt=\{caption\}/)
  assert.match(css, /\.weekly-redesign__location-photo \{\s+width: 100%;\s+transform-origin: center;/)
  assert.match(css, /object-position: 50% 68%/)
})

test('excludes the unavailable cadence feature entirely', () => {
  assert.doesNotMatch(tsx, /same day, every week/i)
  assert.doesNotMatch(tsx, /highlightDay/)
  assert.doesNotMatch(tsx, /cadence/i)
  assert.doesNotMatch(tsx, /day-picker/i)
})

test('keeps the requested lesson links and finale copy', () => {
  assert.match(tsx, /to="\/tourist-lessons"/)
  assert.match(tsx, /to="\/book"/)
  assert.match(tsx, /Book a Lesson/)
  assert.match(tsx, /Make music part of your week\./)
  assert.match(tsx, /Start where you are\. Aaron will help you find the next step\./)
  assert.match(tsx, /You do not need to have everything figured out before you book\./)
})

test('uses the compact Home-style finale as the weekly footer', () => {
  assert.match(tsx, /Footer navigation/)
  assert.match(tsx, /to="\/"[^>]*>Home</)
  assert.match(tsx, /to="\/tourist-lessons"[^>]*>Vacation Lessons</)
  assert.match(tsx, /to="\/about"[^>]*>About</)
  assert.match(tsx, /to="\/faq"[^>]*>FAQ</)
  assert.match(tsx, /Book a Lesson/)
  assert.match(tsx, /weekly-redesign__finale-copyright/)
  assert.doesNotMatch(css, /\.weekly-redesign__finale \{[^}]*min-height:\s*100svh/s)
  assert.match(tsx, /id: 'weekly-finale-score'/)
})

test('keeps the progression and finale visually clean', () => {
  const progressionStart = tsx.indexOf('className="weekly-redesign__progression"')
  const teacherStart = tsx.indexOf('className="weekly-redesign__teacher"')
  const finaleStart = tsx.indexOf('className="weekly-redesign__finale"')
  const progressionSection = tsx.slice(progressionStart, teacherStart)
  const finaleSection = tsx.slice(finaleStart)

  assert.doesNotMatch(progressionSection, /<StaffMark\s*\/>/)
  assert.match(css, /\.weekly-redesign__chart \{\s+position: relative;\s+min-height: 560px;/)
  assert.match(css, /stroke-width: 2\.5/)
  assert.doesNotMatch(finaleSection, /begin/)
  assert.doesNotMatch(css, /\.weekly-redesign__finale \{[^}]*min-height:\s*100svh/s)
  assert.doesNotMatch(css, /weekly-redesign__ghost-word--begin/)
})

test('keeps the cinematic route classification without altering other routes', () => {
  assert.match(layout, /const isCinematic = isTouristLessons \|\| isAbout \|\| isWeeklyLessons/)
})

test('keeps reduced motion fully visible and removes cinematic pinning', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.weekly-redesign__resolved-hero[^}]*opacity:\s*1/s)
  assert.match(css, /\.weekly-redesign__progress-milestone[^}]*opacity:\s*1/s)
  assert.match(tsx, /if \(!root \|\| prefersReducedMotion\)\s*\{?\s*return/)
})

test('preserves established mechanics and links around the new copy', () => {
  assert.doesNotMatch(tsx, /cadence|highlightDay|day-picker|collage|pull-quote/i)
  assert.match(tsx, /to="\/tourist-lessons"/)
  assert.match(tsx, /to="\/book"/)
  assert.match(tsx, /weekly-practice-loop/)
  assert.match(tsx, /weekly-progress-desktop/)
  assert.match(tsx, /weekly-progress-mobile/)
})

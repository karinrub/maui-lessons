import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const content = await readFile(
  new URL('../src/components/faq/faqContent.ts', import.meta.url),
  'utf8',
)
const book = await readFile(new URL('../src/pages/Book.tsx', import.meta.url), 'utf8')
const lessonOptions = await readFile(
  new URL('../src/config/lessonOptions.ts', import.meta.url),
  'utf8',
).catch(() => '')
const tsx = await readFile(
  new URL('../src/components/faq/FaqSections.tsx', import.meta.url),
  'utf8',
)
const css = await readFile(
  new URL('../src/components/faq/FaqSections.css', import.meta.url),
  'utf8',
)
const layout = await readFile(new URL('../src/layout/SiteLayout.tsx', import.meta.url), 'utf8')

test('defines visitor, ongoing, and booking routes for the FAQ guide', () => {
  assert.match(content, /label: 'Visiting Maui'/)
  assert.match(content, /targetId: 'faq-category-vacation'/)
  assert.match(content, /label: 'Learning week to week'/)
  assert.match(content, /targetId: 'faq-category-ongoing'/)
  assert.match(content, /label: 'Before you book'/)
  assert.match(content, /targetId: 'faq-category-planning'/)
})

test('keeps five buyer-oriented FAQ sections and visible decision facts', () => {
  for (const id of ['start', 'vacation', 'ongoing', 'planning', 'pricing']) {
    assert.match(content, new RegExp(`id: '${id}'`))
  }
  assert.match(content, /From \$\$\{STARTING_LESSON_PRICE\} \/ 30 minutes/)
  assert.match(content, /Ukulele supplied/)
  assert.match(content, /Private lessons/)
})

test('derives FAQ starting price from the booking lesson options', () => {
  assert.match(lessonOptions, /export const VACATION_LESSON_OPTIONS/)
  assert.match(lessonOptions, /export const ONGOING_LESSON_OPTIONS/)
  assert.match(lessonOptions, /export const STARTING_LESSON_PRICE = Math\.min/)
  assert.match(lessonOptions, /id: 'solo-30'[\s\S]*?duration: '30 minutes'[\s\S]*?price: 35/)
  assert.match(lessonOptions, /id: 'group-6-8'[\s\S]*?duration: '1 hour'[\s\S]*?price: 120/)
  assert.match(lessonOptions, /id: 'ongoing-60'[\s\S]*?duration: '1 hour'[\s\S]*?price: 60/)
  assert.match(book, /from '..\/config\/lessonOptions'/)
  assert.doesNotMatch(book, /const VACATION_LESSON_OPTIONS =/)
  assert.doesNotMatch(book, /const ONGOING_LESSON_OPTIONS =/)
  assert.match(content, /STARTING_LESSON_PRICE/)
  assert.doesNotMatch(content, /From \$35|start at \$35/)
})

test('scopes supplied instruments to ukuleles', () => {
  assert.match(content, /For ukulele lessons, no\./)
  assert.match(content, /Aaron brings a ukulele/)
  assert.doesNotMatch(content, /(?:guitar|instrument)s? (?:is|are|will be )?supplied/i)
})

test('describes both vacation lesson lengths without claiming every lesson is one hour', () => {
  assert.match(content, /30-minute or one-hour/)
  assert.doesNotMatch(content, /One private hour|the hour moves/i)
})

test('does not promise unfinished booking delivery or unconfirmed policies', () => {
  assert.doesNotMatch(content, /he’ll take it from there/i)
  assert.doesNotMatch(content, /send a booking request/i)
  assert.doesNotMatch(content, /cancellation|reschedul|weather|parking/i)
})

test('omits unconfirmed frequency pricing and future payment availability', () => {
  assert.doesNotMatch(content, /depends on .*how often|frequency-based/i)
  assert.doesNotMatch(content, /Square|coming soon/i)
})

test('renders guide routes, visible facts, and one instructional proof image', () => {
  assert.match(tsx, /faq-guide-routes/)
  assert.match(tsx, /faq-quick-facts/)
  assert.match(tsx, /faq-proof/)
  assert.match(tsx, /src=\{faqProof\.imageSrc\}/)
  assert.match(tsx, /width=\{2400\}/)
  assert.match(tsx, /height=\{1603\}/)
  assert.doesNotMatch(tsx, /faq-break/)
})

test('ends FAQ with the identical shared home finale', () => {
  assert.match(tsx, /import HomeFinale from '..\/home\/HomeFinale'/)
  assert.match(tsx, /<HomeFinale \/>/)
  assert.doesNotMatch(tsx, /faq-close/)
  assert.doesNotMatch(css, /\.faq-close/)
  assert.match(css, /\.faq-page > \.home-finale \{[\s\S]*?width: 100vw;/)
  assert.match(layout, /const isFaq = pathname === '\/faq'/)
  assert.match(layout, /isHome \|\| isWeeklyLessons \|\| isFaq \? null : <SiteFooter \/>/)
})

test('uses open rails and one responsive proof composition instead of a decorative image break', () => {
  assert.match(css, /\.faq-guide-routes \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/)
  assert.match(css, /\.faq-quick-facts \{[\s\S]*?display: flex/)
  assert.match(css, /\.faq-proof \{[\s\S]*?grid-template-columns: minmax\(0, 0\.9fr\) minmax\(280px, 0\.7fr\)/)
  assert.doesNotMatch(css, /\.faq-break/)
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.faq-proof \{[\s\S]*?grid-template-columns: 1fr;/)
})

test('uses opaque dark ink for 0.76rem quick facts over the sage gradient', () => {
  assert.match(
    css,
    /\.faq-quick-facts li \{[\s\S]*?color: #17352a;[\s\S]*?font-size: 0\.76rem;/,
  )
})

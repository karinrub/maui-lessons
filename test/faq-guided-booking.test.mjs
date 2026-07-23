import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const content = await readFile(
  new URL('../src/components/faq/faqContent.ts', import.meta.url),
  'utf8',
)
const tsx = await readFile(
  new URL('../src/components/faq/FaqSections.tsx', import.meta.url),
  'utf8',
)

test('defines visitor, ongoing, and booking routes for the FAQ guide', () => {
  assert.match(content, /label: 'Visiting Maui'/)
  assert.match(content, /targetId: 'faq-category-vacation'/)
  assert.match(content, /label: 'Learning week to week'/)
  assert.match(content, /targetId: 'faq-category-ongoing'/)
  assert.match(content, /label: 'Before you book'/)
  assert.match(content, /targetId: 'faq-category-pricing'/)
})

test('keeps five buyer-oriented FAQ sections and visible decision facts', () => {
  for (const id of ['start', 'vacation', 'ongoing', 'planning', 'pricing']) {
    assert.match(content, new RegExp(`id: '${id}'`))
  }
  assert.match(content, /From \$35 \/ 30 minutes/)
  assert.match(content, /Ukulele supplied/)
  assert.match(content, /Private lessons/)
})

test('does not promise unfinished booking delivery or unconfirmed policies', () => {
  assert.doesNotMatch(content, /he’ll take it from there/i)
  assert.doesNotMatch(content, /send a booking request/i)
  assert.doesNotMatch(content, /cancellation|reschedul|weather|parking/i)
})

test('renders guide routes, visible facts, and one instructional proof image', () => {
  assert.match(tsx, /faq-guide-routes/)
  assert.match(tsx, /faq-quick-facts/)
  assert.match(tsx, /faq-proof/)
  assert.match(tsx, /src=\{faqProof\.imageSrc\}/)
  assert.doesNotMatch(tsx, /faq-break/)
})

test('uses a truthful FAQ booking action', () => {
  assert.match(tsx, /Explore lesson options/)
  assert.doesNotMatch(tsx, /Book a Lesson/)
  assert.doesNotMatch(tsx, /Anything\s+else — just ask when you book\./)
})

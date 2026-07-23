import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const tsx = await readFile(
  new URL('../src/components/faq/FaqSections.tsx', import.meta.url),
  'utf8',
)
const content = await readFile(
  new URL('../src/components/faq/faqContent.ts', import.meta.url),
  'utf8',
)
const css = await readFile(
  new URL('../src/components/faq/FaqSections.css', import.meta.url),
  'utf8',
)

test('emits FAQPage structured data generated from the accordion source', () => {
  assert.match(content, /'@type': 'FAQPage'/)
  assert.match(content, /acceptedAnswer/)
  assert.match(tsx, /application\/ld\+json/)
  // Generated from faqCategories, not a second hand-written copy.
  assert.match(content, /faqCategories\.flatMap/)
})

test('supports deep links that open a question from the URL hash', () => {
  assert.match(tsx, /window\.location\.hash/)
  assert.match(tsx, /setOpen\(item\.id\)/)
})

test('category nav scrolls smoothly and respects reduced motion', () => {
  assert.match(tsx, /handleNavClick/)
  assert.match(tsx, /prefersReducedMotion \? 'auto' : 'smooth'/)
  assert.match(css, /scroll-margin-top/)
})

test('closed answers leave the accessibility tree, with asymmetric timing', () => {
  // visibility flips after collapse so 0fr rows are not read by screen readers
  assert.match(css, /\.faq-row__answer \{[^}]*visibility: hidden/s)
  assert.match(css, /visibility 0s linear 0\.3s/)
  // close faster than open
  assert.match(css, /grid-template-rows 0\.3s/)
  assert.match(css, /grid-template-rows 0\.42s/)
})

test('ghost word crossfades instead of hard-cutting', () => {
  assert.match(tsx, /setGhostWord/)
  assert.match(tsx, /onComplete: \(\) => setGhostWord\(next\)/)
})

test('warm gold drift scrubs in toward Pricing and booking', () => {
  assert.match(tsx, /#faq-category-pricing/)
  assert.match(tsx, /--faq-warm/)
  assert.match(css, /opacity: var\(--faq-warm, 0\)/)
})

test('answer framing dropped the cream sheet (kicker + gold rule remain)', () => {
  assert.doesNotMatch(css, /\.faq-row__answer-text \{[^}]*background/s)
  assert.match(css, /\.faq-row__answer-clip \{[^}]*border-left/s)
})

test('mobile category nav pins below the fixed site header', () => {
  assert.match(css, /top: clamp\(58px, 9svh, 86px\)/)
})

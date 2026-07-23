# FAQ Guided Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/faq` into a two-audience booking guide that exposes decision facts, preserves accessible detailed answers, replaces decorative media with teaching proof, and uses truthful booking language.

**Architecture:** Keep `FaqSections` as route composition and move its content model into a focused `faqContent.ts` module. Add data-driven audience links, quick facts, and proof content ahead of the existing category/accordion renderer; the same question data continues to generate FAQ JSON-LD. CSS extends the existing cream intro and sage guide surface rather than adding a second page system.

**Tech Stack:** React 19, TypeScript, React Router 7, GSAP/ScrollTrigger, CSS, Node built-in test runner, Vite.

## Global Constraints

- Preserve one semantic `h1`, accordion ARIA behavior, answer/category deep links, reduced-motion final states, and FAQPage JSON-LD generated from question data.
- Use confirmed existing facts only: private instruction, ukulele/guitar, supplied ukulele, Maui locations, vacation group formats, current displayed rates, cash/Venmo payment, Aaron's 22 years in music and eight years of ukulele focus.
- Do not publish weather, cancellation, rescheduling, availability, response-time, accessibility, travel, or parking policy until owner confirms it.
- Do not claim a booking request reaches Aaron: `Book.tsx` does not currently send form data.
- No dependencies, testimonials, new route variants, generic card grids, or image generation. User explicitly declined mockups; use existing media only.
- Use `assets/images/aaron-teaching-tree-1.jpg` once in the FAQ proof panel, cropped to preserve Aaron and student under the tree.
- Keep cream/forest/sage/gold palette, Fraunces/Cormorant typography, and existing ghost motif. Use SVG for any new directional indicator rather than text glyphs.

---

## File Structure

- Create: `src/components/faq/faqContent.ts` — typed source of truth for guide routes, visible facts, proof details, FAQ categories/questions, and FAQPage JSON-LD input.
- Modify: `src/components/faq/FaqSections.tsx` — consumes content module; renders guide routes, facts, five FAQ sections, proof panel, updated image, and truthful CTA.
- Modify: `src/components/faq/FaqSections.css` — adds guide-route/fact/proof-media styling; removes decorative image-break styling; preserves accordion/navigation behavior.
- Create: `test/faq-guided-booking.test.mjs` — static regression contract for new content architecture, truthfulness, media purpose, and existing accessibility requirements.
- Modify: `test/faq-polish.test.mjs` — updates category-specific assertions from the old three-section hierarchy to five-section guide behavior without weakening existing interaction checks.

## Task 1: Lock FAQ guide content contract

**Files:**
- Create: `test/faq-guided-booking.test.mjs`
- Create: `src/components/faq/faqContent.ts`

**Interfaces:**
- Produces `faqCategories`, `faqGuideRoutes`, `faqQuickFacts`, `faqProof`, and `faqStructuredData` from `faqContent.ts`.
- `FaqCategory` has `id`, `label`, `descriptor`, `ghostWord`, and `items`.
- `FaqItem` has `id`, `q`, and `a`.
- `faqGuideRoutes` entries have `targetId`, `label`, and `detail`.

- [ ] **Step 1: Write failing guide-content regression test**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const content = await readFile(
  new URL('../src/components/faq/faqContent.ts', import.meta.url),
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/faq-guided-booking.test.mjs`

Expected: FAIL with `ENOENT` because `faqContent.ts` does not yet exist.

- [ ] **Step 3: Create typed FAQ content source**

```ts
export type FaqItem = { id: string; q: string; a: string }

export type FaqCategory = {
  id: 'start' | 'vacation' | 'ongoing' | 'planning' | 'pricing'
  label: string
  descriptor: string
  ghostWord: string
  items: FaqItem[]
}

export const faqGuideRoutes = [
  { label: 'Visiting Maui', detail: 'Vacation lessons', targetId: 'faq-category-vacation' },
  { label: 'Learning week to week', detail: 'Ongoing lessons', targetId: 'faq-category-ongoing' },
  { label: 'Before you book', detail: 'Pricing and planning', targetId: 'faq-category-pricing' },
] as const

export const faqQuickFacts = [
  'Private lessons',
  'Ukulele or guitar',
  'Ukulele supplied',
  'South Maui and visitor accommodation',
  'From $35 / 30 minutes',
] as const

export const faqProof = {
  imageAlt: 'Aaron teaching a student guitar outdoors under a tree on Maui',
  imageSrc: new URL('../../../assets/images/aaron-teaching-tree-1.jpg', import.meta.url).href,
  eyebrow: 'Why learn with Aaron',
  heading: 'A lesson shaped around you.',
  points: [
    '22 years making, studying, and performing music',
    'Eight years with ukulele as his primary focus',
    'Private teaching at a patient, no pressure pace',
  ],
} as const
```

Add complete `faqCategories` data under this scaffold. Move verified existing answers into these exact section IDs:

```ts
export const faqCategories: FaqCategory[] = [
  { id: 'start', label: 'Start playing', descriptor: 'Find your footing', ghostWord: 'begin', items: [] },
  { id: 'vacation', label: 'Vacation lessons', descriptor: 'Make Maui part of the song', ghostWord: 'visit', items: [] },
  { id: 'ongoing', label: 'Ongoing lessons', descriptor: 'Keep building every week', ghostWord: 'practice', items: [] },
  { id: 'planning', label: 'Plan your lesson', descriptor: 'Know what to expect', ghostWord: 'ready', items: [] },
  { id: 'pricing', label: 'Pricing and booking', descriptor: 'Choose your next step', ghostWord: 'play', items: [] },
]
```

Place existing answers as follows:

- `start`: experience, ages, ukulele-or-guitar.
- `vacation`: vacation, group.
- `ongoing`: ongoing.
- `planning`: where, bring-instrument.
- `pricing`: pricing, payment, how-to-book.

Replace `how-to-book` answer with: `The booking page lets you compare lesson options and choose a date and time. Aaron will confirm next steps directly once booking delivery is connected.`

Export `faqStructuredData` as `JSON.stringify(...)`, generated solely from `faqCategories.flatMap(...)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/faq-guided-booking.test.mjs`

Expected: PASS — three tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/faq/faqContent.ts test/faq-guided-booking.test.mjs
git commit -m "feat(faq): add guided booking content model"
```

## Task 2: Render audience routes, facts, proof, and truthful booking CTA

**Files:**
- Modify: `src/components/faq/FaqSections.tsx:1-540`
- Modify: `test/faq-guided-booking.test.mjs`
- Modify: `test/faq-polish.test.mjs`

**Interfaces:**
- Consumes named exports from `faqContent.ts`.
- Produces links to `#faq-category-vacation`, `#faq-category-ongoing`, and `#faq-category-pricing` plus unchanged question-answer hash support.

- [ ] **Step 1: Extend failing component contract**

Append these tests:

```js
const tsx = await readFile(
  new URL('../src/components/faq/FaqSections.tsx', import.meta.url),
  'utf8',
)

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
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/faq-guided-booking.test.mjs`

Expected: FAIL because current FAQ has no `faq-guide-routes`, `faq-quick-facts`, or `faq-proof` markup.

- [ ] **Step 3: Replace local content and insert guide modules**

Replace local `FaqItem`, `FaqCategory`, `faqCategories`, and local structured-data declarations with:

```ts
import {
  faqCategories,
  faqGuideRoutes,
  faqProof,
  faqQuickFacts,
  faqStructuredData,
} from './faqContent'
```

Insert this after `.faq-intro__reassurance` and before `.faq-intro__compass-window`:

```tsx
<nav className="faq-guide-routes" aria-label="Choose your FAQ path">
  {faqGuideRoutes.map((route) => (
    <a key={route.targetId} href={`#${route.targetId}`} onClick={(event) => handleNavClick(event, route.targetId.replace('faq-category-', ''))}>
      <span>{route.label}</span>
      <small>{route.detail}</small>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 3l5 5-5 5" /></svg>
    </a>
  ))}
</nav>
```

Insert this as first child of `.faq-shelf__content`:

```tsx
<ul className="faq-quick-facts" aria-label="Lesson essentials">
  {faqQuickFacts.map((fact) => <li key={fact}>{fact}</li>)}
</ul>
```

Insert this immediately after ongoing section and remove the `category.id === 'the-lessons'` image-break branch:

```tsx
{category.id === 'ongoing' && (
  <aside className="faq-proof" aria-label="Why learn with Aaron">
    <div className="faq-proof__copy">
      <p>{faqProof.eyebrow}</p>
      <h2>{faqProof.heading}</h2>
      <ul>{faqProof.points.map((point) => <li key={point}>{point}</li>)}</ul>
      <Link to="/about">Meet Aaron <span aria-hidden="true">→</span></Link>
    </div>
    <figure className="faq-proof__media">
      <img src={faqProof.imageSrc} alt={faqProof.imageAlt} width={1920} height={1280} loading="lazy" decoding="async" />
    </figure>
  </aside>
)}
```

Change closing link visible string to `Explore lesson options`; leave destination `/book`. Replace close note with `Compare formats, choose a date, and plan your lesson.`

Update `handleNavClick` parameter to accept a category ID only. Guide route target IDs must transform back to same ID before lookup; do not duplicate scrolling logic.

Move the schema-source assertion in `test/faq-polish.test.mjs` to `faqContent.ts` and preserve its single-source check:

```js
const content = await readFile(
  new URL('../src/components/faq/faqContent.ts', import.meta.url),
  'utf8',
)

test('emits FAQPage structured data generated from the accordion source', () => {
  assert.match(content, /'@type': 'FAQPage'/)
  assert.match(content, /acceptedAnswer/)
  assert.match(tsx, /application\/ld\+json/)
  assert.match(content, /faqCategories\.flatMap/)
})
```

Rename the warm-drift test to `warm gold drift scrubs in toward Pricing and booking`, then change only its source assertion to:

```js
assert.match(tsx, /#faq-category-pricing/)
```

- [ ] **Step 4: Run component tests to verify they pass**

Run: `node --test test/faq-guided-booking.test.mjs test/faq-polish.test.mjs`

Expected: PASS — guided-booking and retained polish tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/faq/FaqSections.tsx test/faq-guided-booking.test.mjs
git commit -m "feat(faq): add booking guide paths and proof"
```

## Task 3: Style guide modules and preserve responsive hierarchy

**Files:**
- Modify: `src/components/faq/FaqSections.css:1-745`
- Modify: `test/faq-guided-booking.test.mjs`

**Interfaces:**
- `.faq-guide-routes` is an open editorial rail: three equal text links at desktop, vertical rules; compact stacked links on mobile.
- `.faq-quick-facts` is a ruled, wrapping list; never a card grid.
- `.faq-proof` is the single media-and-copy proof composition; desktop two-column and mobile normal-flow stack.

- [ ] **Step 1: Add failing layout assertions**

```js
const css = await readFile(
  new URL('../src/components/faq/FaqSections.css', import.meta.url),
  'utf8',
)

test('uses open rails and one responsive proof composition instead of a decorative image break', () => {
  assert.match(css, /\.faq-guide-routes \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/)
  assert.match(css, /\.faq-quick-facts \{[\s\S]*?display: flex/)
  assert.match(css, /\.faq-proof \{[\s\S]*?grid-template-columns: minmax\(0, 0\.9fr\) minmax\(280px, 0\.7fr\)/)
  assert.doesNotMatch(css, /\.faq-break/)
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.faq-proof \{[\s\S]*?grid-template-columns: 1fr;/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/faq-guided-booking.test.mjs`

Expected: FAIL because guide/proof classes do not yet have CSS and `.faq-break` still exists.

- [ ] **Step 3: Add CSS modules and remove image-break rules**

Add these structural rules after intro styles; tune only color/spacing values to existing FAQ tokens:

```css
.faq-guide-routes {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 52rem;
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
  border-top: 1px solid rgba(31, 29, 24, 0.22);
}

.faq-guide-routes a {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.35rem 0.75rem;
  padding: 1rem 1.15rem;
  color: rgba(31, 29, 24, 0.78);
  text-decoration: none;
}

.faq-guide-routes a + a { border-left: 1px solid rgba(31, 29, 24, 0.18); }
.faq-guide-routes small { grid-column: 1; color: rgba(31, 29, 24, 0.52); font: italic 1rem/1.2 'Cormorant Garamond', Georgia, serif; }
.faq-guide-routes svg { grid-column: 2; grid-row: 1 / span 2; width: 1rem; stroke: currentColor; fill: none; stroke-width: 1.25; }

.faq-quick-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 0 0 clamp(2rem, 4vw, 3.5rem);
  padding: 0;
  border-top: 1px solid rgba(23, 53, 42, 0.22);
  list-style: none;
}

.faq-quick-facts li { padding: 0.75rem 1rem 0.75rem 0; margin-right: 1rem; color: rgba(23, 53, 42, 0.72); font-size: 0.76rem; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; }

.faq-proof { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(280px, 0.7fr); gap: clamp(2rem, 5vw, 5rem); align-items: end; margin: clamp(2rem, 5vw, 4rem) 0; padding: clamp(2rem, 4vw, 3.5rem) 0; border-top: 1px solid rgba(23, 53, 42, 0.22); border-bottom: 1px solid rgba(23, 53, 42, 0.22); }
.faq-proof__media { margin: 0; overflow: hidden; border-radius: clamp(16px, 2vw, 28px); aspect-ratio: 4 / 3; }
.faq-proof__media img { width: 100%; height: 100%; object-fit: cover; object-position: 37% 63%; }
```

Delete every `.faq-break`, `.faq-break__inner`, and `.faq-break__inner img` rule. Add matching type/rule/link styles for `.faq-proof__copy`, and focus-visible states for guide links. In existing mobile query add:

```css
.faq-guide-routes { grid-template-columns: 1fr; }
.faq-guide-routes a + a { border-top: 1px solid rgba(31, 29, 24, 0.18); border-left: 0; }
.faq-proof { grid-template-columns: 1fr; }
.faq-proof__media { aspect-ratio: 4 / 3; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/faq-guided-booking.test.mjs test/faq-polish.test.mjs`

Expected: PASS — all FAQ tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/faq/FaqSections.css test/faq-guided-booking.test.mjs
git commit -m "style(faq): polish guided booking hierarchy"
```

## Task 4: Run full checks and visual QA

**Files:**
- Verify only: `src/components/faq/faqContent.ts`, `src/components/faq/FaqSections.tsx`, `src/components/faq/FaqSections.css`, `test/faq-guided-booking.test.mjs`, `test/faq-polish.test.mjs`

**Interfaces:**
- Verifies guide links, answer deep links, accordion behavior, `/book` CTA, reduced-motion fallback, and FAQ schema source consistency.

- [ ] **Step 1: Run static and application checks**

```bash
node --test test/faq-guided-booking.test.mjs test/faq-polish.test.mjs
npm run typecheck
npm run lint
npm run build
npm run check:seo
```

Expected: every command exits `0`.

- [ ] **Step 2: Browser desktop QA**

At `http://127.0.0.1:5173/faq`, verify:

1. First viewport has title, three guide routes, then clear preview of sage guide surface.
2. `Visiting Maui` scrolls to Vacation lessons below fixed header.
3. `Learning week to week` scrolls to Ongoing lessons below fixed header.
4. `Before you book` scrolls to Pricing and booking below fixed header.
5. Quick facts are visible before accordion answers.
6. One accordion row opens and closes; `aria-expanded` changes and answer visibility follows.
7. Proof image shows Aaron and student; no beach-dance image appears.
8. CTA reads `Explore lesson options` and lands at `/book`.

- [ ] **Step 3: Browser mobile and reduced-motion QA**

At 390 × 844, verify:

1. Route rail stacks without horizontal clipping.
2. Category navigation remains below fixed header, scrolls horizontally where needed, and does not cover category title.
3. Proof copy and media stack in normal flow; image crop retains instructor/student.
4. Accordion question text wraps without plus icon overlap.

Enable `prefers-reduced-motion: reduce`, reload `/faq`, and verify title, guide routes, category rows, proof panel, and closing CTA are immediately visible with no hidden GSAP state.

- [ ] **Step 4: Record fidelity ledger**

Compare implementation with approved spec at `docs/superpowers/specs/2026-07-23-faq-guided-booking-design.md`:

| Check | Required rendered evidence |
| --- | --- |
| Audience routing | Three named anchors appear in first screen and land correctly. |
| Findability | Facts contain private, instrument choice, supplied ukulele, service area, and starting price without opening answers. |
| Content separation | Vacation and ongoing answers appear in separate sections. |
| Proof | `Why learn with Aaron` uses one instructional media composition and `/about` link. |
| Truthfulness | No promise that the unfinished booking form sends data. |
| Visual system | Cream intro, sage guide surface, rails/rules, Fraunces/Cormorant type, restrained gold, no generic card grid. |

- [ ] **Step 5: Commit verified implementation**

```bash
git add src/components/faq/faqContent.ts src/components/faq/FaqSections.tsx src/components/faq/FaqSections.css test/faq-guided-booking.test.mjs test/faq-polish.test.mjs
git commit -m "feat(faq): complete guided booking upgrade"
```

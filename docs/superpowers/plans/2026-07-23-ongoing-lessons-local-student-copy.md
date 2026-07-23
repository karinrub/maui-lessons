# Ongoing Lessons Local Student Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add approved local student marketing copy to `/weekly-lessons`, correct Aaron's experience claim, and preserve the current cinematic page behavior.

**Architecture:** Keep `WeeklyJourneySections` as the route's self-contained presentation component. Add two semantic normal-flow sections, update existing copy in place, extend the current GSAP match-media lifecycle with lightweight scrubbed reveals, and style the new sections inside the existing scoped stylesheet. Guard content, order, factual correction, and dash-free customer copy with the existing source contract test.

**Tech Stack:** React 19, TypeScript, GSAP 3 with ScrollTrigger, scoped CSS, Node test runner, Vite.

## Global Constraints

- Follow `docs/superpowers/specs/2026-07-23-ongoing-lessons-local-student-copy-design.md`.
- Customer-facing copy in `WeeklyJourneySections.tsx` must not use hyphen, en dash, or em dash characters.
- Do not add testimonials, guarantees, policies, credentials, schedules, dependencies, routes, or media assets.
- Do not change the Practice Loop, progression graph mechanics, global navigation, footer ownership, or link destinations.
- New content must be fully visible without JavaScript and with reduced motion.
- Preserve unrelated working-tree changes.

---

## File Map

- `test/weekly-rhythm-faithful.test.mjs`: extend the existing route contract for new content, order, factual correction, and prohibited dash characters.
- `src/components/weekly/WeeklyJourneySections.tsx`: update approved copy, add audience and weekly lesson sections, and include those sections in the current reveal lifecycle.
- `src/components/weekly/WeeklyJourneySections.css`: style new editorial sections and responsive layouts.
- `src/pages/WeeklyLessons.tsx`: correct the route metadata description.
- `docs/ongoing-lessons-handoff.md`: record the new page structure, copy source, and resolved factual conflict.

### Task 1: Lock Approved Copy And Structure With Failing Tests

**Files:**
- Modify: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: source strings and class names in `WeeklyJourneySections.tsx`.
- Produces: source contract for `weekly-redesign__audience`, `weekly-redesign__weekly-lesson`, section order, corrected teacher claim, route metadata, and dash-free customer-facing literals.

- [ ] **Step 1: Replace the existing foundation-order and copy tests**

Replace `renders the approved foundation sections in page order`, `keeps the approved fact and progression copy as real text`, and `preserves section order and excludes rejected mechanics` with:

```js
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

  const factsSection = tsx.slice(facts, audience)
  assert.doesNotMatch(factsSection, /<StaffMark\s*\/>/)
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
  const literals = [
    ...tsx.matchAll(/>([^<>{}\n][^<>{}]*)</g),
    ...tsx.matchAll(/(?:title|description|caption|aria-label):\s*["'`]([^"'`]+)["'`]/g),
  ].map((match) => match[1])

  for (const literal of literals) {
    assert.doesNotMatch(literal, /[-–—]/, `dash character found in: ${literal.trim()}`)
  }
})

test('preserves established mechanics and links around the new copy', () => {
  assert.doesNotMatch(tsx, /cadence|highlightDay|day-picker|collage|pull-quote/i)
  assert.match(tsx, /to="\/tourist-lessons"/)
  assert.match(tsx, /to="\/book"/)
  assert.match(tsx, /weekly-practice-loop/)
  assert.match(tsx, /weekly-progress-desktop/)
  assert.match(tsx, /weekly-progress-mobile/)
})
```

Update `keeps the requested lesson links and finale copy`:

```js
test('keeps the requested lesson links and approved finale copy', () => {
  assert.match(tsx, /to="\/tourist-lessons"/)
  assert.match(tsx, /to="\/book"/)
  assert.match(tsx, /Book a Lesson/)
  assert.match(tsx, /Make music part of your week\./)
  assert.match(tsx, /Start where you are\. Aaron will help you find the next step\./)
  assert.match(tsx, /You do not need to have everything figured out before you book\./)
})
```

Update caption expectations in `uses the supplied lesson photographs in every
weekly media slot`:

```js
assert.match(tsx, /Maipoina Beach Park, one of the regular lesson spots/)
assert.match(tsx, /Hands on the fretboard/)
assert.match(tsx, /Aaron teaching a lesson/)
assert.doesNotMatch(tsx, /Lesson footage — silent clip, low-fi/)
assert.doesNotMatch(tsx, /Photo:/)
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test test/weekly-rhythm-faithful.test.mjs
```

Expected: FAIL because the two new sections, approved copy, and corrected teacher metadata are absent.

- [ ] **Step 3: Commit the failing contract**

```bash
git add test/weekly-rhythm-faithful.test.mjs
git commit -m "test(weekly): lock local student copy"
```

### Task 2: Add Approved Content And Correct Route Metadata

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.tsx`
- Modify: `src/pages/WeeklyLessons.tsx`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: existing `facts`, `progression`, `ImageFigure`, GSAP match-media lifecycle, `/tourist-lessons`, and `/book`.
- Produces: `.weekly-redesign__audience`, `.weekly-redesign__weekly-lesson`, updated teacher copy, approved finale copy, and supported SEO description.

- [ ] **Step 1: Replace approved data copy**

Use:

```ts
const facts = [
  'Private lessons with Aaron',
  'Ukulele or guitar',
  'Weekly lessons in Kīhei, Wailea, and at Maipoina Beach Park',
  'Rates start at $35 for a 30 minute lesson',
] as const

const progression = [
  {
    title: 'First chords, real songs',
    description:
      'You begin with music you can actually play, so practice has a purpose from the start.',
  },
  {
    title: 'Reading and understanding',
    description:
      'As the music grows, Aaron can introduce reading and help you understand how the instrument works.',
  },
  {
    title: 'Technique and your own style',
    description:
      'With steady practice, your playing becomes more comfortable and your own musical voice has room to come through.',
  },
] as const
```

- [ ] **Step 2: Replace customer-facing copy in existing sections**

Use this opening lede:

```tsx
<p className="weekly-redesign__hero-lede">
  Private ukulele and guitar lessons on Maui, shaped around your experience, your pace,
  and the music you want to play.
</p>
```

Use these media captions and labels:

```tsx
<video
  aria-label="Silent lesson footage"
  ...
/>
<figcaption>Silent lesson footage</figcaption>
```

Keep existing image subjects, but remove the `Photo:` prefix from downstream captions:

```tsx
caption="Maipoina Beach Park, one of the regular lesson spots"
caption="Hands on the fretboard"
caption="Aaron teaching a lesson"
```

Replace the progression heading:

```tsx
<h2 id="weekly-progression-title" className="weekly-redesign__progress-heading">
  <span>The more you play,</span>
  <span>the more it becomes</span>
  <span>your own.</span>
</h2>
```

- [ ] **Step 3: Insert the audience chapter after The Basics**

```tsx
<section className="weekly-redesign__audience" aria-labelledby="weekly-audience-title">
  <div className="weekly-redesign__container">
    <p className="weekly-redesign__eyebrow">A PLACE TO BEGIN</p>
    <div className="weekly-redesign__audience-intro">
      <h2 id="weekly-audience-title">Lessons for every stage of learning.</h2>
      <p>
        Some students are holding an instrument for the first time. Others already play
        and want thoughtful guidance toward what comes next. Aaron meets each student
        where they are and gives them a comfortable way forward.
      </p>
    </div>
    <div className="weekly-redesign__audience-grid">
      <article>
        <span aria-hidden="true">01</span>
        <h3>Adults and returning players</h3>
        <p>
          You do not need a musical background to begin. Start with your first chords,
          return after years away, or build on the skills you already have. Lessons move
          at a pace that gives you time to understand what you are playing and enjoy the
          process.
        </p>
      </article>
      <article>
        <span aria-hidden="true">02</span>
        <h3>Younger students and their parents</h3>
        <p>
          Aaron teaches students of any age with the same patient approach. Younger
          players get clear steps, real music to work toward, and room to learn without
          feeling rushed. For parents looking for a warm and encouraging teacher, every
          lesson is shaped around the student in front of him.
        </p>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Insert the weekly lesson chapter after progression**

```tsx
<section
  className="weekly-redesign__weekly-lesson"
  aria-labelledby="weekly-lesson-title"
>
  <div className="weekly-redesign__grain" aria-hidden="true" />
  <div className="weekly-redesign__container weekly-redesign__weekly-lesson-layout">
    <div>
      <p className="weekly-redesign__eyebrow weekly-redesign__eyebrow--ink">
        YOUR WEEKLY LESSON
      </p>
      <h2 id="weekly-lesson-title">Each week starts where the last one ended.</h2>
    </div>
    <div className="weekly-redesign__weekly-lesson-copy">
      <p>
        Aaron pays attention to what is clicking, what still feels awkward, and what you
        would like to play next. Lessons can move from first chords and familiar songs
        into reading music, technique, and a deeper understanding of the instrument.
      </p>
      <p>
        There is no fixed level chart to keep up with. The pace changes with the student,
        which gives children and adults the time they need to build real confidence.
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Replace teacher, cross-link, and finale copy**

Use:

```tsx
<div className="weekly-redesign__teacher-copy">
  <p>
    Aaron brings <strong>22 years</strong> of making, studying, and performing music to
    every lesson. Ukulele has been his primary instrument and focus for the last{' '}
    <strong>eight years</strong>, and guitar students receive the same personal attention.
  </p>
  <p>
    His approach is patient and encouraging. The goal is to help students feel comfortable
    with the instrument and excited to keep playing between lessons.
  </p>
</div>
```

Use:

```tsx
<p>
  Visiting Maui for a week or two? Explore{' '}
  <Link to="/tourist-lessons">Vacation Lessons</Link>.
</p>
```

Use:

```tsx
<h2 id="weekly-finale-title">Make music part of your week.</h2>
<p>Start where you are. Aaron will help you find the next step.</p>
<p>
  You do not need to have everything figured out before you book. Tell Aaron who the
  lesson is for and what you hope to play.
</p>
```

- [ ] **Step 6: Add new sections to the current GSAP lifecycle**

Insert before `weekly-teacher-score`:

```ts
for (const sectionName of ['audience', 'weekly-lesson'] as const) {
  const section = q(`.weekly-redesign__${sectionName}`)[0]
  const revealItems = q(
    sectionName === 'audience'
      ? '.weekly-redesign__audience-intro > *, .weekly-redesign__audience-grid article'
      : '.weekly-redesign__weekly-lesson-layout > *',
  )

  gsap.fromTo(
    revealItems,
    { y: 34, autoAlpha: 0.45 },
    {
      y: 0,
      autoAlpha: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: {
        id: `weekly-${sectionName}-score`,
        trigger: section,
        start: 'top 84%',
        end: 'center 44%',
        scrub: 0.8,
      },
    },
  )
}
```

Update teacher selector from `.weekly-redesign__teacher-copy` to
`.weekly-redesign__teacher-copy > *`, and update the strong selector to
`.weekly-redesign__teacher-copy strong`.

- [ ] **Step 7: Correct route metadata**

Replace the description with:

```ts
description:
  'Private ongoing ukulele and guitar lessons on Maui for adults and younger students. Learn at a patient pace with Aaron, who brings 22 years in music.',
```

- [ ] **Step 8: Run the focused test and confirm GREEN**

Run:

```bash
node --test test/weekly-rhythm-faithful.test.mjs
```

Expected: PASS.

- [ ] **Step 9: Commit component and metadata**

```bash
git add src/components/weekly/WeeklyJourneySections.tsx src/pages/WeeklyLessons.tsx test/weekly-rhythm-faithful.test.mjs
git commit -m "feat(weekly): add local student copy"
```

### Task 3: Style New Editorial Chapters And Update Handoff

**Files:**
- Modify: `src/components/weekly/WeeklyJourneySections.css`
- Modify: `docs/ongoing-lessons-handoff.md`
- Test: `test/weekly-rhythm-faithful.test.mjs`

**Interfaces:**
- Consumes: new class names from Task 2 and existing palette, type, container, eyebrow, grain, and breakpoint rules.
- Produces: two-column wide layout, single-column narrow layout, reduced-motion visibility, and current documentation.

- [ ] **Step 1: Add wide-screen section styles before `.weekly-redesign__progression`**

```css
.weekly-redesign__audience {
  position: relative;
  padding: clamp(7rem, 12vw, 10rem) 0;
  border-top: 1px solid rgba(23, 53, 42, 0.14);
}

.weekly-redesign__audience-intro {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.7fr);
  align-items: end;
  gap: clamp(2rem, 6vw, 5rem);
  margin-bottom: clamp(4rem, 8vw, 6rem);
}

.weekly-redesign__audience h2,
.weekly-redesign__weekly-lesson h2 {
  max-width: 12ch;
  font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 5.4vw, 5rem);
  font-style: italic;
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.02;
  text-wrap: balance;
}

.weekly-redesign__audience-intro > p {
  max-width: 42rem;
  color: rgba(23, 53, 42, 0.8);
  font-size: clamp(1rem, 1.5vw, 1.12rem);
  line-height: 1.75;
}

.weekly-redesign__audience-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid rgba(23, 53, 42, 0.2);
}

.weekly-redesign__audience-grid article {
  padding: clamp(2rem, 4vw, 3.25rem);
}

.weekly-redesign__audience-grid article:first-child {
  padding-left: 0;
  border-right: 1px solid rgba(23, 53, 42, 0.2);
}

.weekly-redesign__audience-grid article > span {
  display: block;
  margin-bottom: 2rem;
  color: var(--maui-gold);
  font-family: Fraunces, Georgia, serif;
  font-size: 0.8rem;
  letter-spacing: 0.16em;
}

.weekly-redesign__audience-grid h3 {
  max-width: 18ch;
  margin-bottom: 1rem;
  font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  font-size: clamp(1.75rem, 2.7vw, 2.35rem);
  font-style: italic;
  font-weight: 600;
  line-height: 1.1;
}

.weekly-redesign__audience-grid p {
  max-width: 42rem;
  color: rgba(23, 53, 42, 0.8);
  line-height: 1.75;
}

.weekly-redesign__weekly-lesson {
  position: relative;
  padding: clamp(6rem, 10vw, 8.5rem) 0;
  border-top: 1px solid rgba(23, 53, 42, 0.14);
  background: var(--home-sage);
}

.weekly-redesign__weekly-lesson-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.7fr);
  align-items: start;
  gap: clamp(3rem, 8vw, 7rem);
}

.weekly-redesign__weekly-lesson-copy {
  display: grid;
  gap: 1.5rem;
  padding-top: clamp(2.6rem, 5vw, 4rem);
}

.weekly-redesign__weekly-lesson-copy p {
  max-width: 42rem;
  color: rgba(23, 53, 42, 0.82);
  font-size: clamp(1.03rem, 1.5vw, 1.15rem);
  line-height: 1.75;
}

.weekly-redesign__teacher-copy {
  display: grid;
  gap: 1.5rem;
}

.weekly-redesign__teacher-copy p {
  font: inherit;
}
```

- [ ] **Step 2: Add narrow-screen layout rules inside `@media (max-width: 760px)`**

```css
.weekly-redesign__audience-intro,
.weekly-redesign__weekly-lesson-layout {
  grid-template-columns: 1fr;
  gap: 2rem;
}

.weekly-redesign__audience-grid {
  grid-template-columns: 1fr;
}

.weekly-redesign__audience-grid article,
.weekly-redesign__audience-grid article:first-child {
  padding: 2rem 0;
  border-right: 0;
}

.weekly-redesign__audience-grid article + article {
  border-top: 1px solid rgba(23, 53, 42, 0.2);
}

.weekly-redesign__weekly-lesson-copy {
  padding-top: 0;
}
```

- [ ] **Step 3: Expand reduced-motion visibility selector**

Use:

```css
.weekly-redesign__resolved-hero,
.weekly-redesign__resolved-copy,
.weekly-redesign__contact-sheet,
.weekly-redesign__audience-intro > *,
.weekly-redesign__audience-grid article,
.weekly-redesign__progress-milestone,
.weekly-redesign__weekly-lesson-layout > * {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}
```

- [ ] **Step 4: Update the handoff**

Add a dated section near the current-state summary:

```md
## 2026-07-23 Local Student Copy Expansion

The page now gives equal emphasis to adults, returning players, younger
students, and parents. Two normal-flow chapters were added:

1. `weekly-redesign__audience`, between The Basics and progression.
2. `weekly-redesign__weekly-lesson`, between progression and teacher.

Copy source and constraints are recorded in
`docs/superpowers/specs/2026-07-23-ongoing-lessons-local-student-copy-design.md`.
Customer-facing Ongoing Lessons copy avoids hyphen, en dash, and em dash
characters.

The teacher chapter now says Aaron brings 22 years in music. It no longer says
he taught on Maui for 22 years, which conflicted with the About page's 2023 move
date.
```

Replace the handoff's `## Approved page score` section through the line before
`## Media contract` with:

```md
## Approved page score

Exact customer-facing copy lives in
`docs/superpowers/specs/2026-07-23-ongoing-lessons-local-student-copy-design.md`.
The rendered order is:

1. Practice Loop opening with the semantic H1 `Progress happens on repeat.`
2. The Basics with four lesson and location facts.
3. `A PLACE TO BEGIN`, giving equal visual weight to adults and returning
   players, and younger students and their parents.
4. `HOW IT DEVELOPS`, retaining the pinned rising graph with revised milestone
   copy.
5. `YOUR WEEKLY LESSON`, explaining how each lesson continues from the last.
6. `WHO YOU ARE LEARNING FROM`, using supported 22 years in music wording.
7. Vacation Lessons cross link.
8. Home style finale and footer with `Make music part of your week.`

Practice Loop and progression behavior remain unchanged. New chapters stay in
normal document flow and use subtle scrubbed reveals. On reduced motion
devices, every chapter is static and fully visible.
```

- [ ] **Step 5: Run focused tests and static checks**

Run:

```bash
node --test test/weekly-rhythm-faithful.test.mjs
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit styles and handoff**

```bash
git add src/components/weekly/WeeklyJourneySections.css docs/ongoing-lessons-handoff.md
git commit -m "style(weekly): frame local lesson chapters"
```

### Task 4: Full Verification And Browser QA

**Files:**
- Verify only unless a regression requires a scoped fix.

**Interfaces:**
- Consumes: completed component, CSS, test, metadata, and handoff changes.
- Produces: fresh automated and rendered evidence.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm run typecheck
npm run lint
npm run build
node --test test/*.test.mjs
npm run prerender
npm run check:seo
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Start the local server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Keep the yielded session running. Use its reported port exactly.

- [ ] **Step 3: Run Browser plugin QA**

The flow under test is: `/weekly-lessons` loads, scrolls through the new
audience and weekly lesson chapters, opens the Vacation Lessons link, returns,
and opens the Book a Lesson link without layout or runtime errors.

Check:

1. Page URL and title.
2. Meaningful DOM content and no framework overlay.
3. No relevant console warning or error.
4. Desktop viewport at 1440 by 900.
5. Mobile viewport at 390 by 844.
6. Narrow viewport at 320 by 568.
7. No clipping, overlap, overflow, or unreadable wrapping.
8. New chapters appear in approved order.
9. Both audience columns receive equal visual weight.
10. Vacation Lessons and Book a Lesson links navigate correctly.
11. Reduced motion leaves all new copy visible.
12. Capture desktop and mobile screenshots outside the repository.

- [ ] **Step 4: Review final diff**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD~3
git diff HEAD~3 -- src/components/weekly/WeeklyJourneySections.tsx src/components/weekly/WeeklyJourneySections.css src/pages/WeeklyLessons.tsx test/weekly-rhythm-faithful.test.mjs docs/ongoing-lessons-handoff.md
```

Confirm no unrelated file entered the implementation commits.

- [ ] **Step 5: Request code review**

Provide reviewer:

```text
Description: Added approved local student marketing content to Ongoing Lessons,
including equal adult and younger-student emphasis, weekly lesson explanation,
supported Aaron experience wording, dash-free page copy, responsive styling,
tests, metadata, and handoff updates.

Requirements:
docs/superpowers/specs/2026-07-23-ongoing-lessons-local-student-copy-design.md

Review priorities:
factual accuracy, exact approved copy, no customer-facing dash characters,
semantic section order, responsive CSS, reduced motion visibility, preserved
Practice Loop and progression mechanics, and unrelated working-tree safety.
```

- [ ] **Step 6: Apply valid Critical or Important review findings**

Use TDD for behavior changes. Rerun the focused test and all affected checks
after each correction. Do not change copy outside the approved factual scope.

- [ ] **Step 7: Run final fresh verification**

Repeat:

```bash
npm run typecheck
npm run lint
npm run build
node --test test/*.test.mjs
npm run prerender
npm run check:seo
git diff --check
```

Expected: every command exits 0 with zero test failures.

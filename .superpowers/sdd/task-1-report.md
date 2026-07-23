# Task 1 Report: Ongoing Lessons Local Student Copy

## Changes

- Replaced the Ongoing Lessons source contract with the approved local student
  chapter order, supported facts, teacher experience, caption, finale, no dash,
  mechanics, and link expectations.
- Replaced the facts, progression, opening, media, teacher, cross link, and
  finale copy with the approved text.
- Added the audience chapter after The Basics and the weekly lesson chapter
  after progression.
- Added normal flow reveal timelines for the new chapters and updated the
  teacher timeline to reveal each teacher paragraph.
- Replaced the unsupported teaching claim in route metadata with the supported
  22 years in music description.

## Files

- `test/weekly-rhythm-faithful.test.mjs`
- `src/components/weekly/WeeklyJourneySections.tsx`
- `src/pages/WeeklyLessons.tsx`

## RED Evidence

Command:

```sh
node --test test/weekly-rhythm-faithful.test.mjs
```

Result: expected failure, 18 passed and 6 failed. Failures covered the absent
audience and weekly lesson sections, replaced facts and progression content,
teacher experience wording and metadata, dash free customer copy, captions,
and finale copy.

Committed the failing contract as:

```text
c5cb471 test(weekly): lock local student copy
```

## GREEN Evidence

Command:

```sh
node --test test/weekly-rhythm-faithful.test.mjs
```

Result: 24 passed, 0 failed.

## Full Verification

Command:

```sh
node --test test/*.test.mjs
```

Result: 33 passed, 0 failed.

Additional compile and production bundle verification:

```sh
npm run build
```

Result: `tsc -b && vite build` completed successfully.

## Self Review

- The section order is Practice Loop, The Basics, audience, progression, weekly
  lesson, teacher, Vacation Lessons cross link, and finale.
- Customer facing literals in `WeeklyJourneySections.tsx` remain free of hyphen,
  en dash, and em dash characters.
- No routes, media assets, link destinations, Practice Loop mechanics,
  progression graph mechanics, navigation, or footer ownership changed.
- New content is semantic normal document flow and remains present without
  JavaScript or motion.
- No unsupported testimonials, guarantees, policies, credentials, schedules, or
  claims were added.

## Concerns

Task 2 owns the new section specific CSS. Until then, the new semantic content
is intentionally visible in normal document flow but has no dedicated visual
layout treatment.

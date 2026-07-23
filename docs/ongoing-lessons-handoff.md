# Ongoing Lessons Design Handoff

Last verified: 2026-07-23, Pacific/Honolulu.

Route: `/weekly-lessons`

Customer-facing name: **Ongoing Lessons**

## Executive snapshot

The approved final direction is **The Practice Loop**: repetition becomes
progress. A restrained circular opening resolves into the staff-line and rising
learning-curve language already established for this page. The result should
feel measured, geometric, musical, and cinematic without borrowing Vacation
Lessons' collage/dissolve language or About's horizontal biography.

The implementation is merged to `main`.

- Local `main` and `origin/main` are at `43e4132`.
- `af9a0d0` merged `codex/ongoing-lessons-practice-loop` into `main`.
- The previously uncommitted opening-state, caption-aperture, reduced-motion,
  and regression-test work shipped in `30558ec` and `9f7c594`.
- Four later commits tuned the graph and opening:
  `a7fd356`, `e3c893e`, `4f7f2f1`, and `43e4132`.
- The working tree contains no ongoing-page source changes. The untracked
  handoff, foundation plan, and metronome spec are documentation work; the two
  untracked root JPEGs remain historical QA/reference captures.
- Browser QA on 2026-07-23 covered 1440×900, 768×1024, 390×844, 320×568, and
  1024×640, including forward/reverse opening scroll, graph behavior, route
  re-entry, booking CTA navigation, global-menu focus/scroll restoration,
  console health, media loading, and horizontal overflow.
- Known defects remain. The highest-risk one is that prerendered no-JavaScript
  output serializes GSAP's hidden opening state. See **Current audit findings**.

## Source-of-truth order

Use these in this order:

1. This handoff for current implementation status, QA evidence, and known
   defects.
2. `docs/superpowers/specs/2026-07-21-ongoing-lessons-practice-loop-cinematic-polish-design.md`
   for the approved final experience and acceptance criteria.
3. `docs/superpowers/plans/2026-07-21-ongoing-lessons-practice-loop-cinematic-polish.md`
   for historical implementation detail. Do not re-execute it.
4. The code on `main` for actual behavior.

The following documents are historical context, not the final authority:

- `docs/superpowers/specs/2026-07-21-ongoing-lessons-metronome-redesign-design.md`
  and `docs/superpowers/plans/2026-07-21-ongoing-lessons-foundation.md` describe
  the first shipped foundation. They are untracked in the main checkout.
- `ongoing-lessons-awwwards-critique.md` critiques an even earlier journey,
  pathway-tab, and month-rhythm design. Those mechanics were removed and
  should not be restored.
- Earlier weekly/ongoing specs under `docs/superpowers/` document superseded
  explorations: circle-lens journey, photographic media, shared sage,
  scroll-circles, editorial rise, pathways, and month rhythm.

Where the foundation and Practice Loop specs conflict, the Practice Loop spec
wins:

| Foundation version | Approved Practice Loop version |
| --- | --- |
| Dashed media placeholders | Existing lesson video plus five approved photos |
| One-time rising-chart reveal | Reversible scrubbed page storytelling |
| Small static metronome | Four-beat pinned Practice Loop |
| Quiet `Start lessons →` text link | Home-style cream pill `Book a Lesson` CTA |
| No footer navigation | Home, Vacation Lessons, About, and FAQ footer links |
| Oversized dark close | Compact Home-style arch/finale/footer |

## Design north star

The page's emotional idea is **repetition becoming progress**.

- Vacation Lessons: a Maui memory that stays; organic, photographic, layered.
- About: Aaron's life journey; chronological horizontal chapters.
- Ongoing Lessons: practice becoming progress; precise circles, staff lines,
  strict editorial frames, and a rising curve.

The Ongoing page must not use:

- Vacation's photographic dissolve, loose collage, floating numerals, or
  pull-quote mechanics.
- About's horizontal travelling panels.
- A generic card grid, numbered spine, photo carousel, or stacked set of
  competing pinned modules.

Visual system:

- Warm cream paper, sage, deep ink, and restrained gold.
- Cormorant Garamond italic for expressive headings and serif copy.
- Fraunces italic for ghost words and oversized inline numerals.
- Inter for labels and body copy.
- Thin staff-like rules, strict alignment, intentional whitespace, and one
  strong gold accent.
- Reuse shared tokens such as `--home-sage`, `--home-sage-ink`,
  `--maui-gold`, and `--grain-url`.

## Approved page score

### 1. Practice Loop opening

The only semantic H1 is:

> Progress happens on repeat.

Lede:

> Private ukulele and guitar lessons on Maui, shaped around whoever's in front
> of him — not a level chart.

The pinned opening has four reversible beats:

1. **Stillness** — three quiet concentric rings, one resting gold beat,
   low-opacity `practice`, and `Begin again.`
2. **Repetition** — the beat orbits with GSAP MotionPathPlugin, the rings
   breathe by no more than about six percent, and the muted lesson video appears
   in a circular window.
3. **Release** — the rings open into a prepared five-line staff, the beat moves
   onto it, and `Practice becomes progress.` gives way to the real hero.
4. **Progress** — the H1 and lede settle on the left; the video resolves into a
   wide editorial frame; two portrait lesson stills form a strict contact sheet
   below it.

Temporary scene phrases are decorative and `aria-hidden`. Reverse scrolling
must rebuild the opening without a discontinuity.

### 2. Facts and location

Sage field with four real facts:

1. Private, one-on-one lessons
2. Ukulele or guitar
3. Weekly, across Kīhei, Wailea & Maipoina Beach Park
4. From $35 for a 30-minute lesson

The facts enter like evenly spaced beats. The Maipoina Beach Park image expands
from roughly 90% to full content width through wrapper scale, not animated
layout width.

### 3. How it develops

Heading:

> Same instrument.
>
> A different player,
>
> every year.

The rising graph is the main mid-page cinematic moment:

1. **First chords, real songs** — actual songs from day one, not deferred
   payoff.
2. **Reading & understanding** — harder songs introduce reading and why the
   instrument works.
3. **Refining your style** — technique sharpens and the student's own voice
   emerges.

On desktop, the graph stage pins. The guides, gold curve, milestone dots, and
active travelling dot rise as one graphic group. Cards resolve near their
corresponding points, and the fretboard portrait performs one slow crop settle.
The final stage holds briefly before release.

On mobile and short-height screens, the graph remains in normal document flow.
A vertical line and active dot move through the three cards in DOM order. It
must never become a mobile scroll trap.

### 4. Teacher

Warm cream-tan field with:

> Aaron has taught guitar and ukulele on Maui for **22** years. For the last
> **8**, ukulele has been the focus.

The copy and square portrait move from small opposing offsets into alignment.
The numerals receive restrained scale/vertical emphasis.

### 5. Vacation cross-link

Keep this as thin breathing space, not another card or band:

> Just on Maui for a week or two? There's a page for that — Vacation Lessons

The link remains `/tourist-lessons`.

### 6. Home-style finale/footer

Use a shallow cream/tan arch entering the deep-ink field, grain, a centered
serif finale, a cream pill CTA with gold arrow, footer links, and copyright.

- Finale: `Make it a habit.`
- Support: `One lesson a week, for as long as it keeps being useful.`
- CTA: `Book a Lesson` → `/book`
- Links: Home, Vacation Lessons, About, FAQ
- Copyright: current year + Maui Lessons

The natural desktop height should be approximately 500–650px, not an empty
`100svh`. `SiteLayout` intentionally omits the shared `SiteFooter` on this
route because this finale owns the footer content.

## Media contract

The polished implementation uses existing media; it does not use placeholders.

| Role | Asset | Source geometry | Loading |
| --- | --- | --- | --- |
| Loop/hero video | `assets/videos/aaron-weekly-section.mp4` | 1920×1080 | `preload="metadata"`, autoplay, muted, loop, playsInline |
| Hero portrait 1 / video poster | `assets/images/aaron-weekly-1.jpg` | 720×960 | eager |
| Hero portrait 2 | `assets/images/aaron-weekly-2.jpg` | 698×920 | eager |
| Location | `assets/images/aaron-personal-branding-isa-danzig-photography-2-2.jpg` | 2200×1467 | lazy |
| Fretboard | `assets/images/aaron-bookingForm.jpg` | 1467×2200 | lazy |
| Teacher | `assets/images/aaron-teaching-2.jpg` | 1153×1153 | lazy |

Rules:

- Keep explicit intrinsic width/height and `decoding="async"` to prevent layout
  shifts and unstable ScrollTrigger measurements.
- Transform the video wrapper, not the video element.
- Keep video at 16:9, hero portraits at their portrait proportions, fretboard
  portrait at 2:3, and teacher image square/near-square.
- Pause the decorative video outside the opening through IntersectionObserver.
- The video is muted and non-essential; captions describe the media.
- Do not preload downstream photography.
- Known accessibility gap: the video still has `autoPlay`, and its
  IntersectionObserver calls `play()` even when
  `prefers-reduced-motion: reduce` is active.

The untracked root images `weekly-hero.jpeg` and `weekly-hero2.jpeg` are not
part of the approved implementation. Visual inspection on 2026-07-23 found
that the first is a blank cream frame and the second shows the superseded
`A rhythm, not a routine.` photographic hero. Treat them as historical QA or
reference captures unless the owner explicitly says otherwise.

## Motion and engineering contract

Primary files:

- `src/components/weekly/WeeklyJourneySections.tsx`
- `src/components/weekly/WeeklyJourneySections.css`
- `test/weekly-rhythm-faithful.test.mjs`
- `src/pages/WeeklyLessons.tsx` — route metadata/composition; unchanged
- `src/layout/SiteLayout.tsx` — global navigation and footer ownership; unchanged

Architecture:

- Keep one self-contained `WeeklyJourneySections` page plus adjacent CSS.
- One `useLayoutEffect` owns one `gsap.matchMedia(root)` lifecycle.
- Section-local timelines clean up through `mm.revert()`.
- Desktop condition: at least 761px wide and 680px tall.
- Mobile condition: at most 760px wide.
- Short-height condition: at least 761px wide and at most 679px tall.
- Practice Loop pins on desktop, mobile, and short-height branches, with shorter
  measured travel for mobile/short screens.
- The graph pins only on the desktop condition.
- Facts, teacher, cross-link, and finale use restrained reversible scrubbed
  timelines.
- Use transform, opacity, SVG stroke dash offset, and wrapper clipping.
- No React state updates in scroll callbacks.
- No new Lenis instance, wheel listener, scroll snapping, or dependency.
- `GlobalNavigation` must not be queried, mutated, hidden, restyled, or animated
  by weekly-page code.
- The layout-level font-ready `ScrollTrigger.refresh()` remains the shared
  remeasurement authority.

Static resilience:

- CSS/HTML default to the final readable composition.
- JavaScript applies motion-start state only when motion is allowed.
- If JavaScript fails or reduced motion is requested, the hero and all
  downstream content remain visible in normal flow.
- Reduced motion disables pins, scrubs, orbiting, line drawing, clipping, and
  parallax.

The current source satisfies the CSS/default-state portion of this contract,
but the built no-JavaScript output does not. `scripts/prerender.mjs` visits the
motion-enabled page at scroll position zero and serializes GSAP's inline
`opacity: 0; visibility: hidden` opening state into
`dist/weekly-lessons/index.html`.

## Implementation state

### Current `main`

The implementation landed through the following page-specific commits:

| Commit | Completed work |
| --- | --- |
| `34f1f0e` | Practice Loop semantic/static foundation and real media |
| `cedf535` | Responsive media-ratio protection |
| `9e770a8` | Reversible Practice Loop choreography |
| `ce38803` | Facts/location, teacher, and cross-link timelines |
| `5a40c06` | Pinned desktop and normal-flow mobile rising graph |
| `fe91a0d` | Narrow pinned-graph containment |
| `d1cb856` | Compact Home-style finale/footer |
| `30558ec` | Opening initial state, caption aperture, reduced-motion visibility, regression tests |
| `9f7c594` | Refresh-safe loop geometry and progression heading outline |
| `a7fd356` | Pinned graph centering and curve/milestone alignment |
| `e3c893e` | Continuous circle-to-video clip-path interpolation |
| `4f7f2f1` | Circular arc cleanup during resolve |
| `43e4132` | Final curve extension and milestone-center alignment |

The page currently has one source H1, one `gsap.matchMedia(root)` lifecycle,
reversible section timelines, one desktop-only graph pin, a normal-flow
mobile/short-height graph, intrinsic media dimensions, five photographs plus
the lesson video, no cadence/day-picker, and its own Home-style footer.

### Current audit findings

#### High risk

- **Prerendered no-JavaScript output hides primary hero content.**
  `scripts/prerender.mjs` captures the route at scroll position zero after GSAP
  has applied its opening state. The generated
  `dist/weekly-lessons/index.html` contains inline hidden styles on
  `.weekly-redesign__resolved-copy`, `.weekly-redesign__contact-sheet`, and the
  video caption. This breaks the approved no-JavaScript resilience contract and
  gives crawlers a visually hidden primary H1/lede.

#### Medium risk

- **The live accessibility tree initially omits the H1.** At scroll position
  zero, GSAP `autoAlpha: 0` sets `visibility: hidden` on the resolved copy.
  Browser accessibility output exposes the opening region name but not the H1
  until the user scrolls through the intro.
- **The route renders nested `<main>` landmarks.** `SiteLayout.tsx` owns the
  outer `<main class="page-main">`, while `WeeklyJourneySections.tsx` returns a
  second `<main class="weekly-redesign">`.
- **Facts eyebrow spacing is defeated by selector specificity.**
  `.weekly-redesign h2 { margin: 0; }` overrides the lower-specificity
  `.weekly-redesign__eyebrow { margin-bottom: 28px; }`. “THE BASICS” touches and
  visually overlaps the first fact, most clearly at 390×844.
- **Reduced motion does not stop the lesson video.** GSAP is skipped, but the
  `autoPlay` attribute and observer-driven `video.play()` remain active.
- **The final mobile transition crosses the lede.** At 320×568 near scroll
  position 720, the moving hero-video frame covers the visible lede before
  settling below it at the end of the opening.

#### Low risk / maintainability

- `test/weekly-rhythm-faithful.test.mjs` is a static regex/source contract, not
  rendered-behavior coverage. It cannot catch the prerendered hidden state,
  landmark nesting, selector-specificity overlap, video motion preference, or
  transitional collisions.
- The same section-order assertion is implemented twice in that test file.
- `id="weekly-finale-title"` is not referenced by `aria-labelledby` or any
  script/style selector.
- The image helper uses the caption verbatim for both `alt` and
  `<figcaption>`, which can produce duplicate announcements in assistive
  technology.
- No orphaned weekly React/CSS components remain under `src/components/weekly`;
  the old Pathways, Month Rhythm, and Skill Level implementations are absent.

## Verification evidence

Browser evidence gathered from `http://localhost:5173/weekly-lessons` on
2026-07-23:

- Page identity: correct route and `Ongoing Lessons | Maui Lessons` title.
- Console: zero page warnings/errors in every tested viewport.
- Framework overlay/blank page: none.
- Horizontal overflow: zero at every tested viewport.
- Forward/reverse Practice Loop: exact state reconstruction at desktop scroll
  position 500.
- Desktop graph: pins, draws through all three milestone centers, and continues
  to its intended final point.
- Tablet graph: contained at 768×1024 without photo/card overlap.
- Mobile/short-height graph: normal document flow with only the opening pin.
- Route re-entry: expected pin-spacer count restored without duplication.
- Booking CTA: navigates to `/book`.
- Global menu: opens, locks body scroll, closes on Escape, restores focus to
  the menu button, and restores body scrolling.
- Media: all five images report nonzero natural dimensions; video reports
  1920×1080 and pauses outside the opening.

Fresh automated verification on 2026-07-23:

```text
npm run typecheck                         PASS
npm run lint                              PASS
npm run build                             PASS
node --test test/*.test.mjs               PASS — 31/31
npm run prerender                         PASS
npm run check:seo                         PASS
git diff --check                          PASS
```

The passing prerender/SEO commands do not detect the high-risk hidden-output
defect: the fresh prerender still writes `opacity: 0; visibility: hidden` on
the resolved hero copy, video frame/caption, and contact sheet.

## Remaining work

### P0 — implementation defects

- [ ] Fix prerendering so no-JavaScript output preserves the readable final
  composition rather than GSAP's scroll-start state.
- [ ] Keep the real H1 in the accessibility tree during the decorative opening.
- [ ] Remove the nested main landmark.

### P1 — visual and motion accessibility

- [ ] Restore the intended facts-eyebrow spacing.
- [ ] Stop autoplay/observer playback when reduced motion is requested.
- [ ] Prevent the 320×568 resolve transition from crossing the lede.
- [ ] Decide whether image alt text or figcaptions should carry each media
  description to avoid duplicate announcements.

### P1 — test coverage

- [ ] Add rendered tests for landmark count, initial accessibility visibility,
  no-JavaScript/prerender output, responsive overflow, and reduced-motion video
  state.
- [ ] Consolidate duplicate static section-order coverage.

### P1 — final verification after fixes

Run:

```bash
npm run typecheck
npm run lint
npm run build
node --test test/*.test.mjs
git diff --check
```

Also run the repository's prerender/SEO checks before deployment:

```bash
npm run prerender
npm run check:seo
```

- [ ] Reinspect `dist/weekly-lessons/index.html` for hidden inline styles after
  prerender.
- [ ] Re-run the browser matrix at the affected states.
- [ ] Smoke-test the deployed `/weekly-lessons/` route and its direct trailing-
  slash load after fixes ship.

### P2 — future, owner/content dependent

These are not blockers for the approved Practice Loop release:

- Real testimonials/social proof, only when the owner supplies authentic copy.
- Booking submission integration, which remains blocked on a Formspree form ID
  at the project level.
- Further responsive-image optimization if real performance data justifies it.

Do not invent testimonials, availability, a weekly assigned-day promise,
calendar slots, policies, or other business facts.

## Explicit non-goals and rejected mechanics

- Do not add the cadence strip, weekday controls, `highlightDay`, or
  `same day, every week` promise.
- Do not restore Beginner/Intermediate/Advanced tabs, Month Rhythm, the
  circle-lens journey, or the old `A rhythm, not a routine.` hero.
- Do not restore image placeholders; approved media is already supplied.
- Do not add a second smooth-scroll controller, new route files, or dependencies.
- Do not move global navigation behavior into the weekly component.
- Do not reintroduce Vacation collage/pull-quote behavior.
- Do not make the mobile graph pinned.
- Do not hide broken states with z-index, masks, fake spacing, or permanent
  opacity defaults that make no-JavaScript content unreadable.
- Do not use `toggleActions` for the page's storytelling timelines.
- Do not replace the Home-style footer with the older quiet text-link close.

## Recommended continuation sequence

1. Fix the prerender/static-resilience issue first and add a regression test.
2. Correct landmark/H1 accessibility without changing the approved visual
   score.
3. Address the facts spacing, reduced-motion video, and 320×568 transition.
4. Replace or supplement the source-regex tests with rendered behavior checks.
5. Re-run automated, prerender/SEO, and affected viewport checks.
6. Commit and deploy only after the built HTML and live accessibility tree
   match the intended contract.

## Release acceptance checklist

The page is ready for its next release only when:

- [x] It reads immediately as Ongoing Lessons, not Vacation Lessons or About.
- [x] The Practice Loop cleanly becomes the staff/progression system.
- [x] Forward and reverse scroll work in the tested motion states.
- [x] The first frame is intentional and never blank.
- [x] Global navigation remains unchanged.
- [x] The graph is the strongest mid-page moment and remains legible.
- [x] Media proportions and captions are visually correct.
- [ ] Desktop, tablet, mobile, short-height, reduced-motion, keyboard, and
  route-reentry behavior are polished.
- [x] The compact Home-style footer has working links and no duplicate
  `SiteFooter`.
- [x] Automated, prerender, and SEO commands pass.
- [ ] Prerendered output satisfies the no-JavaScript resilience contract.
- [x] The former dirty-worktree fixes are committed.
- [x] The branch is integrated and pushed.
- [ ] No-JavaScript output and deployed trailing-slash behavior are
  smoke-tested after the documented defects are fixed.

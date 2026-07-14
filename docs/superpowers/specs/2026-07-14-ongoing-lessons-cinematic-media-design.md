# Ongoing Lessons Cinematic Media Journey — Design Spec

Date: 2026-07-14
Status: approved direction; awaiting written-spec review

## Goal

Evolve `/weekly-lessons` from a sequence of independent lesson sections into
a cinematic music journey. The page should convey tempo, repetition, and
accumulating confidence while retaining the practical Beginner / Intermediate
/ Advanced exploration path.

The experience must feel materially different from the About page: this is a
student-centred rhythm of learning, not a full-screen biographical chapter
story about Aaron.

## Constraints

- Use the existing media library only. No generated or stock assets.
- The existing weekly video is low quality and silent. It must remain small on
  the page, muted, decorative, and non-essential to understanding the page.
- Specifically incorporate `assets/images/aaron-teaching-2.jpg`, which is not
  currently used on the Ongoing Lessons route.
- Preserve all existing factual copy, the three skill levels, the booking CTA,
  the location line, and the deep-green closing section.
- Preserve the handoff's three verbatim timeline steps and its visual system:
  cream / sage / deep-green ink, Fraunces display type, Inter body type,
  ghost numerals, and gold only for high-intent CTA details.
- No new dependencies.
- At `max-width: 760px` and under `prefers-reduced-motion: reduce`, content
  remains in normal vertical document flow and all media remains readable.

## Approved composition

### 1. Opening: a small living note

Keep the existing opening copy and its compact video placement, rather than
turning the silent clip into a hero. The video is a small 4:3 moving detail:
hands, teaching, and tempo. It supports the opening without requiring audio
or high resolution.

- Keep it muted, looping, and `playsInline`.
- Keep the visible frame compact (roughly the current 200–320px desktop
  range); do not use it as a full-width or full-viewport surface.
- Retain the curtain reveal and provide a poster / still fallback so a failed
  video never obscures page content.
- Motion is restrained: one opening curtain lift, then the clip simply loops.
  No large zoom, no pinned video, and no audio controls.

### 2. Level explorer: useful, photo-led progression

Retain the Beginner / Intermediate / Advanced segmented control because it
answers the visitor's first practical question: “where do I fit?” The tabs
are not the story's destination; they are an interactive movement within it.

- Existing media remains assigned to its current truthful level:
  `aaron-weekly-1.jpg` (Beginner), `aaron-weekly-2.jpg` (Intermediate), and
  `aaron-playing-close-1.jpg` (Advanced).
- Preserve the existing tab mechanics and keyboard support.
- On selection, use the existing compact image clip-wipe / settling motion and
  short copy rise. Do not add a carousel, progress UI, new claims, or generic
  feature cards.
- The sage skill shelf remains the page's first major colour movement.

### 3. Editorial bridge: teaching becomes rhythm

Insert `aaron-teaching-2.jpg` exactly once between the level explorer and the
“How it works” sequence. It is the visual hinge from Aaron teaching today to
the learner returning week after week.

- Treat it as a generous editorial image, not a card and not a full-screen
  chapter panel.
- On desktop, compose it with open cream/sage space and a small piece of
  already-approved adjacent copy; no new visible marketing language is added.
- Give the image a slow, scroll-linked crop or translate shift while it enters
  view. The original photograph remains the focus; no heavy colour overlay,
  artificial parallax scenery, or animated decorative layer is added.
- On mobile and reduced motion it becomes a stationary, correctly cropped
  image in normal flow.

### 4. “How it works”: a compact musical score

Implement the supplied Claude Design horizontal sequence as the page's visual
score, but not as a second About-page chapter system.

- Desktop only: pin a compact timeline stage and translate the three existing
  narrative panels horizontally as page scroll progresses. The horizontal
  spine draws left-to-right; each dot, ghost numeral, and copy block arrives
  as its step reaches reading position; a short final hold lets step 03 rest.
- Panels use typography, the drawn spine, and existing ghost numerals as the
  motion vocabulary. Do not repeat the level photos inside the panels; the
  page should not become a slideshow.
- The title remains above the stage: `How it works`, then `A rhythm,` / `not a
  routine.` with the second line indented.
- Desktop stage is intentionally more compact than About's full-screen
  biography. It uses three editorial beats, no chapter counter, no snap, and
  no per-panel portrait treatment.
- Use GSAP + ScrollTrigger only for the timeline. Do not create a new Lenis
  instance for this page; standard scroll preserves its distinct feel and
  avoids competing smooth-scroll controllers.
- Travel is measured from panel width × (panel count − 1), not `scrollWidth`,
  because the oversized numeral may overflow its panel. Pin and translation
  use numeric, self-measured document positions with
  `invalidateOnRefresh: true`.
- Mobile and reduced motion: no pin or horizontal translation. Render all
  three steps as a clear, vertical timeline in normal document flow.

### 5. Resolution

Keep the existing deep-green `weekly-close` section unchanged: pull quote,
booking CTA, location note, FAQ link, grain treatment, and once-only entrance
animation. It is the quiet resolution after the motion of the page.

## Distinction from the About page

| About | Ongoing Lessons |
| --- | --- |
| Aaron's four-chapter biography | A learner's three-beat weekly rhythm |
| Full-screen photo-led chapter panels | Compact type-and-spine “score” after a photo-led level explorer |
| Chapter counting and hand-rolled snapping | No counter and no snap |
| Page-specific Lenis instance | Standard scrolling plus local GSAP ScrollTriggers |
| Personal history and chronology | Repetition, pace, and musical accumulation |

## Motion and accessibility

- Motion should have a musical cadence: curtain lift, level image wipe,
  editorial bridge drift, then the horizontal score. Avoid concurrent large
  animations competing for attention.
- Decorative video, dots, ghost numerals, grain, and bridge treatment remain
  `aria-hidden` where appropriate; meaningful images retain accurate alt text.
- The level tabs remain keyboard accessible with their existing arrow-key
  support and visible focus states.
- Reduced-motion mode disables scroll-linked crop movement, pinning,
  horizontal translation, and entrance choreography. Static content must be
  fully visible and logically ordered without JavaScript.

## Component boundaries

- `SkillLevelSection.tsx` / `.css`: owns the compact video, skill-level tabs,
  existing three level photos, and the new editorial bridge image/motion.
- `WeeklyJourneySections.tsx` / `.css`: owns only the horizontal desktop score
  (and its vertical no-motion/mobile fallback) plus the unchanged close.
- `WeeklyLessons.tsx`: remains composition-only; it continues to render the
  two feature components in order.

## Verification criteria

- The video never dominates the page, and the page still reads well if it
  cannot load.
- All four photos have one purposeful role; `aaron-teaching-2.jpg` appears
  once as the bridge.
- The level selector remains usable with keyboard and touch.
- The horizontal score is readable, lands step 03 before release, and has no
  horizontal page overflow.
- Ongoing Lessons does not read as a copy of About: no full-screen portrait
  chapters, no snapping, no chapter UI, and no additional Lenis instance.
- At desktop, mobile (≤760px), and reduced-motion settings, copy, media, CTA,
  and focus behaviour remain intact.
- `npm run build`, `npm run lint`, and `npm run typecheck` pass after the
  subsequent implementation.

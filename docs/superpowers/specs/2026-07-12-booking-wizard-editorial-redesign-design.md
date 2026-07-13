# Booking Wizard Editorial Redesign — Design Spec

Date: 2026-07-12
Status: approved direction; adjustments from review incorporated

## Goal

Redesign `/book` from a locked-viewport "dark card in a box" into a normal
scrolling editorial page that matches the site's premium identity (cream
background, ink type, Fraunces/Cormorant display, ghost-numeral motif, gold
reserved for high-intent moments). Visual/structural only — booking behavior
is untouched.

## Non-goals / hard constraints

- No changes to the state machine, step order, `BookingData`,
  `VACATION_LESSON_OPTIONS`, `ONGOING_LESSON_OPTIONS`, `TIME_SLOTS`, pricing,
  `getLessonPrice`, `formatBookingContext`, datetime auto-advance,
  `goTo`/`goBack`/`handleSubmit`.
- Hidden Formspree fields keep exact names: `lessonType`, `participants`,
  `duration`, `price`, `date`, `timeSlot`. Submission stays unwired.
- No invented pricing/copy; existing copy reused verbatim.
- Accessibility preserved: one `<h1>`, heading focus on step change,
  `aria-live` context line, `aria-current="step"`, keyboard-operable
  calendar/slots, visible focus states, full reduced-motion fallback.
- No new dependencies.

## 1. Structural unlock

- `src/index.css`: delete the `.site-shell--booking` desktop block (~lines
  58–98) and the mobile override (~589–602). `/book` gets no special shell
  rules.
- `src/layout/SiteLayout.tsx`: remove `isBooking` entirely. Book renders with
  plain `route-shell` + `page-main`, and receives the standard `<SiteFooter />`
  (fixes the footer-standardization inconsistency noted in CLAUDE.md).
- Page scrolls in normal flow; `bw-panel`'s internal `overflow-y: auto`
  scroll container is removed.

## 2. Page anatomy (top → bottom)

1. **Hero** — existing "let's set up your lesson" Fraunces italic headline,
   `Book a Lesson` micro-label, word-by-word entrance reveal. The canvas
   grow-in that followed it is dropped; content below fades up instead.
2. **Progress rail** — the four existing labels (`Lesson Type`, `Date & Time`,
   `Booking Summary`, `Confirmation`) as a micro-caps row
   (`--label-size`/`--label-tracking`), a thin hairline rule beneath, and a
   gold fill segment scaled to `progressIndex / 3`. Active label full ink;
   done labels ~0.62 alpha; future ~0.38. Same `<ol>` semantics and
   `aria-current="step"`; fill animates via CSS `transform: scaleX`
   transition (no GSAP).
3. **Context line** — the existing `aria-live="polite"` context bar restyled
   as one quiet Cormorant italic line under the rail. No border box. Same
   element and ARIA wiring.
4. **Step content** — directly on cream, ink type. One ghost watermark
   numeral per step (see §3). Step headings keep `tabIndex={-1}` +
   focus-on-change.
5. **Footer** — standard `SiteFooter`.

## 3. Ghost watermark numeral

- One oversized numeral (1–4, matching the current progress step) behind each
  step's heading, echoing `.aaron-story__watermark`:
  Fraunces italic 600, `clamp(14rem, 30vw, 26rem)`, gold at ~0.08–0.1 alpha
  (tuned for cream), right-offset behind the heading.
- **Containment (review adjustment):** numeral is `position: absolute` inside
  a `position: relative` step container; a page-level wrapper carries
  `overflow-x: clip` so the numeral can never introduce a horizontal
  scrollbar at narrow desktop widths.
- **Inertness (review adjustment):** explicitly `aria-hidden="true"`,
  `pointer-events: none`, `user-select: none`, `z-index: 0`; interactive
  content sits above it (`z-index: 1`).
- This replaces the current tiny boxed-tab numerals — net ghost-motif
  frequency unchanged.

## 4. Step treatments

### Steps 1–2: editorial option rows

- Each option is a full-width `<button>` row separated by hairline rules
  (top rule on each row + closing bottom rule).
- Step 1: Cormorant title `clamp(1.8rem, 3vw, 2.6rem)`, existing description
  copy in quiet sans at ~0.68-alpha ink below.
- Step 2: Cormorant title ~1.4rem scale, detail in quiet sans, price
  right-aligned in Cormorant on the title baseline.
- Gold `→` arrow (existing CTA-arrow idiom): rest = `translateX(-8px)` +
  `opacity: 0`; hover / `:focus-visible` / `.is-selected` = slides in.
- Selected row: title full ink, price gold.
- No card chrome anywhere: no background, border-radius, or box-shadow.

### Step 3: date & time

- No `bw-surface` card. Calendar left, times right, in normal page flow;
  vertical hairline divider on desktop; stacked at ≤760px.
- Calendar keeps all `.bwc-*` behavior and structure; skin only. Selected day
  stays gold fill; day cells stay round.
- **Time slots (review adjustment):** wrapped horizontal row of inline pill
  buttons (11 slots, 7 AM–5 PM — a vertical list would run too long).
  Skin: quiet text pills with hairline underline; selected = gold underline
  + full ink; hover = soft gold underline. `aria-pressed` retained.

### Step 4: contact + review

- Review summary: plain `<dl>` with hairline row rules, no card. "Change
  selections" link stays.
- Form fields: underline style — transparent background, no box,
  `border-bottom: 1px solid` ink at ~0.25 alpha; focus = 2px gold underline.
  Labels stay on the micro-label tokens.
- Submit button: `cp-button`'s native dark-ink pill (the cream override
  existed only for the dark canvas and is deleted).

### Step 5: confirmation

- Heading + existing lede + the same rule-row summary treatment. Watermark
  numeral "4".

## 5. Primitive scoping (review adjustment)

- `.cp-form-control` / `.cp-button` defaults in `index.css` are **not**
  redefined. All Book-specific restyling (underline fields, etc.) lives in
  `Book.css` scoped under `.bw` (e.g. `.bw .cp-form-control`), preserving the
  existing override pattern. The boxed default remains available to future
  pages.

## 6. Motion

- Keep: word-by-word hero reveal, step-panel fade/slide transitions
  (direction-aware), per-item stagger via `data-bw-item`, heading focus on
  step change, datetime auto-advance hold.
- Drop: canvas grow-in, amber glow scrub (`bw-canvas-glow` element deleted),
  hero parallax drift.
- Add: watermark numeral cross-fade on step change, riding the existing
  panel transition (opacity only).
- Reduced motion: CSS defaults render the fully-visible static layout; no
  tweens, no scroll-linked work — same branching structure as today.

## 7. Cleanup

- Remove `MAUI_PALETTE_CSS_VARS` injection from `Book.tsx` (no dark surfaces
  remain; stops unused in CSS). `mauiPalette.ts` stays — the NavGradient
  shader owns it.
- `Book.css` rewritten; `.bw-*` / `.bwc-*` prefixes kept; dead local tokens
  and canvas/surface/choice-band rules removed.
- CLAUDE.md: update the Book bullet in "Current Product State" (locked
  viewport + missing footer no longer true).

## 8. Verification

- `npm run build`, `npm run lint`, `npm run typecheck` all pass.
- Manual: reduced-motion fallback; mobile at 760px; keyboard through all five
  steps (rows, calendar, pills, form, submit); no horizontal scrollbar at
  narrow desktop widths (watermark containment); no bracketed/placeholder
  text introduced.

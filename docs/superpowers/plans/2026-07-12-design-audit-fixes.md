# Design Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve every finding in `maui-lessons-design-audit.md` (audited against the live GitHub Pages deploy on 2026-07-11) and ship the fixed site.

**Architecture:** The local working tree is already ahead of the deployed site and resolves most P0 findings (hero-video timeout fallback, per-route `<h1>`, alt text, footer on all routes, meeting-location copy, pinned weekly timeline, ghost-numeral Book step indicator). This plan (1) commits that baseline, (2) fixes the remaining real defects in code, (3) verifies every audit claim locally with a browser, (4) deploys, and (5) re-verifies on the live URL. Items that require facts only the business owner knows (testimonial quotes, a price figure, a Formspree form ID) get an interim safe state plus a clearly marked fill-in task.

**Tech Stack:** Vite 8, React 19, TypeScript 6, React Router 7, GSAP 3 + ScrollTrigger, Lenis. No test framework exists in the repo — verification is `npm run build` / `npm run lint` / `npm run typecheck` plus scripted browser checks (Playwright MCP or Chrome DevTools). Deploy is GitHub Pages via `.github/workflows/deploy-pages.yml` on push to `main`.

## Global Constraints

- Never invent business facts (prices, quotes, names, policies). Facts-needed items are listed in the "Facts needed from the owner" section; until supplied, use the interim states specified in the tasks — never bracketed `[TODO]` text that renders on the page.
- Protect (per audit Section 14): the About biography content verbatim, the ghost-numeral/wordmark motif's current frequency, the cream/forest-green/sage palette, and the single "Book a Lesson" / "Book This Experience" CTA language.
- Every visual/motion change must be checked under both normal motion and `prefers-reduced-motion: reduce`.
- Run `npm run build` and `npm run lint` after each task; both must pass before committing.
- The main responsive breakpoint is `max-width: 760px`; do not introduce new breakpoints.
- Commit after each task with a conventional-commit message ending in:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- Do not edit `dist/`.

## Facts needed from the owner (blockers for Tasks 10–12)

1. **2–4 real student quotes** — short, specific (song learned, beach, a concrete moment), with first name and "visiting from X" / "local student". Needed for Task 10.
2. **A price anchor** — an exact "from $X" figure or range for vacation lessons. Needed for Task 11.
3. **A Formspree form ID** (free tier is fine: formspree.io → new form → copy the `f/xxxxxxx` ID) — so the booking request actually sends. Needed for Task 12. Without it, Task 4's honest interim copy stays.

## Audit-finding → task coverage map

| Audit finding | Status in local tree | Task |
|---|---|---|
| P0 mobile blank page / header never revealed | Timeout fallback exists (`OpeningScene.tsx:628-652`) but deck pin is never created when the hero video stalls → cards 2/3 unreachable | Task 2 (fix) + Task 7 (verify) |
| P0 meeting location near CTA | Done (`VacationStorySections.tsx:419-422`, also Weekly + FAQ) | Task 7 (verify only) |
| P0 `<h1>` + alt text sitewide | Done on every route/img found in review | Task 7 (verify only) |
| P0 footer standardized on all six routes | Done (`SiteLayout.tsx:56` + HomeFinale) | Task 7 (verify only) |
| P1 testimonials / social proof | `[TODO: …]` text literally renders on Home + Vacation | Task 3 (interim) + Task 10 (real quotes) |
| P1 Ongoing Lessons art direction | Done (pinned scrubbed timeline, curtain reveal) | Task 7 (verify only) |
| P1 pricing "from $X" in FAQ | Not done — blocked on fact | Task 11 |
| P1 ghost-numeral Book step indicator | Done (`Book.css:147-167`) | Task 7 (verify only) |
| P2 vacation hero tagline contrast | Not done — cream text at opacity 0.3 over bright sky | Task 5 |
| P2 gold accent foreshadowed on CTAs sitewide | Not done — CTAs are ink/cream only | Task 6 |
| P2 repeated photo treatment | `aaron-tourists-1.jpg` appears untreated on Home deck card 3 and Vacation collage | Task 6 |
| P2 shorten pinned scroll distances | Hero already shortened to `+=120%`; deck still `+=320%` | Task 6 |
| P2 keyboard + reduced-motion QA pass | Not verified | Task 8 |
| §10 About ch. 3→4 possible empty frame | Unverified risk | Task 8 |
| §10 Home bio-teaser trust line | Not done | Task 3 |
| §8 ghost motif on FAQ/Book | Done (Book numerals; FAQ ghost word "curious") | Task 7 (verify only) |
| Book page bracketed placeholder copy (confirm step, textarea) | Renders literally | Task 4 |
| Stale internal docs (audit preamble) | CLAUDE.md contradicts reality | Task 9 |
| Booking submission/routing | Explicitly excluded from audit scoring, but confirm-step copy lies about it | Task 4 (honest interim) + Task 12 (wire) |

---

### Task 1: Baseline — verify and commit the existing uncommitted fixes

The working tree contains uncommitted work that already resolves most P0 findings. Lock it in before changing anything.

**Files:**
- Modify: none (verify + commit only)

**Interfaces:**
- Produces: a clean `main` working tree at a verified-green baseline every later task builds on.

- [ ] **Step 1: Run the full verification suite**

Run:
```bash
cd /Users/karinrubin/Developer/maui-lessons
npm run build && npm run lint && npm run typecheck
```
Expected: all three exit 0. If any fail, stop and fix before committing — the baseline must be green.

- [ ] **Step 2: Review what is being committed**

Run: `git status && git diff --stat`
Expected: modified files across `src/components/…`, `src/layout/SiteLayout.tsx`, `src/index.css`, `src/pages/Book.*`, plus untracked `maui-lessons-design-audit.md`.

- [ ] **Step 3: Commit the baseline**

```bash
git add -A
git commit -m "feat: audit-response baseline — hero timeout fallback, h1/alt, footer, location copy, weekly pin, book numerals

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Let the hero sequence register when the video stalls (root-cause fix)

**Why:** The hero's own pinned sequence — tagline reveal, sage arch/title handoff — is registered inside the effect at `OpeningScene.tsx:654-763`, which early-returns while `!videoReady` (line 658). The "Hard fallback" timeout (lines 628-652) only reveals the header and restarts Lenis; it never lets that registration proceed. `.opening-scene__tagline` and `.opening-scene__arch` both default to `opacity: 0` (`OpeningScene.css:133,175`) and are only ever animated visible inside that gated effect's timeline. So a stalled 14 MB hero video (the audit's confirmed mobile failure) silently loses the tagline copy and arch transition forever — and, because `useHomeScrollSequence.createTriggers()` waits for BOTH hero and deck configs, the deck's pinned card timeline is never created either, leaving service cards 2/3 unreachable. Fixing the registration guard in `OpeningScene.tsx` closes all of it; the hook needs no changes.

**Files:**
- Modify: `src/components/home/OpeningScene.tsx` (only file)

**Interfaces:**
- Consumes: existing `scrollSequence.registerHero` (unchanged), existing 3000 ms fallback timeout effect.
- Produces: new local state `videoLoadTimedOut: boolean` and derived `heroMediaSettled = videoReady || videoLoadTimedOut`. No API changes; `useHomeScrollSequence.ts` untouched.

Two hazards this design must avoid (both verified against source):
1. **Effect re-run teardown:** the registration effect lists `videoReady` in its deps. If the video becomes ready *after* the timeout already registered the hero, a `videoReady` flip would re-run the effect; its cleanup calls `unregisterHero()`, whose shared `teardown` in the hook kills BOTH hero and deck triggers, and the deck never re-registers. Guarding and depending on the derived `heroMediaSettled` (which is already `true` and stays `true`) instead of raw `videoReady` prevents the re-run entirely.
2. **Double stall:** the same guard also requires `landscapeVisible`. If the beach image is also still loading at timeout, registration would stay blocked. The timeout therefore also forces `setLandscapeReady(true)`, which drives the existing fade → `landscapeVisible` path.

No extra guards are needed around the timeline's video operations: with the intro never run, the frame stays at its CSS `opacity: 0` (video invisible over the landscape backdrop), the scrub's fade-out tweens on already-invisible elements are no-ops, `syncFocusAvailabilityFromFrame()` reports focus unavailable at frame opacity 0, and the audio-zone `play()` attempts on a non-ready video already `catch` and fall back to muted.

- [ ] **Step 1: Add the timed-out state and derived flag**

In `src/components/home/OpeningScene.tsx`, next to the other `useState` calls (after line 124):

```ts
  const [videoLoadTimedOut, setVideoLoadTimedOut] = useState(false)
```

And directly below the state declarations:

```ts
  // The hero registration effect gates on this instead of raw videoReady so
  // a video that becomes ready AFTER the fallback timeout doesn't re-run the
  // effect (its cleanup would tear down both hero and deck triggers via the
  // hook's shared teardown, with no path to rebuild them).
  const heroMediaSettled = videoReady || videoLoadTimedOut
```

- [ ] **Step 2: Extend the hard-fallback timeout**

Inside the existing timeout callback (after the `setHeaderSuppressed(false)` / `markIntroComplete()` / `lenisRef.current?.start()` lines, before the closing brace):

```ts
      // Unblock the scroll-sequence registration below: the tagline and
      // arch live only in that timeline, so without this a stalled video
      // silently loses them (and the deck pin, which waits on the hero).
      // Forcing landscapeReady covers the double-stall case where the
      // beach image is also still loading; if it's already loaded this is
      // a no-op.
      setLandscapeReady(true)
      setVideoLoadTimedOut(true)
```

Update the comment block above the effect (lines 622-627) to mention that the timer also unblocks hero registration, not just the header.

- [ ] **Step 3: Re-gate the registration effect**

In the effect at line 654, change the guard clause `!videoReady ||` to `!heroMediaSettled ||`, and in its dependency array (lines 755-763) replace `videoReady` with `heroMediaSettled`.

- [ ] **Step 4: Verify the normal path is unchanged**

Run `npm run dev`, open `http://localhost:5173/` at desktop width.
Expected: intro plays, video fades in, hero pins, tagline reveals word-by-word, arch + "Choose your experience" title appear, deck pins and swaps all three cards — identical to before.

- [ ] **Step 5: Verify the stall path**

Block `**/*.MP4` (Playwright `route.abort()` or DevTools request blocking), viewport ~500 px, hard-reload `/`.
Expected: beach image shows; header fades in within ~3 s; hamburger menu opens and navigates; scrolling pins the hero and the **tagline text and sage arch/title now appear as designed**; continuing down reaches the deck, which pins and scrolls through all three cards; MeetAaron and HomeFinale render. Repeat at 390 px.

- [ ] **Step 6: Verify the slow-but-eventually-loads path**

Throttle to a profile where the video takes >3 s but does load (or delay the route ~8 s instead of aborting). Expected: header at ~3 s; when the video finally loads the intro fades the frame/video in; no console errors; hero and deck pins keep working (i.e. hazard 1 above does not fire).

- [ ] **Step 7: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload `/`.
Expected: unchanged from before — no pinning, media and tagline in flow, no console errors (the fallback-timeout effect already early-returns for reduced motion).

- [ ] **Step 8: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/components/home/OpeningScene.tsx
git commit -m "fix(home): register hero scroll sequence when the video load times out

The 3s fallback only revealed the header; the tagline, arch, and deck
pin all waited on videoReady and were silently lost when the hero
video stalled. Gate registration on videoReady-or-timed-out (derived,
so a late video load can't re-run the effect and tear down both pins),
and force landscapeReady to cover a double stall.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Stop rendering `[TODO]` testimonial text; make quote slots data-driven; add the Home trust line

**Why:** Three pages currently render literal `[TODO: real quote needed — …]` text to visitors (Home `MeetAaron.tsx:218-226`, Vacation `VacationStorySections.tsx:389-413`). Placeholder text on a live page is worse than the section's absence. Make the sections render only when real quotes exist, so Task 10 becomes a pure data fill. Also add the audit's §10 Home recommendation: one specific, checkable trust line in the bio teaser (reusing the verified Keolahou Church fact from the About page — not an invented fact).

**Files:**
- Modify: `src/components/home/MeetAaron.tsx`
- Modify: `src/components/tourist-lessons/VacationStorySections.tsx`

**Interfaces:**
- Produces: `MEET_AARON_VOICE: { quote: string; attribution: string } | null` in `MeetAaron.tsx`, and `vacationVoices: Array<{ id: string; quote: string; attribution: string }>` in `VacationStorySections.tsx`. Task 10 fills exactly these constants — no markup changes needed then.

- [ ] **Step 1: Gate the MeetAaron quote on data**

In `src/components/home/MeetAaron.tsx`, add below the `HEADLINE` constant:

```tsx
// Real student quote goes here (see plan Task 10). Rendering nothing beats
// rendering placeholder text: the section reads as complete either way.
const MEET_AARON_VOICE: { quote: string; attribution: string } | null = null
```

Replace the entire `<figure className="meet-aaron__voice">…</figure>` block (lines 216-226) with:

```tsx
        {MEET_AARON_VOICE ? (
          <figure className="meet-aaron__voice">
            <blockquote className="meet-aaron__voice-quote">{MEET_AARON_VOICE.quote}</blockquote>
            <figcaption className="meet-aaron__voice-attribution">
              {MEET_AARON_VOICE.attribution}
            </figcaption>
          </figure>
        ) : null}
```

- [ ] **Step 2: Add the specific trust line to the bio teaser**

In the same file, replace the `meet-aaron__description` paragraph text (lines 203-208) with:

```tsx
            <p className="meet-aaron__description">
              Aaron teaches with patience, warmth, and a genuine love for helping people learn.
              The ukulele has been his focus for the last eight of his twenty-two years in music —
              most Thursday nights, you can catch him playing at Keolahou Church in Kihei.
            </p>
```

(Every fact in that line already appears on the About page and in the FAQ — nothing new is invented.)

- [ ] **Step 3: Gate the Vacation voices section on data**

In `src/components/tourist-lessons/VacationStorySections.tsx`, add below `pullQuoteWords`:

```tsx
// Real student quotes go here (see plan Task 10). The section is skipped
// entirely while this is empty so no placeholder text ever ships.
const vacationVoices: Array<{ id: string; quote: string; attribution: string }> = []
```

Replace the entire `<section className="vacation-voices" …>…</section>` block (lines 387-413) with:

```tsx
      {vacationVoices.length > 0 ? (
        <section className="vacation-voices" aria-label="What past students say">
          <p className="vacation-voices__eyebrow" data-vacation-reveal>
            From past lessons
          </p>
          <div className="vacation-voices__grid" data-vacation-reveal data-vacation-reveal-group>
            {vacationVoices.map((voice) => (
              <figure key={voice.id} className="vacation-voices__item">
                <blockquote className="vacation-voices__quote">{voice.quote}</blockquote>
                <figcaption className="vacation-voices__attribution">{voice.attribution}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
```

- [ ] **Step 4: Verify in the browser**

Run `npm run dev`. On `/`: scroll to Meet Aaron — no bracketed text, new description line reads correctly, headline/portrait animations still play. On `/tourist-lessons`: scroll the full page — the quote band ("Most vacation activities end…") still appears; no "From past lessons" section; the finale CTA with the location note follows directly. No console errors (the GSAP reveal selectors tolerate the missing section because they select per-element).

- [ ] **Step 5: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/components/home/MeetAaron.tsx src/components/tourist-lessons/VacationStorySections.tsx
git commit -m "fix(content): never render TODO placeholder quotes; add specific trust line to bio teaser

Testimonial slots are now data-driven and hidden while empty.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Book page — remove bracketed placeholder copy, honest confirm step

**Why:** The confirm step renders `[Placeholder confirmation copy — no request was actually sent…]` and the message field's placeholder is `[Anything else we should know?]`. Until Task 12 wires real submission, the confirm step must not claim the request was sent — but it also must not show bracketed dev notes.

**Files:**
- Modify: `src/pages/Book.tsx`

**Interfaces:**
- Consumes: existing `handleSubmit` (unchanged this task).
- Produces: same component; copy-only changes. Task 12 later replaces `handleSubmit`'s body and may tighten the confirm copy further.

- [ ] **Step 1: Fix the textarea placeholder**

In `src/pages/Book.tsx` line 635, change:

```tsx
                    placeholder="[Anything else we should know?]"
```

to:

```tsx
                    placeholder="Anything else Aaron should know?"
```

- [ ] **Step 2: Replace the confirm-step lede**

Replace lines 657-660:

```tsx
              <p className="bw-confirm-lede" data-bw-item>
                [Placeholder confirmation copy — no request was actually sent. Real submission and
                response-time details go here once the booking flow is wired up.]
              </p>
```

with copy that is true both before and after Task 12 wires submission (it describes the request the visitor composed, and directs them to a channel that works today — the details are their own, shown below):

```tsx
              <p className="bw-confirm-lede" data-bw-item>
                Here’s your lesson request. Aaron will follow up by email to confirm the time and
                current rates.
              </p>
```

**Note for the implementer:** if Task 12 (Formspree) lands in the same release, this copy is accurate as-is. If Task 12 is deferred past launch, the Book route must not go live with a submit button that silently discards data — raise this to the owner rather than shipping it; that decision is theirs (audit excluded submission from scoring, but shipping a silent no-op form is a trust failure the audit's whole thrust argues against).

- [ ] **Step 3: Verify in the browser**

Run `npm run dev`, open `/book`, complete the wizard (vacation → group → pick a date + hour → fill name/email → submit).
Expected: no bracketed text anywhere; confirm step shows the new lede plus the summary; "Change" links still work; back buttons still work.

- [ ] **Step 4: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/pages/Book.tsx
git commit -m "fix(book): remove bracketed placeholder copy from wizard

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Vacation hero tagline contrast (audit P2, §10)

**Why:** The headline starts as near-cream (`rgb(236,232,223)`) at `opacity: 0.3` over the bright-sky region of `aaron-pause.jpg` (`vacationSceneConfig.ts:73-116`, `VacationCinematicScene.css:12-21`). The audit flags this pre-scroll state as low-contrast. Fix with a scrim that is fully present at progress 0 and dissolves as the framing effect takes over (driven by the existing `--vac-surface-progress` CSS variable), plus a higher starting opacity.

**Files:**
- Modify: `src/components/tourist-lessons/VacationImageLayer.tsx`
- Modify: `src/components/tourist-lessons/VacationCinematicScene.css`
- Modify: `src/components/tourist-lessons/vacationSceneConfig.ts`

**Interfaces:**
- Consumes: `--vac-surface-progress` custom property already written every scroll tick by `useVacationSceneProgress.ts:22`.
- Produces: no API changes.

- [ ] **Step 1: Add the scrim element**

In `src/components/tourist-lessons/VacationImageLayer.tsx`, inside `.vacation-cinematic-scene__image-frame`, after the `<img>`:

```tsx
        <div className="vacation-cinematic-scene__image-scrim" aria-hidden="true" />
```

- [ ] **Step 2: Style the scrim**

In `src/components/tourist-lessons/VacationCinematicScene.css`, first confirm `.vacation-cinematic-scene__image-frame` has `position: relative` (or `absolute`) and `overflow: hidden`; add `position: relative;` to it if it has no positioning. Then add after the `.vacation-cinematic-scene__image` rules:

```css
/* Readability scrim for the pre-scroll hero state: fully present while the
   cream headline sits over the bright sky, dissolving as the framing effect
   (and the headline's own shift to ink) takes over. Driven by the same
   surface-progress variable the scene already writes every tick. */
.vacation-cinematic-scene__image-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(9, 20, 14, 0.52) 0%,
    rgba(9, 20, 14, 0.3) 48%,
    rgba(9, 20, 14, 0.14) 100%
  );
  opacity: calc(1 - var(--vac-surface-progress, 0));
  pointer-events: none;
}
```

Note: in the reduced-motion / mobile state the scene applies visual state for progress 1 (`useVacationSceneProgress.ts:57`), so `--vac-surface-progress` is 1 and the scrim is invisible there — correct, because in that state the headline already renders in its settled high-contrast form.

- [ ] **Step 3: Raise the starting headline opacity**

In `src/components/tourist-lessons/vacationSceneConfig.ts`, change the `headlineOpacity` expression (lines 112-116) from a `0.3` base to `0.62`:

```ts
    headlineOpacity:
      0.62 +
      headlineQuietProgress * 0.08 +
      headlineBuildProgress * 0.2 +
      headlineDominanceProgress * 0.1,
```

And in `VacationCinematicScene.css` update the matching static default (line 14): `--vac-headline-opacity: 0.62;`

- [ ] **Step 4: Verify**

Run `npm run dev`, open `/tourist-lessons` at desktop width. At scroll position 0 the headline must be clearly readable over the sky (spot-check contrast: with DevTools, sample the headline pixel color vs. the scrimmed background — target ≥ 4.5:1). Scroll through the pin: the scrim dissolves and the settled framed state looks identical to before. Check `max-width: 760px` and reduced-motion: no visible scrim, headline in settled dark form. 

- [ ] **Step 5: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/components/tourist-lessons/VacationImageLayer.tsx src/components/tourist-lessons/VacationCinematicScene.css src/components/tourist-lessons/vacationSceneConfig.ts
git commit -m "fix(vacation): readable pre-scroll hero headline via dissolving scrim

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Sitewide polish trio — gold CTA foreshadowing, repeated-photo treatment, deck scroll length

Three small, related P2 design refinements bundled because they share one review gate (visual QA across routes).

**Files:**
- Modify: `src/components/home/HomeFinale.css`
- Modify: `src/components/tourist-lessons/VacationStorySections.css`
- Modify: `src/components/weekly/WeeklyJourneySections.css`
- Modify: `src/components/faq/FaqSections.css`
- Modify: `src/components/about/AaronStorySections.css`
- Modify: `src/components/home/MeetAaron.css`
- Modify: `src/components/home/StackedServicesDeck.css`
- Modify: `src/components/home/StackedServicesDeck.tsx`

**Interfaces:**
- Consumes: existing CTA arrow spans (`*__cta-arrow`) present in HomeFinale, VacationStorySections, WeeklyJourneySections, FaqSections, AaronStorySections, MeetAaron, StackedServicesDeck markup.
- Produces: no API changes; CSS + one string literal change.

- [ ] **Step 1: Gold accent on primary CTA arrows sitewide (audit §7/P2: introduce the Book page's gold before the Book page, restrained)**

The Book page's amber is `#b87d2c` (used at `Book.css:138`); on dark surfaces the lighter cut `#d69e54` (used at `Book.css:162`) reads better. Add these rules:

`src/components/home/HomeFinale.css` (cream button on dark band):
```css
.home-finale__cta-arrow {
  color: #b87d2c;
}
```

`src/components/tourist-lessons/VacationStorySections.css` (cream button on dark finale):
```css
.vacation-story__finale-cta-arrow {
  color: #b87d2c;
}
```

`src/components/weekly/WeeklyJourneySections.css` (dark band):
```css
.weekly-close__cta-arrow {
  color: #d69e54;
}
```

`src/components/faq/FaqSections.css` (ink button on light shelf):
```css
.faq-close__cta-arrow {
  color: #d69e54;
}
```

`src/components/about/AaronStorySections.css` (dusk panel):
```css
.aaron-story__cta-arrow {
  color: #d69e54;
}
```

`src/components/home/MeetAaron.css` (text link on tan field):
```css
.meet-aaron__cta-arrow {
  color: #b87d2c;
}
```

`src/components/home/StackedServicesDeck.css` (card CTA):
```css
.stacked-services-deck__cta-arrow {
  color: #b87d2c;
}
```

If any of these selectors already sets `color`, override it in place rather than adding a duplicate rule. Check each file first with `grep -n "cta-arrow" <file>`.

- [ ] **Step 2: Differentiate the repeated photo (audit P2)**

`aaron-tourists-1.jpg` appears untreated in both the Home deck (card 3, "Group Experience") and the Vacation collage portrait figure. Give the Home deck instance a distinct warm grade and crop so the two reads differ. In `src/components/home/StackedServicesDeck.css`, add:

```css
/* aaron-tourists-1.jpg also appears full-color on the Vacation page; this
   instance gets a warm editorial grade + higher crop so the two reads
   register as different frames from the same shoot, not a reused asset. */
.stacked-services-deck__card[data-card-index='3'] .stacked-services-deck__media-image {
  object-position: 50% 30%;
  filter: sepia(0.3) saturate(0.8) contrast(1.05);
}
```

- [ ] **Step 3: Shorten the deck pin (audit P2 scroll pacing)**

In `src/components/home/StackedServicesDeck.tsx` line 134, change:

```ts
        end: '+=320%',
```

to:

```ts
        end: '+=260%',
```

(The hero pin was already shortened to `+=120%` in the committed baseline; the About track length is structurally tied to panel width and its snap math, so it stays — the audit calls this "not a candidate for removal," only a slight trim, and the deck is the trim.)

- [ ] **Step 4: Visual QA**

Run `npm run dev`. Check: (a) each route's primary CTA shows the gold arrow, buttons otherwise unchanged, hover/focus states intact; (b) Home deck card 3's photo reads warmer/tighter-cropped than the same photo on `/tourist-lessons`; (c) the deck's three-card swap completes comfortably with noticeably less scroll, no clipping when the pin releases; (d) reduced motion: deck renders stacked cards without pinning, treated image still looks right.

- [ ] **Step 5: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/components/home/HomeFinale.css src/components/tourist-lessons/VacationStorySections.css src/components/weekly/WeeklyJourneySections.css src/components/faq/FaqSections.css src/components/about/AaronStorySections.css src/components/home/MeetAaron.css src/components/home/StackedServicesDeck.css src/components/home/StackedServicesDeck.tsx
git commit -m "feat(design): gold CTA accents sitewide, grade repeated photo, trim deck pin length

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Scripted verification of every already-fixed audit claim (local)

**Why:** The audit's P0 list was written against the deployed site; the local tree claims to fix them. Claims need evidence before the deploy task. Use the Playwright MCP tools (or Chrome DevTools MCP) against `npm run dev`.

**Files:**
- Create: `docs/superpowers/plans/2026-07-12-audit-verification-log.md` (results log — a checklist with observed values, kept in-repo as the audit response record)

**Interfaces:**
- Consumes: dev server at `http://localhost:5173`.
- Produces: the verification log; any failure discovered here becomes a fix commit inside this task before moving on.

- [ ] **Step 1: Start the dev server** (`npm run dev`, background)

- [ ] **Step 2: h1 + alt-text audit on all six routes**

For each of `/`, `/tourist-lessons`, `/weekly-lessons`, `/about`, `/faq`, `/book`, evaluate in the browser:

```js
JSON.stringify({
  h1: document.querySelectorAll('h1').length,
  imgsMissingAlt: [...document.querySelectorAll('img')]
    .filter((img) => !img.getAttribute('alt'))
    .map((img) => img.src.split('/').pop()),
})
```

Expected on every route: `h1 === 1` and `imgsMissingAlt` empty. (On `/` wait for the intro; the tagline `<h1>` exists from first render.) Record each result in the log. Fix any miss immediately (add `alt`/adjust heading level in the owning component) and note the fix.

- [ ] **Step 3: Footer on all six routes**

On each route, scroll to the bottom and evaluate:

```js
Boolean(document.querySelector('.site-footer')) || Boolean(document.querySelector('.home-finale__links'))
```

Expected: `true` everywhere — `.site-footer` on the five non-home routes (rendered by `SiteLayout.tsx:56`), the equivalent finale nav+copyright band on `/`. Also confirm the FAQ page now shows the full five-link footer (the audit's "third variant" is gone) and `/book` shows it too. Record results.

- [ ] **Step 4: Meeting-location copy present**

Confirm visible text "Maipoina Beach Park" near the CTA on `/tourist-lessons` (finale note) and `/weekly-lessons` (close note), and in the FAQ "Where do lessons happen?" answer. Record.

- [ ] **Step 5: Mobile stall scenario end-to-end (the audit's headline defect)**

With Playwright: viewport 390×844, abort route `**/*.MP4`, goto `/`.
Expected within 3.5 s: `.site-header` has neither `is-suppressed` styling nor `opacity: 0` (evaluate `getComputedStyle(document.querySelector('.site-header')).opacity` → `"1"` after the fade); beach image visible; hamburger opens the nav overlay; clicking "FAQ" routes correctly; back on `/`, scrolling reaches the deck and all three cards can be scrolled through (Task 2's fallback). Repeat once at 500 px width. Record.

- [ ] **Step 6: Wizard + interactions regression sweep**

Desktop viewport: Book wizard full pass (calendar disables past dates, hour slots populate, Change links, editable inputs); FAQ accordion expand/collapse; weekly skill tabs swap content and are arrow-key navigable; ghost-numeral step indicator visible on `/book` (`.bw-progress-numeral` in Fraunces italic). Record.

- [ ] **Step 7: Commit the log**

```bash
git add docs/superpowers/plans/2026-07-12-audit-verification-log.md
git commit -m "docs: local verification log for audit P0/P1 claims

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Keyboard, reduced-motion, and About-transition QA pass (audit P2 + §10 About)

**Files:**
- Modify: `docs/superpowers/plans/2026-07-12-audit-verification-log.md` (append results)
- Possibly modify: whichever component a failure implicates (fix inline, document in log)

**Interfaces:**
- Consumes: dev server; verification log from Task 7.

- [ ] **Step 1: Keyboard-only traversal**

On `/`: Tab to the menu button → Enter opens overlay → focus is trapped inside → Tab through all five links → Escape closes and returns focus to the menu button. On `/`, Tab to the hero video when visible → Enter opens focus mode → Escape exits and restores focus. On `/about`: Tab into the pinned story — tabbing to a link inside a later chapter jumps the sequence to that chapter (the `focusin` handler at `AaronStorySections.tsx:337-352`). Record pass/fail per item; fix failures in the owning component.

- [ ] **Step 2: Reduced-motion pass on all six routes**

Emulate `prefers-reduced-motion: reduce`. Expected per route: no pinning anywhere, all content readable in flow, no locked scroll, no invisible sections (watch for GSAP `gsap.set(..., autoAlpha 0)` initial states that only a skipped timeline would reveal). Record per route.

- [ ] **Step 3: About chapter 3→4 transition retest (audit §10 "unverified risk")**

Desktop viewport, normal motion, `/about`: scroll slowly (small increments) from chapter 3 into chapter 4 three times. The audit saw one frame of empty cream with only a ghost numeral. Observe whether panel 4's copy/image are absent for a sustained beat (a real gap: `left 75%`→`left 25%` reveal window on a wide gap between panels) or it's a normal mid-scrub frame.
- If a real gap: widen panel 4's reveal window in `AaronStorySections.tsx` (the `index > 0 && revealTarget` block, line 275) from `start: 'left 75%'` to `start: 'left 95%'` for a faster arrival, retest, and note the change.
- If not reproducible: record "not reproducible at desktop width, 3 attempts" and move on.

- [ ] **Step 4: Commit log updates (and any fixes)**

```bash
git add -A
git commit -m "docs: keyboard/reduced-motion/About-transition QA results

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Refresh CLAUDE.md (the audit's preamble finding: docs contradict the product)

**Why:** The audit opens by flagging that `CLAUDE.md` is materially wrong (claims no git repo, read-only booking form, empty home content). Wrong agent docs cause future regressions — the audit explicitly warns a future agent could "reintroduce the read-only state described in stale docs."

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Correct the stale claims**

Edit `CLAUDE.md`, updating (at minimum) these sections to match reality — keep the existing structure and Agent Rules:
- "Last verified" date → today.
- Repository note: it IS a git repository with remote `https://github.com/karinrub/maui-lessons.git` and GitHub Pages deploy via `.github/workflows/deploy-pages.yml` on push to `main`; live at `https://karinrub.github.io/maui-lessons/`.
- Current Product State: home content is built (OpeningScene → StackedServicesDeck → MeetAaron → HomeFinale); all six routes have real copy and art direction; Book is a functional five-step wizard with a working calendar and editable fields — submission is NOT yet wired (see `handleSubmit` in `src/pages/Book.tsx`); footer is standardized (SiteFooter on non-home routes, equivalent band inside HomeFinale on `/`); hero has a 3 s header-reveal timeout and (post-Task-2) a deck-pin fallback.
- Page Status sections: rewrite each to one short accurate paragraph.
- Known Risks: keep the 14 MB `preload="auto"` hero video entry (still true); remove claims fixed above.
- Add a pointer to `maui-lessons-design-audit.md` and this plan as the current work record, and note the remaining owner-blocked items (quotes, price anchor, Formspree ID).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: refresh CLAUDE.md to match shipped product state

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Fill real testimonials (BLOCKED on owner fact #1)

**Files:**
- Modify: `src/components/home/MeetAaron.tsx` (the `MEET_AARON_VOICE` constant from Task 3)
- Modify: `src/components/tourist-lessons/VacationStorySections.tsx` (the `vacationVoices` array from Task 3)

- [ ] **Step 1: Obtain 2–4 real quotes from the owner** (see Facts needed). Do not proceed with invented or paraphrased quotes.

- [ ] **Step 2: Fill the constants**

Example shape (real content substituted):

```tsx
const MEET_AARON_VOICE = {
  quote: '<owner-supplied quote>',
  attribution: '<First name>, <visiting from … / local student>',
}
```

```tsx
const vacationVoices = [
  { id: 'voice-1', quote: '<owner-supplied>', attribution: '<First name>, visiting from <place>' },
  { id: 'voice-2', quote: '<owner-supplied>', attribution: '<First name>, <place>' },
]
```

- [ ] **Step 3: Verify** — both sections now render with their existing reveal animations; check normal + reduced motion.

- [ ] **Step 4: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/components/home/MeetAaron.tsx src/components/tourist-lessons/VacationStorySections.tsx
git commit -m "feat(content): real student testimonials on Home and Vacation Lessons

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Price anchor in the FAQ (BLOCKED on owner fact #2)

**Files:**
- Modify: `src/components/faq/FaqSections.tsx` (the `pricing` item, line 67-71)

- [ ] **Step 1: Obtain the "from $X" figure or range from the owner.**

- [ ] **Step 2: Update the answer**, preserving the flexible-pricing framing the audit praised:

```ts
      {
        id: 'pricing',
        q: 'What does a lesson cost?',
        a: 'Vacation lessons start at $X. Exact rates depend on the lesson type, group size, and how often you’d like to meet — send a booking request and Aaron will confirm current pricing with you directly.',
      },
```

(Replace `$X` with the owner's figure; adjust the first sentence to a range if that's what's supplied.)

- [ ] **Step 3: Verify** — `/faq` accordion renders the new answer; no layout break at 760 px.

- [ ] **Step 4: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/components/faq/FaqSections.tsx
git commit -m "feat(faq): add price anchor to the cost answer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Wire booking submission via Formspree (BLOCKED on owner fact #3)

**Why:** Excluded from the audit's scoring but the plan's Task 4 note stands: a submit button that silently discards data must not ship. The form is already structured for this — hidden context fields exist and are named stably (`Book.tsx:575-581`).

**Files:**
- Modify: `src/pages/Book.tsx`

**Interfaces:**
- Consumes: hidden inputs `lessonType`, `participants`, `date`, `timeSlot` plus visible `name`, `email`, `phone`, `message` — all already in the form.
- Produces: `handleSubmit` POSTs to Formspree; a new `submitState: 'idle' | 'sending' | 'error'` drives button/label state.

- [ ] **Step 1: Obtain the Formspree form ID from the owner** (format `https://formspree.io/f/XXXXXXXX`).

- [ ] **Step 2: Implement submission**

In `src/pages/Book.tsx`, add near the other constants:

```ts
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/XXXXXXXX' // owner-supplied form ID
```

Add state next to the other `useState` calls:

```ts
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'error'>('idle')
```

Replace `handleSubmit` (lines 346-356):

```ts
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState('sending')

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(event.currentTarget),
      })

      if (!response.ok) {
        throw new Error(`Formspree responded ${response.status}`)
      }

      setSubmitState('idle')
      goTo('confirm')
    } catch {
      setSubmitState('error')
    }
  }
```

Update the submit button (line 644-646):

```tsx
                  <button type="submit" className="cp-button bw-cta" disabled={submitState === 'sending'}>
                    {submitState === 'sending' ? 'Sending…' : 'Send booking request'}
                  </button>
```

Add an inline error line directly above the `bw-footer` div inside the form:

```tsx
                {submitState === 'error' ? (
                  <p className="bw-submit-error" role="alert">
                    That didn’t go through — please try again in a moment.
                  </p>
                ) : null}
```

And in `src/pages/Book.css` add:

```css
.bw-submit-error {
  margin: 0.75rem 0 0;
  color: #d69e54;
  font-size: 0.85rem;
}
```

- [ ] **Step 3: Update the confirm lede to the sent state**

Replace the Task 4 lede with:

```tsx
              <p className="bw-confirm-lede" data-bw-item>
                Your request is on its way. Aaron will reply by email to confirm the time and
                current rates.
              </p>
```

- [ ] **Step 4: Verify end-to-end** — real submission with test data reaches the Formspree dashboard/inbox; error path verified by temporarily pointing `FORMSPREE_ENDPOINT` at an invalid ID (then reverting); keyboard submit works; `sending` state disables the button.

- [ ] **Step 5: Build, lint, commit**

```bash
npm run build && npm run lint && npm run typecheck
git add src/pages/Book.tsx src/pages/Book.css
git commit -m "feat(book): wire booking request submission via Formspree

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: Deploy and re-verify against the live site

**Why:** The audit was conducted against `https://karinrub.github.io/maui-lessons/`. The findings are only "fixed" when the live site passes the same checks.

**Files:** none (deploy + verification)

- [ ] **Step 1: Final local gate**

```bash
npm run build && npm run lint && npm run typecheck
git status
```
Expected: all green, clean tree.

- [ ] **Step 2: Push and watch the deploy**

```bash
git push origin main
gh run watch --exit-status
```
Expected: `deploy-pages.yml` workflow succeeds.

- [ ] **Step 3: Live re-verification (the audit's own method)**

Against `https://karinrub.github.io/maui-lessons/`, repeat the critical subset:
- Narrow viewport (390 px and 500 px) with `**/*.MP4` blocked: header appears ≤ 3.5 s, nav works, deck cards reachable — the audit's Critical finding, closed.
- Same narrow viewports with network throttled to "Slow 4G" and the video NOT blocked (the realistic case): page becomes navigable before the video finishes.
- DOM checks per route: exactly one `<h1>`; zero `<img>` missing `alt`; footer present.
- `/tourist-lessons`: location line near CTA; pre-scroll headline readable.
- `/faq`: pricing answer (with anchor if Task 11 landed).
- `/book`: wizard functional; if Task 12 landed, send one real test request and confirm receipt.
- Append all results to `docs/superpowers/plans/2026-07-12-audit-verification-log.md`, commit, push.

- [ ] **Step 4: Report** — summarize to the owner: which audit findings are closed, which remain blocked on their three facts (quotes, price, Formspree ID), and the audit's own re-verification recommendation that the mobile fix be confirmed once on a physical phone on cellular data (the only check this environment cannot fully perform).

---

## Self-review notes

- **Spec coverage:** every row of the audit's P0/P1/P2 tables and the §10/§13 recommendations maps to a task via the coverage table above. §13-1 → Tasks 2/7/13; §13-2 → Tasks 3/10 + location already shipped; §13-3 → Task 7 (verify, already fixed); §13-4 → Task 7; §13-5 → Task 7 (already fixed, verify). "What not to change" (§14) is encoded in Global Constraints.
- **Deliberately not done:** audit §12 P2 "shorten About horizontal timeline" — the About track's travel distance is structurally coupled to panel width and the hand-rolled Lenis snap targets (`AaronStorySections.tsx:118-241`); shortening it means desynchronizing scrub vs. snap for a subjective pacing gain on the page the audit says to protect. The deck trim (Task 6) delivers the pacing win safely. This is recorded so the decision is visible, not forgotten.
- **Type consistency:** Task 10 fills exactly the `MEET_AARON_VOICE` / `vacationVoices` shapes Task 3 defines; Task 12 uses the form field names already in the committed markup.

# Functional QA Report — Maui Lessons (Desktop)
Live site: https://karinrub.github.io/maui-lessons/ · Reviewed 2026-07-20 · Viewport: 1440×900 desktop Chrome

Scope: load behavior, interactive elements, animation/scroll logic, and stability only. Visual design and aesthetics are out of scope per request; any "legibility" notes below are flagged as functional contrast/readability issues, not style critique.

---

## Home (/)

**Page URL:** https://karinrub.github.io/maui-lessons/

**Load issues:**
- The hero background video never issues a network request. Confirmed across multiple fresh reloads and ~15+ seconds of dwell time — the hero remains a static poster frame indefinitely. No console errors are thrown (silent failure, not a caught exception). The documented 3-second stall-fallback behavior itself works correctly: the tagline, arch scrub, and deck-pin scroll sequence all still activate and function normally, but the actual video element never attempts to load in this environment.
- No console errors, no failed asset requests (all images/fonts returned 200).
npm
**Interaction issues:**
- Hamburger menu → full-screen nav overlay: opens and closes correctly. Escape key closes the overlay and correctly restores keyboard focus to the hamburger button (visible focus ring). Clicking a nav item ("About") navigates correctly once the overlay is fully open.
- On a repeat open (second time toggling the menu in the same session), the overlay's reveal transition took noticeably longer than the first open — a screenshot taken 1.5s after the click showed almost the entire viewport still showing the underlying hero page, with only a small sliver of the dark gradient overlay and close icon visible in the top-left corner. It did resolve to a fully-opened overlay shortly after, but the timing was inconsistent between the first and second open.
- Deck CTAs ("Book This Experience") render correctly per card; not clicked directly on this page but confirmed working via the identical CTA pattern on other pages.

**Animation/scroll issues:**
- Pinned tagline/arch scrub renders and animates smoothly on scroll.
- Three-card stacked deck (Ukulele → Guitar → Group Experience) pin-and-swap transitions correctly, including image crossfade per card and the "01/03 → 03/03" counter.
- MeetAaron stats reveal and Finale CTA/footer band scroll in without jank.

**Overall stability rating: Minor Issues**
(Silent, permanent hero-video load failure; inconsistent nav-overlay open timing on repeat toggles.)

---

## Vacation Lessons (/tourist-lessons)

**Page URL:** https://karinrub.github.io/maui-lessons/tourist-lessons

**Load issues:**
- Clean load, no console errors, no broken images.
- Network log shows a duplicate request to the trailing-slash variant of the URL (`/tourist-lessons/`) that remains in a "pending" state indefinitely after the initial navigation. It does not appear to block rendering or functionality, but it's an unresolved/hanging entry worth a look (likely related to the GitHub Pages SPA routing fallback).

**Interaction issues:**
- "Book a Lesson" CTA at the bottom of the page correctly navigates to `/book`.
- "Read the FAQ" link is present and styled as a working link (not clicked directly in this pass).

**Animation/scroll issues:**
- Pinned hero image correctly shrinks into a framed inset as the user scrolls, with the headline fading in sync; no stutter between captured frames.
- The three numbered story beats (01–03) and the closing "long after the tan fades" section scroll in cleanly.
- Functional legibility issue: the fixed header's "AARON GRZANICH" wordmark renders at very low contrast directly over the page's sage-green sections and photo collage, with no visible masking/veil behind it — at points it is nearly unreadable against the background (confirmed via close-up capture). This same low-contrast rendering was visible over both the green section and the dark ink-colored footer section.

**Overall stability rating: Minor Issues**
(Header wordmark legibility over certain sections; unresolved pending network request.)

---

## Ongoing Lessons (/weekly-lessons)

**Page URL:** https://karinrub.github.io/maui-lessons/weekly-lessons

**Load issues:** None observed. Clean load, no console errors, no failed requests.

**Interaction issues:**
- "Find Your Starting Point" tab control (Beginner/Intermediate/Advanced): clicking each tab instantly swaps the panel content with a correct crossfade, and the ghost-numeral watermark (01/02/03) updates correctly per tab.
- Multiple "Book a Lesson" CTAs present (Pathways panel, Month Rhythm close, page finale) — all rendered and styled consistently; not all clicked individually in this pass but the CTA component is identical to the one verified elsewhere.

**Animation/scroll issues:**
- The horizontally-pinned three-chapter "how it works" journey (circular photo-lens reveal per chapter) transitioned correctly through all three chapters with accurate progress dots and no dropped frames in this pass.
- Month Rhythm's scroll-scrubbed spine line and gold week-4 dot rendered and animated correctly.

**Overall stability rating: Stable**

---

## About (/about)

**Page URL:** https://karinrub.github.io/maui-lessons/about

**Load issues:** None. Clean load, chapter 1 of 4 ("Meet Aaron") rendered immediately with the correct 01/04 progress indicator.

**Interaction issues:** None found. The horizontally-pinned chapter track advances correctly via normal vertical scroll input through all four chapters, and the "Book a Lesson" CTA on the final chapter renders correctly.

**Animation/scroll issues:**
- Bug: During scrolling through the chapter transitions, two separate instances of a full (or near-full) blank cream frame were observed — once during the chapter 1→2 transition and again around chapter 2→3/3→4 — where no chapter content was visible at all for a captured frame, before the next chapter's content rendered correctly on the following check. This runs counter to the documented design intent that chapter reveals are timed so "no blank frames show between chapters."
- This was observed under fairly fast, discontinuous scroll input (multiple scroll-wheel ticks issued in quick succession). It is not confirmed whether a normal, continuous human trackpad scroll at typical speed would reproduce the same blank gap — this would be worth a manual pass to confirm, since the severity depends heavily on scroll speed/method.

**Overall stability rating: Minor Issues**
(Transient blank frames observed during fast scrolling through chapter transitions; unconfirmed at normal scroll speed.)

---

## FAQ (/faq)

**Page URL:** https://karinrub.github.io/maui-lessons/faq

**Load issues:**
- Bug: The page's main heading ("Good questions, honest answers.") and its accompanying decorative ring graphic load in a stuck, near-invisible low-opacity state and do not complete their entrance animation on their own. Confirmed via page-text extraction that the heading text is present in the DOM (so it's not literally missing), but it remains visually illegible for 5+ seconds of dwell time with zero user interaction. A very small scroll nudge (2 ticks down, then back up) is enough to trigger the heading and ring to render at full opacity/position. A visitor who lands directly on this page and doesn't scroll would see a large, apparently empty gap where the page's main heading should be.
- No console errors accompany this; it's a silent animation-state issue, not a script error.

**Interaction issues:**
- Accordion works correctly: clicking a collapsed question expands it (icon toggles + → ×) and collapses whichever question was previously open — single-open accordion behavior confirmed.
- The sticky "In This Guide" section nav (01 Getting Started / 02 The Lessons / 03 Booking) correctly highlights the active section as the user scrolls past each one.

**Animation/scroll issues:**
- Aside from the stuck hero heading, section content rendered correctly once scrolled to at normal pace. Fast/discontinuous scrolling produced similar transient blank-looking gaps to those seen on the About page, though the underlying content was always confirmed present and rendered fine on a follow-up check.

**Overall stability rating: Minor Issues**
(Stuck/invisible hero heading on load is the most visible issue on the site in this pass — first-time visitors who don't scroll would see a broken-looking page.)

---

## Book (/book)

**Page URL:** https://karinrub.github.io/maui-lessons/book

**Load issues:** None. Clean load, correct step-1 render ("Choose your experience").

**Interaction issues:**
- Full five-step wizard tested end-to-end: Lesson Type → Participants → Date & Time → Contact → Confirmation.
- Calendar: past dates (July 1–19, 2026) are correctly disabled/greyed out; "today" (July 20, per system date) is correctly outlined; date selection and month navigation (July → August) both work correctly; time-slot selection updates correctly with clear selected-state styling.
- Contact form fields (Name, Email, Phone, Message) accept input correctly.
- Submission is a documented no-op: clicking "Send booking request" advances to the Confirmation step with an accurate summary of the selections made, but fires no network request at all (confirmed via network log) and produces no console errors — consistent with the project's own documentation that booking submission isn't wired to a backend yet.
- Bug: after submitting, the page transitions to the Confirmation step but does not scroll to the top of the new content. The user is left at whatever scroll position they were at on the Contact step (in this test, at the page footer), so the "Request received" confirmation and booking summary are not visible until the user manually scrolls back up — this could easily be misread as "nothing happened" after clicking the primary call-to-action.

**Animation/scroll issues:**
- The ghost-numeral watermark correctly updates per step (confirmed 1 through 4 via close-up capture).
- Progress rail (Lesson Type / Date & Time / Booking Summary / Confirmation) updates correctly and in sync with the visible step.

**Overall stability rating: Minor Issues**
(Missing scroll-to-top after form submission is the one functional gap; everything else in the wizard performed correctly.)

---

## Cross-Page Patterns Worth Flagging

A few observations recurred across more than one page and may share a root cause:

- **Header wordmark legibility over colored sections** was only conclusively confirmed on Vacation Lessons, but the same fixed-header component is shared sitewide — worth spot-checking Ongoing Lessons and About's sage/green sections too.
- **Blank-looking frames under fast scroll** appeared on both About and FAQ, both of which use scroll-triggered entrance animations with a play-once threshold. This suggests the shared animation pattern (elements start at `opacity: 0` and animate in only once a ScrollTrigger threshold is crossed) may not always fire reliably when the scroll position changes quickly or discontinuously, rather than being two unrelated bugs.
- **Nothing crashed, froze, or caused an unexpected reload anywhere in this pass.** All instability found was visual/animation-state related (stuck opacity, missed scroll-to-top, slow transition), not functional breakage of navigation, forms, or core page logic.

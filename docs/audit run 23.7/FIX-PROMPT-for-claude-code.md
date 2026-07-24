# Prompt for Claude Code — implement all desktop audit fixes

Copy everything in the block below into Claude Code from the repo root.

---

You are working in the Maui Lessons repo (Vite + React + TS + GSAP/ScrollTrigger + Lenis). Read `CLAUDE.md` first and follow its Agent Rules (surgical changes, inspect before editing, never edit `dist/`, run `npm run build` and `npm run lint` after meaningful changes, test both normal motion and `prefers-reduced-motion`).

## Your task
Implement **every fix** documented in the audit set in `docs/audit run 23.7/`. Start by reading these files in full and treat them as the source of truth:
- `desktop-release-readiness.md`  ← master backlog + implementation order (authoritative)
- `hero-audit.md`, `ongoing-lessons-audit.md`, `faq-audit.md`, `booking-audit.md`, `vacation-lessons-audit.md`

Do not invent new work, add features, add FAQ questions, change the creative direction/palette/type, or touch the authentic student photos. Only implement what the audits specify.

## Do the work in this order (from the report's Recommended Implementation Order)

**1. C0a — Home card deck body copy is truncated.**
The "Choose your experience" cards clip their description (e.g. the Ukulele card shows only "…your pace, your" then the CTA). Inspect the card component (likely `src/components/home/StackedServicesDeck.tsx` + its CSS) and give the card body enough height / remove the clip so the full description renders above the CTA. Verify all three cards show their complete copy.

**2. C0b — Ongoing Lessons progress-graph line starts in the wrong position.**
On the "How it develops" rising graph (likely `src/components/weekly/WeeklyJourneySections.tsx`), the gold line renders from a mid-point instead of drawing up from the graph's origin. Fix the line's initial state/path so the draw **begins at the graph origin (left/low) and animates upward** to the final point, with the milestone dots aligned to the drawn path throughout. Test forward and reverse scroll and reduced-motion.

**3. C0c — Hero video must ALWAYS be shown (owner requirement).**
Do **not** remove the video. In the hero (likely `src/components/home/OpeningScene.tsx`): (a) confirm reliable autoplay attributes (`autoplay muted playsinline preload`); (b) ensure the poster only bridges until the video is ready and then the video reliably takes over — never a permanent poster substitution; (c) don't gate the hero reveal on the full video so there's no blank-cream open (poster paints immediately, video fades in when ready); (d) the source `assets/aaron-ukelele-vid-*.MP4` is ~14.3 MB uncompressed — compress it to a few MB (keep H.264 .MP4) so it reliably loads before the user scrolls past. If `ffmpeg` isn't available in your environment, do the code/markup changes and leave a clear note + the exact `ffmpeg` command for the owner to run.

**4. C1 — Scroll-reveal leaves content invisible (FAQ + Booking). This is the biggest fix.**
Root cause: content is set to `opacity:0` and only revealed by a scroll-driven trigger, so it stays invisible when it appears **without** a scroll event.
- FAQ (`src/components/faq/FaqSections.tsx`): question rows measure `opacity 0` while in the viewport → the answers never show on scroll.
- Booking (`src/pages/Book.tsx`, `src/components/booking/BookingCalendar.tsx`): every step transition (pace/size → date & time → contact form → the post-submit "Request received" confirmation) renders blank until a manual scroll; worst after submit (no confirmation shown).
Fix the reveal **pattern**, establishing the rule: *anything that can become visible without a scroll must default to visible; scroll animation may enhance but must never gate presence.* Practically: default this content to `opacity:1` (or fire+resolve the reveal on mount / on step change / `ScrollTrigger.refresh()`), keeping any entrance fade additive and guaranteed to resolve without a scroll.

**5. H2 — Hero tagline contrast.** The hero H1 is cream over a pale sky with no scrim; the first line is hard to read. Add a subtle localized scrim / soft text-shadow / weight nudge — enough to be legible without darkening the airy look. Do this in the same hero session as C0a/C0c.

**6. M1 — Copy pass (two edits).**
- Ongoing: the still photo captioned "Silent lesson footage" → replace with a plain description consistent with its siblings (e.g. "A lesson in progress").
- FAQ "How do I book?" answer: remove the internal-state clause "…once booking delivery is connected" (end at "…choose a date and time." or use a neutral line like "Aaron will confirm your lesson directly.").

**7. L1 (optional, low priority) — Wordmark legibility.** "AARON GRZANICH" is near-invisible over bright heroes on first paint. Slightly increase its contrast/weight at the top of the hero, or extend the existing backdrop veil to the initial state. Only if quick.

## Constraints / guardrails
- Prefer minimal, surgical diffs. Inspect each file before editing; don't assume structure.
- Do not break `prefers-reduced-motion` (content must be fully visible and static there).
- Don't change unrelated sections (Vacation Lessons is complete; leave it alone). Don't edit `dist/`.
- Booking submission routing is a separate, planned task — do **not** wire it up here; just make sure the flow's steps and confirmation are visible.

## Verification (must pass before you call it done)
1. `npm run build`, `npm run lint`, `npm run typecheck` all pass. Run `npm run prerender` and `npm run check:seo` if present.
2. Manually verify each fix at a desktop width (~1440–1600px), both normal and reduced-motion:
   - C0a: all three Home cards show full body copy.
   - C0b: graph line draws up from the start; dots aligned; reverses cleanly.
   - C0c: hero video autoplays and is visible; no blank-cream hold; poster→video handoff is clean.
   - C1: scroll the FAQ — every question is visible in all five categories and the accordion opens; run the full booking flow (type → pace → date → time → contact → submit) and confirm **no step and not the confirmation is ever blank**, including immediately after "Send booking request".
   - H2/M1/L1 as described.
3. Give me a short summary of what changed per item, any file you couldn't fully fix (e.g. video compression if `ffmpeg` was unavailable) with the exact command to finish it, and confirmation that build/lint/typecheck pass.

Work through all items, then report back.

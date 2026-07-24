# Prompt for Claude Code — implement mobile audit fixes

Copy everything in the block below into Claude Code from the repo root.

---

You are working in the Maui Lessons repo (Vite + React + TS + GSAP/ScrollTrigger + Lenis). Read `CLAUDE.md` first and follow its Agent Rules (surgical changes, inspect before editing, never edit `dist/`, run `npm run build` and `npm run lint` after meaningful changes, test both normal motion and `prefers-reduced-motion`).

## Your task

Implement the fixes documented in `docs/audit run 23.7/mobile-release-certification-and-design-audit.md`. Read it in full first — it's the source of truth, including the exact evidence behind each item. Do not invent new work, redesign anything, or touch sections the audit didn't flag (desktop-complete pages — Vacation Lessons, Ongoing Lessons content — are out of scope here unless explicitly listed below).

## Do the work in this order

**1. C1 — About page: chapter track can strand on a blank, non-chapter-aligned frame.**
In `src/components/about/AaronStorySections.tsx`, the horizontal chapter-snap logic can leave the pinned track parked at a position that doesn't correspond to any chapter's snap target if scroll input reverses direction mid-travel (e.g. scroll down a little, then back up). The result is a fully blank screen with no chapter visible and no automatic recovery. Fix so the track is **structurally unable to rest in a non-chapter position** — e.g. always resolve to the nearest valid chapter snap target when scroll input pauses or reverses, regardless of how far mid-travel it is. Preserve the existing "direction-biased, never yanks backward" feel described in `CLAUDE.md` — don't make it snap so aggressively that it undermines the smooth glide that's already working. Test by: scrolling partway into a chapter transition, reversing direction, and stopping — the view must always land on a fully-rendered chapter, never a blank gap. Test at both a real narrow viewport (via devtools device toolbar, since this environment's own audit tooling could not force one) and normal desktop width, and with `prefers-reduced-motion`.

**2. C2 — Hero video never loads.**
Confirmed via live network capture: the Home hero video issues zero network requests on load; only the poster shows. The source file (`assets/videos/aaron-ukelele-vid.MP4`) is still the original 14.3 MB uncompressed asset. `ffmpeg` is available in this environment (unlike a prior agent's environment, per `CLAUDE.md`'s "Not implemented" note — verify with `which ffmpeg` first).
- Compress the video (keep `.MP4`/H.264) to a few MB.
- In `src/components/home/OpeningScene.tsx`, verify `autoplay muted playsinline preload` are all correctly applied and that nothing in the load/reveal logic is preventing the browser from ever issuing the request (check `autoplayAttemptedRef`, the stall-fallback timing, and anything gating `video.load()`/`video.play()`).
- After the fix, verify with a live network capture (not just visual inspection) that a request to the video asset actually fires on page load, and that the video visibly takes over from the poster.

**3. H2 — Touch target sizing.**
- `.menu-toggle` in `src/index.css` is `48px × 40px`. Increase the height to at least 44px (adjust the icon-bar spacing inside it proportionally so it doesn't look oversized).
- `.bwc-day` in `src/pages/Book.css` (booking calendar day cells) has no mobile-specific size floor — it's purely `aspect-ratio: 1` inside a 7-column grid. Check the actual rendered cell size at a 375px viewport (iPhone SE class); if it's under ~44px, add a `max-width:760px` rule that guarantees a minimum comfortable cell size, adjusting the grid gap/container padding as needed so it still fits 7 columns without horizontal scroll.

**4. M1 — FAQ hero heading takes ~5–6 seconds to appear on load.**
In `src/components/faq/FaqSections.tsx`, the page's hero title-line reveal (separate from the already-fixed question-row reveal) resolves on its own after several seconds with no interaction — confirmed via live timing (invisible at 3s, fully visible at 6s). Check whether this delay is intentional pacing or an unintended side effect of the current timeline/stall-fallback setup; if unintentional, shorten it so the headline appears within roughly a second of arrival, consistent with the Book page's equivalent entrance (which resolves in ~1s). Keep the `immediateRender:false` + stall-fallback safety pattern already in place — just tighten the timing, don't remove the safety net.

**5. M2 — Book page hero headline is placeholder copy.**
`src/pages/Book.tsx` line ~52: `const ENTRANCE_HEADLINE = "let's set up your lesson"` is preceded by the comment `// Placeholder-friendly line only — real business voice TBD.` Either confirm this copy is final and remove the stale comment, or replace it with a headline that matches the considered, specific voice used elsewhere (About, FAQ, Vacation). Do not invent new business facts or pricing — this is a copy/tone pass only, and if you're not confident about the right replacement line, leave the existing copy in place and just remove the misleading TBD comment.

**6. M3 — Wordmark contrast over bright hero imagery (mobile is identical to desktop's L1).**
Same fix as desktop's L1 item, if not already done in that pass: "AARON GRZANICH" is low-contrast over the Home/Vacation/About hero photography. A subtle contrast/weight nudge or extending the existing scroll-veil to the pre-scroll state resolves it identically on both. Skip this step if the desktop pass already shipped it — check `git log` for an L1-related commit before doing this work twice.

## Explicitly out of scope for this pass

- **H1 (real device QA)** is not a code fix — it's a process gap (this environment cannot force true phone-width viewports or touch input). Don't try to "fix" it; just flag in your summary that a physical-device pass is still recommended before final sign-off.
- **L1 (tablet/landscape 761–900px breakpoint gap)** — explicitly scoped as a design decision the owner hasn't asked for. Don't add a tablet breakpoint unless asked.
- **L2 (Ongoing Lessons prerender/H1/landmark issues)** — already tracked in `docs/ongoing-lessons-handoff.md`; don't duplicate that work here.

## Constraints / guardrails

- Prefer minimal, surgical diffs. Inspect each file before editing; don't assume structure.
- Don't break `prefers-reduced-motion` — content must stay fully visible and static there.
- Don't touch Vacation Lessons or other desktop-complete sections.
- Don't edit `dist/`.

## Verification (must pass before you call it done)

1. `npm run build`, `npm run lint`, `npm run typecheck` all pass.
2. C1: manually reproduce the original bug pattern (scroll into a chapter transition, reverse, stop) at a real narrow viewport via devtools device emulation — confirm it now always resolves to a fully-rendered chapter. Test forward, backward, and interrupted-mid-travel scrolling.
3. C2: confirm via a live network-request capture (devtools Network tab) that the video request fires and the video plays, at both desktop and mobile emulated widths.
4. H2: confirm menu button and calendar day cells meet a ~44px minimum at a 375px emulated viewport.
5. M1: confirm the FAQ headline is visible within ~1 second of navigation, no scroll required.
6. M2/M3 as described.
7. Give a short summary of what changed per item, anything you couldn't fully verify (e.g. if devtools device emulation isn't available in your environment either — note that explicitly rather than guessing), and confirmation that build/lint/typecheck pass.

Work through all items, then report back.

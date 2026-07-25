Fix the remaining mobile issues documented in `docs/audit run 25.7/mobile-device-emulation-audit.md`. Read that report in full first — it has exact evidence, screenshots referenced by name, and severity ratings. Also read `CLAUDE.md`'s newest banner entry (2026-07-25, "fourth mobile pass") for the short version and cross-references.

Work through these in order:

## 1. Required — fix the fixed-header wordmark colliding with body headings (R1)

The "AARON GRZANICH" wordmark in the fixed header (`GlobalNavigation.tsx` / `NavGradient.tsx`, veil styling in `index.css` under `.site-header::before` / `.is-scrolled`) overlaps section headings illegibly whenever a heading's bounding box scrolls into the header's vertical band. This was confirmed on real Playwright device emulation on both iPhone SE (320px portrait) and iPad Air (landscape) — two different layouts, same bug — so it's a real CSS/positioning issue, not a rendering artifact.

The existing `is-scrolled` masked backdrop-blur veil already tries to solve this but isn't sufficient against certain heading/background combinations. Don't just make the veil heavier everywhere (risks looking heavy-handed where it already works fine). Instead, prefer a targeted fix: detect when a heading (or any large text block) is actually intersecting the header's rect — e.g. via `IntersectionObserver` on section headings, or a scroll-position check against known section boundaries — and fade/hide the wordmark specifically during that overlap, rather than driving it off a uniform scroll-distance trigger.

Verify the fix by reproducing the original repro conditions: scroll on the FAQ page at a narrow phone width (~320-375px) past "WHY LEARN WITH AARON", and on iPad Air landscape width past the About page's "A lesson shaped around you." heading. Both should no longer show overlapping text.

## 2. Recommended — confirm the video console-noise isn't a real playback bug on production (M1)

Every route logs two `net::ERR_EMPTY_RESPONSE` console errors tied to the two video assets (`aaron-ukelele-vid`, `aaron-weekly-section`). Local testing showed the local server serves both files completely and correctly via direct `curl -H "Range: ..."` requests, so this is most likely a benign Chromium `<video>` probe-request-cancellation pattern, not a broken asset. But this was never confirmed against the actual live `github.io` CDN specifically (the audit's environment couldn't reach that domain).

Check this against the deployed production site: load each route in a real browser with devtools open, watch the Network tab for the video requests, and confirm the video element actually reaches a playing/ready state (`readyState`, `currentTime` advancing) rather than just checking for console noise. If it's confirmed benign, note that in `CLAUDE.md`'s "Known Risks" section so future passes don't re-flag it. If it turns out to be a real production-only failure, treat it as a Required fix tied to the existing hero-video tracking already in `CLAUDE.md`.

## 3. Recommended — measure the real tap area of footer/nav text links (M2)

`CLAUDE.md` claims footer and nav text links have an invisible `::after` hit-area extension to ~44px, but the audit's own attempt to verify this (tapping just outside a link's visible box) was inconclusive — the tap landed on an unrelated adjacent element rather than proving or disproving the extension. Confirm directly: inspect the actual CSS for the relevant link components (likely `SiteFooter.tsx` / its CSS, and any shared nav-link styles) for a `::after` or padding-based hit-area rule, and if one exists, verify via computed styles or a scoped Playwright tap test that it actually produces a ≥44px tappable region. Report findings either way — don't leave this ambiguous in the docs.

## 4. Not yet re-verified — do NOT mark this resolved without re-testing it

The 2026-07-24 mobile audit (`docs/audit run 23.7/mobile-release-certification-and-design-audit.md`) found a Critical bug: on the About page's horizontally-pinned chapter track, scrolling down a little and then back up (a small reversing scroll gesture) can strand the track on a blank, non-chapter-aligned frame with no automatic recovery. This was never re-tested in the 2026-07-25 passes. Before doing anything else, reproduce this using real Playwright device emulation (now working in this environment — see the setup notes in `docs/audit run 25.7/mobile-device-emulation-audit.md` Section 0 if you need to rebuild that harness) at a real narrow phone width, with a down-then-up scroll sequence on `/about`. If it reproduces, fix the chapter-track state machine so it always settles on a valid chapter position — e.g. clamp resting positions to only ever be valid snap targets, or force a settle-to-nearest-chapter when scroll input pauses mid-travel — while preserving the "direction-biased, never yanks backward" feel `CLAUDE.md` describes as intentional. This is higher severity than the header/wordmark issue above; if you have to prioritize, fix this first.

## General notes

- Read the actual component/CSS files before editing — don't guess at class names or structure from the audit report alone.
- Keep changes minimal and scoped to each fix; this is a polish/bugfix pass, not a redesign.
- Run `npm run build`, `npm run lint`, and `npm run typecheck` after changes.
- Re-verify each fix with real device-width testing (Playwright device emulation, per the audit's methodology) rather than a resized desktop browser — a resized window at ~500px is not sufficient evidence for mobile-specific layout fixes, as established by this project's own audit history.
- Update `CLAUDE.md` with a dated note on what was fixed and how it was verified, following the existing banner format at the top of the file.

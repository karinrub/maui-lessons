# Mobile Device-Emulation Audit

Project: Maui Lessons (Aaron Grzanich)
Scope: Mobile and tablet — real Playwright device emulation (viewport, device pixel ratio, touch input, user agent) across all six routes.
Date: 2026-07-25
Baseline: `docs/audit run 23.7/mobile-release-certification-and-design-audit.md` (2026-07-24) is the prior mobile audit. That pass could not get narrower than a ~500 CSS px resized desktop window and said so explicitly. This pass replaces that constraint with true device emulation and either confirms or revises its findings accordingly.
Also consulted: `CLAUDE.md`, `docs/ongoing-lessons-handoff.md`.

---

## 0. Methodology — read this first

**What "device emulation" means here, concretely.** Every finding below was produced by Playwright driving real Chromium with `playwright-core`'s built-in device descriptors — the same mechanism Playwright's own device-emulation feature uses. Each descriptor sets the actual CSS viewport size, `devicePixelRatio`, `isMobile`/`hasTouch` flags (so the site's touch-vs-pointer code paths run, not a desktop mouse simulation), and the real device `userAgent` string. Taps were sent as real touch events (`page.tap()` / `page.touchscreen.tap()`), not mouse clicks. This is a materially different and more accurate method than resizing a desktop browser window, which was the prior pass's acknowledged limitation.

Devices covered, all via Playwright's official device presets except where noted:

| Device | Viewport (CSS px) | DPR | Orientation(s) tested |
|---|---|---|---|
| iPhone SE | 320×568 | 2 | portrait, landscape |
| iPhone 13 (stands in for 12/13/14, identical viewport) | 390×664 | 3 | portrait |
| iPhone 14 Pro Max | 430×740 | 3 | portrait |
| iPad Mini | 768×1024 | 2 | portrait, landscape |
| iPad Air | 820×1180 (custom profile — no exact Playwright preset exists; built from `iPad Pro 11`'s touch/UA profile with the real iPad Air viewport) | 2 | portrait, landscape |
| Pixel 7 (Android) | 412×839 | 2.625 | portrait |
| Galaxy S24 (Android) | 360×780 | 3 | portrait |

Nine device/orientation combinations × all six routes = 54 page loads, each screenshotted at top, ~55% scroll, and full scroll-to-bottom (162 screenshots total), plus a console-error and horizontal-overflow check on every load. A further interaction pass exercised the hamburger nav overlay (real tap open/close), the FAQ page, and the Book wizard's first step on iPhone SE.

**Why this ran against a local build rather than the live URL.** This environment's outbound network policy allowlists specific domains for its own sandboxed shell process (npm, PyPI, git+github.com) but does **not** include `github.io` — confirmed by direct proxied requests to `karinrub.github.io` and several other `*.github.io` hosts, all rejected at the proxy with `403` before reaching the site, independent of any browser tooling. The site *is* reachable from the chat's own browser-control channel (a separate, less-restricted path used earlier in this conversation for the desktop-resize pass), but that channel has no device-emulation capability of its own — it can only resize a real window, floored at ~500px in this environment, with no DPR/UA/touch control. Neither gap could be closed by working around the other in isolation, so the two problems were solved separately and then combined:

1. **Chromium had a real missing runtime dependency, not just a missing install.** Playwright's own `chromium` browser was not present, and `npx playwright install --with-deps chromium` failed because this environment has no `sudo` (confirmed: `sudo` itself refuses to run under this sandbox's `no_new_privs` setting). Running `npx playwright install chromium` (no `--with-deps`) *did* successfully download the actual browser binary — the earlier appearance of a stalled download was this environment killing backgrounded processes between tool calls, not a real network failure. `ldd` on the resulting `chrome` binary showed exactly one missing shared library: `libXdamage.so.1`. Standard package-manager routes to get it were closed (`apt`/`apt-get download` for `arm64` all resolve to `ports.ubuntu.com`, which is not in this sandbox's proxy allowlist and returns `403`). The library was small enough to build from source: a websearch located real upstream mirrors (`github.com/openkylin/libxdamage`, `github.com/openkylin/libxfixes` for the one header dependency it needed that wasn't already on the system), both cloned successfully over `git` (which does reach `github.com`, unlike raw/codeload subdomains), compiled directly with `gcc` against the system's existing `libX11`/`libXext`, and dropped into a directory added to `LD_LIBRARY_PATH`. `ldd` afterward showed zero missing libraries, and Chromium launched cleanly. This means true Playwright/Chromium device emulation is now genuinely available in this environment going forward, not just simulated.
2. **The sandbox's shell network still couldn't reach the live site.** With Chromium working, `page.goto('https://karinrub.github.io/...')` failed outright (`ERR_TUNNEL_CONNECTION_FAILED`) for the domain-allowlist reason above. Rather than fall back to the live URL or silently substitute the resize-based method, this pass built and served **the exact same source that GitHub Pages deploys** — `npm install && npm run build && npm run preview` against a clean copy of this repository — and ran Playwright against `http://localhost:4173`, which bypasses the proxy entirely (confirmed via this sandbox's own `no_proxy` config). This is not the live CDN-served site, but it is the same compiled output from the same source tree, built with the project's own toolchain; the only meaningful difference from production is CDN/edge-caching behavior, which is out of scope for a design/layout/interaction audit. This is disclosed here rather than presented as if it were the live URL.

**What this pass did not verify.** Genuine touch/momentum-scroll physics (Playwright's `tap()` sends discrete touch events, not a physical finger's velocity curve), real device GPU rendering quirks, and true cellular network conditions are still not reproducible by any environment-based tool, including this one — that gap is orthogonal to the emulation-vs-resize question this pass was asked to close, and a physical-device pass remains valuable on its own terms. The hero-video console noise discussed in Cross-Site Issues below was investigated but not fully root-caused against the live CDN specifically (see X1).

---

## 1. Executive Summary

With true device emulation in place, the picture is both better and worse than the previous ~500px-resize pass suggested, in ways that matter.

**Better:** there is **no horizontal overflow on any of the 54 route/device combinations tested**, including at the narrowest real phone (iPhone SE, 320px) and across both tablet orientations. The hamburger nav overlay opens and closes correctly under a real touch tap, with clean full-screen presentation and no clipped or overlapping content, on iPhone SE. The hamburger's own touch target measures 48×44 CSS px — meeting the 44px guideline directly (this revises the prior audit's finding of a 40px-tall hamburger; either the component was already fixed since that pass, or that pass measured a different, non-canonical element — this pass measured the actual interactive `<a>`/button box directly at real device scale). The FAQ page's tablet-width layout (confirmed on iPad Mini and iPad Air, both orientations) is a **completely different, sidebar-based design** ("IN THIS GUIDE" with numbered sections 01–05) from the phone-width sticky-pill-tab layout — meaning the phone-specific FAQ sticky-rail defect described below is confirmed **not** to reach tablet widths at all.

**Worse, and now confirmed at real device resolution rather than inferred from a resized window:** the fixed header's "AARON GRZANICH" wordmark colliding with body headings is real and reproduces identically on true iPhone SE (320px, DPR 2) and on true iPad Air landscape (1180×820, DPR 2) — two devices with different DPR, different UA, different touch profiles, and in the tablet case, an entirely different page layout underneath it. That rules out the possibility that the earlier finding was an artifact of the resize tool; it is a real, CSS-driven collision that happens whenever a heading scrolls to the exact vertical band the fixed header occupies, regardless of device class. It is intermittent by design (only visible during the few hundred pixels of scroll where a heading passes under the header), which this pass's per-route "top/55%/bottom" screenshot sampling caught on some routes and devices and not others — consistent with, not contradicting, that mechanism.

Two items from the automated console-error capture warrant a measured read rather than an alarmed one. Every one of the 54 route loads logged exactly two `net::ERR_EMPTY_RESPONSE` console errors, later confirmed (via a `curl` request bypassing the browser entirely) to correspond to the site's two video assets, both of which the local preview server serves correctly and completely when requested with an explicit HTTP `Range` header outside the browser. This is a known, common Chromium behavior where a `<video>` element's initial probe request is superseded/cancelled once the element decides its real buffering strategy, and the cancellation is what surfaces as `ERR_EMPTY_RESPONSE` in the console — not necessarily evidence the video fails to display. This pass did not have time to confirm actual on-screen video playback frame-by-frame (only poster/first-frame state is visible in static screenshots), so this is reported as **observed and explained, not dismissed** — see X1.

**Would I certify this for production today?** The header/wordmark collision is confirmed real, cross-device, and was already flagged (at lower confidence) in both the 2026-07-24 and this pass's own preceding note — it should be fixed before this component is called "solved" on mobile. Nothing found in this pass is a hard blocker on the scale of the 2026-07-24 pass's About-page chapter-track stranding (which this pass did not re-attempt — see Section 6, Not Re-Verified), but the header collision is a real, now well-evidenced, cross-device polish gap that undercuts the site's own stated design intent (the `is-scrolled` masked veil exists specifically to prevent this).

---

## 2. Design Assessment

**Visual quality — strong and confirmed at real device pixel ratios.** Screenshots taken at 2×, 2.625×, and 3× device pixel ratios show crisp type rendering with no blurring or subpixel artifacts from the `clamp()`/`vw`-based type scale — this is a real risk area for sites with heavy fluid typography, and it holds up cleanly at every DPR tested. The recurring ghost-word/ghost-numeral motif (the oversized translucent "practice," FAQ's numbered chapter watermarks, About's chapter numerals) renders identically in proportion and legibility across all seven device profiles.

**Layout adaptivity — the FAQ page is a genuinely different design at tablet width, not a stretched phone layout.** This is worth calling out as a real strength: rather than the common anti-pattern of a mobile accordion simply given more horizontal room at tablet width, FAQ's tablet layout replaces the phone's horizontal sticky-tab category rail entirely with a persistent left-hand sidebar index ("IN THIS GUIDE," 01–05). This is real, deliberate, per-breakpoint design work, confirmed identically on both iPad Mini and iPad Air, both orientations.

**Craftsmanship gap — the header wordmark collision is a real, unaddressed edge case in an otherwise careful system.** The site already ships specific code (the `is-scrolled` masked backdrop-blur veil, per `CLAUDE.md`) to solve exactly this problem — legibility of the fixed wordmark against scrolling body content. That the collision still reproduces at real device resolution, on both a phone and a tablet, in portrait and landscape, means the existing mitigation is real but insufficient against certain background/heading combinations, not simply unimplemented. That distinction matters for how it should be fixed: this needs a stronger or more targeted version of the existing approach (e.g., fading the wordmark out specifically while a heading's bounding box intersects the header's, rather than a uniform scroll-position-based veil), not a first implementation from scratch.

---

## 3. Release Assessment

**Reliability.** The nav overlay's open/close cycle was verified with a real touch tap (not a mouse click) and produced a clean, fully-legible full-screen menu with no clipped links, on the narrowest phone profile tested (iPhone SE). No JavaScript exceptions (`pageerror`) were logged on any of the 54 route loads — only the two per-route video-related console errors discussed in X1.

**Touch interaction.** The hamburger button measures a real, device-scale 48×44 CSS px — at the 44px guideline. This pass did not conclusively verify the actual expanded tap area of the footer/nav text links beyond their visible box (an early attempt at this produced an inconclusive result — a tap placed deliberately outside a link's box landed on a different, adjacent element rather than proving or disproving a hit-area extension) — this specific question is left open rather than asserted either way; see Section 6.

**Responsiveness.** Zero horizontal overflow across all 54 route/device/orientation combinations, including the narrowest phone (iPhone SE, 320px) and both tablet orientations. This is the single most important quantitative result of this pass and directly contradicts nothing from the prior audit — both passes agree on this point, now with higher-confidence evidence.

**Production readiness.** Not blocked by anything found in this pass at the "cannot ship" level. The header-collision item is real and should be fixed, but it is a legibility/polish defect, not a broken-page or broken-flow defect — no route failed to load, no interactive element failed to respond, and no layout broke under real touch input in the interactions this pass exercised.

---

## 4. Strengths

Zero horizontal overflow at seven distinct device profiles spanning 320px to 1180px is a genuinely strong, now rigorously-tested result — this is exactly the class of bug that's easy to introduce and easy to miss without per-device testing, and this codebase does not have it. The FAQ page's tablet-specific sidebar layout is real, deliberate, breakpoint-aware design work rather than a stretched phone layout. The nav overlay is fully functional under real touch input with no clipping at the narrowest tested phone width. Type rendering holds up cleanly at every device pixel ratio tested (2×, 2.625×, 3×). The hamburger's touch target meets the 44px guideline when measured directly on the real interactive element at true device scale.

---

## 5. Cross-Site Issues

**X1 — Every route logs two `ERR_EMPTY_RESPONSE` console errors for the site's video assets; likely benign, not fully root-caused against production.** Confirmed via direct `curl` with an explicit `Range` header that the local server serves both video files (`aaron-ukelele-vid`, `aaron-weekly-section`) completely and correctly outside the browser — the files are not broken, missing, or misconfigured on the server side in this build. The errors reproduce even on a single page load with no route navigation (isolated by loading only `/` and waiting 6 seconds with no further interaction), which rules out "aborted by navigating away" as the explanation. The most likely remaining explanation is a known, common Chromium `<video>` element behavior: an initial small probing request gets superseded once the element settles on its real buffering strategy, and the superseded request is what logs as `ERR_EMPTY_RESPONSE`, while playback itself proceeds normally on the request that follows. This pass did not confirm actual video playback state frame-by-frame (screenshots only capture whatever frame — poster or live — is showing at capture time, and every "top" screenshot examined showed a normal-looking beach/portrait image with no visible broken-media icon or blank box). Given `CLAUDE.md`'s own history of tracking a related, more severe hero-video issue (video never issuing a network request at all, on the *live* site specifically), this finding should be treated as **worth a follow-up check against the actual production CDN** rather than dismissed outright — the local-build environment and the live GitHub Pages/CDN environment are not guaranteed to behave identically for large-media loading behavior specifically.

**X2 — The fixed-header wordmark/body-heading collision is real, reproducible, and cross-device — this is the same defect the 2026-07-24 and preceding same-day passes flagged, now confirmed at true device resolution.** Reproduced on real iPhone SE (320px, DPR 2, portrait) with "WHY LEARN WITH AARON" / FAQ sticky-tab content directly overlapping the wordmark, and independently on real iPad Air (1180×820 landscape, DPR 2) with "A lesson shaped around you." overlapping the wordmark — two different devices, two different DPRs, two different page layouts (phone sticky-tabs vs. tablet sidebar), same collision. This confirms the defect is driven by the header's own fixed positioning and background-veil logic relative to scroll position, not by anything specific to a resized desktop window. It is intermittent by nature — visible only in the scroll band where a heading's box intersects the header's — which is why it did not appear in every screenshot taken (e.g., not visible in the Pixel 7 "About" mid-scroll screenshot examined in this pass, where the header happened to sit over a photo/color-band section instead of directly over heading text at that scroll position).

**X3 — The phone-width FAQ sticky-tab-rail defect (previously reported as "never un-sticks") is confirmed scoped to phone widths only.** Both iPad Mini and iPad Air (both orientations) render FAQ with the sidebar layout described in Section 2, which has no sticky horizontal tab rail at all — there is nothing to un-stick at tablet width. This narrows, rather than expands, the previously-reported defect's blast radius; it should still be fixed at phone widths, but it is not a tablet-width concern.

---

## 6. Remaining Work

### Required

**R1. Fixed header wordmark collides with body headings during scroll, confirmed on real iPhone SE and real iPad Air (landscape).**
- *Observation:* "AARON GRZANICH" overlaps section headings directly and illegibly during the scroll band where a heading's bounding box intersects the fixed header's, on at least two real device profiles with different DPR, UA, and (in the tablet case) an entirely different underlying page layout.
- *Evidence:* Screenshots `iPhone_SE_portrait_faq_mid.png` (wordmark over "WHY LEARN WITH AARON" and the FAQ tab rail) and `iPad_Air_landscape_faq_mid.png` (wordmark over "A lesson shaped around you.") from this pass, both captured via real Playwright device emulation, not a resized window.
- *User impact:* Directly undercuts legibility of both the brand wordmark and the section heading at a predictable, recurring scroll position, on every route this pass sampled with a heading near the header band.
- *Counterargument:* The existing `is-scrolled` masked veil does work for many scroll positions and backgrounds — this is a real but bounded edge case (specific heading/background combinations), not a total failure of the mitigation.
- *Tradeoffs:* A stricter fix (e.g., detecting heading-header intersection directly and fading the wordmark specifically then, rather than on a uniform scroll-distance trigger) is more correct but more complex than the current approach; a blanket stronger veil is simpler but risks looking heavier-handed against backgrounds where the current veil already works fine.
- *Severity:* **Required.**

### Recommended

**M1. Confirm the two per-route `ERR_EMPTY_RESPONSE` console errors against the live production CDN specifically, not just this local build.**
- *Observation/Evidence:* See X1. Root cause is plausible (benign Chromium video-probe-cancellation behavior) but not confirmed against the actual GitHub Pages-served assets, which this pass's sandboxed network could not reach directly.
- *User impact:* If this reflects real playback failure on production (as a related, more severe version of this issue has previously been documented against the live site in `CLAUDE.md`), it would matter more on mobile bandwidth than desktop.
- *Counterargument:* The local reproduction strongly suggests a benign, request-level Chromium behavior rather than an application bug, since the server demonstrably serves the full asset correctly outside the browser.
- *Tradeoffs:* None to investigate further; this is a verification step, not a design change.
- *Severity:* **Recommended.**

**M2. Determine the real expanded tap area of footer/nav text links; this pass's own attempt to measure it was inconclusive.**
- *Observation:* A tap placed just outside one footer link's visible box landed on a different, adjacent element rather than confirming or ruling out an invisible hit-area extension (`CLAUDE.md` describes such an extension existing sitewide via `::after`).
- *User impact:* Unknown until measured properly — could be fine, could be a real gap between visible text size and actual tap-target size.
- *Counterargument:* The directly-measured hamburger button did meet the 44px guideline, suggesting the sitewide hit-area work described in `CLAUDE.md` is likely real; this item is about confirming it for text links specifically, not a sign anything is wrong.
- *Tradeoffs:* None — purely a verification gap.
- *Severity:* **Recommended.**

### Not Re-Verified This Pass

The 2026-07-24 audit's most serious finding — a reversing scroll gesture stranding the About page's horizontally-pinned chapter track on a blank frame — was not re-attempted here. That finding required a specific, deliberate down-then-up scroll sequence that this pass's route-sampling methodology (top/55%/bottom, one direction) does not reproduce by construction. Do not treat that finding as cleared by this report; it needs its own dedicated re-test, ideally now using this same real-device-emulation setup rather than a resized window, given this pass proved that setup is achievable in this environment.

---

## 7. Readiness Scores (1–10)

- **Device-width layout integrity — 9.** Zero overflow across seven real device profiles from 320px to 1180px, both orientations where tested. This is a rigorously-earned score, not an inferred one.
- **Touch interaction — 7.** What was tested (nav overlay, hamburger sizing) held up well under real touch input; the footer-link hit-area question remains genuinely open rather than resolved.
- **Cross-device consistency — 6.** Held down specifically by the header-collision defect being confirmed identical across two very different device classes — a real, evidenced, not-yet-fixed cross-cutting issue.
- **Verification confidence — 8.** Materially higher than the prior pass specifically because this one used real device emulation rather than a resized window; the remaining gap to a 9–10 is physical touch/momentum physics and the still-unconfirmed live-CDN video behavior.

---

## 8. Final Recommendation

**Fix R1 (header/wordmark collision) before calling mobile header legibility solved; nothing else found in this pass blocks release on its own.** The collision is real, now confirmed at true device resolution on two different device classes, and sits on top of a mitigation the codebase already invested in — this is squarely a "finish what was started" fix, not new design work. The two Recommended items (video console-error root cause against production, and footer-link tap-area measurement) are genuine open questions worth closing but do not rise to blocking severity on their own evidence. The 2026-07-24 About-page chapter-track finding remains the single highest-severity known issue on mobile and was not addressed by this pass; it should not be considered resolved.

---

## 9. Stopping Rule

Not yet — R1 is scoped and evidenced clearly enough to act on directly, and the About-page chapter-track re-test (now feasible with real device emulation, per this pass's own methodology work) is the next highest-value single test to run. Once R1 is fixed and the About-page interaction is re-verified under true device emulation, this environment's remaining gap (physical touch/momentum-scroll physics and true cellular conditions) is the same one every prior pass has named — that is the point at which further automated re-testing here would have diminishing returns relative to one real physical-device pass.

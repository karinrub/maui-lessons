# Hero Section — Final Audit

Project: Maui Lessons (Aaron Grzanich)
Route audited: Home `/` — Hero / opening scene only
Environment: Chromium, desktop, 1512 px wide
Date: 2026-07-23

Starting assumption (per protocol): **the Hero is production-ready.** The task below is only to find observable evidence that would justify rejecting that assumption.

> **Scope note / owner addendum (2026-07-23):** this audit covers the Home **opening scene** only. The owner separately flagged that the Home **"Choose your experience" card deck** (further down the Home page) truncates its card body copy so the service descriptions aren't fully readable — verified live. That is a **Required** fix but belongs to the card-deck section, not the opening scene; it is tracked as **C0a** in `desktop-release-readiness.md`.

---

## Phase 1 — Observation (no judgement)

Repeated fresh loads and scroll interactions were performed. Raw observations only:

- On a hard load, the viewport is a **flat cream/off-white field with nothing on it** — no wordmark, no hamburger, no spinner, no image — for roughly the first 2–3 seconds.
- The beach photograph then appears: Aaron holding a ukulele, walking the shoreline beneath a leaning palm, mountains and ocean behind. The hamburger icon (top-left) and a centred wordmark appear with it.
- At rest (scroll position 0) the hero shows **only the photograph** — no headline, tagline, subhead, button, or scroll cue is visible.
- The centred wordmark reads "AARON GRZANICH" but is extremely faint against the bright sky.
- On slow downward scroll, a handwritten-script line scrubs in over the image: "Learn your first ukulele song on one of the world's most beautiful beaches." The line is cream/near-white.
- On fast scroll the same line appears and the image stays pinned, then a sage-green arch rises from the bottom carrying the curved words "Choose your experience," handing off to the next section.
- Across several seconds at rest, the image shows **no perceptible motion** (no ambient video playback observed).

Instrumented checks (DOM / network, for factual grounding, not judgement):

- Hero `<video>` present: `assets/aaron-ukelele-vid-*.MP4`, `autoplay` + `muted`, `preload="auto"`, `poster = aaron-beach-1.jpg`.
- File is served correctly: HTTP 200, `video/mp4`, **14,315,052 bytes (~14.3 MB)**, `accept-ranges: bytes`.
- Across multiple loads and after a 6-second wait, the video stayed `readyState = 0` (HAVE_NOTHING), `paused = true`, `videoWidth = 0`, computed `opacity = 0`. No frame ever presented; the poster/static image is what is seen.
- Poster image `aaron-beach-1.jpg`: HTTP 200, 683 KB, `naturalWidth 2200`, `complete = true` (loads quickly).
- Exactly one `<h1>`, full text present and all word-spans at `opacity 1`. `<h1>` color = `rgb(250, 245, 238)` (warm cream). No text scrim behind it.

---

## Phase 2 — Experience

**The complete experience:** You arrive and, for a beat, see a blank warm-white screen. A wide, calm photograph then fades in — a man with a ukulele on an empty Maui beach under a bending palm, soft clouds, quiet ocean. Nothing else asks for attention: no headline, no button. As you begin to scroll, a light handwritten line drifts across the sky — "Learn your first ukulele song on one of the world's most beautiful beaches" — before the image gives way to a soft green arch and the site's first choice.

- **What is communicated:** place and mood first (Maui, ocean, ukulele, calm, unhurried); the literal offer ("learn your first ukulele song") arrives a moment later, on scroll.
- **Emotions that emerge:** calm, warmth, escape, ease. It feels like a vacation, not a sales page.
- **Story:** "Here is a beautiful, low-pressure place to pick up an instrument." The photo of Aaron himself quietly signals a real person/teacher.
- **Curiosity:** yes — the withheld text and the visible arch handoff both invite scrolling.
- **Trust:** partially. The imagery is credible and premium; but at rest the hero states nothing in words and the brand name is nearly invisible, so trust rests almost entirely on the photograph until the visitor scrolls.
- **Encourages scrolling:** yes — the pinned image, the scrubbing tagline, and the rising arch all pull the eye downward.

---

## Phase 3 — Evaluation (four perspectives)

**Customer.** The image is inviting and would make me keep scrolling. Trust is established more by mood than by information — at the first frame I am not told what this is or given anything to click, which is acceptable for an atmospheric hero but leans heavily on the photo. It makes lessons feel appealing/relaxed rather than urgent.

**Aaron (client delivery).** It represents him well — tasteful, calm, professional, and it puts his own face and instrument front and centre. I would be comfortable showing it, with the caveat that the opening blank moment and the faint tagline/wordmark are the parts I'd want tightened before calling it finished.

**Hiring manager (portfolio).** Craft is high: art direction, the scrub-linked tagline reveal, the pinned image, and the arch transition into the next section are well executed and original. Semantics are correct (single descriptive H1). Two details read as unfinished under scrutiny — low text/background contrast on the hero copy and the multi-second blank opening — which a senior reviewer would notice. Net: it strengthens a portfolio, and would strengthen it more with a small contrast/loading pass.

**Senior design lead.**
- *Objective:* (a) 2–3 s blank-cream opening before any content; (b) hero copy is cream over a pale sky with no scrim, producing weak legibility; (c) a 14.3 MB uncompressed video that did not present in testing.
- *Subjective alternatives:* withholding the tagline until scroll, and the script typeface, are valid creative choices, not defects.
- *Preference:* whether a scroll cue "should" exist is taste; its absence is not a fault given the arch already invites scrolling.

---

## Phase 4 — Validation (arguing against each issue)

- **Blank-cream opening.** Counter-argument: it could be an intentional intro fade, and part of the delay might be the automation tab throttling media. Rebuttal: the poster image is only 683 KB and loads instantly, yet the screen stays blank ~2–3 s across every fresh load — the reveal is being held (gated on the heavy hero media, with a fallback timer), so a real first-time visitor does experience a blank hold. **Valid**, with a note that exact duration varies by connection.
- **Low-contrast hero copy.** Counter-argument: the line is atmospheric/emotional, the brand is deliberately soft, and the photo already conveys the offer. Rebuttal: this line is the hero's *only* verbal message and the semantic H1; cream text over a pale cloudy sky with no scrim is measurably low-contrast (H1 color `rgb(250,245,238)`), and the first line in particular is hard to read at a glance. Softness is intended; illegibility of the primary message is not. **Valid.**
- **14.3 MB non-playing video.** Counter-argument: `readyState 0` may be caused by the automated browser deprioritising/throttling background media rather than a genuine failure, so real users might see it play. Rebuttal I can stand behind: I cannot fully isolate playback in this environment, so I will not claim the video "never plays for users." What is *not* environment-dependent is that the asset is 14.3 MB and uncompressed, which is objectively heavy for a hero video and is the likely cause of the gated blank load. **Partially valid** — reframed as an asset-weight/reliability issue rather than a confirmed playback failure.
- **Faint wordmark.** Counter-argument: the hamburger provides navigation, and the nav overlay + sections carry the brand clearly; the wordmark is decorative here and a blur veil helps once scrolled. Rebuttal: it is still the business name rendered near-invisibly on first paint. Real but minor. **Valid, low.**

---

## Phase 5 — Tradeoffs

- **Improving copy contrast** (soft radial scrim behind the text, a small text-shadow, or slightly heavier weight): risk of dulling the airy, light aesthetic. Must be done subtly to preserve the calm look — a localized scrim behind the words is lower-risk than darkening the whole image.
- **Removing/short-circuiting the load gate** so the poster shows immediately: risk of a visible image→video pop if the video later loads. Compressing the video (or dropping it in favour of the poster) is the cleaner path and avoids the pop.
- **Compressing the video:** essentially no downside at sensible quality; only cost is the re-encode step.
- **Darkening the wordmark:** trivial; only risk is making the deliberately-minimal header feel slightly heavier.

---

## Recommendations

### R1 — Hero copy contrast
- **Observation:** The hero tagline / H1 is cream script over a pale, cloudy sky with no scrim; the first line is hard to read.
- **Evidence:** Verified visually (zoomed capture of the revealed line) and in the DOM — `<h1>` color `rgb(250,245,238)` on a light-sky background, no text-shadow or scrim element.
- **Impact:** Storytelling and clarity. This line is the hero's only verbal message; if it is not comfortably readable, the value proposition is weakened. Affects customers and portfolio polish.
- **Severity:** **Recommended**
- **Recommendation (smallest change):** Add a subtle localized scrim or soft text-shadow behind the tagline (or nudge its weight/opacity up) — enough to clear a legibility bar without darkening the overall image.

### R2 — Hero video must always be shown (owner requirement) + heavy asset / blank-cream load
- **Owner clarification (2026-07-23):** the hero video **is an intended, important part of the hero and plays reliably for the owner.** It must **always be shown** — it is not optional and must not be dropped in favour of the poster. The poster is a *fallback for while the video loads*, not a replacement.
- **Observation:** In the automated audit environment the video did not reach a playable state (`readyState 0` after 6 s) and only the poster showed; the owner confirms it plays for them, so the non-playback was most likely the automated browser throttling media (as caveated in the original audit). Separately, there was ~2–3 s of blank cream on first load before any hero content.
- **Evidence:** Video served correctly — HTTP 200, `video/mp4`, **14,315,052 bytes (~14.3 MB)**, uncompressed. Poster (`aaron-beach-1.jpg`) is 683 KB and loaded instantly, so the blank hold is the media-gated reveal, not image weight. Owner reports consistent playback in normal use.
- **Impact:** The video is central to the intended hero experience, so **reliability of playback is the priority**: it must appear for every visitor, including on slower connections, where a 14.3 MB uncompressed file is the main risk to "always shown" (it may not buffer before the user scrolls past, leaving only the poster). The blank-cream open is a secondary first-impression issue.
- **Severity:** **Required** (per owner: the video must always display).
- **Recommendation (smallest change):**
  1. **Keep the video and guarantee it always plays** — confirm `autoplay muted playsinline preload` are set so it reliably starts across browsers; ensure the poster only shows until the video is ready and the video then reliably takes over (never a permanent poster substitution).
  2. **Compress the video (target a few MB, keep the `.MP4`/H.264)** so it loads fast enough to always appear before the user scrolls past — this directly serves the "always shown" requirement.
  3. **Don't gate the hero reveal on the full video** — let the poster paint immediately so there's no blank-cream hold, with the video fading in the moment it's ready.
  4. **Verify on real browsers/devices** (including a slower connection) that the video plays every time.

### R3 — Faint wordmark at rest
- **Observation:** "AARON GRZANICH" at top-center is near-illegible over the bright hero.
- **Evidence:** Zoomed capture — thin light serif over sky at very low contrast; only partly mitigated by the scroll veil once scrolled.
- **Impact:** Minor brand legibility on first paint. Affects trust/polish slightly; navigation is unaffected (hamburger works).
- **Severity:** **Preference**
- **Recommendation (smallest change):** Slightly increase the wordmark's contrast/weight at the top of the hero, or extend the existing backdrop veil to the initial state.

No other elements warrant change. The imagery, the scrub-linked tagline reveal, the pinned-image behaviour, the arch handoff into the next section, the single descriptive H1, and the graceful fallback to the poster all meet a professional standard and require no changes.

---

## Final Reflection

Restarting mentally and reviewing the hero once more with no memory of the above: the things I would still independently flag are (1) the copy is hard to read against the sky, and (2) the opening is blank for a couple of seconds. On the video: the owner has since confirmed it plays reliably for them and that it must always be shown, so the earlier "did not visibly play" observation is reframed as (3) *ensure the heavy video reliably displays for all users* — a Required reliability item, not a reason to remove the video. The faint wordmark survives only as "minor / preference." The rest of the hero is genuinely strong.

---

## Final Verdict

**Production readiness — Yes.** The hero is functional, resilient (clean fallback to a high-quality poster), semantically correct, and visually premium. Its shortcomings are refinements (contrast, load, asset weight), not breakage. It can ship.

**Portfolio quality — Yes.** The art direction, scrub-driven tagline, pinned image, and arch transition demonstrate real craft and originality. It strengthens a portfolio, and would strengthen it further with the small contrast/loading pass in R1–R2.

**Client delivery — Yes, with a short polish pass preferred.** I would deliver this to Aaron. I would prefer to first tighten the tagline contrast and the opening load moment, both of which are small changes; neither blocks delivery.

**Remaining required work:** **None that block completion.** No issue found rises to a launch blocker. R1 and R2 are recommended improvements; R3 is a preference.

**Confidence — High (with one scoped caveat).** The visual and interaction observations (blank opening, low-contrast copy, arch handoff, semantics) were reproduced directly and are high-confidence. The single lower-confidence point is *why* the video did not play — the automated browser may throttle media — so that specific conclusion was deliberately reframed as an asset-weight/reliability recommendation and flagged for verification on a native browser.

**Stopping Rule:** After R1 and R2 are addressed and verified, would I recommend permanently stopping work on this Hero? **Yes.**

No further design iteration is recommended. The Hero has reached the point of diminishing returns, and additional work is unlikely to produce a meaningful improvement for users, business goals, or portfolio quality.

# Ongoing Lessons Practice Loop Cinematic Polish

Date: 2026-07-21
Status: implemented on `main` through `43e4132`; audited 2026-07-23

> **CURRENT STATUS:** This is the approved design record, not an open
> implementation request. The Practice Loop shipped in merge `af9a0d0` with
> follow-up fixes through `43e4132`. Known exceptions to this spec's resilience
> and accessibility requirements are tracked in
> `docs/ongoing-lessons-handoff.md`; do not treat those exceptions as new
> design direction.

## Goal

Finish `/weekly-lessons` as a scripted, cinematic scroll experience that is as polished as the Home, Vacation Lessons, and About routes while remaining unmistakably its own page.

The page's signature idea is **The Practice Loop**: repetition becomes progress. A restrained circular opening sequence resolves into the existing staff-line and rising-curve language. Motion is tied to scroll, reverses when the visitor scrolls upward, and remains smooth across desktop, tablet, and mobile.

The page must not reuse Vacation Lessons' photographic dissolve, loose collage, floating numerals, or pull-quote mechanics. It must not reuse About's horizontally travelling biography chapters. Ongoing Lessons should feel precise, rhythmic, progressive, and deliberately measured.

## Approved direction

The site owner selected **The Practice Loop** from three visual opening concepts and approved its four-beat storyboard:

1. **Stillness** — a quiet circular system waits for scroll beneath the unchanged global navigation.
2. **Repetition** — a gold orbiting beat reveals a living lesson inside the loop.
3. **Release** — the circular system opens into staff lines and forward movement.
4. **Progress** — the composition resolves into the readable `Progress happens on repeat.` hero.

The opening is the first chapter of a page-wide reversible score. It is not a one-time intro animation.

## Non-negotiable invariants

- Keep `GlobalNavigation` and its menu icon visually and behaviorally unchanged.
- Do not suppress, restyle, resize, recolor, or animate the global navigation from this route.
- Keep the current route, page metadata, factual copy, lesson video, five approved photographs, Vacation Lessons cross-link, and `/book` CTA destination.
- Preserve the cream, sage, deep-ink, and restrained-gold site palette.
- Keep meaningful content in semantic document order and fully visible without JavaScript or under reduced motion.
- All scroll-driven motion must be reversible. Do not use one-time `toggleActions` for page storytelling.
- Do not add a new Lenis instance. Ongoing Lessons uses native scrolling with local GSAP/ScrollTrigger choreography.
- Do not add dependencies.

## Distinction from the other cinematic routes

| Route | Emotional idea | Signature mechanic | Media behavior |
| --- | --- | --- | --- |
| Vacation Lessons | A Maui memory that stays | Pinned photographic hero, loose collage, word-fill quote | Organic, floating, layered |
| About | Aaron's life journey | Horizontal pinned chapters | Chronological, panel-driven |
| Ongoing Lessons | Repetition becoming progress | Practice Loop opening and rising learning curve | Measured, geometric, score-like |

Ongoing Lessons will use clean editorial frames, strict alignment, thin staff lines, circular repetition, and upward progress. There are no overlapping photo collages, travel-memory dissolves, horizontal biography panels, or decorative chapter numerals.

## Page structure

The route remains a single `WeeklyJourneySections` surface rendered by `WeeklyLessons.tsx`:

1. Practice Loop opening and resolved hero
2. Sage facts and location chapter
3. `How it develops` pinned progression chapter
4. Teacher chapter
5. Vacation Lessons cross-link
6. Home-style finale/footer

## Scroll architecture

### Ownership

`WeeklyJourneySections.tsx` owns one `useLayoutEffect` and one `gsap.matchMedia(root)` context. It creates section-local timelines and tears them down with `mm.revert()`.

No animation writes React state on scroll. ScrollTrigger drives DOM transforms directly. The page must not create per-frame React renders, global wheel listeners, or a second smooth-scroll controller.

### Media-query branches

Use three explicit conditions:

- `desktop`: `min-width: 761px` and `prefers-reduced-motion: no-preference`
- `mobile`: `max-width: 760px` and `prefers-reduced-motion: no-preference`
- `reduced`: `prefers-reduced-motion: reduce`

The desktop and mobile branches build different geometry from the same semantic markup. Crossing the breakpoint causes GSAP to revert the old branch before constructing the new one.

### Scrub behavior

- Pinned story chapters use `scrub` between `0.8` and `1.1` for smooth catch-up without sluggish input.
- Scroll-controlled transforms use `ease: 'none'`; the scroll distance supplies the pacing.
- Section-local timelines use labelled phases rather than unrelated ScrollTriggers fighting over the same properties.
- Every timeline must render correctly at progress `0`, `0.5`, and `1`, then return exactly to progress `0` on reverse scroll.
- Pinned distances and media positions are functions measured on refresh, with `invalidateOnRefresh: true`.
- The existing layout-level font-ready `ScrollTrigger.refresh()` remains the shared font remeasurement authority.

### Animation properties

Prefer `transform`, `opacity`, SVG stroke dash offset, and wrapper clipping. Avoid scroll-driven layout properties such as width, height, margin, or top when a transform can express the same movement.

`will-change` is limited to actively animated wrappers. It is not applied to every child or left on the entire page.

## Chapter 1: Practice Loop opening

### Structure

The opening consists of a tall scroll region containing one pinned `100svh` stage. The stage begins at the top of the route under the unchanged fixed navigation.

- Desktop pin travel: approximately `160vh` beyond the first viewport.
- Mobile pin travel: approximately `125vh` beyond the first viewport.
- The exact distance is expressed as a measured function and tuned in browser QA so the four beats never rush or drag.

The fixed global navigation stays above the stage with its existing stacking, veil, and scrolled behavior. The weekly component does not query or mutate the header.

### Semantic baseline

The final headline remains the only semantic `<h1>`:

> Progress happens on repeat.

Temporary opening phrases such as `Begin again.` and `Practice becomes progress.` are visual scene text and use `aria-hidden="true"`. The lede remains real text in the resolved composition.

The static CSS baseline is the final, readable hero. `useLayoutEffect` applies motion-start transforms before paint only when motion is allowed. If JavaScript fails or reduced motion is requested, visitors see the resolved hero with no pinning or hidden content.

### Four-beat timeline

#### 0.00–0.20: Stillness

- Three thin concentric rings sit centered in a spacious cream field.
- A single gold dot rests near the top of the outer ring.
- `practice` appears as a very low-opacity Fraunces ghost word behind the system.
- The scene reads `Begin again.` with a quiet scroll cue.
- Nothing blocks the logo or menu icon.

#### 0.20–0.48: Repetition

- The gold dot completes a controlled orbit using GSAP's included `MotionPathPlugin`; no new dependency is required.
- The rings breathe outward by no more than roughly six percent; this is a measured pulse, not a continuous decorative loop.
- A circular window reveals the muted lesson video inside the rings.
- `Begin again.` gives way to the visual phrase `Practice becomes progress.`
- The video remains muted, looping, and `playsInline`. It is not full-screen and does not require audio to understand the page.

#### 0.48–0.76: Release

- The rings open on the right. Do not attempt a fragile live SVG shape morph; crossfade and transform a prepared open-arc group into a prepared five-line staff group.
- The gold dot exits the orbit and travels onto the staff.
- The ghost word drifts gently in the opposite direction.
- The semantic headline begins to resolve from clipped lines.

#### 0.76–1.00: Progress

- The final headline settles on the left.
- The lede fades and rises into its reading position.
- The lesson video settles into a wide, rounded editorial frame on the right.
- The two portrait lesson images resolve into a strict two-column contact-sheet row directly below the video. They do not overlap and do not float independently.
- A restrained circular trace remains around the media as a memory of the loop.
- The loop/staff transition finishes before the stage unpins, preventing a visual jump into the facts band.

Reverse scrolling reconstructs the staff into the loop, returns the video to its circular window, and brings back `Begin again.` without a discontinuity.

### Hero media sizing

The source video is `1920×1080`; the two lesson stills are portrait-oriented (`720×960` and `698×920`). Their rendered frames should respect those source shapes:

- Wide desktop: video approximately `390–440px` wide at `16:9`; each portrait approximately `125–145px` wide with a `3:4` frame.
- Laptop/tablet: video approximately `340–390px`; portrait pair remains legible rather than collapsing to narrow slivers.
- Mobile: video uses the full content width at `16:9`; portraits form a balanced two-column `3:4` row below it.
- Small mobile: minimum media gap `10px`; no image is narrower than approximately `132px` at a `390px` viewport.

Add explicit intrinsic `width` and `height` attributes to images. Use `decoding="async"`. Above-fold hero media may load eagerly; downstream imagery loads lazily.

The video wrapper, rather than the video element, receives scene transforms. The video uses `object-fit: cover`, an intentional focal point, `preload="metadata"`, and `aaron-weekly-1.jpg` as its cropped still-image poster/fallback.

## Chapter 2: Facts and location

The sage facts band becomes one calm rhythmic chapter rather than a static block.

- Four facts retain their real text and hairline separators.
- A single scrubbed timeline moves the facts from a small downward offset into alignment, then gives them a slight upward exit as the location image takes focus.
- The facts enter at evenly spaced timeline positions, like beats in a measure. They do not pop or use spring easing.
- The location photograph expands from approximately `88–92%` of the content width to the full content width using a wrapper scale, not width animation.
- The image receives a restrained internal crop shift while its wrapper settles.
- Desktop target frame: up to the full `1120px` container width, approximately `2:1` to `16:9`, instead of the current right-aligned `720×480` frame that leaves unused space.
- Mobile target frame: full content width with a shallower crop than the current nearly square treatment.

This section uses no collage, floating numerals, or independently drifting photographs.

## Chapter 3: How it develops

This is the page's principal cinematic chapter and the continuation of the Practice Loop.

### Desktop composition

- A large typographic heading occupies the opening portion of the section.
- `Same instrument.`, `A different player,`, and `every year.` sit on separate clipped lines with controlled horizontal offsets.
- The graph stage pins after the heading reaches its reading position.
- The graph occupies roughly two-thirds of the content width; the fretboard photograph occupies the remaining third in its native portrait orientation.

### Desktop scroll sequence

The pinned graph uses approximately `150–180vh` of scroll travel, tuned against the final content height.

1. The staff-like horizontal guides enter together from a modest positive Y offset.
2. The complete guide/curve/dot graphic group rises through the stage as the visitor scrolls down.
3. The gold curve draws from left to right through SVG stroke dash offset.
4. One active gold progress dot travels along the curve while the three milestone dots resolve at their positions.
5. Each stage card reaches full opacity and its final Y position around its corresponding dot, then softens slightly as the next stage becomes primary.
6. The fretboard image performs one slow crop settle and no independent collage-style float.
7. A short final hold allows `Refining your style` to be read before the pin releases.

The horizontal guides, rising curve, milestone dots, and active dot share one parent translation so they visibly move upward together, satisfying the requested graph behavior. The active dot also advances along the rising path.

Scrolling upward reverses the card emphasis, dot travel, line draw, and complete graph rise exactly.

### Graph polish

- Increase the graph's usable height and avoid positioning the third card against the right boundary.
- Keep all three cards within the graph column; no copy may overlap the portrait.
- Use more deliberate curve geometry with three readable plateaus/rises rather than the current shallow two-step path.
- Guide lines should resemble musical staff notation without becoming a literal chart grid.
- Use one strong gold accent and restrained ink opacity hierarchy.
- Ensure card copy never drops below WCAG-readable contrast during its primary state.
- Non-primary cards may soften but remain understandable; they must never disappear during a paused scroll.

### Mobile composition

Mobile uses the same content in a vertical cinematic score:

- No desktop SVG positioning is reused.
- The section remains in normal document flow; the mobile graph does not pin.
- A vertical staff/curve and active dot move through the three stages as the visitor scrolls.
- Cards remain in DOM order and never rely on full-page screenshot auto-scrolling to become visible.
- One section-level scrubbed timeline draws the vertical line, moves the active dot, and applies reversible card emphasis.

This normal-flow composition is shared by all mobile heights, avoiding a scroll trap while retaining responsive motion.

## Chapter 4: Teacher

The teacher chapter uses the warm cream-tan field and becomes a controlled typographic reveal.

- The sentence remains real text with `22` and `8` as oversized Fraunces numerals.
- The copy and portrait move from opposing small offsets into alignment, then continue a few pixels past each other as the section exits.
- The numerals receive a restrained scale/vertical emphasis tied to scroll.
- The square `1153×1153` source image is rendered as a square or near-square frame around `420–480px` on wide desktop, instead of the current `485×300` landscape crop.
- Mobile uses a full-width square/near-square frame with the subject kept visible.

The teacher motion is geometric and paired; it does not use Vacation's floating-photo parallax.

## Cross-link

Keep the Vacation Lessons cross-link as a thin breathing space between the teacher chapter and finale.

- Its text shifts upward by a very small reversible amount.
- It does not become another card, band, or pinned sequence.
- The link remains `/tourist-lessons` with a visible focus state.

## Home-style finale/footer

Replace the current oversized `100svh` close with the Home finale's visual structure:

- shallow tan/cream arch entering the deep-ink field
- centered serif finale line
- cream pill CTA with gold arrow
- footer navigation links
- copyright line
- fine grain overlay

Use Ongoing Lessons copy:

- Finale line: `Make it a habit.`
- Supporting line: `One lesson a week, for as long as it keeps being useful.`
- CTA: `Book a Lesson` linking to `/book`
- Navigation: Home, Vacation Lessons, About, FAQ
- Copyright: current year and `Maui Lessons`

The footer's natural desktop height should land near the Home finale's compact proportion, approximately `500–650px` depending on viewport height, rather than consuming an empty `100svh`.

The footer uses one reversible scrubbed timeline inspired by Vacation's finale treatment:

- finale line scales from roughly `0.9` to `1`
- supporting line rises and reaches full opacity
- CTA, links, and copyright rise in a restrained stagger
- reversing scroll unwinds the sequence

Hover/focus behavior matches the Home footer. The page continues to omit the separate cream `SiteFooter` because the footer navigation now lives inside this dark finale.

## Responsive system

### Wide desktop: `≥1180px`

- Full Practice Loop choreography and pinned graph.
- The primary wide-screen container grows from the current `1120px` to a maximum of `1240px`, while text line lengths remain controlled.
- Hero media reads as one strict contact sheet; no tiny `90px` portrait slivers.
- Footer uses the Home-style arch at its full shallow width.

### Laptop/tablet: `761–1179px`

- Preserve the opening pin with reduced translation distances.
- The resolved hero may stack text above media between approximately `761px` and `900px` if the side-by-side composition compresses the headline or portraits.
- The graph pins when the viewport is at least `761px` wide and `680px` tall. Shorter desktop/tablet viewports use the normal-flow mobile graph choreography.
- At short viewport heights, reduce pin distances before reducing type below its intended hierarchy.

### Mobile: `≤760px`

- Keep the Practice Loop centered and shorten its scroll distance.
- Resolve the hero into text, full-width video, then the two portrait stills.
- Facts become one column with rhythmic hairline rows.
- Downstream images use their source aspect ratios rather than arbitrary fixed heights.
- Footer links wrap with the same spacing behavior as Home.
- All fixed/sticky scenes must release cleanly when the browser's dynamic address bar changes viewport height.

### Small mobile: `≤440px`

- Test at `390×844`, `375×667`, `360×640`, and `320×568`.
- Clamp headline size and ring diameter independently so neither collides with the unchanged navigation.
- Avoid placing required copy below the fold inside a pinned `100svh` stage.
- If the available height is under approximately `620px`, use the short-height motion fallback.

## Performance

- Keep one ScrollTrigger timeline per major chapter where practical.
- Do not create one trigger per word, line, or decorative ring.
- Animate wrappers rather than video/SVG subtrees when possible.
- No React state updates in `onUpdate`.
- Use SVG stroke dash offset instead of repeatedly measuring paths per frame.
- Cache path length and relevant node lists during setup.
- Use `passive` browser behavior by relying on ScrollTrigger rather than custom wheel/touch listeners.
- Pause the decorative video when it is well outside the viewport and safely resume it when visible.
- Explicit media dimensions prevent layout shifts and improve ScrollTrigger measurement stability.
- Do not preload downstream photography.
- Keep grain pseudo-elements static.
- Refresh after media metadata/load only when geometry actually changes.

## Accessibility and resilience

- `prefers-reduced-motion: reduce` disables pins, scrubs, orbiting, line drawing, clip animation, and parallax.
- Reduced-motion and no-JavaScript output is the final readable hero followed by normal document flow.
- Decorative rings, staff guides, active dots, and ghost words are `aria-hidden`.
- The final hero uses a real `<h1>`; section headings retain logical `<h2>` hierarchy.
- Facts and learning stages remain real text.
- Video remains muted and non-essential; captions describe it.
- Focus outlines remain visible on every link against cream, sage, and ink fields.
- Pinned scenes must not trap keyboard focus or change focus order.
- Scroll position is never programmatically snapped on this route.

## Component and file boundaries

Primary implementation files:

- `src/components/weekly/WeeklyJourneySections.tsx`
- `src/components/weekly/WeeklyJourneySections.css`
- `test/weekly-rhythm-faithful.test.mjs`
- `CLAUDE.md`

`WeeklyLessons.tsx`, `GlobalNavigation.tsx`, and the navigation CSS are read-only for this work.

The weekly page remains one main component plus adjacent CSS. Small local helpers for a staff mark, media figure, and accessible visual text stay inside `WeeklyJourneySections.tsx`; do not introduce new route component files.

## Testing strategy

### Static contract

Update `test/weekly-rhythm-faithful.test.mjs` to assert:

- Practice Loop markup and four phase concepts
- semantic final H1 and decorative temporary phrases
- unchanged lesson video and five image imports
- Home-style finale navigation and copyright
- absence of cadence/day-picker content
- absence of Vacation collage/pull-quote patterns
- reversible `scrub` triggers instead of one-time `toggleActions`
- reduced-motion branch and mobile fallback
- unchanged global navigation ownership

### Automated verification

Run fresh after implementation:

```bash
npm run typecheck
npm run lint
npm run build
node --test test/*.test.mjs
```

All commands must exit `0`.

### Browser QA

Validate the live route at:

- `1440×900`
- `1280×800`
- `1024×768`
- `768×1024`
- `390×844`
- `375×667`
- `320×568`

For each relevant viewport:

1. Confirm the first viewport is intentional and the unchanged navigation remains readable.
2. Capture the Practice Loop at approximately `0%`, `28%`, `64%`, and `100%` scroll progress.
3. Scroll backward through the same positions and verify every element reconstructs without a jump.
4. Exercise the global menu button and confirm the existing overlay still opens, focuses, closes, and restores scroll correctly.
5. Capture the graph at its three milestones in both directions.
6. Verify the active dot and complete guide/curve group move upward together.
7. Verify all graph cards remain legible and do not collide with the photograph.
8. Confirm footer height, links, focus states, and reverse animation.
9. Check for horizontal overflow, clipped type, image distortion, layout shifts, scroll traps, and stale pin spacers.
10. Confirm no relevant console errors or framework overlay.

Also test one desktop and one mobile viewport with reduced motion enabled. All content must be visible in normal flow with no pin spacers or hidden animation start states.

## Acceptance criteria

- The opening immediately reads as Ongoing Lessons, not Vacation Lessons or About.
- The Practice Loop transforms smoothly into the page's staff/progression system.
- The global navigation and menu icon are unchanged.
- Forward and reverse scroll both work throughout the page.
- The graph is the strongest mid-page cinematic moment and its dot, curve, and guides visibly rise with scroll.
- Media uses intentional dimensions based on source aspect ratios.
- The footer matches the Home finale structure and no longer leaves an empty full viewport.
- Desktop, tablet, mobile, short-height, reduced-motion, and keyboard experiences are polished.
- Automated verification passes with zero failures.

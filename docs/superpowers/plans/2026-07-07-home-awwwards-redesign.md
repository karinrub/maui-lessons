# Home Page Awwwards Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the home page to award-level polish: seamless, layered "Choose Your Experience" background; monumental per-letter stair-step "Meet Aaron" headline reveal replacing the overlapping textPath ribbon; gap-free background flow; integrated home finale/footer with a "Book a Lesson" CTA.

**Architecture:** Spec: `docs/superpowers/specs/2026-07-07-hero-awwwards-redesign-design.md`. Four independent work areas: (1) deck seam fix + static atmosphere layers, (2) deck ambient motion layers, (3) MeetAaron rewrite, (4) new HomeFinale component + footer suppression. All motion is GSAP transform/opacity only; the shared grain texture is a static SVG data-URI in a CSS custom property.

**Tech Stack:** Vite, React 19, TypeScript, GSAP 3 + ScrollTrigger, plain CSS.

## Global Constraints

- No new npm dependencies (no SplitText — manual letter spans).
- All animation is transform/opacity only; grain is a static SVG data-URI.
- Full `prefers-reduced-motion` fallbacks in every touched component.
- No new hues beyond deep ink `#0d2018` (already used in deck media gradients).
- Do not invent business copy; reuse existing copy. New functional lines allowed: "The teacher", "Ready to play your first song?", "Book a Lesson", "© <year> Maui Lessons".
- No automated test suite exists — "verify" steps mean manual dev-server checks (`npm run dev`), plus `npm run build` + `npm run lint` per task.
- Supersedes Task 4 of `docs/superpowers/plans/2026-07-07-four-ui-fixes.md` (ribbon recolor/path tweak); Tasks 1–3 of that plan are already applied in the working tree.

---

### Task 1: Deck seam fix + static atmosphere (grain, radial stage light)

**Files:**
- Modify: `src/index.css` (`:root` block, ~lines 1–12)
- Modify: `src/components/home/StackedServicesDeck.css:1-18`
- Modify: `src/components/home/OpeningScene.css` (`.opening-scene__arch` rule, ~line 160)

**Interfaces:**
- Produces: `--grain-url` CSS custom property on `:root` — consumed by Task 1 (deck, arch), and later by Task 4 (finale). Exact name: `--grain-url`.

- [ ] **Step 1: Add the shared grain texture variable**

In `src/index.css`, inside the existing `:root` block, directly after the `--home-tan: #dcb877;` line, add:

```css
  /* Shared paper-grain texture (static SVG noise) — used by the deck band,
     the hero arch, and the home finale so they read as one material. */
  --grain-url: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
```

- [ ] **Step 2: Make the deck section opaque and overlap the arch (seam kill)**

In `src/components/home/StackedServicesDeck.css`, replace:

```css
.stacked-services-deck {
  position: relative;
  z-index: 2;
  width: 100%;
  overflow-x: clip;
  background: transparent;
}
```

with:

```css
/* Opaque at the section level (not just the pin): the section sits in normal
   flow for ~1 viewport before its pin engages, and a transparent background
   there let the cream ambient canvas show through as a visible gap between
   the hero arch and the sage band. The -2px pull-up kills the sub-pixel
   hairline where the arch's bottom edge meets this section's top edge. */
.stacked-services-deck {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: -2px;
  overflow-x: clip;
  background: var(--home-sage);
}
```

- [ ] **Step 3: Add the radial stage light to the pin**

In the same file, in `.stacked-services-deck__pin`, replace the line:

```css
  background: var(--home-sage);
```

with:

```css
  /* Pool of light behind the card stack — sage lifted ~6% at center, easing
     back to the flat section sage well before the edges so the pin still
     meets the arch above and the section below with zero seam. */
  background: radial-gradient(90% 70% at 50% 46%, #c6d4b0 0%, var(--home-sage) 62%);
```

(Keep the existing comment above the rule; it still holds for the outer color.)

- [ ] **Step 4: Add the grain layer to the pin**

In the same file, directly after the `.stacked-services-deck__pin` rule, add:

```css
/* Static paper grain over the whole pinned band (cards included) — texture,
   zero runtime cost. Painted by a pseudo-element so no DOM/markup change. */
.stacked-services-deck__pin::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 4;
  background-image: var(--grain-url);
  background-repeat: repeat;
  opacity: 0.05;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

- [ ] **Step 5: Add the same grain to the hero arch**

In `src/components/home/OpeningScene.css`, directly after the `.opening-scene__arch` rule (ends `will-change: transform, opacity;`), add:

```css
/* Same grain as the services band below (see --grain-url in index.css), so
   the arch and the deck read as one continuous material, not two flat fills. */
.opening-scene__arch::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: var(--grain-url);
  background-repeat: repeat;
  opacity: 0.05;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

- [ ] **Step 6: Build + lint**

Run: `npm run build && npm run lint`
Expected: both exit 0.

- [ ] **Step 7: Verify manually in the dev server**

Run: `npm run dev`

- Scroll from the hero through the arch into the services deck at desktop and ≤760px widths. Confirm no cream gap or hairline appears anywhere between arch and sage band (including the stretch before the deck pin engages).
- Confirm the card stack sits in a subtle pool of lighter sage; edges of the pin still flat sage.
- Confirm faint grain visible on the sage band and arch (zoom in if needed); cards still legible.
- Emulate `prefers-reduced-motion: reduce`: grain and radial light are static CSS — confirm no change in behavior, no seams.

- [ ] **Step 8: Commit**

```bash
git add src/index.css src/components/home/StackedServicesDeck.css src/components/home/OpeningScene.css
git commit -m "feat(home): seal arch/deck seam, add grain + radial stage light"
```

---

### Task 2: Deck ambient motion (drifting blobs, ghost word, progress rail)

**Files:**
- Modify: `src/components/home/StackedServicesDeck.tsx`
- Modify: `src/components/home/StackedServicesDeck.css`

**Interfaces:**
- Consumes: existing `buildTimeline` callback passed to `scrollSequence.registerDeck` (`StackedServicesDeck.tsx:124-164`) with labels `swap1`/`swap2`; existing `sectionRef`; `usePrefersReducedMotion`.
- Produces: no external interfaces.

- [ ] **Step 1: Add refs for the new layers**

In `src/components/home/StackedServicesDeck.tsx`, after the existing ref declarations (`cardsRef`, line 58), add:

```tsx
  const ghostRef = useRef<HTMLDivElement>(null)
  const blobOneRef = useRef<HTMLDivElement>(null)
  const blobTwoRef = useRef<HTMLDivElement>(null)
  const progressNumsRef = useRef<HTMLSpanElement[]>([])
```

- [ ] **Step 2: Add the new markup inside the stage**

In the JSX, inside `<div className="stacked-services-deck__stage">`, add the blob and ghost layers **before** the `<div ref={canvasRef} ...>` element:

```tsx
          <div
            ref={blobOneRef}
            className="stacked-services-deck__blob stacked-services-deck__blob--jungle"
            aria-hidden="true"
          />
          <div
            ref={blobTwoRef}
            className="stacked-services-deck__blob stacked-services-deck__blob--amber"
            aria-hidden="true"
          />
          <div ref={ghostRef} className="stacked-services-deck__ghost" aria-hidden="true">
            experiences
          </div>
```

and add the progress rail **after** the closing tag of the canvas `<div>` (still inside the stage):

```tsx
          <div className="stacked-services-deck__progress" aria-hidden="true">
            <span className="stacked-services-deck__progress-line" />
            <span className="stacked-services-deck__progress-count">
              {['01', '02', '03'].map((num, index) => (
                <span
                  key={num}
                  ref={(element) => {
                    if (element) {
                      progressNumsRef.current[index] = element
                    }
                  }}
                  className="stacked-services-deck__progress-num"
                >
                  {num}
                </span>
              ))}
              <span className="stacked-services-deck__progress-total">/ 03</span>
            </span>
          </div>
```

- [ ] **Step 3: Wire ghost parallax + counter crossfades into the registered deck timeline**

In the `buildTimeline` callback passed to `scrollSequence.registerDeck` (currently returns the card timeline directly), restructure it to build the same card timeline into a local `tl`, then append the new tweens, then return `tl`:

```tsx
        buildTimeline: () => {
          const tl = gsap
            .timeline({ paused: true })
            .addLabel('start')
            .to(secondCard, { ...stackPositions.second, duration: 0.58, ease: 'power2.out' }, 'start')
            .to(thirdCard, { ...stackPositions.third, duration: 0.58, ease: 'power2.out' }, 'start+=0.08')
            .to({}, { duration: 0.5 })
            // The leaving card slides out fully opaque — the canvas edge
            // masks it — and only fades in the last stretch of its travel,
            // so its text never double-exposes over the card underneath.
            .addLabel('swap1')
            .to(
              firstCard,
              { x: 0, yPercent: stackPositions.exit.yPercent, duration: 1, ease: 'none' },
              'swap1',
            )
            .to(firstCard, { opacity: 0, duration: 0.3, ease: 'none' }, 'swap1+=0.7')
            .to(
              secondCard,
              { ...stackPositions.front, yPercent: 0, duration: 1, ease: 'none' },
              'swap1',
            )
            .to(
              thirdCard,
              { ...stackPositions.second, yPercent: 0, duration: 1, ease: 'none' },
              'swap1',
            )
            .to({}, { duration: 0.12 })
            .addLabel('swap2')
            .to(
              secondCard,
              { x: 0, yPercent: stackPositions.exit.yPercent, duration: 1, ease: 'none' },
              'swap2',
            )
            .to(secondCard, { opacity: 0, duration: 0.3, ease: 'none' }, 'swap2+=0.7')
            .to(thirdCard, { ...stackPositions.front, yPercent: 0, duration: 1, ease: 'none' }, 'swap2')

          // Progress counter: crossfade 01→02 and 02→03 halfway through each
          // card swap, riding the same scrubbed timeline as the cards.
          const nums = progressNumsRef.current
          if (nums.length === 3) {
            tl.to(nums[0], { autoAlpha: 0, duration: 0.2, ease: 'none' }, 'swap1+=0.5')
              .to(nums[1], { autoAlpha: 1, duration: 0.2, ease: 'none' }, 'swap1+=0.5')
              .to(nums[1], { autoAlpha: 0, duration: 0.2, ease: 'none' }, 'swap2+=0.5')
              .to(nums[2], { autoAlpha: 1, duration: 0.2, ease: 'none' }, 'swap2+=0.5')
          }

          // Ghost word parallax spanning the full pin: added last, with the
          // timeline's already-final duration, so it never extends the scrub.
          const ghost = ghostRef.current
          if (ghost) {
            tl.fromTo(
              ghost,
              { yPercent: 10 },
              { yPercent: -10, duration: tl.duration(), ease: 'none' },
              0,
            )
          }

          return tl
        },
```

- [ ] **Step 4: Add the blob drift loops, gated by visibility**

After the existing `useLayoutEffect` (ends line 172), add a second effect:

```tsx
  // Ambient drifting washes: two blurred-gradient blobs on slow yoyo loops.
  // Gated by IntersectionObserver (same reasoning as MeetAaron's gating:
  // pin-spacer geometry above keeps shifting, so visibility observation is
  // more robust than scroll-position triggers) so they cost nothing while
  // the section is off-screen. Reduced motion: blobs stay static.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const blobOne = blobOneRef.current
    const blobTwo = blobTwoRef.current

    if (!section || !blobOne || !blobTwo || prefersReducedMotion) {
      return
    }

    const tweens = [
      gsap.to(blobOne, {
        xPercent: 14,
        yPercent: -10,
        duration: 34,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      }),
      gsap.to(blobTwo, {
        xPercent: -12,
        yPercent: 12,
        duration: 40,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      }),
    ]

    const observer = new IntersectionObserver(
      ([entry]) => {
        tweens.forEach((tween) => {
          if (entry.isIntersecting) {
            tween.play()
          } else {
            tween.pause()
          }
        })
      },
      { threshold: 0 },
    )
    observer.observe(section)

    return () => {
      observer.disconnect()
      tweens.forEach((tween) => tween.kill())
    }
  }, [prefersReducedMotion])
```

- [ ] **Step 5: Add CSS for blobs, ghost word, and progress rail**

In `src/components/home/StackedServicesDeck.css`, after the `.stacked-services-deck__stage` rule, add:

```css
/* Ambient washes: pure radial-gradients (no blur filter — cheap), animated
   by transform only, clipped by the pin's overflow. */
.stacked-services-deck__blob {
  position: absolute;
  z-index: 0;
  width: clamp(320px, 46vw, 720px);
  aspect-ratio: 1;
  border-radius: 50%;
  opacity: 0.12;
  pointer-events: none;
  will-change: transform;
}

.stacked-services-deck__blob--jungle {
  top: -12%;
  left: -10%;
  background: radial-gradient(circle, rgba(23, 53, 42, 0.5) 0%, rgba(23, 53, 42, 0) 68%);
}

.stacked-services-deck__blob--amber {
  right: -12%;
  bottom: -14%;
  background: radial-gradient(circle, rgba(220, 184, 119, 0.65) 0%, rgba(220, 184, 119, 0) 68%);
}

/* Oversized ghost word behind the cards; CSS `translate` centers it so the
   GSAP transform (yPercent parallax) composes with it instead of clobbering. */
.stacked-services-deck__ghost {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  color: rgba(23, 53, 42, 0.06);
  font-family: "Fraunces", "Cormorant Garamond", Georgia, "Times New Roman", serif;
  font-size: clamp(8rem, 20vw, 20rem);
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  will-change: transform;
}

/* Stage progress rail: thin line + 01/03 counter. Nums stack absolutely and
   crossfade via the scrubbed deck timeline; first is visible by default so
   reduced motion shows a correct static "01 / 03". */
.stacked-services-deck__progress {
  position: absolute;
  z-index: 3;
  top: 50%;
  right: clamp(18px, 3vw, 40px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  translate: 0 -50%;
  pointer-events: none;
}

.stacked-services-deck__progress-line {
  width: 1px;
  height: clamp(72px, 12svh, 120px);
  background: rgba(23, 53, 42, 0.35);
}

.stacked-services-deck__progress-count {
  position: relative;
  display: flex;
  align-items: baseline;
  color: rgba(23, 53, 42, 0.6);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.12em;
}

.stacked-services-deck__progress-num {
  position: absolute;
  left: 0;
  opacity: 0;
}

.stacked-services-deck__progress-num:first-child {
  opacity: 1;
}

.stacked-services-deck__progress-total {
  margin-left: 1.6em;
}
```

and inside the existing `@media (max-width: 760px)` block, add:

```css
  .stacked-services-deck__progress {
    display: none;
  }
```

- [ ] **Step 6: Build + lint**

Run: `npm run build && npm run lint`
Expected: both exit 0.

- [ ] **Step 7: Verify manually in the dev server**

Run: `npm run dev`

- Scroll into the deck: ghost "experiences" drifts slowly upward as cards swap; counter reads 01, crossfades to 02 mid-first-swap, 03 mid-second-swap; scrolling back reverses.
- Watch ≥30s while section visible: blobs drift very slowly; scroll away, check (via Performance panel or CPU meter) that motion pauses off-screen.
- Confirm z-order: blobs behind ghost, ghost behind cards, rail above sage but never over cards, grain above all.
- ≤760px: progress rail hidden; ghost word scales down without overflow-induced horizontal scroll (section has `overflow-x: clip`).
- Reduced motion: blobs/ghost static, counter shows "01 / 03", cards use their existing reduced-motion layout; no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/StackedServicesDeck.tsx src/components/home/StackedServicesDeck.css
git commit -m "feat(home): deck ambient motion — drifting washes, ghost word parallax, progress rail"
```

---

### Task 3: MeetAaron rewrite — stair-step headline reveal

**Files:**
- Modify: `src/components/home/MeetAaron.tsx` (full rewrite)
- Modify: `src/components/home/MeetAaron.css` (full rewrite)

**Interfaces:**
- Consumes: `usePrefersReducedMotion` hook; asset `assets/images/aaron-playing-close-2.jpg`; existing copy text (bio paragraph + "Learn more about Aaron" CTA).
- Produces: no external interfaces (`Home.tsx` keeps `<MeetAaron />` unchanged).

- [ ] **Step 1: Replace `src/components/home/MeetAaron.tsx` with the full new implementation**

```tsx
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './MeetAaron.css'

gsap.registerPlugin(ScrollTrigger)

const portraitImage = new URL('../../../assets/images/aaron-playing-close-2.jpg', import.meta.url).href

const HEADLINE = 'Meet Aaron'

export default function MeetAaron() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const media = mediaRef.current
    const image = imageRef.current

    if (!media || !image) {
      return
    }

    if (prefersReducedMotion) {
      gsap.set(image, { clipPath: 'inset(0% 0% 0% 0%)' })
      return
    }

    // Center-expanding reveal: the image starts clipped to a single point
    // at its own center and the mask grows outward on all four sides at
    // once, so it reads as expanding from the middle rather than sliding
    // open left-right. Using a single fromTo() (not a separate set() + to())
    // matters here: equal-valued inset() sides collapse to a single-token
    // computed value ("inset(50%)") once applied to the DOM, and a plain
    // .to() with no explicit `from` reads that collapsed computed style back
    // as its start value — a 1-token start against a 4-token end breaks
    // GSAP's per-token interpolation, so it silently snaps instead of
    // animating. fromTo() parses the `from` string literally (4 tokens),
    // sidestepping the DOM readback entirely.
    //
    // The hero's own pin-spacers don't exist yet at mount (they wait on
    // image/video load), so this section briefly sits much closer to the
    // top of a shorter document than it will once those land. A plain
    // once-off onEnter would misfire against that stale layout and never
    // get a second chance. toggleActions' reverse leg self-corrects: when
    // the shared ScrollTrigger.refresh() (fired once the hero is ready)
    // recalculates this trigger's real position, GSAP notices we're now
    // above the (correct) start and reverses the tween back to its hidden
    // state, so it can play forward for real when the user actually
    // scrolls here.
    const tween = gsap.fromTo(
      image,
      { clipPath: 'inset(50% 50% 50% 50%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: media,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  // Stair-step headline reveal + card entrance. Letters live in individual
  // overflow-hidden masks; the mask span carries the static staircase offset
  // (--ma-step, set inline per letter) while only the inner span is tweened,
  // so the entrance animation and the stair shape never fight. Sequential
  // stagger + descending final baselines = the cascade reads as stairs
  // descending left→right, and masked spans make glyph overlap impossible.
  //
  // Same pin-spacer caveat as the portrait reveal above: toggleActions'
  // reverse leg self-corrects if the shared refresh moves this trigger.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const headline = headlineRef.current
    const card = cardRef.current

    if (!section || !headline || !card || prefersReducedMotion) {
      return
    }

    const letters = headline.querySelectorAll<HTMLElement>('.meet-aaron__letter-inner')
    if (letters.length === 0) {
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    })

    timeline.fromTo(
      letters,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.055 },
    )
    timeline.fromTo(
      card,
      { x: 40, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' },
      '>-0.25',
    )

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  }, [prefersReducedMotion])

  // Gentle portrait parallax against the tan field. Scrubbed over the whole
  // section's viewport transit; scrub triggers recompute cleanly on the
  // shared ScrollTrigger.refresh(), so the hero pin-spacer timing above
  // doesn't strand it with stale coordinates.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const media = mediaRef.current

    if (!section || !media || prefersReducedMotion) {
      return
    }

    const tween = gsap.fromTo(
      media,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className={['meet-aaron', prefersReducedMotion ? 'is-reduced-motion' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="Meet Aaron"
    >
      <div className="meet-aaron__inner">
        <p className="meet-aaron__eyebrow">The teacher</p>
        <h2 ref={headlineRef} className="meet-aaron__headline" aria-label={HEADLINE}>
          {HEADLINE.split('').map((char, index) =>
            char === ' ' ? (
              <span
                key={index}
                className="meet-aaron__letter meet-aaron__letter--space"
                aria-hidden="true"
              />
            ) : (
              <span
                key={index}
                className="meet-aaron__letter"
                aria-hidden="true"
                style={{ '--ma-step': index } as CSSProperties}
              >
                <span className="meet-aaron__letter-inner">{char}</span>
              </span>
            ),
          )}
        </h2>

        <div className="meet-aaron__row">
          <div ref={mediaRef} className="meet-aaron__media">
            <img
              ref={imageRef}
              className="meet-aaron__media-image"
              src={portraitImage}
              alt="Aaron playing ukulele"
              loading="lazy"
            />
          </div>

          <Link ref={cardRef} to="/about" className="meet-aaron__content">
            <p className="meet-aaron__description">
              Aaron teaches with patience, warmth, and a genuine love for helping people learn.
              With more than 20 years of playing and teaching experience, he creates relaxed
              lessons where students of any age can feel comfortable, capable, and connected
              through music.
            </p>
            <span className="meet-aaron__cta">
              Learn more about Aaron
              <span className="meet-aaron__cta-arrow" aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Replace `src/components/home/MeetAaron.css` with the full new stylesheet**

```css
/* Continues straight off the services deck's sage, then shifts into the
   section's own warm tan within the first quarter of its height — an
   obvious color change that still reads as a smooth blend, not a hard cut.
   The -2px pull-up kills any sub-pixel hairline against the deck above. */
.meet-aaron {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: -2px;
  background: linear-gradient(180deg, var(--home-sage) 0%, var(--home-tan) 26%, var(--home-tan) 100%);
  padding: clamp(64px, 10svh, 128px) clamp(16px, 4vw, 56px) clamp(48px, 8svh, 96px);
}

.meet-aaron__inner {
  width: min(94vw, 1080px);
  margin: 0 auto;
}

.meet-aaron__eyebrow {
  margin: 0 0 clamp(0.8rem, 2svh, 1.4rem);
  color: rgba(23, 53, 42, 0.7);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* Monumental display headline. Each letter sits in its own overflow-hidden
   mask; the mask carries the static staircase offset (--ma-step set inline)
   while the entrance tween runs on the inner span only. */
.meet-aaron__headline {
  display: flex;
  align-items: flex-start;
  margin: 0;
  color: var(--home-sage-ink);
  font-family: "Fraunces", "Cormorant Garamond", Georgia, "Times New Roman", serif;
  font-size: clamp(4rem, 12vw, 11rem);
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.meet-aaron__letter {
  display: inline-block;
  overflow: hidden;
  transform: translateY(calc(var(--ma-step) * 0.045em));
}

.meet-aaron__letter--space {
  width: 0.26em;
}

.meet-aaron__letter-inner {
  display: inline-block;
  will-change: transform;
}

.meet-aaron__row {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: end;
  gap: clamp(28px, 5vw, 72px);
  margin-top: clamp(40px, 7vw, 88px);
}

.meet-aaron__media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(23, 53, 42, 0.12);
  will-change: transform;
}

.meet-aaron__media-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  will-change: clip-path;
}

.meet-aaron__content {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.8svh, 1.1rem);
  padding: clamp(28px, 4vw, 44px);
  border: 1px solid rgba(31, 29, 24, 0.1);
  border-radius: 20px;
  background: #fbf7ee;
  color: #1f1d18;
  text-decoration: none;
  box-shadow:
    0 1px 2px rgba(6, 18, 13, 0.15),
    0 30px 60px -32px rgba(6, 18, 13, 0.35);
  transition: box-shadow 0.24s ease, transform 0.24s ease;
}

.meet-aaron__content:hover,
.meet-aaron__content:focus-visible {
  box-shadow:
    0 1px 2px rgba(6, 18, 13, 0.2),
    0 36px 70px -32px rgba(6, 18, 13, 0.45);
  transform: translateY(-2px);
}

.meet-aaron__content:focus-visible {
  outline: 1px solid rgba(23, 53, 42, 0.6);
  outline-offset: 0.3rem;
}

.meet-aaron__description {
  margin: 0;
  max-width: 52ch;
  color: rgba(31, 29, 24, 0.68);
  font-size: clamp(0.95rem, 1.2vw, 1.05rem);
  line-height: 1.55;
}

.meet-aaron__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-top: 0.3rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid rgba(23, 53, 42, 0.4);
  color: #17352a;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: border-color 0.22s ease, color 0.22s ease;
}

.meet-aaron__content:hover .meet-aaron__cta,
.meet-aaron__content:focus-visible .meet-aaron__cta {
  border-color: #17352a;
  color: #0d2018;
}

.meet-aaron__cta-arrow {
  transition: transform 0.22s ease;
}

.meet-aaron__content:hover .meet-aaron__cta-arrow {
  transform: translateX(0.25rem);
}

@media (max-width: 760px) {
  .meet-aaron__headline {
    font-size: clamp(2.6rem, 15vw, 4.5rem);
  }

  .meet-aaron__letter {
    transform: translateY(calc(var(--ma-step) * 0.03em));
  }

  .meet-aaron__row {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .meet-aaron__media {
    aspect-ratio: 16 / 10;
  }
}
```

- [ ] **Step 3: Build + lint**

Run: `npm run build && npm run lint`
Expected: both exit 0. (Watch for unused-import errors — the old file imported `RefObject`; the new one must not.)

- [ ] **Step 4: Verify manually in the dev server**

Run: `npm run dev`

- Scroll to Meet Aaron. Letters rise sequentially left→right out of individual masks, settling on baselines that descend like stairs; at no frame do any two letters overlap. Scroll back up: reveal reverses.
- Card slides in from the right after the last letters land; portrait clip reveal still expands from center; portrait drifts subtly (parallax) as the section transits the viewport.
- Reduced motion: headline fully visible at final stepped positions immediately, card and portrait visible, zero motion.
- ≤760px: headline fits without horizontal scroll; portrait above card stacked; step offset shallower.
- Confirm the old ribbon is gone (no `<svg>` in the section, no "Bowlby One" usage) and no console errors.
- VoiceOver/accessibility tree spot-check: heading announces "Meet Aaron" once (aria-label), letter spans hidden.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/MeetAaron.tsx src/components/home/MeetAaron.css
git commit -m "redesign(home): replace ribbon with stair-step Meet Aaron headline reveal"
```

---

### Task 4: HomeFinale + footer suppression + font cleanup

**Files:**
- Create: `src/components/home/HomeFinale.tsx`
- Create: `src/components/home/HomeFinale.css`
- Modify: `src/pages/Home.tsx`
- Modify: `src/layout/SiteLayout.tsx:52`
- Modify: `index.html:9`

**Interfaces:**
- Consumes: `--grain-url` (Task 1), `usePrefersReducedMotion`, existing CTA interaction grammar (arrow slide / translateY hover).
- Produces: `HomeFinale` default-export React component, no props.

- [ ] **Step 1: Create `src/components/home/HomeFinale.tsx`**

```tsx
import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './HomeFinale.css'

gsap.registerPlugin(ScrollTrigger)

export default function HomeFinale() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const cta = ctaRef.current

    if (!section || !cta || prefersReducedMotion) {
      return
    }

    // Once-only entrance (no reverse: a footer CTA popping back out on
    // upward scroll would read as broken, not cinematic).
    const tween = gsap.fromTo(
      cta,
      { scale: 0.92, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  return (
    <section ref={sectionRef} className="home-finale" aria-label="Book a lesson">
      {/* Inverted bookend of the hero's sage arch: same radius language,
          tan dome hanging into the ink field. */}
      <div className="home-finale__arch" aria-hidden="true" />
      <div className="home-finale__inner">
        <p className="home-finale__line">Ready to play your first song?</p>
        <Link ref={ctaRef} to="/book" className="home-finale__cta">
          Book a Lesson
          <span className="home-finale__cta-arrow" aria-hidden="true">→</span>
        </Link>
        <nav className="home-finale__links" aria-label="Footer navigation">
          <Link to="/tourist-lessons">Vacation Lessons</Link>
          <Link to="/weekly-lessons">Ongoing Lessons</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
        <p className="home-finale__copyright">© {new Date().getFullYear()} Maui Lessons</p>
      </div>
      <div className="home-finale__grain" aria-hidden="true" />
    </section>
  )
}
```

- [ ] **Step 2: Create `src/components/home/HomeFinale.css`**

```css
/* Deep-ink finale field. -2px pull-up kills any hairline against the tan
   Meet Aaron section above; the tan arch below the top edge carries the
   previous section's color into this one, so the boundary reads as one
   continuous surface (continuity rule from the design spec). */
.home-finale {
  position: relative;
  z-index: 2;
  overflow: hidden;
  margin-top: -2px;
  background: #0d2018;
  padding: 0 clamp(16px, 4vw, 56px) clamp(40px, 6svh, 72px);
}

/* Mirror of the hero arch: rectangle rounded along its bottom edge, so the
   tan bulges down into the ink. Wider than the viewport (145vw) to keep the
   curve shallow, exactly like the hero's dome. */
.home-finale__arch {
  position: relative;
  left: 50%;
  width: 145vw;
  height: clamp(120px, 18svh, 230px);
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
  background: var(--home-tan);
  transform: translateX(-50%);
}

.home-finale__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.2rem, 3svh, 2rem);
  width: min(94vw, 1080px);
  margin: clamp(48px, 8svh, 96px) auto 0;
  text-align: center;
}

.home-finale__line {
  margin: 0;
  color: rgba(250, 245, 238, 0.92);
  font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  font-style: italic;
  font-weight: 600;
  line-height: 1.2;
}

.home-finale__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: clamp(0.9rem, 1.6vw, 1.15rem) clamp(1.8rem, 3.4vw, 2.6rem);
  border-radius: 999px;
  background: #fbf7ee;
  color: #0d2018;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-decoration: none;
  text-transform: uppercase;
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.55);
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.home-finale__cta:hover,
.home-finale__cta:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 24px 48px -18px rgba(0, 0, 0, 0.65);
}

.home-finale__cta:focus-visible {
  outline: 1px solid rgba(250, 245, 238, 0.78);
  outline-offset: 0.3rem;
}

.home-finale__cta-arrow {
  transition: transform 0.22s ease;
}

.home-finale__cta:hover .home-finale__cta-arrow {
  transform: translateX(0.25rem);
}

.home-finale__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(1rem, 2.5vw, 2rem);
  margin-top: clamp(0.6rem, 2svh, 1.2rem);
}

.home-finale__links a {
  color: rgba(250, 245, 238, 0.6);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.22s ease;
}

.home-finale__links a:hover,
.home-finale__links a:focus-visible {
  color: #faf5ee;
}

.home-finale__links a:focus-visible {
  outline: 1px solid rgba(250, 245, 238, 0.78);
  outline-offset: 0.3rem;
}

.home-finale__copyright {
  margin: 0;
  color: rgba(250, 245, 238, 0.35);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

/* Same grain material as the deck band and hero arch (--grain-url). */
.home-finale__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: var(--grain-url);
  background-repeat: repeat;
  opacity: 0.05;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

- [ ] **Step 3: Mount the finale in `src/pages/Home.tsx`**

Replace the file's contents with:

```tsx
import HomeAmbientBackground from '../components/home/HomeAmbientBackground'
import HomeFinale from '../components/home/HomeFinale'
import MeetAaron from '../components/home/MeetAaron'
import OpeningScene from '../components/home/OpeningScene'
import StackedServicesDeck from '../components/home/StackedServicesDeck'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useHomeScrollSequence from '../hooks/useHomeScrollSequence'

export default function Home() {
  useDocumentTitle('Home | Maui Lessons')
  const scrollSequence = useHomeScrollSequence()

  return (
    <>
      <HomeAmbientBackground />
      <OpeningScene scrollSequence={scrollSequence} />
      <StackedServicesDeck scrollSequence={scrollSequence} />
      <MeetAaron />
      <HomeFinale />
    </>
  )
}
```

- [ ] **Step 4: Suppress the global footer on the home route**

In `src/layout/SiteLayout.tsx`, replace line 52:

```tsx
      <SiteFooter />
```

with:

```tsx
      {isHome ? null : <SiteFooter />}
```

- [ ] **Step 5: Drop the now-unused Bowlby One webfont**

In `index.html`, replace the Google Fonts `href` (line 9):

```html
      href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,600&family=Fraunces:ital,opsz,wght@0,144,700;0,144,900;1,144,400&display=swap"
```

with:

```html
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,600&family=Fraunces:ital,opsz,wght@0,144,700;0,144,900;1,144,400&display=swap"
```

(Task 3 removed the only "Bowlby One" reference; confirm with `grep -ri "bowlby" src/` → no matches.)

- [ ] **Step 6: Build + lint**

Run: `npm run build && npm run lint`
Expected: both exit 0.

- [ ] **Step 7: Verify manually in the dev server**

Run: `npm run dev`

- Scroll to page bottom: tan Meet Aaron flows into the inverted tan arch, then ink field; no gap/hairline at the boundary at several widths.
- CTA scales/fades in once when the finale enters; scrolling up and back down does not replay it. Click "Book a Lesson" → `/book`.
- Footer links navigate; © line shows current year; grain visible on ink.
- Home route shows no old `site-footer` element; `/about` (or any other route) still shows the old global footer.
- Reduced motion: CTA visible immediately, everything static.
- Network panel: Google Fonts CSS request no longer includes Bowlby One.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/HomeFinale.tsx src/components/home/HomeFinale.css src/pages/Home.tsx src/layout/SiteLayout.tsx index.html
git commit -m "feat(home): add finale footer with Book a Lesson CTA, drop Bowlby One font"
```

---

### Task 5: Final full-project verification

**Files:** none (verification only)

- [ ] **Step 1: Build + lint**

Run: `npm run build && npm run lint`
Expected: both exit 0.

- [ ] **Step 2: Full home-page QA pass**

Run: `npm run dev`

- Full scroll-through at desktop width: hero → arch → deck (atmosphere + progress rail) → Meet Aaron (stair reveal) → finale. No background gaps or hairlines anywhere; each boundary color-continuous.
- Repeat at ≤760px.
- Repeat with `prefers-reduced-motion: reduce` emulated: every section static-but-complete, nothing hidden or squished.
- Route away mid-scroll and back: no stale pins, no console errors, footer suppression still correct.

- [ ] **Step 3: Report per-file changes**

Summarize, per file, what changed (deck seam/atmosphere, deck motion layers, MeetAaron rewrite, finale + footer suppression + font cleanup).

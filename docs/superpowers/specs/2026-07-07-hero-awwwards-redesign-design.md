# Home Page Awwwards Redesign — Design Spec

Date: 2026-07-07. Status: approved by user (conversation), pending spec review.

## Goal

Elevate three areas of the home page to award-level polish without changing content or messaging:

1. **"Choose Your Experience" section** (`StackedServicesDeck`): richer, layered background; kill the visible gap between the hero arch and the sage background.
2. **Meet Aaron section** (`MeetAaron`): replace the overlapping, wave-like textPath ribbon with a monumental per-letter stair-step headline reveal; restructure the section layout.
3. **Background continuity + footer**: no transparent gaps anywhere in the home flow; add an integrated home finale/footer with a prominent "Book a Lesson" CTA.

## Constraints

- No new npm dependencies (no SplitText — manual letter spans).
- All animation transform/opacity only; grain is a static SVG data-URI.
- Full `prefers-reduced-motion` fallbacks per existing project convention.
- Palette and typography extend the existing system; no new hues beyond deep ink `#0d2018` (already used in deck media gradients).
- Do not invent business copy; reuse existing copy.
- Existing plan `docs/superpowers/plans/2026-07-07-four-ui-fixes.md` Task 4 is superseded by this spec's Meet Aaron rewrite. Tasks 1–3 of that plan are already applied in the working tree.

## 1. Choose Your Experience (StackedServicesDeck)

### Root cause of the gap

- `.stacked-services-deck` (outer section) is `background: transparent`; only `.stacked-services-deck__pin` is sage. The section sits in normal flow ~1 viewport before its pin engages, so the cream ambient canvas shows through between the hero arch and the pinned sage band.
- Sub-pixel hairline where the arch's bottom edge meets the deck's top edge.

### Changes

1. **Seam kill.** Outer `.stacked-services-deck` becomes opaque `var(--home-sage)`; section pulled up `margin-top: -2px` so no hairline renders under the arch. Hero untouched.
2. **Radial stage light.** CSS `radial-gradient` on the pin (sage lightened ~6% at center, behind the card stack) so cards sit in a pool of light.
3. **Grain.** Inline SVG `feTurbulence` data-URI overlay on the sage band (pin-level `::after` or dedicated layer), `opacity: 0.05`, `mix-blend-mode: overlay`, `pointer-events: none`. Static.
4. **Drifting washes.** Two absolutely-positioned blurred radial blobs (deep jungle green; faint amber), opacity ≤ 0.12, each on an infinite 30–40s `gsap.to` yoyo loop (x/y transform only). Play/pause gated by an IntersectionObserver on the section (same pattern as MeetAaron's ribbon gating).
5. **Ghost typography.** Oversized Fraunces italic word "experiences" (~20vw), `color: rgba(23, 53, 42, 0.06)`, absolutely positioned behind the cards, scrubbed parallax `yPercent: 10 → -10` attached to the existing registered deck timeline (not a new ScrollTrigger).
6. **Progress rail.** Thin vertical line + "01 / 03" counter at the right edge of the stage; counter crossfades at the existing `swap1` / `swap2` timeline labels. Hidden on mobile if cramped.

### Reduced motion

Blobs static (no loop), ghost word static, progress rail shows "01 / 03" static. Grain and radial light are static already.

## 2. Meet Aaron

### Decision

Delete the SVG textPath ribbon marquee entirely (mechanism rotates glyphs to path tangent — overlap is unavoidable on any non-flat path). Replace with a static monumental headline with per-letter stair-step reveal. Approaches B (straightened textPath) and C (straight marquee) were considered and rejected/deferred.

### Layout (desktop ≥ 761px)

```
[eyebrow: THE TEACHER]
M e e t  A a r o n            ← full-width display headline, letters descend stair-step
┌────────────┐        ┌──────────────────┐
│  portrait  │        │  bio card + CTA  │
└────────────┘        └──────────────────┘
```

- Headline: Fraunces, `clamp(4rem, 12vw, 11rem)`, ink-toned (`--home-sage-ink` family) on the sage→tan gradient (existing section background kept).
- Portrait keeps existing center-out clip reveal (untouched logic) + gains gentle scrub parallax `yPercent: -6 → 6`.
- Bio card (existing copy + CTA, existing card styling) positioned right of/beside the portrait; enters after the last letter lands.

### Letter markup

Each letter is two spans: outer = `overflow: hidden` mask carrying the **static** staircase offset (`transform: translateY(calc(i * 0.045em))` via nth-child or inline style); inner = the tweened element. Two layers so the entrance tween never fights the step offset. Word split done manually in JSX from a constant string; spaces preserved; `aria-label="Meet Aaron"` on the heading with letter spans `aria-hidden`.

### Timeline

```tsx
const tl = gsap.timeline({
  scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
})
tl.fromTo(innerLetters,
  { yPercent: 110 },
  { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.055 },
)
tl.fromTo(card, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, '>-0.25')
```

- Sequential stagger + stepped final baselines = descending-stairs cascade; masks make overlap geometrically impossible.
- Note the hero pin-spacer refresh caveat already documented in `MeetAaron.tsx` — keep `toggleActions: 'play none none reverse'` so a post-refresh position correction self-heals (same reasoning as the existing portrait reveal).

### Mobile (≤ 760px)

Stacked: eyebrow → headline (step `0.03em`, font `clamp(2.6rem, 15vw, 4.5rem)`) → portrait → card. Same reveal timeline.

### Reduced motion

Letters render at final stepped positions immediately (no tween, masks inert); card and portrait fully visible; portrait clip already handled by existing reduced-motion branch.

### Removals

- `RIBBON_PATH_DESKTOP` / `RIBBON_PATH_MOBILE`, both ribbon SVGs, textPath tiling/measuring effect, ribbon IntersectionObserver, all `.meet-aaron__ribbon*` CSS, "Bowlby One" font reference.
- Per-frame `startOffset` attribute tween disappears — net performance win.

## 3. Background continuity + footer

### Continuity rule

Every home section owns an opaque background whose top edge color exactly matches the previous section's bottom edge color, with `-2px` overlap at each boundary:

- Hero arch (sage) → deck (sage, now opaque at section level) → MeetAaron (existing sage→tan gradient, already correct) → finale (tan→deep ink `#0d2018`).
- Ambient WebGL canvas remains as under-layer for the hero only.

### HomeFinale (new component)

New `src/components/home/HomeFinale.tsx` + `.css`, rendered last in `Home.tsx`:

- Top edge: downward arch curve mirroring the hero arch (same radius language, inverted) in tan, sitting on the ink field — bookend motif.
- Background: gradient tan → deep ink `#0d2018`; grain overlay shared with deck (same data-URI) for material cohesion.
- Content (no invented copy beyond short functional lines):
  - Cormorant Garamond italic line: "Ready to play your first song?"
  - Large pill button **Book a Lesson** → `/book`. Cream `#fbf7ee` bg, ink text; hover `translateY(-2px)` + arrow slide (existing CTA grammar). Entrance: `scale: 0.92, autoAlpha: 0 → 1`, once, on enter.
  - Small links: Vacation Lessons, Ongoing Lessons, About, FAQ.
  - © line (year + business name only).
- Reduced motion: everything visible immediately.

### Global footer on home

`SiteLayout.tsx` suppresses `SiteFooter` on `/` (finale replaces it). Other routes unchanged.

## Performance summary

- All motion transform/opacity. `will-change` only where already used.
- Blobs and any looping motion gated by IntersectionObserver.
- Grain static; no runtime cost.
- Removing the ribbon marquee removes a per-frame SVG attribute tween.

## Files touched

- `src/components/home/StackedServicesDeck.tsx` / `.css` — background layers, ghost word, progress rail, seam fix.
- `src/components/home/MeetAaron.tsx` / `.css` — heavy rewrite per §2.
- `src/components/home/HomeFinale.tsx` / `.css` — new.
- `src/pages/Home.tsx` — mount finale.
- `src/layout/SiteLayout.tsx` — suppress global footer on `/`.
- `src/index.css` — possible one var (deep ink) if promoted to `:root`.

## Verification

- `npm run build` and `npm run lint` pass.
- Manual dev-server QA: seam gone at arch/deck boundary at multiple widths; deck atmosphere layers render and pause off-screen; Meet Aaron letters never overlap at any frame, stair cascade reads left→right descending; card enters after letters; finale arch seam-free over tan; Book CTA navigates; reduced-motion pass for every touched section; mobile (≤760px) pass.

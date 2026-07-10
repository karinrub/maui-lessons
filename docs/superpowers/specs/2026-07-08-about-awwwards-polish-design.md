# About Aaron — Awwwards-Level Polish Design

Date: 2026-07-08. Scope: `src/components/about/AaronStorySections.{tsx,css}` only.

## Goals (from brief)

1. Card (journey beat) title emphasis
2. Page entrance animation
3. Typography enhancement
4. Horizontal scroll optimization
5. Color elevation (60-30-10, gradients, shadows, overlays)
6. Micro-interactions, loading animation, accessibility

## Decisions

- **No new dependencies.** GSAP + ScrollTrigger already installed cover everything. Lenis stays home-page-only.
- **No dark-mode toggle.** Brief said "consider"; a theme switch fights the warm daylight brand and adds infra. Instead chapter 4 becomes a "dusk" chapter — deep-green dark panel with light type and amber CTA. Gives the page a light→dark narrative arc and the dark-surface craft signal jurors look for, without a toggle.
- **60-30-10 palette:** 60% warm paper `#f7f3ea`, 30% sage/deep green (`--home-sage`, `#17352a`), 10% amber accent (`--home-tan #dcb877`) reserved for numerals, rules, progress bar, dusk CTA. Amber is decorative-only on light ground (contrast too low for body text).

## Features

- **Entrance:** paper veil wipes up on mount; chapter 1 portrait clip-path reveal + eyebrow/masked heading line/body stagger. Reduced motion: veil hidden via CSS, content static.
- **Beat titles:** larger Fraunces italic, oversized amber numerals, amber rule, scrub-tied stagger per beat.
- **Typography:** masked line reveal on chapter-1 heading, larger display clamp, giant watermark chapter numerals (aria-hidden) behind each panel, tightened measures.
- **Horizontal scroll:** gentle chapter snap, `anticipatePin`, chapter counter `01 / 04` + amber progress bar (decorative, aria-hidden), media parallax drift via `containerAnimation`, keyboard `focusin` handler scrolls the pinned sequence to the focused panel and resets stray `scrollLeft`.
- **Micro-interactions:** magnetic CTA (pointer: fine + motion-ok only), CTA hover lift/shadow. (Cursor follower built then removed on user request 2026-07-08.)
- **End-of-scroll hold:** pin extends ~35% past the horizontal travel so the dusk chapter rests before the page unpins into the footer. Pin lives on its own trigger; the horizontal tween stays linear for containerAnimation accuracy.
- **A11y:** visually-hidden `h1`, `:focus-visible` outlines on CTA, reduced-motion fallbacks preserved, decorative layers aria-hidden, text contrast ≥ WCAG AA (ink on paper, paper on dusk green).

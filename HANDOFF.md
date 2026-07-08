# Handoff — Maui Lessons home page awwwards redesign

## Repo / branch
- Repo: /Users/karinrubin/Developer/maui-lessons (Vite + React 19 + TS + GSAP/ScrollTrigger, NOT Next.js)
- Branch: `home-awwwards-redesign` (branched off main)
- Baseline commit ba6f9eb committed pre-existing four-ui-fixes working-tree changes.

## Authoritative documents (read these first)
1. Spec: `docs/superpowers/specs/2026-07-07-hero-awwwards-redesign-design.md` (commit 61707cc)
2. Plan: `docs/superpowers/plans/2026-07-07-home-awwwards-redesign.md` (commit 3513bd9)
   — contains COMPLETE code for every step. Execute tasks in order, checkbox tracking.
3. Progress ledger: `.superpowers/sdd/progress.md` — tasks listed complete are DONE,
   do not redo. Trust ledger + `git log` over memory.

## Process
- Use superpowers:subagent-driven-development (fresh implementer subagent per task,
  task review after each, final whole-branch review at end).
- User approved everything; do NOT ask permissions or questions. Run continuously.
- Per task: implement exactly per plan code, `npm run build && npm run lint` must pass,
  commit with the plan's commit message.

## The 5 tasks (check ledger/git log for which are already done)
1. Deck seam fix + grain + radial light — `src/index.css` (add `--grain-url` in :root),
   `StackedServicesDeck.css` (opaque sage section, -2px margin-top, radial pin bg,
   pin::after grain), `OpeningScene.css` (arch::after grain).
2. Deck ambient motion — `StackedServicesDeck.tsx/.css`: blob refs + markup, ghost
   "experiences" word, progress rail 01/03; ghost parallax + counter crossfades added
   inside existing `buildTimeline` (labels swap1/swap2); blob yoyo loops gated by
   IntersectionObserver; reduced-motion skips.
3. MeetAaron FULL rewrite (both files, complete replacements in plan) — deletes textPath
   ribbon, adds per-letter stair-step masked headline reveal (`--ma-step` custom prop,
   inner span tweened yPercent 110→0, stagger 0.055, power4.out), card entrance, portrait
   parallax; keeps existing clip-path portrait reveal verbatim.
4. New `src/components/home/HomeFinale.tsx/.css` (inverted tan arch, ink field, Book a
   Lesson pill CTA, links, ©, grain), mount in `Home.tsx`, suppress `<SiteFooter />` on
   home route in `SiteLayout.tsx:52`, remove Bowlby+One from `index.html` fonts URL.
5. Final verification: build + lint + full manual QA pass (desktop, ≤760px,
   prefers-reduced-motion).

## Global constraints
- No new npm deps. Transform/opacity animation only. Reduced-motion fallback everywhere.
- No invented business copy beyond: "The teacher", "Ready to play your first song?",
  "Book a Lesson", "© <year> Maui Lessons".
- No automated tests exist — verification = build + lint + manual dev-server checks.
- CAVEMAN MODE plugin active in user's sessions (style only, ignore for code).

## After all tasks
Final whole-branch code review (most capable model), fix findings, then
superpowers:finishing-a-development-branch.

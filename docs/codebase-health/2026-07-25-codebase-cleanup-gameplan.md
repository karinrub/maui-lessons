# Codebase Cleanup Game Plan — 2026-07-25

**Goal:** Safely reduce confirmed repository clutter, make current guidance discoverable, and improve cleanup regression protection without changing site behavior, visual design, animations, accessibility, responsiveness, or deployment behavior.

**Global constraints:** Preserve Git history; no bulk CSS cleanup; no asset/package deletion without listed evidence; one independently verifiable commit per phase; stop if any check changes rendered behavior.

**Execution status, 2026-07-25:** Phase 1 and automatic-safe parts of Phases 2
and 3 completed. Asset/public deletion, archive moves, CSS cleanup, component
refactors, and worktree cleanup remain gated by required evidence.

## Classification

- **Safe to execute automatically:** baseline/test-command repair, current-doc index/archive moves, `@gsap/react`, unused palette exports, ignored `.DS_Store` files.
- **Safe after targeted validation:** `public/icons.svg` and seven unreferenced source images.
- **Requires manual review:** public URL consumers, creative/source-photo retention, any CSS selector removal, large component extraction, `.worktrees/` cleanup.
- **Do not change:** imported runtime assets, active route/component/style paths, deployment pipeline semantics, historic documents before archive/index exists.

## Phase 1 — Baseline protection

**Areas:** `package.json`, existing test files, CI workflow; no runtime behavior changes.

**Preconditions:** clean worktree; capture `git status`; record current failing full-test assertion.

**Changes:**

1. Add a `test:all` script that executes `scripts/booking-submission.test.mjs` and `test/*.mjs`.
2. Update only stale assertion `test/weekly-rhythm-faithful.test.mjs:43` to assert the current approved SEO title or a semantically stable route metadata contract. Do not change `WeeklyLessons.tsx` title merely to satisfy old test text.
3. Add the full test command to README/current operating guide.

**Evidence:** audit baseline: 62/63 full tests pass; failure text expects obsolete `Ongoing Lessons | Maui Lessons`, while live `WeeklyLessons.tsx` uses current SEO title.

**Risk:** Low. **Validation:** `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:all`, `npm run check:seo`, `npm run test:launch`. **Manual:** inspect title on `/weekly-lessons` and prerendered HTML. **Rollback:** revert single commit. **Expected score:** Testability +1, documentation +0.5. **Done:** all existing tests reachable from supported script and green.

## Phase 2 — Documentation current/archival boundary

**Areas:** `README.md`, `CLAUDE.md`, `docs/`, root audits, `inspo/`; documentation moves/edits only.

**Preconditions:** Phase 1 green; owner agrees historical docs should be retained but moved.

**Changes:**

1. Create `docs/README.md` (or `docs/current/README.md`) with: current operating docs, current release evidence, archive policy, and date/source-of-truth rules.
2. Move rows marked Archive in audit into dated archive folders without renaming filenames where avoidable; retain `git mv` history.
3. Keep records marked Keep in current locations or a clearly named current folder.
4. Update `README.md`, `docs/GIT_AND_DEPLOYMENT.md`, `maui-lessons-seo-task-list.md`, and FAQ design status; do not rewrite historical report conclusions.
5. Preserve `inspo/aboutaaron.md` as owner-fact source. Ask owner before archiving/removing external inspiration material.

**Evidence:** 54 documents are historical; HANDOFF/older specs carry explicit superseded/implemented banners; current facts are scattered and `maui-lessons-seo-task-list.md` names files no longer present.

**Risk:** Medium (link breakage/history loss). **Validation:** `rg` old paths and update links; `git diff --check`; `npm run build`; verify docs index reaches every current document. **Manual:** open archive index and follow ten representative links. **Rollback:** `git revert` archive commit. **Expected score:** Documentation +2. **Done:** one current entry point, no stale execution instructions presented as current, all history retained.

## Phase 3 — Confirmed dead-code/dependency cleanup

**Areas:** `package.json`, `package-lock.json`, `src/styles/mauiPalette.ts`, ignored Finder metadata.

**Preconditions:** Phase 1 green; fresh `rg` confirms no `@gsap/react`, `toCssRgb`, `MAUI_PALETTE_CSS_VARS`, or `--maui-*` consumers.

**Changes:**

1. Remove `@gsap/react` with npm so lockfile stays consistent.
2. Remove only `toCssRgb` and `MAUI_PALETTE_CSS_VARS`; revise palette comment to describe actual GLSL consumers.
3. Remove ignored local `.DS_Store` files; do not alter tracked files.

**Evidence:** direct repository-wide searches produce only definitions/package manifest references; shader helper `toGlslVec3` remains actively imported.

**Risk:** Very low. **Validation:** `npm ci`, then complete Phase 1 command set; inspect production bundle route load. **Manual:** Home/nav gradient and Book rendering at desktop/mobile. **Rollback:** revert commit, reinstall lockfile. **Expected score:** Dependency +1, dead-code +0.5, asset hygiene +0.5. **Done:** no direct unused dependency/exports/Finder metadata remain.

## Phase 4 — Unused asset/public-file decision

**Areas:** `public/icons.svg`; `assets/images/aaron-palms-beach-1.jpg`, `aaron-playing-2.jpg`, `aaron-beach-dance-1.jpg`, `canopy-bright-1.jpg`, `canopy-dense-1.jpg`, `canopy-sky-1.jpg`.

**Preconditions:** Owner confirms no current or planned creative use and no external direct URL consumer; Phase 3 green.

**Changes:** Remove only owner-approved candidates. Update/archive documents that mention deleted assets so historical text does not appear as an active asset instruction; do not erase historical evidence.

**Evidence:** no source/config/test/runtime reference; Vite production build omits all seven source images; public sprite has no repository runtime reference.

**Risk:** Low functional, medium historical/external. **Validation:** repository-wide reference search; `npm run build`; inspect `dist/` manifest; `npm run check:seo`; `npm run test:launch`; deployed Pages route smoke check. **Manual:** every route, social metadata, bookmarked `/icons.svg` if analytics are available. **Rollback:** restore files from commit. **Expected score:** Asset hygiene +1.5. **Done:** every removed asset has owner signoff and zero build/runtime references.

## Phase 5 — Safe duplicate consolidation

**Areas:** only candidates proven by Phase 1–4 coverage; likely metadata/test helpers, not visual finalers.

**Preconditions:** tests cover present behavior; no visual contract depends on duplicated markup.

**Changes:** Extract at most one pure helper per commit when identical logic is shown by source and tests. Do not unify route finales, GSAP timelines, or responsive CSS merely because names resemble each other.

**Evidence:** current audit finds deliberate, responsibility-specific duplication; no confirmed duplicate implementation is safe to abstract today.

**Risk:** Medium. **Validation:** focused test first, then full suite/build/SEO/launch. **Manual:** route transitions, footer/CTA appearance, keyboard navigation, reduced motion. **Rollback:** revert isolated commit. **Expected score:** Maintainability +0.5 only if a real shared contract emerges. **Done:** each abstraction has at least two stable consumers and removes a tested duplicate.

## Phase 6 — Targeted architecture cleanup

**Areas:** `src/pages/Book.tsx`, `src/components/home/OpeningScene.tsx`, `src/components/weekly/WeeklyJourneySections.tsx`, `src/components/about/AaronStorySections.tsx`, `src/components/faq/FaqSections.tsx`.

**Preconditions:** behavioral browser tests cover each extraction seam. Start with Book; defer OpeningScene until dedicated video/focus/Lenis tests exist.

**Changes:** one controller responsibility per task (for example Booking submit transport state or pure price/date formatting). Preserve public DOM classes and GSAP selector contracts unless tests/visual review explicitly approve replacement.

**Evidence:** line counts 906–1,128 and many effects/callbacks confirm complexity, but not a safe universal split.

**Risk:** High. **Validation:** focused regression test, full command set, desktop/mobile/reduced-motion manual checks. **Rollback:** one commit per extraction. **Expected score:** Maintainability/component architecture +1 when behavior stays identical. **Done:** smaller unit has a named responsibility, explicit interface, and direct tests.

## Phase 7 — Test and validation hardening

**Areas:** `package.json`, `.github/workflows/deploy-pages.yml`, targeted tests.

**Preconditions:** prior phases green.

**Changes:** make CI execute `test:all`; retain existing SEO/prerender flow. Add browser coverage only for cleanup-sensitive contracts: current title/meta, public assets, selector-dependent animation initial states, route direct-load behavior, and reduced motion.

**Risk:** Low to medium (CI duration). **Validation:** local full suite; one Pages workflow run; inspect artifact paths. **Manual:** live Pages six-route smoke pass. **Rollback:** revert CI/test commit. **Expected score:** Testability +1, deployment hygiene +0.5. **Done:** local and CI invoke same complete test contract.

## Phase 8 — Final regression and reassessment

**Areas:** whole repository; audit report update only after evidence.

**Preconditions:** all approved cleanup commits merged.

**Changes:** none before validation; then record before/after inventory, removed files, checks, and score changes.

**Validation:** `git status --short`; `npm ci`; `npm run typecheck`; `npm run lint`; `npm run build`; `npm run test:all`; `npm run check:seo`; `npm run test:launch`; Pages workflow; manual desktop/mobile/reduced-motion checks.

**Risk:** Medium if any broad phase hid a regression. **Rollback:** revert phase commits in reverse order. **Expected score:** 8–8.5 realistic; 10 requires ongoing document discipline, asset ownership policy, and behavior tests for complex motion controllers. **Done:** every cleanup assertion has evidence and no approved change regresses live site behavior.

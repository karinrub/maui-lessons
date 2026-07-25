# Codebase Health Audit — 2026-07-25

## Executive summary

Maui Lessons is a healthy, deployable React/Vite static site with strong route-level separation, real Pages automation, and unusually thorough motion/accessibility regression checks for a small marketing site. Current source is not cluttered with confirmed unreachable React components. Main cleanup risk is documentation drift, not runtime dead code.

**Overall Codebase Health Score: 7.4 / 10.**

This is not a deletion mandate. Evidence supports only a small automatic-cleanup set: three ignored Finder metadata files, one unused package, and two unused palette exports. Seven public/runtime asset candidates are absent from all current source, build output, configuration, and tests, but retain historical-design references; remove only after targeted owner review. Existing ignored `.worktrees/` are not cleanup targets: they may contain active worktree state.

## Post-audit execution status

Completed after this audit: `@gsap/react` removed; `toCssRgb` and
`MAUI_PALETTE_CSS_VARS` removed from `src/styles/mauiPalette.ts`; three ignored
asset-directory `.DS_Store` files removed; `npm run test:all` added; stale
weekly-title regression assertion corrected; `docs/README.md` added as the
current-document entry point. Full test, typecheck, lint, build, SEO, and
launch-readiness validation passed after these changes.

Not executed: seven asset/public-file candidates, mass archival moves, CSS
selector cleanup, component refactors, and ignored worktree cleanup. They need
owner/external-use or runtime evidence beyond the certainty threshold.

`npm audit --omit=dev` also reports two high-severity advisories through
`react-router-dom` 7.18.0 / `react-router` 7.18.0
([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)).
The advisory response offers `react-router-dom` 7.11.0 as its automatic fix,
which is a version downgrade. No dependency security change was made because
that path needs release-note and routing regression review.

## Scope and method

- Inspected tracked repository tree, ignored tooling/worktree directories, Git status, 12 recent commits, package/config/deploy files, all runtime source paths, scripts, tests, public files, asset basename references, and documentation inventory.
- Traced routes from `src/App.tsx`; traced direct imports, lazy imports, `new URL(...)` assets, public-file references, GSAP/ScrollTrigger selectors, tests, scripts, and GitHub Pages workflow inputs.
- Built production output once. Vite emitted only actively imported source assets; it did not emit the six source-image candidates below. Public files are copied verbatim, so build omission alone cannot prove a public file unused.
- No production or test code, assets, dependencies, config, or existing documentation changed in this audit. Only this report and the paired game plan are new.

## Baseline validation

| Command | Result | Evidence |
|---|---|---|
| `npm run typecheck` | Pass | exits 0; `noUnusedLocals` and `noUnusedParameters` enabled for `src/` |
| `npm run lint` | Pass | exits 0; Oxlint config active |
| `npm run build` | Pass | exits 0; six route chunks plus active images/videos emitted |
| `npm test` | Pass | 3/3 booking-submission tests pass |
| `npm run check:seo` | Pass | each route checked; one `h1`, zero images missing `alt` |
| `npm run test:launch` | Pass | FAQ first paint, wordmark collision, rail release, booking preview, 320–1440px overflow checks pass |
| `node --test test/*.mjs` | **Fail** | 62 pass, 1 fail: `test/weekly-rhythm-faithful.test.mjs:43` still expects obsolete title `Ongoing Lessons | Maui Lessons`; source now uses current SEO title |
| `npm run optimize:media` | Not run | intentionally rewrites source videos; prohibited in audit-only phase |

## Score breakdown

| Area | Score | Evidence / main weakness | Genuine 10 requirement | 10 in cleanup? |
|---|---:|---|---|---|
| Project structure | 8 | Clear `pages`, feature components, hooks, config, utilities. | Smaller boundaries for 900–1,128 line controllers. | Partly |
| Maintainability | 7 | Strong comments; several multi-responsibility animation controllers. | Extract testable lifecycle helpers without behavior change. | Partly |
| Dead-code control | 8 | TypeScript catches unused locals; no unused runtime components found. Old docs/assets remain. | remove confirmed leftovers, add repeatable audit checks. | Yes |
| Duplication control | 7 | Shared `playIfInView`, palette, options, metadata exist. Footer/content and motion conventions intentionally repeat. | Consolidate only proven, stable shared contracts. | Partly |
| Documentation health | 4 | 60+ docs; many historical plans remain beside current instructions; several stale claims/paths. | Explicit archive/index/current-source map. | Yes |
| Dependency health | 8 | All but `@gsap/react` traced to source/scripts/config. | remove unused package, lockfile/CI consistency check. | Yes |
| Asset hygiene | 6 | Active assets traced; six old source assets + public sprite have no live use. Large videos are optimized in CI destructively. | owner-approved asset manifest and non-mutating media pipeline. | Partly |
| Styling architecture | 6 | Feature-scoped CSS plus global base; very large page CSS and selector/GSAP coupling. | tokenized shared primitives plus visual regression baseline. | Partly |
| Component architecture | 7 | Feature boundaries generally clear. `OpeningScene`, `Book`, weekly, FAQ, About are oversized. | focused controllers/presenters with behavior tests. | Partly |
| Animation architecture | 7 | GSAP cleanup/reduced-motion work is deliberate and tested. DOM selector coupling is fragile. | scoped selector contracts and lifecycle tests. | Partly |
| Type safety | 7 | strict unused checks, TS source. Booking transport is JS plus `.d.ts`; tests are mostly source-text assertions. | move JS transport/test utilities to TS or validate runtime contracts. | Partly |
| Testability | 7 | Browser checks cover responsive hazards; `npm test` excludes six existing tests and one is stale. | unified test command, semantic/browser coverage for critical flows. | Yes |
| Build/deploy hygiene | 8 | Pages workflow runs CI, SEO, prerender, fallback, deploy. | immutable optimization output and full CI test command. | Partly |
| Cleanup safety confidence | 7 | import/build/reference evidence strong for small candidate set; historic docs/assets require preservation review. | asset registry and current-doc index. | Yes |

## Repository inventory

| Area | Files / role | Classification |
|---|---|---|
| Entry and routing | `src/main.tsx`, `App.tsx`, `layout/SiteLayout.tsx` | Active and required; six lazy/eager routes explicitly defined |
| Route pages | `pages/{Home,TouristLessons,WeeklyLessons,About,FAQ,Book}.tsx` plus `Book.css` | Active and required |
| Shared UI | navigation, footer, transition, structured data, gradient, atmospheric background | Active and required |
| Feature UI | `home/`, `tourist-lessons/`, `weekly/`, `about/`, `faq/`, `booking/` | Active; most feature-local components are single-entry imported by route/page |
| Runtime support | `hooks/`, `config/`, `styles/mauiPalette.ts`, `utils/` | Active except two confirmed unused palette exports |
| Styles | `src/index.css`, 10 feature/page CSS files | Active; selector reachability needs runtime coverage before removals |
| Assets | 22 source images, 2 source videos, public metadata/assets | 16 source images + 2 videos active; 6 images and `public/icons.svg` need targeted review |
| Automation | `scripts/*.mjs`, `.github/workflows/deploy-pages.yml` | Active deployment/QA; media script mutates source files |
| Tests | `scripts/booking-submission.test.mjs`, six `test/*.mjs` | Active files, but only one test file is wired to `npm test`; one stale assertion confirmed |
| Docs | root reports, `docs/`, `inspo/`, plans/specs/audits | Mostly historical technical context; current instructions scattered |
| Generated/temporary | `dist/`, `node_modules/`, ignored `.worktrees/`, `.superpowers/`, `.agents/`, `.DS_Store` | generated/tool state; do not commit/remove blindly |

### Route and dynamic-use evidence

`App.tsx` imports Home eagerly and lazy-loads the five other pages. Every page mounts its named feature root. Dynamic loading exists only at those `lazy(() => import(...))` route boundaries. GSAP selectors are feature-root scoped in the components that own their markup; therefore selector-only CSS cannot be classified as dead by text search. `new URL(..., import.meta.url)` covers source media imports; public assets must be checked separately because Vite copies them directly.

## Documentation retention audit

Actions: **Keep**, **Update**, **Merge**, **Archive**, **Delete**, **Investigate further**. No document is a confirmed deletion in this phase: even stale records can contain unique validation or decision history.

| File path | Purpose / accuracy | Duplicate content | Action | Confidence | Evidence / preservation before deletion |
|---|---|---|---|---|---|
| `README.md` | Current local/build/Pages orientation; omits test commands. | overlaps deployment doc | Update | High | retain deployment facts; add supported validation commands |
| `CLAUDE.md` | Current chronological source map, but 377 lines and older entries conflict with newer banners. | overlaps audit reports | Merge | High | preserve newest verified entries; split current-operating-guide from archive |
| `HANDOFF.md` | Explicitly stale July 15 home handoff. | CLAUDE/spec/plan | Archive | Confirmed | banner says done; preserve commit/task history |
| `docs/GIT_AND_DEPLOYMENT.md` | July 6 status snapshot. | README/workflow | Update | High | replace snapshot with current deployment runbook or archive snapshot |
| `docs/HOMEPAGE_TRANSITION_AUDIT.md` | Explicitly resolved transition analysis. | home scroll spec | Archive | Confirmed | retained root-cause history |
| `docs/2026-07-25-seo-optimization-pass.md` | Current SEO pass record. | CLAUDE SEO entry | Keep | High | unique detailed validation and external follow-up |
| `docs/maui-lessons-codebase-audit.md` | July 6 backlog, many findings now resolved/superseded. | remediation plan/design | Archive | Confirmed | preserve original baseline; do not execute as current backlog |
| `docs/ongoing-lessons-handoff.md` | Recent weekly route history. | CLAUDE/weekly specs | Archive | High | retain unique design/motion rationale; label historical source map |
| `docs/vacation-lessons-handoff.md` | Vacation handoff; deployment facts stale. | CLAUDE/README | Archive | High | retain scene rationale, move only current runbook facts |
| `docs/audit run 23.7/FIX-PROMPT-for-claude-code.md` | One-shot implementation prompt. | 23.7 audits | Archive | Confirmed | historical remediation instructions |
| `docs/audit run 23.7/FIX-PROMPT-mobile-for-claude-code.md` | One-shot mobile prompt. | 23.7 audits | Archive | Confirmed | historical remediation instructions |
| `docs/audit run 23.7/booking-audit.md` | July 23 booking evidence. | 25.7 readiness/CLAUDE | Archive | High | retain baseline/repro record |
| `docs/audit run 23.7/desktop-release-readiness.md` | July 23 desktop snapshot. | 25.7 desktop report | Archive | Confirmed | superseded by newer pass |
| `docs/audit run 23.7/faq-audit.md` | July 23 FAQ evidence. | 25.7 docs | Archive | High | retain unique pre-fix evidence |
| `docs/audit run 23.7/hero-audit.md` | July 23 hero evidence. | 25.7 docs | Archive | High | retain unique pre-fix evidence |
| `docs/audit run 23.7/mobile-release-certification-and-design-audit.md` | July 24 mobile snapshot. | 25.7 mobile reports | Archive | Confirmed | superseded/retested later |
| `docs/audit run 23.7/ongoing-lessons-audit.md` | July 23 weekly snapshot. | weekly handoff/specs | Archive | High | preserve route history |
| `docs/audit run 23.7/vacation-lessons-audit.md` | July 23 vacation snapshot. | vacation handoff | Archive | High | preserve route history |
| `docs/audit run 25.7/FIX-PROMPT-for-claude-code.md` | One-shot remediation prompt. | 25.7 reports/CLAUDE | Archive | Confirmed | task completed per current release |
| `docs/audit run 25.7/desktop-release-readiness.md` | Current dated desktop evidence. | CLAUDE summary | Keep | High | current launch record |
| `docs/audit run 25.7/mobile-device-emulation-audit.md` | Current device-emulation evidence. | mobile readiness | Keep | High | unique methodology/device data |
| `docs/audit run 25.7/mobile-release-readiness.md` | Current launch-readiness evidence. | device audit | Keep | High | unique release conclusion |
| `docs/superpowers/plans/2026-06-29-about-sticky-slideshow.md` | Explicitly superseded unshipped plan. | matching spec | Archive | Confirmed | preserve decision trail |
| `docs/superpowers/plans/2026-07-07-four-ui-fixes.md` | Historical implementation plan. | matching work history | Archive | High | verify completion labels before archival move |
| `docs/superpowers/plans/2026-07-07-home-awwwards-redesign.md` | Historical shipped plan. | HANDOFF/spec | Archive | High | retain implementation rationale |
| `docs/superpowers/plans/2026-07-08-about-aaron-story.md` | Historical About plan. | matching spec | Archive | High | active architecture differs in details; preserve choices |
| `docs/superpowers/plans/2026-07-10-weekly-lessons-skill-levels.md` | Explicitly shipped then superseded. | matching spec | Archive | Confirmed | preserve retired-feature explanation |
| `docs/superpowers/plans/2026-07-12-audit-verification-log.md` | Historic verification log. | design audit | Archive | High | preserve evidence |
| `docs/superpowers/plans/2026-07-12-booking-wizard-redesign-prompt.md` | One-shot prompt. | booking spec | Archive | Confirmed | preserve only as historical prompt |
| `docs/superpowers/plans/2026-07-12-booking-wizard-sage-wash-addendum.md` | Historic addendum. | booking spec/prompt | Archive | High | retain design rationale |
| `docs/superpowers/plans/2026-07-12-design-audit-fixes.md` | Historic plan. | July audit records | Archive | High | preserve validation history |
| `docs/superpowers/plans/2026-07-14-ongoing-lessons-cinematic-media.md` | Historic weekly plan. | matching spec | Archive | High | weekly evolved since plan |
| `docs/superpowers/plans/2026-07-14-weekly-circle-lens-journey.md` | Historic weekly plan. | matching spec | Archive | High | preserve route evolution |
| `docs/superpowers/plans/2026-07-14-weekly-journey-images.md` | Historic weekly asset plan. | matching spec | Archive | High | images still active; preserve provenance |
| `docs/superpowers/plans/2026-07-14-weekly-lessons-title-entrance.md` | Historic plan. | matching spec | Archive | High | retain motion rationale |
| `docs/superpowers/plans/2026-07-14-weekly-mobile-horizontal-scroll.md` | Historic plan. | matching spec | Archive | High | later responsive approach changed |
| `docs/superpowers/plans/2026-07-14-weekly-rhythm-faithful-horizontal.md` | Historic plan. | matching spec | Archive | High | route evolved |
| `docs/superpowers/plans/2026-07-16-weekly-editorial-layer.md` | Historic plan. | matching spec | Archive | High | preserve content decision record |
| `docs/superpowers/plans/2026-07-20-codebase-health-remediation.md` | Old health plan; names files already absent and contains now-stale exact tasks. | matching design/current audit | Archive | Confirmed | retain for prior cleanup evidence; never execute blindly |
| `docs/superpowers/plans/2026-07-20-ongoing-lessons-conversion-redesign.md` | Historic plan. | weekly specs | Archive | High | preserve rationale |
| `docs/superpowers/plans/2026-07-20-ongoing-lessons-scroll-circles.md` | Historic plan. | matching spec | Archive | High | preserve animation history |
| `docs/superpowers/plans/2026-07-21-ongoing-lessons-foundation.md` | Explicitly historical/superseded. | matching spec | Archive | Confirmed | banner supplies evidence |
| `docs/superpowers/plans/2026-07-21-ongoing-lessons-practice-loop-cinematic-polish.md` | Explicitly implemented. | matching spec | Archive | Confirmed | retain validated design record |
| `docs/superpowers/plans/2026-07-23-faq-guided-booking.md` | Historic FAQ plan. | matching spec/current FAQ | Archive | High | retain requirements/source history |
| `docs/superpowers/plans/2026-07-23-ongoing-lessons-local-student-copy.md` | Historic weekly copy plan. | matching spec | Archive | High | preserve approved copy source |
| `docs/superpowers/plans/2026-07-25-launch-readiness-remediation.md` | Just-completed remediation plan. | CLAUDE/current audits | Archive | High | preserve release evidence |
| `docs/superpowers/specs/2026-06-29-about-sticky-slideshow-design.md` | Superseded design. | 06-29 plan/07-08 spec | Archive | Confirmed | retain decision history |
| `docs/superpowers/specs/2026-07-02-home-scroll-sequence-design.md` | Resolved design. | transition audit | Archive | High | preserve orchestrator rationale |
| `docs/superpowers/specs/2026-07-07-hero-awwwards-redesign-design.md` | Historical design. | plan/HANDOFF | Archive | High | retain visual decisions |
| `docs/superpowers/specs/2026-07-08-about-aaron-story-design.md` | Historical but architecture-relevant. | matching plan | Archive | High | preserve as About provenance |
| `docs/superpowers/specs/2026-07-08-about-awwwards-polish-design.md` | Historical polish brief. | About plan | Archive | High | preserve decisions |
| `docs/superpowers/specs/2026-07-10-weekly-lessons-skill-levels-design.md` | Superseded design. | matching plan | Archive | Confirmed | preserve retired feature context |
| `docs/superpowers/specs/2026-07-12-booking-wizard-editorial-redesign-design.md` | Current booking architecture provenance. | booking prompts | Keep | High | still explains live design; mark implementation status |
| `docs/superpowers/specs/2026-07-14-ongoing-lessons-cinematic-media-design.md` | Historical weekly design. | matching plan | Archive | High | preserve evolution |
| `docs/superpowers/specs/2026-07-14-weekly-cinematic-color-progression-design.md` | Historical weekly visual direction. | weekly specs | Archive | Medium | confirm no unique active token requirement before move |
| `docs/superpowers/specs/2026-07-14-weekly-circle-lens-journey-design.md` | Historical weekly design. | matching plan | Archive | High | preserve motion choices |
| `docs/superpowers/specs/2026-07-14-weekly-journey-images-design.md` | Historical asset composition. | matching plan | Archive | High | preserve active-image provenance |
| `docs/superpowers/specs/2026-07-14-weekly-lessons-title-entrance-design.md` | Historical weekly design. | matching plan | Archive | High | retain motion rationale |
| `docs/superpowers/specs/2026-07-14-weekly-mobile-horizontal-scroll-design.md` | Historical responsive design. | matching plan | Archive | High | later approach changed |
| `docs/superpowers/specs/2026-07-14-weekly-rhythm-faithful-horizontal-design.md` | Historical source-direction record. | matching plan | Archive | High | preserve supplied-reference provenance |
| `docs/superpowers/specs/2026-07-15-weekly-journey-polish-design.md` | Historical weekly polish. | weekly plan | Archive | High | retain behavior rationale |
| `docs/superpowers/specs/2026-07-16-weekly-editorial-layer-design.md` | Historical weekly design. | matching plan | Archive | High | retain content rationale |
| `docs/superpowers/specs/2026-07-20-codebase-health-remediation-design.md` | Historical remediation design, partly stale. | 07-20 plan/current audit | Archive | High | preserve previous conclusions, do not execute |
| `docs/superpowers/specs/2026-07-20-ongoing-lessons-editorial-rise-design.md` | Historical weekly design. | weekly plans | Archive | High | retain design history |
| `docs/superpowers/specs/2026-07-20-ongoing-lessons-scroll-circles-design.md` | Historical weekly design. | matching plan | Archive | High | retain motion history |
| `docs/superpowers/specs/2026-07-20-ongoing-lessons-shared-sage-design.md` | Historical weekly design. | weekly plans | Archive | Medium | check current CSS before archival move |
| `docs/superpowers/specs/2026-07-21-ongoing-lessons-metronome-redesign-design.md` | Explicitly historical/superseded. | matching plan | Archive | Confirmed | banner supplies evidence |
| `docs/superpowers/specs/2026-07-21-ongoing-lessons-practice-loop-cinematic-polish-design.md` | Implemented current-design record. | matching plan/weekly source | Keep | High | current weekly provenance |
| `docs/superpowers/specs/2026-07-23-faq-guided-booking-design.md` | Says implementation not started; source is implemented. | matching plan/current FAQ | Update | Confirmed | preserve approved design, correct status/history |
| `docs/superpowers/specs/2026-07-23-ongoing-lessons-local-student-copy-design.md` | Historical copy design. | matching plan/current weekly | Archive | High | preserve approved copy provenance |
| `maui-lessons-design-audit.md` | July 13 audit; many later fixes. | SEO task list/current audits | Archive | High | preserve baseline/re-audit evidence |
| `maui-lessons-seo-task-list.md` | Active-looking backlog with stale references to deleted `SkillLevelSection.tsx`; task 8 text outdated after CI media optimizer. | SEO pass/CLAUDE | Update | Confirmed | reconcile all completed/open claims before retention |
| `ongoing-lessons-awwwards-critique.md` | Explicitly historical. | weekly specs/handoff | Archive | Confirmed | preserve critique history |
| `qa-functional-report.md` | July 20 desktop QA. | 25.7 desktop readiness | Archive | High | preserve earlier evidence |
| `qa-functional-report-mobile.md` | July 20 code-only review; later real emulation supersedes claims. | 25.7 mobile reports | Archive | Confirmed | preserve limits/repro context |
| `vacation-lessons-copy-review.md` | Copy source/review. | vacation components/handoff | Keep | Medium | retain unless copy owner confirms replacement source |
| `inspo/ vac_lessons-concept.md` | Raw concept. | vacation specs | Archive | Medium | preserve creative reference; odd leading-space filename needs careful move |
| `inspo/aboutaaron.md` | Unique owner-provided biography source. | About components/spec | Keep | High | do not delete; factual provenance |
| `inspo/apple.md` | External copied inspiration. | none | Archive | Medium | retain attribution/provenance or remove only with owner approval |
| `inspo/vac_lessons_inspo.md` | External implementation inspiration. | vacation specs | Archive | Medium | retain source reference or owner approval before removal |

**Documentation totals:** Keep 8; Update 4; Merge 1; Archive 67; Delete 0; Investigate further 0. Archive means move only after creating a short current-doc index and preserving Git history; it is not permission to discard content.

## Dead code and cleanup candidates

### Confirmed safe after normal validation

| Candidate | Finding | Evidence | Confidence | Deletion risk | Recommended action |
|---|---|---|---|---|---|
| `@gsap/react` | Unused production dependency. | `rg` found it only in `package.json` and `package-lock.json`; no source/script/test/config import. `gsap` itself is heavily used. | Confirmed | Very low | **Completed:** package + lock entry removed; full suite passed. |
| `toCssRgb`, `MAUI_PALETTE_CSS_VARS` in `src/styles/mauiPalette.ts` | Unused exports. | Definitions were sole runtime hits; no `--maui-*` custom-property use existed outside their object. `toGlslVec3` remains used by NavGradient/HomeAmbientBackground. | Confirmed | Very low | **Completed:** exports and stale comment removed; full suite passed. |
| `assets/.DS_Store`, `assets/images/.DS_Store`, `assets/videos/.DS_Store` | Finder metadata, ignored/untracked. | `.gitignore` includes `.DS_Store`; `git ls-files` returns none; no runtime/config reference. | Confirmed | Very low | **Completed:** local metadata deleted; never tracked. |

### Safe only after targeted validation

| Candidate | Finding | Evidence | Confidence | Deletion risk | Required validation |
|---|---|---|---|---|---|
| `public/icons.svg` | No runtime reference; Vite copies it because it is in `public/`. | No index/source/script/test/config reference; only old remediation plan names it. | High confidence | Low | Check deployed/static URLs and owner use; remove; `build`, Pages artifact inspection, site smoke test. |
| `assets/images/aaron-palms-beach-1.jpg` | No current runtime import. | Appears only in superseded 06-29 spec/plan; omitted from Vite build. | High confidence | Low functional / medium historical | Confirm not retained as owner source photo; remove; build + visual routes. |
| `assets/images/aaron-playing-2.jpg` | No current runtime import. | Only old remediation plan; omitted from Vite build. | High confidence | Low functional / medium historical | Same. |
| `assets/images/aaron-beach-dance-1.jpg` | No current runtime import. | Only FAQ design text; omitted from Vite build. | High confidence | Low functional / medium historical | Same. |
| `assets/images/canopy-bright-1.jpg` | No current runtime import. | Only old remediation plan; omitted from Vite build. | High confidence | Low functional / medium historical | Same. |
| `assets/images/canopy-dense-1.jpg` | No current runtime import. | Only old remediation plan; omitted from Vite build. | High confidence | Low functional / medium historical | Same. |
| `assets/images/canopy-sky-1.jpg` | No current runtime import. | Only old remediation plan; omitted from Vite build. | High confidence | Low functional / medium historical | Same. |

### Must not remove

- All currently imported source components/styles/assets, including apparently duplicated finale/footer markup: each route deliberately owns different visual closing context.
- `gsap`, `lenis`, React, React DOM, React Router, Playwright, Vite, TypeScript, Oxlint, type packages, and React Vite plugin: imports/scripts/config trace each one.
- `scripts/prerender.mjs`, `scripts/check-seo.mjs`, deployment workflow, `public/robots.txt`, `public/sitemap.xml`, and `site.webmanifest`: direct workflow/index/config use.
- `src/utils/playIfInView.ts`: used by FAQ, HomeFinale, VacationStorySections; it centralizes first-viewport reveal behavior.
- `.worktrees/`, `.superpowers/`, `.agents/`: ignored tooling/worktree state. Treat as **Do not delete** until each worktree is inspected for unmerged changes and tool ownership is known.

### Uncertain candidates and verification gaps

| Item | Classification | Why uncertain | Needed validation |
|---|---|---|---|
| CSS selectors, especially in large feature CSS | Requires runtime verification | GSAP/query selectors and conditional classes are not safely decidable from text search. | Playwright route-wide selector coverage or Chrome CSS coverage across interaction/reduced-motion/viewport matrix. |
| Repeated footer markup in Home/FAQ/Weekly/Vacation | Requires runtime verification | Similar navigation/copyright has distinct layout/ink-field contracts. | Visual and accessibility comparison before extracting component. |
| `OpeningScene.tsx`, `Book.tsx`, weekly/About/FAQ controllers | Requires runtime verification | Oversize is confirmed; safe extraction boundaries are not. | Add behavior tests, then extract one responsibility per change. |
| `public/icons.svg` external consumers | Requires runtime verification | Repository has no reference, but public URL could be linked elsewhere. | owner/deployment analytics or redirect policy check. |

## Duplicate and complexity findings

| Area | Finding | Evidence | Recommendation | Confidence |
|---|---|---|---|---|
| Finales/footers | Similar link/copyright structures occur in `HomeFinale`, weekly, vacation, and FAQ via HomeFinale. | route-specific classes, colors, CTA/copy, and SiteLayout suppression show deliberate divergence. | Do not abstract in first cleanup phase. | High confidence |
| Route metadata | Six small page components repeat `useDocumentMeta`. | Each supplies route-specific SEO text and direct component mount. | Accept duplication; central route registry only if metadata/testing needs grow. | High confidence |
| Animation setup | GSAP lifecycle patterns repeat across major components. | each has unique triggers, responsive branches, reduced-motion behavior. | Standardize only cleanup helper boundaries proven by tests; no generic animation framework now. | High confidence |
| Booking state | `Book.tsx` contains data model, step machine, animation, calendar integration, submit transport, accessibility focus. | 906 lines; multiple effects/functions. | Targeted decomposition after baseline test coverage. | High confidence |
| Hero state | `OpeningScene.tsx` owns video, Lenis, focus mode, pin sequence, animation, fallback/accessibility. | 1,128 lines, 10+ effects/callbacks. | High-risk refactor; defer until direct tests exist. | Confirmed complexity / requires runtime verification for refactor |
| Feature CSS | Weekly 1,141 lines, FAQ 875, Book 882, Vacation 719, About 600. | page-scoped files are active; no unused-selector proof. | Do not bulk consolidate; audit only touched selectors with CSS coverage. | High confidence |
| Selector contracts | Many `querySelector`/GSAP class contracts bridge JSX and CSS. | static strings and dynamic state classes. | Document selector ownership before moving markup/CSS. | High confidence |

## Dependency audit

| Package | Runtime/build use | Action | Confidence |
|---|---|---|---|
| `@gsap/react` | No imports anywhere. | Remove later. | Confirmed |
| `gsap` | Numerous animation imports; ScrollTrigger lifecycle. | Keep. | Confirmed |
| `lenis` | Home OpeningScene and About story. | Keep. | Confirmed |
| `react`, `react-dom`, `react-router-dom` | app/runtime/routing. | Keep. | Confirmed |
| `@types/react`, `@types/react-dom`, `@types/node` | TS/Node config. | Keep. | Confirmed |
| `@vitejs/plugin-react`, `vite`, `typescript` | Vite and TypeScript config/build. | Keep. | Confirmed |
| `oxlint` | `npm run lint` and config. | Keep. | Confirmed |
| `playwright` | SEO, prerender, launch scripts, browser tests. | Keep. | Confirmed |
| extraneous packages reported by `npm ls` | local `node_modules` state only, not direct manifest dependencies. | Do not hand-delete; `npm ci` later restores lockfile-exact tree. | High confidence |

## Asset audit

All 16 runtime source images and both videos have direct source imports/config references and were emitted by `npm run build`; keep them. Active videos are 6.2 MB and 3.3 MB locally; workflow runs `optimize:media` before build, which rewrites them in CI only. That design deserves later review because local and CI artifact bytes differ, not because either video is removable.

| Asset group | Status | Evidence |
|---|---|---|
| Active source images (16) | Keep | Direct imports in active home/about/FAQ/tourist/weekly modules; emitted by build. |
| `aaron-ukelele-vid.MP4`, `aaron-weekly-section.mp4` | Keep, optimize rather than delete | Active video elements plus `optimize-media.mjs` explicit inputs; emitted by build. |
| six candidate images listed above | Targeted validation | no runtime source/config/test reference, not emitted; historic docs only. |
| `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml` | Keep | direct index/robots/SEO/deployment references. |
| `public/icons.svg` | Targeted validation | no repository runtime reference; public copy behavior means it still deploys. |
| `.DS_Store` files | Safe delete | ignored/untracked OS metadata. |

## Safe cleanup order and definition of done

1. Establish a reproducible baseline and repair only stale tests/document status claims.
2. Create a current-doc index; archive, do not discard, historical material.
3. Remove confirmed code/package/Finder metadata candidates.
4. Validate and remove approved unused assets/public sprite.
5. Improve test command coverage and only then consider small architecture extraction.
6. Re-run full local suite, Pages-equivalent build/prerender, responsive manual checks, and reassess scores.

Expected benefit: smaller dependency/asset surface, less misleading guidance, reliable cleanup guardrails, and lower future refactor risk. Main risk: static appearance can hide CSS/GSAP/external-public usage; mitigate through narrow commits, complete validation, and reversible Git history.

**Cleanup phase definition of done:** no unclassified candidate remains; every removal has reference/build/runtime evidence; docs have a current entry point plus preserved archive; `npm run typecheck`, `lint`, `build`, `test`, `check:seo`, `test:launch`, and the complete `test/*.mjs` suite pass; Pages workflow succeeds; and a post-cleanup audit records before/after inventory and scores.

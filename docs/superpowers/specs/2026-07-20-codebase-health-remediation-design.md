# Codebase Health Remediation Design

## Goal

Resolve every confirmed, code-owned health-audit finding without changing the visible booking UI or connecting it to an external booking service.

## Scope

- Repair the ongoing-lessons route's document landmarks, footer behavior, and tab/panel ARIA contract.
- Preserve the existing weekly journey rather than introducing the currently orphaned weekly component set.
- Remove unreachable weekly components, their styles, unused palette exports, unused public sprite, and unused production assets.
- Prevent resize and orientation changes from resetting readers to the top of the About and Vacation pages.
- Make booking-step transitions cancellable so an expired timer cannot navigate the wizard after a newer action.
- Harden the WebGL canvases with shader/program checks, cleanup, and a non-WebGL fallback.
- Improve regression coverage with semantic, route, and source-of-truth tests.
- Update operational documentation to state that booking submission is intentionally unconnected and that the confirmation screen does not deliver data. This remains the sole known blocker to a 100/100 production-readiness score.

## Non-goals

- Do not alter booking-page appearance, labels, flow, or confirmation wording.
- Do not send data to Formspree, email, a CRM, or any other external service.
- Do not invent business availability, pricing, contact details, or booking policies.

## Design

`SiteLayout` remains the only document-level `main` owner. The ongoing page will use a section-level wrapper, include its own footer band because the shared footer is deliberately suppressed there, and keep every tabpanel in the DOM so each tab's `aria-controls` target always exists.

The existing weekly journey remains the active implementation. The orphaned `WeeklyPathways`, `WeeklyMonthRhythm`, and `WeeklyStepVisual` implementation will be removed rather than silently changing the current page to a second design.

The booking wizard will keep its existing interface but manage its transition fallback timer through a ref and cleanup function. A later navigation action will cancel an earlier fallback before it can update state.

About and Vacation animation initialization will refresh their layout from the current scroll position; neither will issue a global `window.scrollTo` during breakpoint changes.

WebGL visual components will validate compilation/linking, release GPU allocations on cleanup, and render no canvas animation if initialization fails. The page's existing CSS backgrounds remain the visual fallback.

## Verification

- Add failing regression tests before each behavioral change.
- Run the complete Node test suite, Oxlint, TypeScript no-emit check, production build, SEO check, and prerender.
- Use a local browser check for all public routes, the weekly footer/landmark structure, responsive breakpoint changes, and booking rapid-navigation behavior.

## Known blocker

The booking form currently prevents native submission and displays a confirmation without delivering data. The owner explicitly deferred external integration until the project is otherwise complete. This is documented rather than changed in this remediation pass.

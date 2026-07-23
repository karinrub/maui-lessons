# FAQ Guided Booking Design

**Date:** 2026-07-23  
**Status:** Approved design; implementation not started

## Goal

Elevate `/faq` from a polished mixed-topic accordion into a trustworthy, easy-to-scan booking guide. It must help both Maui visitors and ongoing local students find answers fast, explain why Aaron is a strong choice, and lead to a truthful next action.

This is an evolution of the existing page—not a route redesign. Preserve its cream/sage material language, ghost-type motif, editorial typography, accessible accordion, anchor links, reduced-motion behavior, and `FAQPage` structured data.

## Current-state findings

- The current intro and accordion mechanics match site quality, but the guide mixes vacation and ongoing audiences in the same question sequence.
- Price, format, location, group availability, instruments, and payment are hidden behind accordion rows. These are booking decisions, not secondary details.
- The only image, `aaron-beach-dance-1.jpg`, appears between `The lessons` and `Booking` as a full-bleed break. It reads as decorative interruption and does not demonstrate the private teaching experience.
- The page has no compact proof moment near its booking decision: Aaron's established experience, personal teaching approach, and instrument range are scattered elsewhere in the site.
- Current booking copy says Aaron will receive a request, but `Book.tsx` currently transitions into confirmation without sending a form. Stronger FAQ conversion cannot amplify that misleading promise.

## Product decisions

### Audience routing

Serve vacation and ongoing buyers equally. Give each an immediate in-page route instead of forcing either audience to scan a generic FAQ.

The intro gains a compact, text-led choice rail:

- `Visiting Maui` → Vacation lesson details.
- `Learning week to week` → Ongoing lesson details.
- `Before you book` → Planning, pricing, and booking.

These are in-page anchors, not duplicate routes or tabs. They must remain visible and usable without JavaScript.

### Information architecture

Replace the three current categories with five sections, in this order:

1. **Choose your lesson** — beginner readiness, ages, ukulele or guitar, instrument provided.
2. **Vacation lessons** — private beach lesson, group/family experience, South Maui locations, hotel/Airbnb option.
3. **Ongoing lessons** — regular private progression, learner range, Kihei/Wailea and Maipoina context.
4. **Planning your lesson** — only owner-confirmed logistics such as weather, meeting details, accessibility, travel/parking, changes, and cancellations.
5. **Pricing and booking** — confirmed formats, price, payment, and a truthful booking next step.

The desktop left rail and mobile sticky horizontal rail retain their existing role, but use these headings. Each audience route lands at the appropriate section with correct fixed-header clearance.

### Information visibility

Keep the accordion for explanatory questions. Add a short visible fact strip directly below the audience routing rail so a visitor can answer core booking questions without opening anything:

- Private lessons
- Ukulele or guitar
- Instrument supplied
- South Maui / Aaron comes to visitor accommodation where confirmed
- From `$35 / 30 minutes`

Use editorial ruled rows, not generic cards. Facts must be derived from the same verified source used by `Book.tsx` and FAQ data; do not maintain competing price strings.

The exact publicly visible booking options should reflect current confirmed booking data, not vague wording such as "exact rate depends." Any frequency-based pricing claim must be removed unless the owner verifies it.

### Trust and proof

Place a concise `Why Aaron` proof panel after ongoing lessons and before planning/booking.

It should use only confirmed site facts:

- More than twenty years teaching music on Maui (the live site currently states 22 years).
- Eight years of ukulele focus.
- Private, patient, no-pressure teaching.
- Beginner through advanced; ukulele and guitar.

Include a restrained link to `/about`, not a testimonial placeholder. Real testimonials remain hidden until owner-provided.

### Image direction

Remove the current full-bleed image break. The beach-dance image is not suitable proof for this guide.

Use one existing teaching-focused image only after an asset review confirms the least-reused, best-composed candidate. Place it beside or within `Why Aaron`, with an adjacent text purpose. It must support a claim about one-on-one instruction; it must not split two question groups merely for visual variety.

At mobile width, image follows proof copy in normal flow. Maintain intrinsic dimensions, descriptive `alt`, lazy loading, and a modest rounded crop consistent with existing editorial image treatments.

### Booking integrity

Until booking submission is connected to a real destination, FAQ must not say that a request reaches Aaron or that he will respond. The CTA should use neutral, truthful language such as `Choose a lesson time` or `Start your lesson plan` and link to `/book`.

When a real delivery integration exists, change CTA and FAQ copy to `Request your lesson` only after testing delivery. Add an owner-confirmed response-time expectation only if it is operationally reliable.

## Content source and guardrails

No business facts may be invented. Before implementation, make a source matrix with three states:

- **Confirmed in code/site:** facts safe to render now.
- **Owner confirmation required:** weather, cancellations, rescheduling, transportation/parking, accessibility, availability timing, group limits, and any policy-specific wording.
- **Do not claim:** booking delivery/response until integration is live; cards/Square availability unless current and confirmed.

The FAQ data remains the single source of truth for the rendered accordion and `FAQPage` JSON-LD. Visible facts may be a derived subset of that data or shared verified booking constants; no duplicated values.

## Component design

`FaqSections.tsx` remains the route-level component, but split static data and layout into clear local concerns if the file becomes hard to scan:

- FAQ category/question data, including whether an item is a visible booking fact.
- Audience route data.
- Verified proof facts.
- Rendering for intro/router rail, fact strip, category nav, accordion, proof media panel, and close CTA.

No new dependencies. Retain ARIA-expanded accordion behavior, deep links to individual answers/categories, keyboard focus styles, and reduced-motion final content states.

## Visual behavior

- Preserve warm cream intro and sage FAQ surface.
- Replace compass-only hero emphasis with route clarity; compass may remain as a subdued decorative element if it does not compete with audience routes.
- Maintain ghost type sparingly. Do not add a ghost word to every new module.
- Keep current high-intent gold treatment for pricing/booking progression.
- Avoid card grids and salesy badges. Use type, rules, white space, and one intentional proof image.

## Acceptance criteria

- First screen identifies both visitor and ongoing paths and exposes a clear in-page starting action for each.
- A visitor can find format, instrument, location/service area, and starting price without opening an accordion row.
- Vacation and ongoing answers are not interleaved.
- The only FAQ image has instructional purpose and does not interrupt accordion flow.
- FAQ states only verified operational facts; unsupported policies are omitted.
- Booking language accurately reflects whether data is delivered.
- Exactly one `h1`; valid FAQ structured data derives from rendered question/answer source.
- Desktop and mobile category navigation, audience links, answer deep links, keyboard accordion controls, and reduced-motion layout work.
- No relevant console errors, overflow, hidden content, or fixed-header anchor collisions at desktop and 390 px mobile widths.

## Implementation order

1. Audit and confirm business-fact matrix with owner.
2. Resolve booking delivery or adjust all booking wording to current truthful behavior.
3. Rework FAQ data into five guide sections and shared verified facts.
4. Build audience routing and visible fact strip.
5. Add proof panel and replace decorative beach-dance break with selected teaching image.
6. Update FAQ schema/meta wording where source data changed.
7. Verify desktop, mobile, reduced motion, keyboard, deep-link, and CTA flows.

## Out of scope

- New FAQ route variants or separate vacation/ongoing pages.
- Invented testimonials, policies, pricing, response times, or availability.
- Booking backend selection beyond making current FAQ language truthful.
- A sitewide visual redesign.

# FAQ — Final Audit

Project: Maui Lessons (Aaron Grzanich)
Route audited: `/faq` — FAQ section only
Environment: Chromium, desktop, 1512 px wide
Date: 2026-07-23

Starting assumption (per protocol): **the FAQ is already complete.** The task is only to determine whether observable evidence disproves that.

Section purpose held throughout: the FAQ exists to **remove friction immediately before conversion** — a visitor should leave feeling "I understand how this works, and nothing important is stopping me from booking."

---

## Phase 1 — Observation

- The route opens on a hero headline **"Good questions, honest answers."** (revealed on scroll), then a set of three category cards ("Visiting Maui / Vacation lessons", "Learning week to week / Ongoing lessons", "Before you book / Planning and pricing").
- Below, a two-column layout: a **sticky left "IN THIS GUIDE" index** (01 Start Playing, 02 Vacation Lessons, 03 Ongoing Lessons, 04 Plan Your Lesson, 05 Pricing and Booking) and, on the right, a summary band (PRIVATE LESSONS · UKULELE OR GUITAR · UKULELE SUPPLIED · SOUTH MAUI AND VISITOR ACCOMMODATION · FROM $35 / 30 MINUTES) followed by numbered question sections. Ghost words ("begin") sit behind the content.
- Each question is an accordion button ending in "?"; expanding one reveals an answer prefixed **"Aaron's note."**
- **Critical interaction observation:** while scrolling through the question sections, the numbered scaffolding (01/02…, section eyebrows, the "begin" ghost word) is visible, but the **question rows themselves are blank** — the right-hand content area reads as empty green panels. The first question is open by default (`aria-expanded="true"`) in the DOM.
- Instrumented facts: one `<h1>` ("Good questions, honest answers."), 11 accordion questions present in the DOM, all with substantive answers.

**Full content inventory (from the DOM):**

1. Do I need any experience? — "None at all… moves at your pace, one chord at a time. If you already play, ongoing lessons pick up wherever you are…"
2. What ages do you teach? — "All of them… families often learn side by side."
3. Ukulele or guitar? — "Both… ukulele has been Aaron's focus for the last eight years; guitar lessons come with the same one-on-one attention."
4. What happens in a vacation lesson? — "A private 30-minute or one-hour lesson on a Maui beach… a real song you keep long after the trip ends."
5. Can we book as a group or family? — "Yes… everyone learns the same song, side by side."
6. How do ongoing lessons work? — "They become a regular part of your week. Each lesson picks up exactly where the last left off…"
7. Where do lessons happen? — "Around South Maui… Maipoina Beach Park or along the coast through Kihei and Wailea — and Aaron will come to you, hotel or Airbnb."
8. Do I need to bring my own instrument? — "For ukulele, no. Aaron brings one. For guitar, ask about instrument needs before you arrive."
9. What does a lesson cost? — "Rates start at $35 for a 30-minute lesson. Compare options on the booking page."
10. How do I pay? — "Venmo or cash on the day of your lesson."
11. How do I book? — "The booking page lets you compare lesson options and choose a date and time. Aaron will confirm next steps directly once booking delivery is connected."

---

## Phase 2 — Visitor journey

Having read the site, I arrive interested and nearly ready. The hero line ("Good questions, honest answers") sets an approachable, transparent tone, and the sticky index promises a tidy, skimmable structure organized exactly around how I'd think — visiting vs. ongoing, then planning/pricing. The summary band gives me the gist at a glance (private, ukulele or guitar, ukulele supplied, South Maui, from $35). **But as I scroll into the questions, the panels are empty** — I see section numbers and headings but no actual questions to read or click. Instead of reassurance, the core of the page appears blank, which is disorienting at the exact moment I wanted answers.

---

## Phase 3 — Conversion psychology

The *written* answers, read in the DOM, are excellent and each removes a real hesitation: no experience needed, any age, both instruments, instrument supplied, clear locations (with come-to-you), transparent pricing, simple payment, and a plain booking path. If I could read them on the page, I would feel ready to book.

**As the page actually renders, I do not feel ready — because I cannot see the answers while scrolling.** The remaining hesitation is not a missing topic; it is that the FAQ's content does not display, so it fails to reassure me and could push me to look elsewhere.

---

## Phase 4 — Business evaluation

**Potential student.** The content would make me comfortable booking — but only if it were visible. As rendered, the empty panels leave me uncertain and I might leave to search elsewhere.

**Aaron.** The answers are accurate, warm, and would cut repetitive questions (instruments, price, location, payment). That value is lost while the answers don't display.

**Hiring manager.** The information architecture (category index, "Aaron's note" voice, price anchor, semantic accordion with `aria-expanded`/`aria-controls`) shows real UX and product thinking. But a FAQ whose answers don't appear on scroll would not read as finished frontend work; the reveal defect undercuts otherwise strong craft.

**Senior design lead.**
- *Objective issue:* the accordion question rows render at opacity 0 while in the viewport (measured), so the content is effectively invisible during normal scrolling.
- *Objective (minor):* Q11 answer leaks an internal state ("once booking delivery is connected").
- *Subjective/preference:* the ghost-word styling and quiet palette; the abstract category cards.

---

## Phase 5 — Coverage validation

Mapping the standard booking concerns against the content:

- Experience level — ✅ Q1
- Lesson format — ✅ Q4, Q6
- Scheduling / cadence — ✅ Q6 (weekly), Q11 (choose date/time)
- Location — ✅ Q7 (incl. come-to-you)
- Instruments — ✅ Q3, Q8 (supplied)
- Pricing — ✅ Q9 (+ summary band)
- Payment — ✅ Q10
- Age suitability — ✅ Q2
- Commitment — ✅ Q6
- Vacation vs ongoing — ✅ category split + Q4/Q6
- **Cancellation / weather policy — ❌ not covered.**

On coverage, the only absent topic is cancellation/rescheduling (and, for beach lessons, weather). I am deliberately not turning this into a recommendation: lessons are **pay-on-the-day (Venmo or cash), with no prepayment**, so there is no money at risk and the practical cost of a cancellation is near zero. Under that model, the absence of a cancellation policy is unlikely to *prevent* a booking. It is a possible future nicety, not an omission that blocks conversion, so per the anti-inflation rule it is noted and dismissed.

---

## Phase 6 — Challenge

- **Invisible question rows.** Could another UX lead call this "not a problem"? The only credible counter is that it might be an artifact of the automated browser rather than a real user-facing failure. I tested that directly: the identical automated scrolling reliably triggered scroll-reveal animations on the Home, Vacation, Ongoing, and About sections, and here the questions measured `opacity 0` across many in-viewport scroll positions (scrollY ≈ 300–1300) with screenshots showing blank panels. The failure is specific to the FAQ accordion, not general. No UX lead would accept invisible FAQ answers. **Retained as Required.** (Due-diligence note: the team should still reproduce once on a native browser before/after the fix.)
- **Q11 internal-state copy.** Could it be fine? It's factual and low-stakes, but "once booking delivery is connected" is engineer-facing language that a booking-ready visitor shouldn't see; it can read as "booking isn't working yet." **Retained as a small Recommended copy fix.**
- **Cancellation topic.** Dismissed above (pay-on-the-day removes the risk it would address).

---

## Phase 7 — Tradeoffs

- **Making the question rows visible when in view (R1):** essentially no downside — it restores the intended behavior. A subtle entrance fade can remain, provided it resolves to full opacity. It does not make the FAQ longer, harder to scan, or more overwhelming; it makes the existing content actually readable.
- **Trimming the Q11 caveat (R2):** none — removing the internal-state clause leaves a cleaner, more confident answer. No loss of useful information to the visitor.

---

## Recommendations

### R1 — FAQ question rows do not become visible on scroll *(the finding of this audit)*
- **Observation:** While scrolling the FAQ, the accordion question rows stay invisible; the right-hand content area appears as empty panels. Only section numbers/eyebrows and the ghost word show.
- **Evidence:** Measured the effective computed opacity of every question button (walking the ancestor chain) at multiple in-view scroll positions: all returned **0.00** while `getBoundingClientRect` placed them within the viewport (e.g., scrollY 500/700/1000/1300, tops ranging −54→821 px). Screenshots at those positions show blank green panels. The 11 answers exist in the DOM and the accordion is functional when a row is clicked; the failure is purely that the rows render at opacity 0 until interacted with. The same automated scrolling successfully revealed content on all four other sections, indicating a FAQ-specific reveal defect rather than an environment artifact.
- **Impact:** Directly defeats the FAQ's entire purpose. A visitor arriving to resolve final questions sees no answers, gains no reassurance, and may leave to search elsewhere — the exact friction the FAQ exists to remove. Harms clarity, trust, conversion, and perceived professionalism.
- **Severity:** **Required**
- **Recommendation (smallest change):** Make the accordion items' resting state fully visible — i.e., stop gating their opacity on a scroll-reveal that isn't firing (default them to `opacity:1`, or correct the ScrollTrigger start so it reliably fires when a section enters the viewport). Keep any entrance fade additive and guaranteed to resolve to 1. Verify on a native browser across the full scroll of all five categories.

### R2 — Q11 answer exposes an internal state
- **Observation:** The "How do I book?" answer ends "…Aaron will confirm next steps directly **once booking delivery is connected**."
- **Evidence:** Read from the DOM (answer region for Q11).
- **Impact:** Minor professionalism/confidence. The clause is engineer-facing and can make a booking-ready visitor doubt whether booking works. (Related to the known, accepted state that booking submission isn't wired yet — flagged here only as user-facing copy.)
- **Severity:** **Recommended**
- **Recommendation (smallest change):** End the answer at "…choose a date and time," or replace the clause with a neutral line such as "Aaron will confirm your lesson directly."

No other changes are recommended. The question set, category structure, "Aaron's note" voice, price anchor, and semantic accordion markup all meet a professional standard and — once R1 is fixed — need no further work.

---

## Final validation (independence test)

Rereading with fresh eyes: the first thing I'd independently flag is that **the questions don't appear as I scroll** — it's impossible to miss when you try to actually use the FAQ. I'd also independently notice the "once booking delivery is connected" clause reading like a leftover TODO. I would **not** independently invent missing questions (coverage is strong) or flag the styling. Both recommendations survive; nothing is inflated.

---

## Final Verdict

**Friction removal — No (as currently rendered).** The written answers would remove friction, but because the question rows do not become visible on scroll, the FAQ does not deliver its content and therefore does not remove hesitation — and may add it. Contingent entirely on R1.

**Trust — Split, netting No as rendered.** The copy ("honest answers," transparent pricing/payment/locations, patient tone) is trust-building; but empty panels where answers should be undermine confidence at the decision moment. Once R1 is fixed, the answer is a clear Yes.

**Conversion — No (as rendered).** Invisible answers cannot support the booking decision. With R1 fixed, the content is well-targeted to convert.

**Craftsmanship — No (as rendered).** The IA and semantic accordion are portfolio-grade in concept, but I would not showcase a FAQ whose answers don't display. After R1, this becomes a confident Yes.

**Client delivery — No.** Not production-ready while the questions/answers don't render on scroll. After R1 (and ideally R2), yes.

**Remaining required work:**
1. **R1 — Fix the accordion question reveal** so the questions/answers are visible when scrolled into view (verified on a native browser across all five categories).

*(R2 is a recommended, non-blocking copy tidy. The absent cancellation/weather topic is intentionally not required, given the pay-on-the-day model.)*

**Confidence — High.** The core finding rests on direct, repeated measurement (effective opacity 0 for every in-view question across many scroll positions) corroborated by screenshots, plus the contrast that the same automation revealed content correctly on four other sections. The content inventory and coverage were read directly from the DOM. The one caveat — recommended, not doubt — is to reproduce R1 on a native browser as due diligence before and after the fix.

---

## Final Decision

Because a **Required** issue remains, the diminishing-returns conclusion does **not** yet apply.

Once R1 is resolved and verified (and R2 optionally applied), the FAQ's content and information architecture are strong enough that **no further design iteration would be warranted** — at that point the FAQ will have reached the point of diminishing returns and effort should move elsewhere. Until R1 is fixed, this section is **not** complete.

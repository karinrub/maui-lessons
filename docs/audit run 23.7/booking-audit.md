# Booking Experience — Final Audit

Project: Maui Lessons (Aaron Grzanich)
Route audited: `/book` — complete booking flow
Environment: Chromium, desktop, 1512 px wide
Date: 2026-07-23

Starting assumption (per protocol): **the booking flow is already production-ready.** The task is only to determine whether observable evidence disproves that.

Purpose held throughout: the booking page must **turn intent into action** with no re-persuasion needed. The visitor should never wonder "what do I do next / did something happen / is this broken," and should leave feeling **"booking this was effortless."**

Note on scope: the known, accepted state that booking submission is not yet wired ("we'll take care of routing as the last task") is treated as out of scope; this audit evaluates the flow's usability, feedback, and rendering as they currently exist.

---

## Phase 1 — Pure observation

I completed the flow end to end (Vacation path), at varying speeds, with backtracking, an empty submit, and a full valid submit. Observations:

- **Entry:** `/book` opens with a "BOOK A LESSON" eyebrow and a headline that reveals on scroll; a **persistent 4-step progress stepper** sits at the top: **LESSON TYPE · DATE & TIME · BOOKING SUMMARY · CONFIRMATION**, with a live breadcrumb "YOUR LESSON — …" that updates with each choice.
- **Step 1 (Lesson type):** "Choose your experience" with two editorial rows — "Vacation Lessons / Ukulele Experience" and "Ongoing Lessons" — each with a description. Renders clearly once settled.
- **Step 2 (Pace/size):** After selecting a type, "Choose your vacation lesson" with five priced rows (1 person 30 min $35 · 1 person 1 hr $60 · 2–3 ppl $80 · 4–5 ppl $100 · 6–8 ppl $120). A "Back" link is present.
- **Step 3 (Date & time):** Calendar (July 2026) with **past dates disabled, today circled, month navigation**, and an empty-state "No date chosen yet — Choose a date to see available lesson times." Selecting a date **instantly** shows time slots (7 AM–5 PM) on the right.
- **Selection auto-advances** — choosing an option or a time moves to the next step without a separate "Next" click.
- **Final step (Summary + contact):** A "Change selections" link and a summary (Date/Time), then a contact form — Name, Email, Phone, Message ("Anything else Aaron should know?") — and a "Send booking request" button plus "Back."
- **Validation:** Name and Email are `required`; clicking submit empty is blocked by native validation, which focuses the first invalid field.
- **Confirmation:** A valid submit advances to a "Request received" screen with a full "YOUR REQUEST" summary (Lesson, Group size, Duration, Price, Date, Time, Name, Email) and "Aaron will follow up by email to confirm the time and next steps."
- **Critical behavior:** On **every step transition**, the new step's content appears **blank** and does **not** become visible on its own. Measured effective opacity of the incoming content while *not* scrolling:
  - Step 3 calendar day-cells: **opacity 0 at t≈2.2 s** after the step loaded (31 day-buttons present in the DOM, all invisible); screenshot shows an empty calendar area.
  - Final-step form: **all 10 inputs at opacity 0 at t≈2 s**; screenshot fully blank.
  - Confirmation: blank at t≈2 s after submit; the "Request received" content and summary only appeared after a manual scroll.
  In each case a small scroll nudge revealed the content; waiting did not. Hidden context fields correctly carried the full selection (`lessonType=vacation, participants="1 person", duration="1 hour", price="$60", date="2026-07-24", timeSlot="9:00"`), and the confirmation displayed Name/Email accurately.

---

## Phase 2 — User journey

I choose "Vacation Lessons," and the page moves me forward — but the next screen is **empty**. I see a heading ("Choose your vacation lesson") and nothing under it, so I hesitate, unsure if it's loading or broken; if I happen to scroll, the price options appear. I pick a pace and it happens again — "When would you like to play?" over a **blank** area until I scroll, at which point a nice calendar appears. Picking a date is satisfying (times appear immediately). I choose a time and land on a **blank** screen again; scrolling reveals the contact form. I fill in my name and email, click "Send booking request," and the screen goes **blank once more** — no visible confirmation that anything happened. Only when I scroll do I find "Request received" with a tidy summary. The *bones* of this flow feel effortless — a clear stepper, instant time slots, auto-advance, a clean recap — but the repeated blank screens make the actual experience feel uncertain and broken at exactly the moments I most need reassurance.

---

## Phase 3 — Friction analysis

- **Choosing lesson type:** low thinking; clear. *But* the advance lands on a blank step → hesitation.
- **Choosing pace/size:** clear priced rows once visible; blank-on-arrival is the friction.
- **Date & time:** the calendar and instant time slots are excellent and low-friction *once visible*; the blank arrival is the friction.
- **Contact form:** minimal fields (Name/Email required, Phone/Message optional) — low effort; blank-on-arrival is the friction.
- **Submit → confirmation:** blank screen immediately after clicking submit is the single highest-risk friction point — a user reasonably concludes the request failed and abandons or re-submits.

At every transition, a visitor could reasonably abandon because the page appears empty/broken. The friction is not the flow's structure (which is good) — it is the reveal defect.

---

## Phase 4 — Conversion psychology

I have decided to book. What could change my mind? **Repeated blank screens.** Each step momentarily looks broken, and momentum is lost four times (type → pace → date/time → contact), then a fifth time after I submit, when I get **no visible confirmation**. That final blank is the most damaging: at the peak of intent, the absence of feedback creates doubt that my request went through. Nothing about the *content* would deter me — it's the rendering that repeatedly interrupts trust and momentum.

---

## Phase 5 — Business evaluation

**Customer.** I could complete it, but only if I figure out that I must scroll at each step. The blank submit screen would make me doubt it worked; I might email Aaron to check — the opposite of "effortless."

**Aaron.** The flow captures everything he needs (type, size, duration, price, date, time, name, email) and ends with a clean recap — but the blank steps will cost completed bookings and likely generate "did my booking go through?" messages, increasing his manual communication.

**Hiring manager.** The information architecture, the 4-step stepper, auto-advance, the calendar (disabled past dates, empty state), the state management (hidden context fields), native validation, and the confirmation recap are portfolio-grade in concept. But a booking flow that shows a blank screen on every step — and after submit — is not something I'd showcase until fixed.

**Senior product designer.**
- *Objective issue:* every step transition renders the incoming content at opacity 0 until a manual scroll (measured), including the post-submit confirmation.
- *Subjective/preference:* the ghost-numeral styling; the quiet palette.
- *Known dependency (not a new issue):* the confirmation promises an email follow-up while submission routing is not yet connected.

---

## Phase 6 — Edge cases

- **Empty submit:** correctly blocked; Name/Email are `required` and native validation focuses the first invalid field. Good.
- **Change selections / Back:** affordances present at the contact step and on inner steps; selections persist in state (hidden fields intact).
- **Date logic:** past dates disabled, today circled — correct.
- **In-step updates (date → times):** instant, no blank — so the defect is specific to *step transitions*, not to all rendering.
- **Full valid submit:** advances to "Request received" with an accurate, complete summary — state carried correctly end to end.

The system handles inputs and state gracefully; the single failure mode is the step-transition reveal.

---

## Phase 7 — Challenge

**Blank-on-advance.** Could another product designer call this "not a problem"? The only credible counter is that it's an artifact of the automated browser rather than a real user-facing failure. I tested that directly and reject it: (1) the same automated scrolling revealed content correctly across the Home, Vacation, Ongoing, and About sections, and in-step updates here (date → time slots) rendered instantly; (2) I measured the incoming content at opacity 0 persisting for 2+ seconds with no scroll on the calendar, the form, and the confirmation; (3) waiting never resolved it — only scrolling did. No product designer would accept a booking flow that shows blank screens at every step and immediately after submit. **Retained as Required.** (Due-diligence note: reproduce on a native browser before/after the fix.)

The confirmation-copy/email dependency is a known, accepted state (routing is the planned last task), so it is documented as context, not raised as a new defect.

---

## Phase 8 — Tradeoffs

- **Making each step's content visible on advance (R1):** essentially no downside to simplicity, speed, momentum, clarity, trust, or conversion — it restores the intended behavior and removes the friction. Any entrance fade can remain provided it resolves to full opacity without requiring a scroll, and the auto-scroll-to-new-step should land with content already visible. This *only* improves the flow.

---

## Recommendations

### R1 — Each booking step (and the confirmation) renders blank until the user scrolls *(the finding of this audit)*
- **Observation:** On every step transition — pace/size, date & time, contact form, and the "Request received" confirmation — the incoming content appears blank and does not become visible on its own; only a manual scroll reveals it.
- **Evidence:** Measured effective computed opacity (walking the ancestor chain) of the incoming content while not scrolling: calendar day-cells = **0.00 at ~2.2 s** (31 cells present); all 10 form inputs = **0.00 at ~2 s**; confirmation blank at ~2 s. Screenshots at each point show empty content areas with only the wordmark/footer/ghost-numeral visible. A scroll nudge revealed the content each time; waiting did not. In-step updates (date → time slots) rendered instantly, isolating the defect to step transitions.
- **Impact:** Directly attacks completion and confidence at the highest-intent moments. A visitor repeatedly meets what looks like a broken/empty page, loses momentum at each step, and — most damagingly — receives **no visible confirmation after clicking "Send booking request,"** which reads as a failed submission and invites abandonment or duplicate attempts and follow-up emails. Harms conversion, trust, clarity, and perceived professionalism.
- **Severity:** **Required**
- **Recommendation (smallest change):** Ensure each step's content is fully visible the moment the step becomes active — i.e., stop gating step content on a scroll-reveal that doesn't fire on step change (default the incoming content to `opacity:1`, or trigger/refresh the reveal on step mount), and have the auto-scroll land on a step whose content is already visible. Keep any entrance fade additive and guaranteed to resolve without a scroll. Verify on a native browser across all steps and the confirmation.

No other changes are recommended. The stepper, breadcrumb, priced option rows, calendar (disabled past dates, empty state, instant time slots), auto-advance, state management, required-field validation, "Change selections"/"Back" affordances, and the confirmation recap all meet a professional standard and — once R1 is fixed — need no further work.

---

## Final validation (independence test)

Completing the flow again with fresh eyes: the thing I would independently flag, immediately and every time, is that **each step goes blank until I scroll — including right after I submit.** I would not independently invent other problems; the rest of the flow is genuinely well made. R1 survives; nothing is inflated.

---

## Final Verdict

**Booking experience — No (as currently rendered).** The flow's structure is effortless in concept, but the repeated blank screens at every transition — and after submit — make the real experience feel uncertain and broken rather than effortless. Contingent entirely on R1.

**Conversion — Yes, it is meaningfully reduced,** at four transitions and, most critically, at the submit → confirmation moment where the user gets no visible feedback. Exact locations: pace/size step, date & time step, contact step, and the "Request received" confirmation.

**Trust — No (as rendered).** The stepper, calendar, validation, and recap are professional, but blank screens at decision moments undercut trust and would prompt "did it go through?" doubt. With R1 fixed, this becomes Yes.

**Craftsmanship — No (as rendered).** Architecture, state management, validation, and confirmation are portfolio-grade in concept, but I would not showcase a booking flow that blanks on every step. After R1, a confident Yes.

**Client delivery — No.** Not production-ready while every step and the confirmation render blank until scroll. After R1 (and with submission routing later connected as planned), yes.

**Remaining required work:**
1. **R1 — Fix the step-transition reveal** so each step's content (options, calendar, contact form) and the confirmation are visible immediately without a manual scroll (verified on a native browser).

*(The submission routing is a separately-planned task and is not counted here; once it's wired, the confirmation's "Aaron will follow up by email" promise becomes true.)*

**Confidence — High.** The core finding rests on repeated, direct opacity measurements (0.00 while in view, persisting for 2+ seconds) corroborated by screenshots across multiple steps and the confirmation, plus the contrast that the same automation rendered content correctly elsewhere and for in-step updates. The one caveat — recommended, not doubt — is to reproduce R1 on a native browser before and after the fix.

---

## Final Decision

Because a **Required** issue remains, the diminishing-returns conclusion does **not** yet apply.

Once R1 is resolved and verified (and submission routing connected per the existing plan), the booking experience's structure, state handling, validation, and confirmation are strong enough that **no further design iteration would be warranted** — at that point it will have reached the point of diminishing returns and effort should move elsewhere. Until R1 is fixed, this booking experience is **not** complete.

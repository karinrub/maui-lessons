
# Maui Lessons — Website Design & Conversion Audit

**Site audited:** https://karinrub.github.io/maui-lessons/
**Business:** Maui Music Lessons (Aaron Grzanich) — ukulele/guitar lessons for tourists and local students
**Audit date:** July 11, 2026
**Method:** Live rendered review (Chrome, desktop viewport ~1512px and constrained narrow viewports down to ~500px), interactive testing (clicks, forms, accordions, calendar), DOM/JavaScript inspection, and cross-reference against the project's own internal engineering documentation (`CLAUDE.md`, verified 2026-06-29).

A note on that internal documentation before anything else: `CLAUDE.md` describes the home page content section as unbuilt (`{/* HOME CONTENT GOES HERE */}`) and the booking form as a read-only, non-functional placeholder. **Neither is true of the live site as of this audit.** The deployed site is materially ahead of its own documentation — real home-page content, a real booking wizard with a working calendar, and real page copy exist across every route. This audit evaluates what is actually live, not what the internal docs describe.

---

## 1. Executive verdict

**Current score: 69/100**

The site does not yet feel premium as a whole, though large parts of it clearly are. It is genuinely bespoke, not template-derived — the biography timeline on the About page, the WebGL navigation gradient, and the recurring ghost-numeral motif could not be dropped into an unrelated business unchanged. Its strongest quality is the About page: a specific, well-paced, art-directed account of a real person's 22-year path to teaching ukulele in Maui, which does more for trust and memorability than anything else on the site. Its greatest weakness is a confirmed, reproducible failure at narrow viewport widths in which the hero video never finishes loading, the header stays permanently hidden, and the visitor is left on a blank page with no way to navigate — a serious problem for a site whose stated audience is tourists, who disproportionately browse on phones. The most important opportunity is closing that mobile gap and adding the trust/pricing signals (testimonials, a stated location, expectation-setting on cost) that a paying tourist needs before booking a stranger. From a design and UX perspective the desktop experience is close to launch-ready; the site as a whole is not, because of the mobile-access risk and the missing trust layer.

---

## 2. Weighted scorecard

| Category | Max | Earned | Rationale |
|---|---|---|---|
| Visual design & art direction | 15 | 12 | Coherent, restrained palette (cream/forest green/sage/gold) and considered composition on Home, Vacation Lessons, and About. Loses points to a low-contrast hero tagline moment on Vacation Lessons and to image crops that repeat with little variation in treatment. |
| Brand distinctiveness / freedom from template patterns | 15 | 13 | Custom WebGL nav gradient, ghost-numeral editorial motif, and a specific, real biography are all hard to imitate. Among the strongest scores on the sheet. |
| Typography, hierarchy, readability | 10 | 7 | Fraunces/serif display type paired with a plain sans body reads as intentional and premium. Docked for zero `<h1>` elements found in the DOM (confirmed) and one low-contrast headline moment. |
| Layout, spacing, composition, rhythm | 10 | 8 | Home, Vacation Lessons, and About are art-directed as sequences, not just stacked sections. Ongoing Lessons is comparatively flat (pill selector + timeline + CTA) and reads less considered than its siblings. |
| UX, navigation, IA | 10 | 6 | Nav is minimal and clear, CTA language is consistent ("Book a Lesson" / "Book This Experience"), and the accordion/tab/wizard interactions all work. Docked for a footer that differs across pages for no apparent reason and for the absence of any fallback path to navigation if the homepage intro sequence stalls. |
| Content clarity, persuasion, trust, conversion journey | 10 | 6 | Copy is specific and emotionally well-pitched ("Most vacation activities end when you fly home. This one doesn't."). Docked for zero testimonials or social proof anywhere on the site, no stated meeting location/beach on the Vacation Lessons page, and no price anchoring anywhere. |
| Mobile responsiveness & cross-viewport quality | 10 | 4 | Confirmed, reproduced defect: at narrow viewport widths the hero video does not reach a loaded state and the header remains permanently suppressed, leaving a blank page with no navigation. See Section 11 for full evidence and caveats. |
| Interaction design, motion, feedback | 5 | 4 | Scroll-driven card carousels, a functional tabbed skill-level selector, a working accordion, and a fully functional multi-step booking wizard with a real calendar all performed correctly in testing. |
| Accessibility & inclusive usability | 5 | 2 | 4 of 5 `<img>` elements on the homepage are missing `alt` text (confirmed via DOM query). No `<h1>` found anywhere in the homepage DOM. Landmark structure (`header`, `nav`, `main`) is present and correctly used, which is a genuine positive, but not enough to offset the above. |
| Frontend polish, consistency, perceived performance | 5 | 3 | Three different footer treatments across six routes (full nav+copyright on Home, none on Vacation/Ongoing/About, a stripped two-link version on FAQ). A 14MB `preload="auto"` hero video with no confirmed load-failure fallback is a real perceived-reliability risk, and is already flagged as a known risk in the project's own internal documentation. |
| Cohesion, memorability, overall premium impression | 5 | 4 | The repeated ghost wordmark and numeral motif, restrained palette, and specific biography give the site a point of view that persists after leaving it — on desktop. |
| **Total** | **100** | **69** | |

Arithmetic: 12 + 13 + 7 + 8 + 6 + 6 + 4 + 4 + 2 + 3 + 4 = **69**.

Categories below 80% of available points (visual design 12/15=80% is at the line; everything from Typography down is below 80%) are explained inline above and in Sections 6, 7, 10, and 11 with specific evidence.

---

## 3. First-impression test

**After 5 seconds (desktop):** A prospective customer sees a full-bleed Maui beach photo with palm trees, then a centered video frame of a man's hands playing ukulele fades in. The tagline "Learn your first ukulele song on one of the world's most beautiful beaches" appears as they begin to scroll. This is a **direct observation**: the offer (ukulele lessons), the setting (a real Maui beach), and the emotional register (calm, sensory) are legible almost immediately. The customer's likely next action is to keep scrolling — the page invites it.

**After 30 seconds:** The visitor has scrolled into "Choose your experience" and seen three lesson types (Private Ukulele Lessons, Guitar Lessons, Group Experience) with real descriptive copy, then a preview of "Meet Aaron" with a photo and a short bio line. This is a **direct observation** of what's on the page; the **interpretation** is that a visitor now understands who teaches, what the formats are, and that this is a real, non-touristy small operation rather than an agency. A likely hesitation at this point: no price has been mentioned, and no specific beach or meeting point has come up yet.

**After 2 minutes:** A visitor who continues into the About page timeline (Illinois State University 1999 → Asheville, NC → College of San Mateo, CA → Fort Collins, CO where he first studied ukulele → Maui, 2023–present, plus a specific detail that he plays at Keolahou Church on Thursday nights) will have a strong, credible sense of who Aaron is — this is **direct observation** of unusually specific, non-generic biographical content. The **interpretation** is that this level of specificity is doing real trust-building work that most competitor sites in this category do not attempt. The remaining open question at 2 minutes, for a tourist specifically, is still practical: what does this cost, and where exactly do I meet him? Neither is answered without navigating to the FAQ and finding a deliberately deferred pricing answer. The likely next action is either to open the Book flow (if trust is high enough already) or to look for a price before committing further attention.

---

## 4. Creative-direction diagnosis

**Art direction:** Cinematic and editorial rather than "marketing site" — full-bleed photography, scroll-driven pinning, and a recurring ghost-numeral/wordmark device that functions almost like a watermark across every page. This is consistent and repeated with enough discipline to read as a system, not a one-off flourish.

**Typography:** A serif display face (Fraunces, per the codebase) in both upright and italic cuts carries every emotional headline; body copy is a plain, quiet sans. This is a coherent two-voice system — display type for feeling, body type for information — used consistently across all six routes.

**Composition:** Home, Vacation Lessons, and About are genuinely art-directed as sequences: intro → pin → reveal → conclusion, with intentional pacing. Ongoing Lessons breaks this pattern and reads as a more conventional stacked layout (tab selector, then a vertical numbered list, then a CTA), which is a noticeable dip in ambition relative to its siblings.

**Color:** Warm cream, deep forest green, sage green, and a warm gold/amber gradient reserved specifically for the navigation overlay and the Book page. This restraint — using the boldest color only at the two highest-intent moments (opening the menu, booking) — is a deliberate and effective choice.

**Imagery:** A small, real photo library used honestly — actual candid photos of lessons in progress, not stock tourism photography. Repetition of a handful of images across pages is accepted per this audit's scope and does not reduce the score; see Section "Image use" embedded in Sections 6–7 for how it's treated.

**Copy:** Specific and restrained. Lines like "No classroom, no crowd, just the beach and the instrument" and "Most vacation activities end when you fly home. This one doesn't" sound like they were written for this business, not adapted from a template library.

**Motion:** GSAP/ScrollTrigger-driven pinning and horizontal-scroll storytelling (confirmed on Home and About) is used to communicate — the About page's horizontal timeline literally paces out a chronological story — rather than purely for decoration.

**Restraint:** Largely restrained. The one place restraint slips is the Book page, which switches to a dark green-to-gold gradient card chrome distinct from the rest of the site's palette — a legitimate "special moment" treatment for the highest-intent page, but one that isn't foreshadowed anywhere else on the site.

**Consistency:** Strong on typography and color; weak on structural consistency — see the footer inconsistency documented in Section 6.

**Brand memorability:** High on desktop. The specific biography and the ghost-numeral motif are the two most ownable, hardest-to-copy elements on the site.

**Current aesthetic in one sentence:** A restrained, editorial, scroll-driven scrapbook of a real Maui musician's life and teaching practice, built around warm neutral tones and a recurring numeral/wordmark motif.

**Recommended evolution in one sentence:** Extend the same specificity and pacing discipline that already defines the About page and the opening scene into Ongoing Lessons, the footer, and the mobile experience, rather than introducing any new visual language.

---

## 5. What is working

**Location:** About page, full biography sequence.
**What works:** A four-part, horizontally-paced timeline with real dates, real places, and one small, specific, checkable detail ("plays at Keolahou Church on Thursday nights").
**Why it works:** Specificity is the opposite of template copy. A visitor cannot get this content from a page-builder theme.
**Contribution:** Directly builds the "experienced" and "trustworthy" brand attributes named in the brief.
**Risk of weakening it during refinement:** High if anyone tries to "streamline" or shorten the biography in a future content pass — this is the single highest-trust asset on the site and should be protected, not condensed.

**Location:** Global — the ghost "AARON GRZANICH" wordmark and the ghost numerals ("01/02/03," "01/03," "02/03," "03/03") repeated across Home, About, and the card carousels.
**What works:** A consistent, understated art-directed device that appears on every page without becoming a gimmick.
**Why it works:** It's structural, not decorative — it doubles as a progress/wayfinding cue.
**Contribution:** Brand memorability and a sense of an intentional system.
**Risk:** Overuse if extended further; it currently sits at the right frequency.

**Location:** Book page, steps 3–4 (calendar and details review).
**What works:** A real, correctly-functioning calendar (confirmed: past dates in July 2026 are disabled, today is selectable, hour slots populate on date selection) and an editable review summary with per-field "Change" links back to earlier steps.
**Why it works:** This is meaningfully better UX than the "read-only placeholder" the project's own documentation still describes it as.
**Contribution:** Directly reduces booking friction and cognitive load.
**Risk:** None identified from redesign; risk instead is regression if a future change reintroduces the read-only state described in stale docs.

**Location:** Ongoing Lessons page, skill-level selector.
**What works:** A three-way pill toggle (Beginner/Intermediate/Advanced) that correctly swaps headline, copy, bullet list, and photo when clicked (confirmed via direct interaction).
**Why it works:** Lets a visitor self-segment in two seconds without leaving the page.
**Contribution:** Reduces cognitive load for a page serving two very different audiences (locals at different skill levels).
**Risk:** Low, but worth protecting the instant-feedback speed if content is expanded.

**Location:** Global CTA language.
**What works:** "Book a Lesson" / "Book This Experience" is used consistently everywhere a primary CTA appears.
**Why it works:** One verb, one destination, no competing calls to action.
**Contribution:** Removes decision friction at the moment of highest intent.
**Risk:** Low.

---

## 6. What is missing

**Location:** Vacation Lessons page (the primary tourist conversion page).
**Missing element:** Any stated location, beach name, or meeting-point information.
**Evidence:** Full page-by-page read of the Vacation Lessons route; the only geographic reference anywhere on the site is "Maui" generally and, separately, "Keolahou Church" on the About page (unrelated to where lessons happen).
**Why it matters:** The brief's stated conversion goal is explicitly "an oceanside experience for tourists" — tourists booking an in-person meetup with a stranger need to know roughly where before they'll commit attention to booking.
**Severity:** High.
**Confidence:** Strong inference (I reviewed the full rendered page and did not encounter this information, but cannot fully rule out that it appears only inside the booking flow after a lesson type is selected).
**Recommendation:** State the general meeting area (even a neighborhood/beach name, without exact GPS for safety reasons) on the Vacation Lessons page itself, near the CTA.
**Works with existing image library:** Yes — no new photography required, this is a copy addition.

**Location:** Sitewide.
**Missing element:** Any testimonial, review, or third-party trust signal.
**Evidence:** Confirmed absent across all six routes reviewed.
**Why it matters:** "Trustworthy" is one of three explicit desired brand attributes in the brief, and social proof is the standard mechanism for establishing trust with strangers before an in-person, paid interaction.
**Severity:** High.
**Confidence:** Confirmed (direct observation across every page).
**Recommendation:** Even a small number of short, specific quotes (not a generic 5-star carousel — that would itself be a template tell) would materially close this gap.
**Works with existing image library:** Yes — text-based, no photography dependency.

**Location:** FAQ / Booking category.
**Missing element:** Any concrete pricing or price range, even a "starting at" figure.
**Evidence:** The "What does a lesson cost?" question is answered with "Rates depend on the lesson type and how often you'd like to meet. Send a booking request and Aaron will confirm current pricing with you directly."
**Why it matters:** This is a deliberate, reasonable business choice, not an error — but for a tourist audience comparison-shopping activities on a trip, price-anchoring absence is a known point of drop-off before booking.
**Severity:** Medium (deliberate business decision, not a defect — flagged as an opportunity, not a fault).
**Confidence:** Confirmed.
**Recommendation:** If exact pricing can't be published, consider a price range or "from $X" figure, which still respects flexibility while giving enough anchoring to keep a tourist in the funnel.
**Works with existing image library:** Yes.

**Location:** Homepage DOM, sitewide.
**Missing element:** Semantic `<h1>` heading.
**Evidence:** `document.querySelectorAll('h1').length` returned `0` on the homepage (confirmed via direct DOM query).
**Why it matters:** Screen-reader users and search engines both rely on a single clear `<h1>` for page structure; its absence is an accessibility and SEO gap.
**Severity:** Medium.
**Confidence:** Confirmed for the homepage; not independently re-verified on every other route, but the same component patterns (styled divs/spans for display type) appear to be reused sitewide, so this is a strong inference for other pages.
**Recommendation:** Apply a real `<h1>` to the primary headline on each page (visually unchanged, styled via CSS as today).
**Works with existing image library:** N/A (code fix, not content).

**Location:** Homepage, hero imagery.
**Missing element:** `alt` text on most images.
**Evidence:** DOM query found 5 `<img>` elements on the homepage, 4 of which have no `alt` attribute or an empty one.
**Why it matters:** Screen-reader users get no description of meaningful photography; this also affects image SEO.
**Severity:** Medium.
**Confidence:** Confirmed.
**Recommendation:** Add short, specific `alt` text to every content image (the decorative ghost numerals and background textures can remain `alt=""` if purely decorative).
**Works with existing image library:** Yes.

---

## 7. What is overdone

Very little on this site is genuinely excessive. Two smaller notes:

**Location:** Book page.
**What's overdone relative to the rest of the site:** The dark green-to-gold gradient card chrome is a noticeably different visual register from the cream/sage palette used everywhere else, introduced with no earlier foreshadowing.
**Evidence:** Direct visual comparison across all six routes.
**Why it slightly reduces cohesion:** A visitor arriving at Book from any other page experiences a small tonal jump rather than a natural continuation.
**Confidence:** Subjective judgment.
**Recommendation:** This is a legitimate expressive choice for the highest-intent page and does not need to be removed — but introducing the gold accent once, earlier (e.g., as the accent color on primary CTA buttons sitewide, which already happens on the FAQ and Ongoing Lessons "Book a Lesson" buttons), would make the Book page feel like a payoff rather than a swap.

**Location:** Homepage pinned card carousel and About page horizontal timeline.
**What's overdone:** Two different scroll-jacking mechanisms (a pinned card stack on Home, a horizontal-pin timeline on About) both ask the visitor to scroll considerably further than the visible content suggests, and in testing, progress through the pinned card carousel required significantly more scroll input than a typical section — this reads as extended, not necessarily broken, but it is a real amount of scroll commitment stacked on top of the already-long opening-scene pin.
**Confidence:** Subjective judgment, partially informed by the amount of scroll input needed in testing to progress through the sequences.
**Recommendation:** Not a candidate for removal — both are genuinely distinctive and effective — but consider shortening the scroll distance required per step slightly, especially on the homepage opening sequence which already asks for a long pin before any of this content is reached.

Nothing else on the site rises to the level of "overdone" — there is no excess animation-as-decoration, no competing typography, no oversized whitespace, no icon clutter, and no forced asymmetry. This is worth stating plainly rather than inventing additional criticism.

---

## 8. Template-likeness assessment

**Template-likeness: 15/100**

This is a low score, meaning the site reads as unmistakably bespoke. Signals:

- A custom WebGL shader gradient exists solely for the full-screen navigation overlay — no page-builder or template ships this.
- The recurring ghost-numeral/wordmark motif is a specific, repeated structural device, not a stock pattern.
- Copy throughout is specific to this business (real place names, real dates, real church name) rather than interchangeable "trust us" marketing language.
- No generic "AI landing page" tells are present: no icon-plus-headline feature grid of three, no fake star-rating testimonial carousel, no decorative blur/glow orbs, no marquee ticker, no stock photography.
- The one structurally template-adjacent pattern is the Ongoing Lessons page (tab selector → numbered vertical list → CTA), which is a common SaaS-landing-page shape — still well-executed and on-brand, but the most interchangeable section on the site.

**Strongest bespoke signal:** The About page biography timeline — real, specific, and impossible to transfer to another business unchanged.

**Strongest template-like signal:** The Ongoing Lessons page's tab-selector-plus-vertical-timeline structure, which would look at home on many SaaS or coaching sites.

**Three to five changes most likely to make the site feel more ownable:**
1. Give the Ongoing Lessons page the same scroll-pinned, sequential pacing already used on Home, Vacation Lessons, and About, rather than a flatter stacked layout.
2. Resolve the footer inconsistency (Section 10) — right now it reads as three different sites stitched together at the structural level, which undercuts the otherwise-strong sense of a single authored system.
3. Extend the ghost-numeral motif deliberately into the FAQ and Book pages, where it currently doesn't appear, so the device reads as a true sitewide signature rather than a Home/About-only flourish.
4. Add the specific, checkable trust details already proven to work on the About page (a place name, a date, a recurring gig) to the Vacation Lessons page as well.

**One distinctive design idea that could become a recognizable brand signature, without new photography:** Use the ghost-numeral device as a literal, functional step-indicator inside the Book wizard (which currently uses a plain "1. Lesson / 2. Group / 3. Date & Time..." text row) — this would tie the site's most distinctive visual idea directly to its highest-intent moment, using only typography and existing motion patterns.

---

## 9. Comparative benchmark

External research was available. Because this is a narrow business category (single-instructor, in-person, tourist-facing music lessons), no direct one-to-one competitor was researched by name; instead, reference points were drawn from adjacent categories with matching audience, service model, and conversion goal — premium independent tour operators and private surf-instruction businesses, both of which share a tourist-facing, in-person, trust-dependent, single- or small-operator booking model.

| Reference category | Why relevant | What it typically does better | What this site already does as well or better | Principle worth learning | What should not be copied |
|---|---|---|---|---|---|
| Premium boutique/private tour operator sites (e.g., luxury private-tour brands surfaced in current research) | Same model: a real person or small team selling an in-person, trust-dependent, tourist-facing experience | Typically foreground credentials/awards and trust signals immediately on the homepage; heavier investment in mobile-first performance given booking often happens from a phone mid-trip | This site's copy voice and biography are more specific and less "brochure" than most category examples | Trust signals need to arrive early, not just on a dedicated About page three clicks deep | Do not adopt the black-and-gold "luxury travel" aesthetic wholesale — it would fight this brand's calmer, more personal register |
| Independent single-instructor surf-lesson businesses | Same operator model (solo instructor, personal-attention pitch, tourist + local dual audience) and, per current research, over 70% of category traffic is mobile — booking often happens from a hotel or beach on a phone | Category standard is mobile-first booking flows, calendar availability shown early, and instructor credibility surfaced immediately | This site's booking wizard (calendar, review-and-edit summary) is more polished than the category baseline described in research | Mobile is not a secondary experience in this category — it is frequently the primary one | Do not adopt generic "ocean blues and sandy neutrals" surf-brand color clichés; this site's more restrained forest-green/cream palette is more distinctive |

The goal of these references is principle-level: both categories reinforce that (1) mobile reliability is not optional for this audience, and (2) trust signals need to surface earlier than a dedicated About page. Neither reference should be imitated visually — this brand's calmer, editorial register is a genuine differentiator worth protecting.

---

## 10. Page-by-page and section-by-section findings

### Home
**Purpose/clarity:** Clear — establishes offer, setting, and tone within the first scroll.
**Composition/hierarchy:** Strongest sequencing on the site: intro → pin → tagline reveal → lesson-type carousel → bio teaser → CTA → footer.
**Copy:** "Learn your first ukulele song on one of the world's most beautiful beaches" is specific and evocative.
**Image treatment:** Beach photo and hands-on-ukulele video are well-paired; video morphs into a framed, shrinking card as the visitor scrolls, a nice piece of art direction.
**Interaction quality:** Card carousel (Private Ukulele Lessons / Guitar Lessons / Group Experience) is functional and well-paced on desktop; see Section 11 for the confirmed narrow-viewport failure.
**Specific strength:** The "Choose your experience" three-card sequence gives a visitor a clear self-service menu before any commitment is asked.
**Specific weakness:** No testimonials or specific location before the fold ends — see Section 6.
**Recommendation:** Add one short, specific trust line (a place name, a returning-student detail) into the bio teaser card, mirroring the About page's approach.

### Vacation Lessons (Tourist Lessons)
**Purpose/clarity:** Clear offer for visitors; strongest emotional copy on the site ("Most vacation activities end when you fly home. This one doesn't.").
**Composition/hierarchy:** A well-paced three-benefit sequence (Made for beginners / A private, unhurried hour / A song, not a souvenir), each paired with a real photo and caption.
**Copy/persuasion:** Excellent and specific.
**Visual distinctiveness:** The parallax "framing" effect on the hero image (it insets into a bordered, shrinking card as you scroll) is a genuinely distinctive touch.
**Image treatment:** Repeated park-picnic-table lesson photo appears here and on Ongoing Lessons in similar crops; acceptable per this audit's scope, but a different crop or a monochrome/duotone treatment on one instance would help the two pages feel more distinct from each other.
**Specific weakness:** No stated location/beach name (Section 6); tagline text is briefly low-contrast against a bright sky background during the initial hero state, before the framing effect kicks in (subjective judgment, borderline confirmed via screenshot — worth a quick contrast check).
**Responsive behavior:** No footer present at the bottom of this page (confirmed — scroll position maxed out at the closing CTA with no nav links or copyright beneath it), inconsistent with Home.
**Recommendation:** Add location copy near the CTA; add a footer consistent with the rest of the site; increase tagline contrast (a darker overlay scrim or a solid-color text treatment) for the pre-scroll hero state.

### Ongoing Lessons (Weekly Lessons)
**Purpose/clarity:** Clear, serves a distinct local/student audience well.
**Composition/hierarchy:** The flattest, least art-directed page on the site — a tab selector, a vertical numbered "how it works" list, and a CTA, with none of the scroll-pinning or framing devices used elsewhere.
**Copy/persuasion:** Good, specific ("Twenty-two years of music, taught with patience").
**Interaction quality:** The Beginner/Intermediate/Advanced pill selector is the best-executed piece of interaction on this page — confirmed functional, instant, and clearly labeled.
**Specific strength:** Serves three distinct skill levels without three separate pages.
**Specific weakness:** Reads as noticeably less premium/considered than its sibling pages due to the flatter composition; no footer present (confirmed, same pattern as Vacation Lessons).
**Recommendation:** Bring this page's composition up to the standard set elsewhere — even a single scroll-pinned moment (e.g., the "how it works" timeline becoming a pinned sequence rather than a static vertical list) would close the gap.

### About
**Purpose/clarity:** The clearest, most complete piece of trust-building content on the site.
**Composition/hierarchy:** A four-part horizontally-paced biography with a large decorative ghost numeral per chapter and a bottom-left progress indicator — genuinely bespoke and well-executed.
**Copy/persuasion:** Excellent — specific dates, places, and one checkable proof point (Thursday nights at Keolahou Church).
**Visual distinctiveness:** The strongest page on the site for this criterion.
**Interaction quality:** One transitional scroll frame between chapters 3 and 4 showed a large, empty cream gap with only a ghost numeral visible before the next chapter's content arrived (a single observed frame during scroll-testing; confidence: unverified risk — may simply be an intermediate animation frame rather than a genuine glitch, but worth a targeted retest).
**Specific weakness:** No footer present at the end of the sequence (confirmed, same pattern as Vacation/Ongoing).
**Recommendation:** Protect this page's content and pacing during any future redesign; verify the chapter-3-to-4 transition doesn't produce a genuinely empty frame on real devices.

### FAQ
**Purpose/clarity:** Clear, well-organized into categories (Getting Started, an equipment-related question, The Lessons, Booking).
**Composition/hierarchy:** Clean accordion pattern, first item open by default.
**Copy/persuasion:** Direct, honest answers, including an honest (if conversion-softening) non-answer on pricing.
**Interaction quality:** Confirmed functional — accordion items expand/collapse correctly on click, icon changes from "+" to "×".
**Specific weakness:** This page has its own third footer variant — just "FAQ" and "Book" links on a plain background, with no copyright and no full nav — different from both the Home footer and the no-footer pattern on Vacation/Ongoing/About.
**Recommendation:** Standardize on one footer treatment sitewide (see Section 12, P0).

### Book
**Purpose/clarity:** Clear five-step wizard (Lesson → Group → Date & Time → Details → Done).
**Composition/hierarchy:** Distinct dark green-to-gold treatment, functioning as a "special moment" for the highest-intent page (see Section 7 for a note on cohesion).
**Interaction quality:** Confirmed fully functional: lesson-type selection, group-size selection, a real calendar correctly reflecting the current month with past dates disabled, populated hour slots on date selection, and an editable review-and-details step with per-field "Change" links and genuinely editable (not read-only) form fields.
**Specific strength:** This is the single biggest positive gap between the live site and its own stale internal documentation — the booking flow is materially more built than described.
**Specific weakness:** No footer needed here since it's a self-contained flow, so this is not a defect; note only that visual tone shifts from the rest of the site (Section 7).
**Note on scope:** Per this audit's constraints, the absence of actual submission/routing behavior at the end of the flow is explicitly excluded from evaluation and scoring.

---

## 11. Responsive, interaction, and accessibility audit

### Desktop (~1512px, tested directly)
All interactions below are **Confirmed** via direct testing: full-screen navigation overlay opens/closes correctly and routes to the correct page on link click; homepage card carousel advances through all three cards with correct content; Ongoing Lessons skill-level pill selector correctly swaps content on click; FAQ accordion expands/collapses correctly; Book wizard's calendar, time-slot grid, review summary, and form fields all function correctly, including genuinely editable (not read-only) text inputs.

### Tablet (~1024px)
Not independently re-verified with the same rigor as desktop and mobile due to a testing-environment constraint (see note below); layout at this width is expected, based on the documented single breakpoint at 760px, to render in the same desktop-style layout as 1512px. This is a **strong inference**, not a confirmed test, and is worth a manual check.

### Mobile (~500px achieved; true 390px/320px could not be forced in this testing environment)
**Confirmed, high-severity defect, reproduced independently three times (separate fresh browser tabs/sessions, including one full page reload):** At a narrow viewport width, the hero `<video>` element never advances past `readyState 0` (`HAVE_NOTHING`) and remains in a stalled `networkState 2` (loading) indefinitely (7+ seconds observed per session). The site's header element carries the class `site-header is-suppressed` with `opacity: 0` for the entire duration of each test and never becomes visible. The visible result is a blank cream page with no header, no hamburger menu, no hero image or video, and no way to navigate to any other page short of manually editing the URL.

**Important caveat on causation:** I could not fully isolate viewport width as the sole variable. This testing environment showed some inconsistency in enforced window width across tabs, and repeated large (14MB) video fetches across multiple tabs in the same browser session could plausibly contend for a limited number of concurrent hardware video-decode sessions — a known constraint on some systems, independent of any site bug. I confirmed the failure reproduces at narrow widths and confirmed the same asset loaded successfully in an initial, isolated desktop-width session, which is suggestive but not conclusive proof that width alone is the trigger.

**What is confirmed regardless of root cause:** there is no timeout or fallback in the observed behavior that reveals the header/navigation if the hero video fails to reach a loaded state. This means any real-world condition that stalls the video — a slow mobile connection, cellular data, a strict autoplay policy, or a temporarily unavailable CDN edge — has the potential to leave a real visitor on a blank, unnavigable page. This class of risk is already named in the project's own internal "Known Risks" documentation (the 14MB `preload="auto"` hero video and the need for "a more careful loading strategy"), which corroborates that this is a recognized, unresolved risk rather than a speculative one introduced by this audit.

**Severity:** Critical if it reproduces on real devices/networks (which is plausible but not proven here). **Confidence label: Confirmed** for the observed behavior (blank page, suppressed header, stalled video) in this testing environment; **Unverified risk** for whether narrow viewport width specifically (as opposed to network/decoder conditions that correlate with mobile use) is the root cause.

**Recommended correction:** Add a hard timeout (a few seconds) that reveals the header/navigation and falls back to the static beach image regardless of hero-video load state, so a slow or failed video load can never fully block access to the rest of the site. This should be verified on at least one real mobile device on a throttled connection before being considered resolved.

### Keyboard and accessibility
**Confirmed via DOM inspection:** semantic landmark elements (`header`, `nav`, `main`) are present and correctly used; the hero `<video>` element carries an `aria-label`. **Confirmed:** 4 of 5 `<img>` elements on the homepage lack `alt` text; zero `<h1>` elements exist in the homepage DOM. Full keyboard-only traversal (tab order through the nav overlay, focus-visible states, Escape-to-close) as described in the project's internal documentation was not independently re-tested end-to-end in this session; this is an **unverified risk** worth a dedicated pass, not a confirmed defect either way.

### Motion and interaction
**Confirmed:** scroll-driven pin sequences on Home and About, the framing effect on Vacation Lessons, and all tab/accordion/wizard interactions function correctly at desktop width. `prefers-reduced-motion` fallback behavior described in the project's internal documentation was not independently re-tested in this session — **unverified risk**, not a confirmed defect.

### Perceived performance
**Confirmed via DOM inspection:** the hero video is a 14MB MP4 loaded with `preload="auto"`, consistent with the project's own documented "Known Risks." This is a legitimate perceived-performance and reliability concern independent of the mobile-navigation issue above.

Per this audit's constraints, none of the above findings penalize the booking form for lacking submission, routing, or confirmation behavior — that scope is explicitly excluded.

---

## 12. Prioritized action plan

### P0 — Resolve before launch

| Priority | Location | Exact change | Reason | Expected effect | Effort | Confidence | Type |
|---|---|---|---|---|---|---|---|
| P0 | Homepage opening sequence (`OpeningScene`) | Add a hard timeout that reveals the header/nav and shows the static beach image regardless of hero-video load state | Confirmed: header stays permanently hidden and page is blank with no navigation if the video fails to reach a loaded state | Removes a potential total-navigation-blocking failure for any visitor on a slow or unreliable connection | Small–Medium | Confirmed behavior / unverified root cause | Development |
| P0 | Vacation Lessons page | Add a stated general meeting location/beach name near the primary CTA | Tourists need to know roughly where before committing to book with a stranger | Directly supports the brief's stated conversion goal | Small | Strong inference | Copy |
| P0 | Sitewide | Add real `alt` text to all content images and a semantic `<h1>` to each page's primary headline | Confirmed accessibility gaps (4/5 images missing alt text on homepage; zero `<h1>` in DOM) | Improves screen-reader usability and SEO | Small | Confirmed | Development |
| P0 | Sitewide | Standardize the footer across all six routes (currently three different treatments) | Confirmed inconsistency reads as unfinished/unpolished and removes a consistent secondary navigation path from most pages | Improves perceived polish and gives visitors a consistent way to reach FAQ/Book from anywhere | Small | Confirmed | Development |

### P1 — Highest-impact premium upgrades

| Priority | Location | Exact change | Reason | Expected effect | Effort | Confidence | Type |
|---|---|---|---|---|---|---|---|
| P1 | Sitewide | Add a small number of specific, non-generic testimonials or trust quotes | Confirmed complete absence of social proof anywhere on the site, against an explicit "trustworthy" brand goal | Directly closes the largest content-level trust gap | Medium | Confirmed | Copy + Development |
| P1 | Ongoing Lessons page | Bring composition up to the pacing/art-direction standard used on Home/Vacation Lessons/About (e.g., a pinned "how it works" sequence instead of a static vertical list) | Confirmed this page is the flattest, least distinctive on the site | Raises brand consistency and premium feel | Medium | Subjective judgment, well-supported | Design + Development |
| P1 | FAQ, pricing answer | Add a price range or "from $X" figure alongside the existing flexible-pricing explanation | Confirmed no pricing information exists anywhere on the site | Reduces a known drop-off point for comparison-shopping tourists without sacrificing pricing flexibility | Small | Confirmed gap / subjective recommendation | Copy |
| P1 | Book wizard step indicator | Replace the plain "1. Lesson / 2. Group..." text row with a version of the site's ghost-numeral motif | Currently the site's most distinctive visual idea doesn't appear on its highest-intent page | Strengthens brand ownability at the moment of conversion | Small–Medium | Subjective judgment | Design + Development |

### P2 — Refinement

| Priority | Location | Exact change | Reason | Expected effect | Effort | Confidence | Type |
|---|---|---|---|---|---|---|---|
| P2 | Vacation Lessons hero | Increase tagline contrast in the pre-scroll hero state (darker scrim or solid-color text) | Text is briefly low-contrast against a bright sky | Improves initial readability | Small | Subjective judgment | Design |
| P2 | Book page palette | Introduce the gold accent earlier and more subtly sitewide (e.g., consistently on primary CTA buttons) so the Book page's palette feels like a payoff, not a swap | Currently a sudden tonal shift with no earlier foreshadowing | Improves sitewide cohesion | Small | Subjective judgment | Design |
| P2 | Vacation Lessons / Ongoing Lessons repeated photo | Vary the crop or apply a light treatment (e.g., duotone) to the repeated park-picnic-table photo on one of its two appearances | The two instances currently look nearly identical, slightly weakening the sense of a larger proof library | Improves perceived variety without new photography | Small | Subjective judgment | Design |
| P2 | Homepage/About scroll pacing | Slightly shorten the scroll distance required to progress through the pinned card carousel and horizontal timeline | Both sequences currently require a substantial amount of scroll input | Reduces friction for impatient visitors without removing the device | Medium | Subjective judgment | Development |
| P2 | Keyboard/reduced-motion | Run a dedicated keyboard-only and `prefers-reduced-motion` QA pass | Not independently re-verified in this session | Confirms (or surfaces gaps in) previously documented accessibility behavior | Small | Unverified risk | QA |

---

## 13. The highest-leverage five

**1. Fix the mobile navigation-blocking failure.**
- **Problem:** At narrow viewport widths, the hero video stalls and the header/nav never appears, leaving a blank, unnavigable page (confirmed, reproduced 3×).
- **Location:** `OpeningScene` intro sequence, homepage.
- **Proposed change:** Add a hard timeout (2–4 seconds) that reveals the header and falls back to the static beach image regardless of video state.
- **Why higher leverage than other recommendations:** Every other recommendation on this list is irrelevant to a visitor who never gets past a blank screen. This is the only item that can fully block conversion for an entire audience segment.
- **Expected effect on score:** Could move the Mobile category from 4/10 toward 8–9/10 and lift the UX and Frontend Polish categories as well, plausibly a 6–9 point swing on the total 100-point score once verified on real devices.
- **Implementation guidance:** In the intro-sequence controller, start a timer in parallel with the video-load listener; whichever resolves first (video ready, or timeout) triggers "reveal header." Ensure the fallback also unlocks scroll if the pin logic depends on the same event.

**2. Add specific, non-generic trust content (testimonials + a stated meeting location).**
- **Problem:** Zero social proof anywhere on the site; no stated location on the tourist-facing page.
- **Location:** Homepage bio teaser card and/or About page; Vacation Lessons hero/CTA area.
- **Proposed change:** Add 2–4 short, specific quotes (named, if possible) and one line stating the general meeting beach/area.
- **Why higher leverage:** Directly targets the "trustworthy" brand attribute named in the brief and the single largest content gap found in this audit.
- **Expected effect on score:** Plausible 3–5 point lift, concentrated in Content Clarity/Trust and Cohesion/Memorability.
- **Implementation guidance:** Treat this with the same specificity discipline already used on the About page — real names/details, not generic "amazing experience!" copy, which would itself read as templated.

**3. Standardize the footer across all six routes.**
- **Problem:** Three different footer treatments (full nav+copyright on Home, none on Vacation/Ongoing/About, a stripped two-link version on FAQ).
- **Location:** Sitewide, `SiteFooter` component and its per-page usage.
- **Proposed change:** Use one footer (recommend the Home version — full nav + copyright) on every route.
- **Why higher leverage:** This is a small, cheap, purely structural fix that removes a confirmed, visible inconsistency likely to register (even subconsciously) as unfinished.
- **Expected effect on score:** Small but real, roughly 1–3 points, concentrated in Frontend Polish and UX/Navigation.
- **Implementation guidance:** Confirm `SiteFooter` is rendered unconditionally in `SiteLayout` rather than per-page, or audit each page component for a missing footer render.

**4. Add a real `<h1>` and `alt` text sitewide.**
- **Problem:** Zero `<h1>` elements and 4 of 5 missing `alt` attributes, confirmed via DOM inspection on the homepage.
- **Location:** Sitewide, primary headline components and content `<img>` elements.
- **Proposed change:** Apply semantic `<h1>` to each page's main headline (no visual change required) and write specific `alt` text for each meaningful photo.
- **Why higher leverage:** Cheap, low-risk, immediately verifiable, and closes a real accessibility and SEO gap without touching any visual design.
- **Expected effect on score:** Roughly 2–3 points, concentrated in Accessibility and Typography/Hierarchy.
- **Implementation guidance:** Audit each page for exactly one `<h1>`; write one specific sentence of `alt` text per photo describing its actual content (e.g., "Aaron playing ukulele under a palm tree on a Maui beach").

**5. Bring Ongoing Lessons up to the site's established art-direction standard.**
- **Problem:** This page is a flatter, more conventional stacked layout compared to the scroll-pinned, sequential pacing used everywhere else on the site.
- **Location:** Ongoing Lessons (`/weekly-lessons`) page.
- **Proposed change:** Convert the "how it works" numbered list into a pinned, scroll-driven sequence consistent with the Home and About pattern, without introducing new visual language.
- **Why higher leverage:** This is the most visible remaining "template-adjacent" section on an otherwise bespoke site; fixing it closes the biggest remaining consistency gap in the site's own established system.
- **Expected effect on score:** Roughly 2–4 points, concentrated in Layout/Composition and Brand Distinctiveness.
- **Implementation guidance:** Reuse the existing `ScrollTrigger` pin pattern already built for the homepage card carousel rather than building new motion logic.

None of these five changes depend on obtaining additional photography.

---

## 14. What not to change

**The About page biography timeline.** This is the single strongest asset on the site. Any future redesign should treat its specific, real content (dates, places, the Keolahou Church detail) as fixed and protected — shortening or genericizing it in the name of "simplification" would directly undo the site's best trust-building work.

**The recurring ghost-numeral/wordmark motif.** This is the most ownable visual idea on the site. An aggressive redesign that replaces it with more conventional iconography or badges would trade a genuinely distinctive device for a more generic one. Any extension of this motif (per Section 8's recommendation) should match its current restrained frequency, not increase it further.

**The restrained cream/forest-green/sage palette.** This is what keeps the site from reading as generic tropical stock styling, which the project's own internal documentation explicitly says to avoid. Recommendations elsewhere in this audit (e.g., introducing the gold accent earlier) should be implemented as a subtle extension of this palette, not a replacement of it.

**The consistent "Book a Lesson" / "Book This Experience" CTA language.** Simple, and it works. Any content refresh should preserve a single, unambiguous conversion verb rather than introducing variation for its own sake.

---

## 15. Final reassessment

- **Current score:** 69/100
- **Realistic score after P0 improvements:** 76/100
- **Realistic score after P0 and P1 improvements:** 83/100
- **Premium feel:** moderate
- **Template-likeness:** 15/100
- **Launch readiness:** nearly ready
- **Strongest existing quality:** A specific, well-paced, genuinely bespoke biography and a restrained, consistent visual system that together make the desktop experience feel authored rather than assembled.
- **Largest current weakness:** A confirmed, reproducible failure at narrow viewport widths that leaves visitors on a blank page with no navigation — a critical risk for a site whose stated primary audience browses on phones.
- **Single most important next move:** Add a hard timeout/fallback to the homepage intro sequence so the header and navigation always become accessible, then verify on at least one real mobile device on a throttled connection.

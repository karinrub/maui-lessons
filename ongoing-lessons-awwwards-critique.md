# Ongoing Lessons — Awwwards-Style Critique
Maui Lessons · `/weekly-lessons` · reviewed 2026-07-20

## What Works Well

- **Headline hook.** "A rhythm, not a routine." is a strong, ownable line — it reframes recurring lessons as a lifestyle rather than a chore, and sets up the "rhythm" metaphor that recurs through the page (Month Rhythm spine, progress line). Good copywriting discipline.
- **Three-chapter horizontal journey** (`WeeklyJourneySections.tsx`) is the standout interaction: pinned scroll-driven chapters with a circular "lens" photo reveal (`WeeklyStepVisual.tsx`) feels premium and matches the site's Apple-style scroll-product language rather than a generic "how it works" grid.
- **Reduced-motion fallback** converts the pinned track into an in-flow vertical timeline — accessibility wasn't bolted on after the fact.
- **Direction-biased travel** (chapters only complete in the last scroll direction, never yank backward) is a genuinely thoughtful detail most sites in this genre get wrong — it prevents the disorienting snap-back feel common in pinned-scroll sections.
- **"Find Your Starting Point" tablist** (`WeeklyPathways.tsx`) gives the page a second purpose beyond storytelling — self-selection by skill level is the right feature for a lessons business, and reviving it as an accessible tablist rather than the old pill selector is a real upgrade.
- **Month Rhythm spine** (`WeeklyMonthRhythm.tsx`) closes the loop nicely: after "how lessons work" and "which level are you," a concrete week-by-week narrative answers "what do I actually get in month one," which is the exact question a hesitant buyer has.
- **Ghost-numeral watermark motif** ties this page back to the rest of the site's visual identity instead of feeling like a bolted-on template page.
- **Consistent close pattern**: CTA + location + footer nav gives every route the same reliable exit ramp.

## What to Remove/Change

- **Redundant "Book a Lesson" CTAs stacked with no differentiation.** The page surfaces a CTA inside the Pathways card, then again at Month Rhythm's close, then again in the finale band. Three visually identical gold-arrow CTAs in one scroll with no distinct framing risks CTA fatigue — the visitor can't tell if clicking "Book" from the Beginner panel does anything different than the generic footer CTA.
- **`SkillLevelSection.tsx`/`.css` are dead code still sitting in the tree.** Per the project handoff, they're unused and safe to delete along with any images only they reference — leaving dead components in an "award submission" codebase is a housekeeping smell even if invisible to users; delete before this page is used as a portfolio piece.
- **Three sequential scroll-hijacked/pinned modules on one page (journey → pathways tablist → month rhythm spine) risk scroll fatigue.** Each individually is well-crafted, but stacked back to back on a single route, a visitor who just wants pricing/logistics has to sit through three distinct motion "acts" before reaching the practical close. Awwwards judges reward one strong signature interaction per page more than three competing ones.
- **No visible pricing on this page.** FAQ carries the "$35 for 30 minutes" anchor line, but a prospective ongoing-lessons student deciding between Beginner/Intermediate/Advanced tracks has to leave the page to find cost — a real conversion leak on the page whose entire job is to convert.
- **Testimonial slot is empty and hidden.** Understandable given no real quotes exist yet, but structurally this page has zero social proof — for a recurring-commitment product ("come every week"), trust signals matter more here than on the one-off Vacation Lessons page.

## Optimization Suggestions

- **Differentiate the CTAs by intent.** Make the Pathways-card CTA say "Book a Beginner Lesson →" (level-aware, passing the selected tab as a query param/context into the Book wizard's `type`/`participants` prefill) rather than a generic "Book a Lesson." This turns three identical CTAs into one clearly-staged funnel.
- **Surface a price anchor on this page**, not just on FAQ — even a single line under the Pathways heading ("Lessons start at $35/30 min") removes a click-away moment at the exact point of highest purchase intent.
- **Add a lightweight progress/scroll indicator across the whole page**, not just within the journey chapter track — since three motion sections are stacked, a persistent thin progress rail (echoing the Book wizard's gold-fill rail) would help visitors gauge how much page is left and reduce the feeling of an endless scroll.
- **Micro-interactions on the Pathways tabs.** Right now the three tabs (Beginner/Intermediate/Advanced) are functionally solid (accessible tablist) but could use a subtle state transition — a soft gold underline sweep or crossfade on the ghost-numeral watermark when switching tabs — to make the self-selection moment feel as crafted as the journey chapters above it.
- **Retire or merge Month Rhythm with Pathways.** Both sections independently try to answer "what's it like to start," which duplicates intent. Consider collapsing them: let selecting a Pathway level reveal that level's own first-month rhythm, rather than a single generic month timeline that doesn't differentiate beginner from advanced pacing.
- **Delete `SkillLevelSection.tsx`/`.css`** and any orphaned images now that `WeeklyPathways.tsx` fully supersedes it — reduces bundle weight and eliminates a known source of prior confusion (the background-video investigation noted in the source map).
- **Run the hero video/asset audit on this page's images too.** `aaron-weekly-1`, `aaron-teaching-2`, `aaron-weekly-2` are all loaded eager (per the source map, intentionally, so the pinned track doesn't show blank frames) — worth confirming they're served at the correct responsive size for mobile rather than a single large master, since eager-loading three uncompressed images compounds the existing ~14 MB hero video weight problem sitewide.

## Redesign Ideas

- **Level-aware first month.** Instead of one static "Week 1–4" rhythm, let the Beginner/Intermediate/Advanced tab selection in Pathways drive the copy shown in Month Rhythm (e.g., Advanced week 4 = "a new technique, not just a finished song"). Same spine, same gold week-4 accent, but content that actually reflects the chosen level — turns two static sections into one adaptive one and justifies the extra scroll length.
- **Add a "next lesson, this week" mini-calendar teaser** near the close CTA — even a static illustrative week view (Mon/Wed evening slots, say) makes "steady, weekly" tangible before the visitor ever opens the Book wizard, similar to how the redesigned Book page already uses a real calendar.
- **Replace the third stacked CTA with a single sticky/anchored "Book a Lesson" affordance** (e.g., a slim gold tab fixed to the viewport edge, visible only past the fold) so the page's motion sections can breathe without needing a CTA planted after each one — Awwwards-tier sites tend to have exactly one persistent conversion affordance plus one narrative-close CTA, not three identical mid-page ones.
- **Testimonial-ready empty state.** Since real quotes are owner-blocked, consider a placeholder module design (not fake text, but a real *shaped* slot — e.g., a quote-mark watermark and attribution line layout) so that the day real testimonials arrive, they drop into a space that was designed for them rather than being retrofitted.
- **Cross-link into Vacation Lessons for indecisive visitors.** Someone landing on Ongoing who's actually a short-term visitor has no path back to `/tourist-lessons` until the global nav — a single line ("Just visiting? See Vacation Lessons →") near the Pathways section would reduce bounce.
- **Consider a filter/compare view for returning visitors.** A future iteration could let a visitor toggle between "New to lessons" and "Already a student" states, changing the CTA language and possibly skipping the Journey chapters entirely for returning students who don't need the "how it works" explainer again.

Overall: this page already clears the bar the site's other pages set — a real signature interaction (the pinned three-chapter journey), a legitimate secondary feature (level self-selection), and a narrative close. The gap to "stunning and competitive" is less about adding polish and more about **editing**: cut the duplicate CTAs and the overlapping Pathways/Month-Rhythm intent, surface pricing where the purchase decision is actually made, and let the one adaptive idea (level-aware rhythm) replace two static ones.


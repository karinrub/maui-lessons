# SEO Optimization Pass — 2026-07-25

Full-site technical + on-page SEO pass targeting local and tourist search intent
(`ukulele lessons Maui`, `guitar lessons Maui`, `guitar teacher Maui`, `things to
do in Kihei/Wailea`, `Maui vacation activities`, `Maui date ideas`, and related
queries listed in the brief). Scope: all six routes, `index.html`,
`robots.txt`/`sitemap.xml`, and every structured-data block. No visual/design
changes — copy edits were kept minimal and in the site's existing voice.

Verified after every change: `npm run build`, `npm run lint`, `npm run
typecheck`, and `npm run check:seo` (the project's own h1/alt smoke test) all
pass, and the prerendered output for all six routes was inspected directly to
confirm no regressions (see Verification below).

## What was implemented

### Fixed a real bug: the page `<title>` search engines actually read didn't match the SEO-tuned title

Every page called two separate hooks — `useDocumentTitle` (set a generic
label like `"Home | Maui Lessons"` directly on `document.title`) and
`useDocumentMeta` (built a better, keyword-specific title but only used it for
`og:title`/`twitter:title`, never `document.title`). The result: the actual
`<title>` tag — the single most important on-page SEO element, and what
Google typically shows as the blue link text — was the generic, non-specific
version on 4 of 6 routes, while the good title only reached social-preview
cards. Fixed by making `useDocumentMeta` the single source of truth for
`document.title`, and removed the now-redundant `useDocumentTitle` hook
(deleted, unused after the fix — confirmed no remaining references before
removal).

### Rewrote every page's title and meta description around real search intent

All six routes' `<title>`/description pairs were rewritten to name the actual
service + instrument + location combination each page should rank for, while
staying accurate to that page's real content (no page claims something it
doesn't offer):

| Route | New title |
|---|---|
| `/` | Ukulele & Guitar Lessons in Maui, Hawaii \| Maui Lessons |
| `/tourist-lessons` | Ukulele Lessons for Maui Vacations \| Kihei & Wailea |
| `/weekly-lessons` | Guitar & Ukulele Teacher in Kihei & Wailea, Maui |
| `/about` | Meet Aaron Grzanich \| Maui Ukulele & Guitar Teacher |
| `/faq` | Ukulele & Guitar Lesson FAQ \| Maui Lessons |
| `/book` | Book a Ukulele or Guitar Lesson on Maui \| Maui Lessons |

Descriptions were rewritten the same way — each names Maui plus the specific
neighborhoods (Kihei/Wailea), calls out beginner-friendliness, and
distinguishes the tourist page (one-time vacation activity) from the ongoing
page (recurring local instruction), so the two lesson-type pages no longer
compete for identical intent.

### Structured data: added Person schema, connected the entity graph, added pricing/service data, added SiteNavigationElement

- **New `Person` schema** for Aaron Grzanich (name, job title, bio, portrait,
  link to `/about`) — this was a real gap: the site had `Organization` and
  `LocalBusiness` schema but no `Person` entity, despite being a
  single-instructor business where Aaron *is* the trust signal (E-E-A-T).
- **Connected the graph with `@id`** — `LocalBusiness.founder`/`employee` and
  `Person.worksFor` now reference each other by `@id` instead of duplicating
  data inline, which is the correct pattern for related schema.org entities.
- **`LocalBusiness` enriched** with `priceRange` and two `makesOffer` entries
  (Vacation Ukulele Lesson, Ongoing Ukulele & Guitar Lessons) — all sourced
  directly from `src/config/lessonOptions.ts` (the same config the booking
  page renders from), so this can't drift out of sync with real pricing and
  never invents a number that isn't already live on the site. `areaServed`
  expanded from one combined string to three explicit `Place` entries (Maui,
  Kihei, Wailea) for clearer geographic targeting.
- **New `SiteNavigationElement` block** listing the site's six primary
  sections, mirroring the real nav/footer exactly — a standard, low-risk
  technique for improving Google's odds of surfacing sitelinks under the
  main search result (this is algorithmic on Google's end and tied to site
  authority/branded search volume, which no markup can force — see External
  Actions below — but this removes any structural ambiguity about what the
  primary sections are, which is the part actually within this codebase's
  control).
- **`og:site_name`, `og:locale`, `og:image:alt`, `twitter:image:alt`** added
  — previously missing, all standard OG/Twitter completeness fields.
  `og:image:alt`/`twitter:image:alt` describe the actual shared photo (not
  the page title, which would have been wrong on every route using the
  default image).

### FAQ: three new questions targeting real search intent, feeding the existing FAQPage rich-result schema

The FAQ accordion already generates its `FAQPage` JSON-LD directly from its
content array, so adding real, useful questions is simultaneously a content
improvement and new rich-result eligibility. Added:

- *"Is this a good thing to do in Kihei or Wailea?"* — targets `things to do
  in Kihei`/`Wailea`.
- *"Is a lesson a good Maui date idea or family activity?"* — targets `Maui
  date ideas`/`family activities Maui`.
- *"Do you teach locals, or just visitors?"* — targets the
  local-vs-tourist split explicitly and reinforces both audiences are
  genuinely served.

All three are answered honestly from the site's actual offering — nothing
speculative or exaggerated.

### Copy: two small, in-voice edits for keyword coverage that was genuinely missing

- **Home page hero tagline** — was "Learn your first ukulele song on one of
  *the world's* most beautiful beaches," which never mentioned Maui or
  guitar anywhere on the homepage despite the business teaching both. Changed
  to "Learn your first ukulele *or guitar* song on one of *Maui's* most
  beautiful beaches" — same rhythm, same length, now actually names the
  place and both instruments the business teaches.
- **Guitar Lessons card alt text** (home page) — was the generic "Aaron
  teaching a one-on-one music lesson," which didn't even say "guitar" despite
  labeling the card "Guitar Lessons." Changed to "Aaron teaching a private
  guitar lesson on Maui" — more accurate *and* more relevant.

No other visible copy was changed — the rest of the site's headlines (e.g.
"Bring home more than just photos.", "Progress happens on repeat.") were left
untouched. They're deliberately emotional rather than keyword-bearing, and
the surrounding copy (eyebrows, ledes) already carries the real keyword
context in every case checked, so rewriting the headlines themselves would
have traded real design voice for no measurable gain.

### Technical

- **`site.webmanifest` added** (new — didn't exist before), referencing the
  existing `favicon.svg` (no new binary asset created, consistent with the
  standing rule not to touch branding until an approved mark exists). Linked
  from `index.html`. Uses relative paths (`"."`/`"favicon.svg"`, not
  `"/"`/`"/favicon.svg"`) so it resolves correctly both locally and at the
  real GitHub Pages subpath (`/maui-lessons/`) — an absolute path would have
  been wrong in production.
- **`theme-color` meta tag added**, matching the site's actual cream
  background (`#f5f0e7`).
- **Static `<meta name="description">` fallback added to `index.html`** for
  crawlers/tools that fetch raw HTML without executing JS. Discovered and
  fixed a regression this introduced during verification: `useDocumentMeta`
  was always creating a *new* managed tag instead of adopting the existing
  static one, which briefly produced two `<meta name="description">` tags in
  the rendered output. Fixed by having it adopt any existing tag with the
  same name/property before creating a new one — confirmed via the actual
  prerendered HTML that every route now has exactly one.
- **`sitemap.xml`**: added `lastmod` (2026-07-25, accurate — this is the date
  of this actual content change), `changefreq`, and `priority` to all six
  URLs.
- **`robots.txt`**: reviewed, already correct (`Allow: /` plus sitemap
  reference) — no change needed.

## Verification

- `npm run build`, `npm run lint` (oxlint, 0 warnings/errors), `npm run
  typecheck` (`tsc -b --noEmit`) — all pass on the final state.
- `npm run check:seo` (the project's own smoke test) — passes: exactly one
  `<h1>` and zero images missing `alt` on every route.
- Ran the project's own `scripts/prerender.mjs` and inspected the actual
  generated static HTML for all six routes directly (not just the dev
  server) to confirm: unique, correct `<title>` per route; exactly one
  `<meta name="description">` per route; exactly one `<link
  rel="canonical">` per route; all structured-data blocks present and valid
  JSON (`LocalBusiness`, `Person`, `Organization`, `WebSite`,
  `SiteNavigationElement` sitewide, plus `BreadcrumbList` and `FAQPage`
  — now 14 questions — on their respective routes).
- No design, layout, or interaction changes — this was a metadata/schema/copy
  pass only.

## SEO improvements that require external services (not completable in the codebase)

- **Google Search Console**: submit the sitemap, request indexing/re-crawl
  after this deploy, and monitor for crawl errors, mobile-usability issues,
  and rich-result eligibility (structured data can be valid and still not
  render as a rich result until Google actually re-crawls and chooses to use
  it).
- **Google Business Profile**: create or claim one for the business. This is
  the single highest-leverage action not achievable from the codebase —
  local map-pack rankings for queries like "ukulele lessons Maui" or "guitar
  teacher Kihei" are driven primarily by Business Profile signals (reviews,
  categories, photos, Q&A, posts), not the website. It would also unlock a
  real, verified street address/service-area and phone number, which the
  `LocalBusiness` schema in this codebase deliberately does not include
  today (per `CLAUDE.md`'s standing rule against inventing business facts —
  there's no storefront and the meeting locations vary, so a fabricated
  address would be worse than none).
- **Backlinks**: local citations (Yelp, TripAdvisor, Hawaii tourism
  directories, Maui visitor-activity aggregators) and any press/blog mentions
  would meaningfully help both rankings and the odds of Google surfacing
  sitelinks — sitelinks are tied to overall site authority and branded search
  volume, which no on-page markup can substitute for.
- **Real reviews/testimonials**: `src/components/home/MeetAaron.tsx` and
  `VacationStorySections.tsx` both already have a review/testimonial slot
  that's intentionally hidden while empty (per existing project convention
  against placeholder content). Real student reviews — on the site itself and
  on Google Business Profile — are one of the strongest trust/E-E-A-T signals
  available and are entirely blocked on the owner supplying them.
- **Analytics** (e.g. Google Analytics/Search Console linkage): the project
  has none installed (confirmed — no analytics dependency in `package.json`).
  Without it, there's no way to verify which of these changes actually move
  rankings/traffic over time; adding analytics is a small technical task but
  is a product decision, not folded into this pass.
- **Hero video compression**: unrelated to this pass's scope but worth
  repeating from `CLAUDE.md`'s existing tracked item — a large, uncompressed
  hero video is a Core Web Vitals / page-speed factor, and page speed is a
  confirmed (if minor) ranking signal. Still blocked on the same `ffmpeg`
  availability issue tracked elsewhere in the repo.
- **A dedicated 1200×630 social share image**: `og:image`/`twitter:image`
  currently reuse the homepage hero photo sitewide (already the case before
  this pass). A purpose-designed social card per page (or at least one
  sitewide) is a design task, not a coding one.

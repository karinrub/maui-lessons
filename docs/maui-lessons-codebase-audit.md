# Maui Lessons Codebase Audit

Date: July 6, 2026

## Purpose

This document records the current issues and completion gaps found in the Maui Lessons codebase. It is intended to be added to the project folder and used as the implementation backlog.

The codebase is a Vite, React, and TypeScript site using React Router, GSAP, ScrollTrigger, Lenis, custom WebGL navigation effects, and a multi step booking flow.

The design and motion foundation are strong. The main remaining work is business completion, routing reliability, content completion, performance, SEO, and codebase hardening.

## Verified checks

| Check | Result |
|---|---|
| npm ci | Passed |
| npm run typecheck | Passed |
| npm run build | Passed |
| GitHub Pages base path build | Passed |
| npm audit | No known dependency vulnerabilities |
| npm run lint | Fails because it scans node_modules |

## Priority 1: Fix before public sharing

### 1. Repair the lint command

Current problem:

`npm run lint` runs `oxlint` with no project configuration or ignore rules.

This causes Oxlint to scan `node_modules`, including TypeScript's own files. The audit run produced 31 errors and more than 15,000 warnings that are not caused by the Maui Lessons source code.

Current source quality signal:

`npm run typecheck` passes, but the lint command cannot currently be used as a meaningful project quality gate.

Required work:

1. Add an Oxlint configuration file.
2. Limit linting to project source folders.
3. Ignore `node_modules`, `dist`, coverage output, `.DS_Store`, and generated files.
4. Add a `.gitignore` file if one does not already exist in the real repository.

Recommended `.gitignore` entries:

```text
node_modules/
dist/
coverage/
.DS_Store
.env
.env.local
```

Acceptance criteria:

1. `npm run lint` analyzes only the project source.
2. It exits successfully when no actual source issues are found.
3. It does not print warnings or errors from dependencies.

### 2. Prevent GitHub Pages direct route failures

Current problem:

The app uses `BrowserRouter`.

GitHub Pages does not automatically route direct requests for React paths back to `index.html`.

Likely failure cases:

1. A visitor opens `/book` directly.
2. A visitor refreshes while on `/tourist-lessons`.
3. A visitor receives a shared link to `/about` or `/faq`.

These can result in a GitHub Pages 404 even though internal navigation works.

Required work:

1. Add a GitHub Pages SPA fallback solution.
2. Preserve the original pathname and query values during fallback.
3. Add a React catch all route that renders a proper not found page for truly unknown app routes.
4. Verify every public route works after a hard refresh in the deployed GitHub Pages environment.

Routes to verify:

```text
/
 /tourist-lessons
 /weekly-lessons
 /about
 /faq
 /book
```

Acceptance criteria:

1. Every known route loads directly from GitHub Pages.
2. Every known route survives a browser refresh.
3. Unknown paths show a deliberate in app not found experience.

### 3. Do not show booking confirmation until a real request succeeds

Current problem:

The booking flow advances to the confirmation step without sending information anywhere.

The current handler in `src/pages/Book.tsx` prevents default form submission and immediately switches to the confirmation step.

The confirmation copy explicitly indicates that no request was actually sent.

This makes the current public experience misleading because a visitor can believe Aaron received her request when he did not.

Required work:

1. Choose and implement a real submission mechanism.
2. Use Formspree, Resend, a serverless function, a booking system, or another production ready endpoint.
3. Add a pending request state.
4. Disable duplicate submission while the request is in progress.
5. Add a failure state with retry guidance.
6. Add an accessible success message.
7. Add spam protection.
8. Update the confirmation copy to accurately explain what happens next.
9. Include all booking selections in the submitted payload.

Suggested booking payload:

```text
lesson type
number of participants when applicable
preferred date
preferred time of day
name
email
phone if collected
additional notes if collected
source route or campaign data if available
```

Acceptance criteria:

1. Aaron receives a complete booking inquiry.
2. The confirmation step appears only after confirmed delivery.
3. Failed delivery does not look like successful booking.
4. A user cannot accidentally submit the request multiple times.

### 4. Replace visible placeholder content

Current problem:

Several pages and homepage cards still visibly contain placeholder text, headings, steps, questions, or descriptions.

Known affected areas include:

1. `src/pages/About.tsx`
2. `src/pages/WeeklyLessons.tsx`
3. `src/pages/FAQ.tsx`
4. `src/components/home/StackedServicesDeck.tsx`
5. Booking confirmation copy

Required work:

1. Replace every user visible placeholder with production copy.
2. Remove any temporary developer notes from the visitor facing interface.
3. Ensure all headings, descriptions, and calls to action communicate real service details.
4. Use existing approved image assets where visual content is missing.

Acceptance criteria:

1. No visitor visible text uses brackets, placeholder labels, temporary instructions, or unfinished copy.
2. Every route has a complete content purpose.
3. Every major page ends with a useful action.

## Priority 2: Complete the real product pages

### 5. Build the Weekly Lessons page

Current state:

The route exists but remains structurally incomplete.

Current placeholders include a page heading, section heading, three steps, video placeholder, and booking call to action heading.

Required work:

1. Define who weekly lessons are for.
2. Explain the ongoing lesson format.
3. Explain what students can learn.
4. Clarify instruments, skill levels, location, scheduling, and who provides the instrument.
5. Add real visual storytelling using the unused approved photo library.
6. Add a clear route into the booking flow.
7. Make the page emotionally distinct from Vacation Lessons.

Desired emotional distinction:

Vacation Lessons should feel temporary, special, sensory, and connected to Maui.

Weekly Lessons should feel personal, structured, progressive, and sustainable.

Acceptance criteria:

1. A local student can understand the offering without needing to contact Aaron first.
2. The page clearly leads into the correct booking path.
3. The page feels like a complete experience rather than a placeholder route.

### 6. Build the About page

Current state:

The route exists but contains placeholder biography, section headings, call to action text, and gallery labels.

Required work:

1. Write Aaron's real story.
2. Explain his teaching philosophy.
3. Establish trust without overclaiming.
4. Use existing Aaron imagery intentionally.
5. Connect the story to both visitor lessons and weekly students.
6. Add a strong but specific booking call to action.

Acceptance criteria:

1. The page helps a visitor feel confident choosing Aaron.
2. The copy feels personal rather than generic.
3. The page contains no visible placeholders.

### 7. Build the FAQ page

Current state:

The route exists but contains placeholder questions and no real answers.

Required work:

1. Add real questions and concise answers.
2. Cover common booking objections before visitors have to ask.
3. Add FAQ schema once the content is finalized.

Suggested FAQ topics:

```text
Do I need experience?
Do I need my own ukulele or guitar?
Where do beach lessons take place?
Can you teach children or families?
What should I bring?
What happens if the weather changes?
How far ahead should I book?
What is your cancellation policy?
Can I book a group lesson?
Do you teach locals on an ongoing basis?
```

Acceptance criteria:

1. Questions reduce booking friction.
2. Answers are accurate and operationally useful.
3. The page contains no fake or placeholder content.

## Priority 3: Engineering reliability and architecture

### 8. Make homepage sequence cleanup independently safe

Current state:

The homepage scroll sequence is much improved because hero and deck trigger creation are centrally coordinated through `useHomeScrollSequence`.

This is better than the previous independent setup.

Remaining risk:

Both `registerHero()` and `registerDeck()` return the same shared teardown function.

A cleanup from either component can remove both hero and deck triggers, even if the other component remains mounted.

This is structurally fragile during future changes, rerenders, media updates, responsive behavior, or refactoring.

Required work:

1. Make hero registration return an unregister function that removes only hero ownership.
2. Make deck registration return an unregister function that removes only deck ownership.
3. Reserve full trigger destruction for the shared homepage sequence unmount.
4. Test responsive changes, route exits, route reentry, and reduced motion behavior.

Acceptance criteria:

1. Removing or rerendering one homepage section does not destroy the other section's active timeline.
2. Route transitions do not leave orphaned ScrollTriggers.
3. No duplicate triggers appear after navigation or responsive mode changes.

### 9. Add route based code splitting

Current problem:

All route components are imported eagerly from `src/App.tsx`.

This means the initial homepage bundle includes code for non homepage pages, even when users never visit them.

Required work:

1. Use `React.lazy()` for non homepage routes.
2. Use `Suspense` with a deliberate lightweight loading state.
3. Keep the homepage route immediately available.
4. Recheck build output after splitting.

Suggested split candidates:

```text
Vacation Lessons
Weekly Lessons
About
FAQ
Book
```

Acceptance criteria:

1. Initial homepage JavaScript is smaller.
2. Direct navigation to every lazy loaded route still works.
3. Loading states are intentional and do not flash awkwardly.

### 10. Add a real project quality gate

Required work:

1. Keep `typecheck`.
2. Repair and keep `lint`.
3. Add a production build command to the normal precommit or predeploy workflow.
4. Consider adding automated checks in GitHub Actions.
5. Document the exact local verification sequence.

Suggested sequence:

```text
npm ci
npm run typecheck
npm run lint
npm run build
```

Acceptance criteria:

1. A future change cannot silently break compilation, types, or production build.
2. The deployment workflow runs the same essential checks.

## Priority 4: Performance

### 11. Optimize the homepage hero video

Current observation:

The hero video build asset is approximately 14.3 MB.

This is the largest single performance risk in the project, especially for visitors on cellular data, hotel Wi Fi, or slower devices.

The current opening scene uses `preload="auto"`.

Required work:

1. Create a smaller compressed mobile version.
2. Add WebM alongside MP4 where appropriate.
3. Keep a high quality poster image.
4. Consider `preload="metadata"` or a more selective load strategy.
5. Load the full video after first paint or when the opening scene is close to viewport.
6. Validate visual quality on both desktop and mobile.
7. Measure actual mobile network behavior.

Acceptance criteria:

1. The first experience still feels cinematic.
2. The page does not aggressively download an unnecessarily large asset before it is needed.
3. Visitors on mobile can interact quickly.

### 12. Audit image dimensions and loading strategy

Current problem:

The site has a strong image library, but image loading and dimensions should be deliberate.

Required work:

1. Add explicit width and height metadata where practical.
2. Use responsive image sizes where appropriate.
3. Ensure below fold imagery uses lazy loading.
4. Audit unused images and remove irrelevant duplicates.
5. Use only optimized production images.

Acceptance criteria:

1. Reduced layout shift.
2. No unnecessary asset downloads.
3. Strong visual quality on high density mobile screens.

### 13. Use the existing unused image library intentionally

Current observation:

The repository contains more approved photos than are currently referenced by source code.

Only a small subset of available images is in active use.

Required work:

1. Map each existing photo to a page or story purpose.
2. Use existing images to complete About, Weekly Lessons, FAQ supporting moments, and booking cards.
3. Avoid adding imagery only as decoration.
4. Remove unused assets that will not be used.

Acceptance criteria:

1. Existing image assets support the user journey.
2. The site does not require new photography to complete its core pages.

## Priority 5: SEO, trust, and discoverability

### 14. Add page metadata

Current problem:

`index.html` has basic setup but lacks production search and social metadata.

Required work:

1. Add a real page title strategy for each route.
2. Add meta descriptions.
3. Add canonical URLs.
4. Add Open Graph title, description, URL, and image.
5. Add Twitter card metadata.
6. Add a proper favicon set and verify that referenced favicon files exist.

Acceptance criteria:

1. Shared links have a polished preview.
2. Search engines can understand each page's purpose.
3. Every important page has a unique title and description.

### 15. Add structured data

Required work:

1. Add LocalBusiness schema.
2. Add service schema for private ukulele and guitar lessons.
3. Add FAQ schema after real FAQ content is written.
4. Include real service area details, contact method, booking URL, and social profiles when available.
5. Validate structured data with Google's Rich Results Test after deployment.

Acceptance criteria:

1. Structured data accurately matches what is on the page.
2. No schema claims exceed Aaron's actual services or operating area.

### 16. Add sitemap and robots rules

Required work:

1. Add `sitemap.xml`.
2. Add `robots.txt`.
3. Ensure all public routes are included in the sitemap.
4. Ensure staging, temporary, or private content is not indexed if any exists.

Acceptance criteria:

1. Search engines can crawl the production site appropriately.
2. Public routes are discoverable.

### 17. Clarify operational trust details

The finished site should clearly communicate:

```text
Lesson location options
Service area
What students should bring
Whether instruments are provided
Who lessons are for
Children and family policies
Group lesson rules
Weather plan
Cancellation policy
Payment method
How early visitors should book
Expected response time after inquiry
```

Acceptance criteria:

1. A visitor can make a confident booking decision without emailing basic questions.
2. The FAQ and booking experience match the real operating policies.

## Priority 6: Documentation and deployment clarity

### 18. Resolve documentation conflicts

Current problem:

`CLAUDE.md` says the project is not a Git repository.

Other deployment documentation says the project is connected to GitHub and deployed through GitHub Pages.

The archive reviewed did not include the documented GitHub Actions workflow, so it could not be verified.

Required work:

1. Update `CLAUDE.md` to reflect the current repository state.
2. Confirm the GitHub Actions deployment workflow exists and is committed.
3. Document current deployment URL and branch strategy.
4. Document local development, testing, build, and deployment commands.
5. Clearly label completed work versus planned work.
6. Keep one current source of truth for coding agents.

Acceptance criteria:

1. A new coding agent can understand the project without relying on outdated directions.
2. Deployment instructions match the actual repository.

## Priority 7: Maintain the design quality while completing the product

The current visual and interaction strengths should be protected.

Do not trade away the following while fixing technical and product gaps:

```text
Cinematic homepage opening
Scroll based emotional pacing
Distinct Maui atmosphere
Strong full screen navigation
Reduced motion support
Clear separation between vacation and weekly lesson experiences
Minimal interface with meaningful negative space
Existing original Aaron and Maui assets
```

The next phase should not be another broad redesign.

The next phase should make the business, content, and reliability layer catch up to the quality already present in the motion and art direction.

## Recommended implementation order

### Stage 1: Public safety and conversion

1. Fix lint configuration.
2. Add `.gitignore`.
3. Fix GitHub Pages deep route behavior.
4. Add a catch all not found route.
5. Implement real booking submission.
6. Add submission loading, failure, and success states.

### Stage 2: Finish visible content

1. Replace homepage service card placeholders.
2. Finish Weekly Lessons.
3. Finish About.
4. Finish FAQ.
5. Remove temporary user facing notes.

### Stage 3: Strengthen architecture and performance

1. Make shared homepage cleanup independently safe.
2. Add route based code splitting.
3. Optimize hero video.
4. Audit image loading and dimensions.
5. Use the remaining approved photo library purposefully.

### Stage 4: Discovery and deployment quality

1. Add metadata.
2. Add structured data.
3. Add sitemap and robots rules.
4. Confirm GitHub Actions deployment.
5. Update project documentation.
6. Verify the deployed experience on desktop and mobile with hard refreshes and shared route links.

## Definition of ready for a real public launch

The site is ready to share publicly when all of the following are true:

1. Every public page contains finished real content.
2. Every route works when opened directly and after refresh on GitHub Pages.
3. A booking inquiry is actually delivered to Aaron.
4. The booking interface never claims success when delivery fails.
5. The codebase passes type checking, linting, and production build.
6. Mobile visitors can access the homepage without an unnecessarily expensive video download.
7. The site has real metadata, social previews, structured data, sitemap, and robots rules.
8. The project documentation accurately describes the repository and deployment workflow.
9. The site has been tested on desktop and mobile at the final production URL.

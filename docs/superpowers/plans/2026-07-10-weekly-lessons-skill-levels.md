# Ongoing Lessons Skill-Level Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the intro block + tabbed skill-level section on the Ongoing Lessons page per `docs/superpowers/specs/2026-07-10-weekly-lessons-skill-levels-design.md`.

**Architecture:** One new component `SkillLevelSection` (own CSS file) mounted at the top of `WeeklyLessons.tsx`, replacing the current placeholder heading + "Skill Levels" grid. Uses GSAP + ScrollTrigger for line-by-line intro reveal and crossfade, following the existing `OpeningScene`/`StackedServicesDeck` idioms (gsap.context, `usePrefersReducedMotion`).

**Tech Stack:** React 19, TypeScript, GSAP 3 + ScrollTrigger, existing `ph-block` CSS primitives, existing `.cp-*` content-page classes for anything not level-specific.

## Global Constraints

- No cards, no horizontal scroll (per spec).
- Copy is TODO-placeholder — do not invent factual business details.
- Reduced motion: no stagger, no crossfade animation, no sliding underline.
- `npm run build` and `npm run lint` must pass after implementation.
- Mobile breakpoint is `760px` (existing site convention).

---

### Task 1: `SkillLevelSection` component with intro block and static 3-tab layout (no motion yet)

**Files:**
- Create: `src/components/weekly/SkillLevelSection.tsx`
- Create: `src/components/weekly/SkillLevelSection.css`
- Modify: `src/pages/WeeklyLessons.tsx` (remove placeholder heading section + "Skill Levels" `cp-grid--3` block, lines 12–35 of current file; render `<SkillLevelSection />` in their place)

**Interfaces:**
- Produces: `export default function SkillLevelSection()` — no props, self-contained.
- Produces CSS classes consumed by Task 2 (motion): `.skill-intro`, `.skill-intro__label`, `.skill-intro__title`, `.skill-intro__title-line`, `.skill-intro__text`, `.skill-section`, `.skill-tabs`, `.skill-tab`, `.skill-tab.is-active`, `.skill-tab-underline`, `.skill-panel`, `.skill-panel__layout--beginner`, `.skill-panel__layout--intermediate`, `.skill-panel__layout--advanced`, `.skill-panel__image`, `.skill-panel__body`.

- [ ] **Step 1: Write `SkillLevelSection.tsx` with static structure (React state for active tab, no GSAP yet)**

```tsx
import { useState } from 'react'

type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

const levels: { id: SkillLevel; label: string; heading: string; body: string }[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    heading: '[Beginner headline — TODO]',
    body: '[Short description of what beginner students focus on — TODO]',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    heading: '[Intermediate headline — TODO]',
    body: '[Short description of what intermediate students focus on — TODO]',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    heading: '[Advanced headline — TODO]',
    body: '[Short description of what advanced students focus on — TODO]',
  },
]

export default function SkillLevelSection() {
  const [active, setActive] = useState<SkillLevel>('beginner')
  const activeLevel = levels.find((level) => level.id === active) ?? levels[0]

  return (
    <>
      <div className="skill-intro">
        <p className="skill-intro__label">Ongoing Lessons</p>
        <h1 className="skill-intro__title">
          <span className="skill-intro__title-line">[Dramatic title line one — TODO]</span>
          <span className="skill-intro__title-line">[Dramatic title line two — TODO]</span>
        </h1>
        <p className="skill-intro__text">
          [Background paragraph about Aaron's teaching — TODO]
        </p>
      </div>

      <div className="skill-section">
        <div className="skill-tabs" role="tablist" aria-label="Skill level">
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              role="tab"
              id={`skill-tab-${level.id}`}
              aria-selected={level.id === active}
              aria-controls={`skill-panel-${level.id}`}
              className={`skill-tab${level.id === active ? ' is-active' : ''}`}
              onClick={() => setActive(level.id)}
            >
              {level.label}
            </button>
          ))}
          <span className="skill-tab-underline" aria-hidden="true" />
        </div>

        <div
          className={`skill-panel skill-panel__layout--${activeLevel.id}`}
          role="tabpanel"
          id={`skill-panel-${activeLevel.id}`}
          aria-labelledby={`skill-tab-${activeLevel.id}`}
        >
          <div className="skill-panel__image ph-block" aria-hidden="true">
            Image placeholder
          </div>
          <div className="skill-panel__body">
            <h2 className="skill-panel__heading">{activeLevel.heading}</h2>
            <p className="skill-panel__text">{activeLevel.body}</p>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write `SkillLevelSection.css` with intro typography and per-tab layout variants**

```css
.skill-intro {
  padding: clamp(2.5rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3rem);
}

.skill-intro__label {
  margin: 0 0 0.75rem;
  color: rgba(31, 29, 24, 0.38);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.skill-intro__title {
  margin: 0 0 1.5rem;
  color: rgba(31, 29, 24, 0.86);
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  font-style: italic;
  font-weight: 500;
  line-height: 1.05;
}

.skill-intro__title-line {
  display: block;
}

.skill-intro__text {
  max-width: 640px;
  color: rgba(31, 29, 24, 0.62);
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  line-height: 1.6;
}

.skill-section {
  padding: clamp(1.5rem, 3vw, 2.5rem) 0 clamp(2.5rem, 5vw, 4.5rem);
  border-top: 1px solid rgba(45, 39, 29, 0.09);
}

.skill-tabs {
  position: relative;
  display: flex;
  gap: clamp(1.5rem, 3vw, 2.75rem);
  margin-bottom: clamp(2rem, 4vw, 3rem);
  border-bottom: 1px solid rgba(45, 39, 29, 0.12);
}

.skill-tab {
  position: relative;
  padding: 0 0 0.9rem;
  background: none;
  border: none;
  color: rgba(31, 29, 24, 0.42);
  font: inherit;
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  font-weight: 500;
  cursor: pointer;
}

.skill-tab.is-active {
  color: rgba(31, 29, 24, 0.9);
}

.skill-tab-underline {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: rgba(31, 29, 24, 0.78);
  border-radius: 2px;
  /* position/width set inline by JS (Task 2); falls back to hidden here */
  width: 0;
}

.skill-panel {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.skill-panel__image {
  min-height: 220px;
  border-radius: clamp(10px, 1.2vw, 18px);
}

.skill-panel__heading {
  margin: 0 0 0.85rem;
  color: rgba(31, 29, 24, 0.8);
  font-size: clamp(1.3rem, 2.2vw, 1.9rem);
  font-weight: 400;
  line-height: 1.15;
}

.skill-panel__text {
  margin: 0;
  color: rgba(31, 29, 24, 0.6);
  font-size: clamp(0.95rem, 1.1vw, 1.05rem);
  line-height: 1.6;
}

/* Beginner: image left, text right */
.skill-panel__layout--beginner {
  grid-template-columns: 1fr 1fr;
  align-items: center;
}

/* Intermediate: text on top, image full-width below */
.skill-panel__layout--intermediate {
  grid-template-columns: 1fr;
}

.skill-panel__layout--intermediate .skill-panel__body {
  order: -1;
}

.skill-panel__layout--intermediate .skill-panel__image {
  min-height: 320px;
}

/* Advanced: large image, text overlaid bottom-left */
.skill-panel__layout--advanced {
  position: relative;
  grid-template-columns: 1fr;
}

.skill-panel__layout--advanced .skill-panel__image {
  min-height: 420px;
}

.skill-panel__layout--advanced .skill-panel__body {
  position: absolute;
  bottom: clamp(1rem, 2.5vw, 2rem);
  left: clamp(1rem, 2.5vw, 2rem);
  max-width: 60%;
  padding: clamp(1rem, 2vw, 1.5rem);
  background: rgba(245, 240, 231, 0.92);
  border-radius: clamp(8px, 1vw, 14px);
}

@media (max-width: 760px) {
  .skill-panel__layout--beginner,
  .skill-panel__layout--intermediate,
  .skill-panel__layout--advanced {
    grid-template-columns: 1fr;
  }

  .skill-panel__layout--beginner .skill-panel__body,
  .skill-panel__layout--intermediate .skill-panel__body {
    order: -1;
  }

  .skill-panel__layout--advanced {
    position: static;
  }

  .skill-panel__layout--advanced .skill-panel__body {
    position: static;
    max-width: none;
    margin-top: 1rem;
    background: none;
    padding: 0;
  }

  .skill-tabs {
    gap: clamp(1rem, 5vw, 1.5rem);
  }
}
```

- [ ] **Step 3: Edit `WeeklyLessons.tsx` — remove placeholder heading + Skill Levels grid, mount `SkillLevelSection`**

Remove the existing first two `<section className="cp-section">` blocks (page heading + "Skill Levels" grid, currently lines 12–35) and the now-unused `skillLevels` constant. Add the import and render call:

```tsx
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import SkillLevelSection from '../components/weekly/SkillLevelSection'

const howItWorksSteps = ['Step 1', 'Step 2', 'Step 3'] as const

export default function WeeklyLessons() {
  useDocumentTitle('Ongoing Lessons | Maui Lessons')

  return (
    <>
      <SkillLevelSection />

      <section className="cp-section">
        <p className="cp-section-label">How It Works</p>
        {/* ...unchanged... */}
```

Everything from "How It Works" onward stays exactly as it is today.

- [ ] **Step 4: Run build and lint**

Run: `npm run build && npm run lint`
Expected: both pass with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/weekly/SkillLevelSection.tsx src/components/weekly/SkillLevelSection.css src/pages/WeeklyLessons.tsx
git commit -m "feat(weekly): add intro block and skill-level tabs (static)"
```

---

### Task 2: Add motion — intro line reveal, animated tab underline, panel crossfade

**Files:**
- Modify: `src/components/weekly/SkillLevelSection.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion()` from `src/hooks/usePrefersReducedMotion.ts` (returns `boolean`).
- Consumes: `gsap`, `gsap/ScrollTrigger` (already a project dependency, see `OpeningScene.tsx`).

- [ ] **Step 1: Add refs and GSAP intro reveal (scroll-triggered, line-by-line)**

Add to the top of the file:

```tsx
import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)
```

Inside the component, add refs and effect:

```tsx
const prefersReducedMotion = usePrefersReducedMotion()
const introRef = useRef<HTMLDivElement>(null)
const lineRefs = useRef<HTMLElement[]>([])

useLayoutEffect(() => {
  const intro = introRef.current
  const lines = lineRefs.current
  if (!intro || lines.length === 0) return

  if (prefersReducedMotion) {
    gsap.set(lines, { opacity: 1, y: 0 })
    return
  }

  gsap.set(lines, { opacity: 0, y: 24 })

  const context = gsap.context(() => {
    gsap.to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: intro,
        start: 'top 80%',
      },
    })
  }, intro)

  return () => context.revert()
}, [prefersReducedMotion])
```

Attach `introRef` to the `.skill-intro` div, and collect the title lines + text paragraph into `lineRefs`:

```tsx
<div ref={introRef} className="skill-intro">
  <p
    className="skill-intro__label"
    ref={(el) => {
      if (el) lineRefs.current[0] = el
    }}
  >
    Ongoing Lessons
  </p>
  <h1 className="skill-intro__title">
    <span
      className="skill-intro__title-line"
      ref={(el) => {
        if (el) lineRefs.current[1] = el
      }}
    >
      [Dramatic title line one — TODO]
    </span>
    <span
      className="skill-intro__title-line"
      ref={(el) => {
        if (el) lineRefs.current[2] = el
      }}
    >
      [Dramatic title line two — TODO]
    </span>
  </h1>
  <p
    className="skill-intro__text"
    ref={(el) => {
      if (el) lineRefs.current[3] = el
    }}
  >
    [Background paragraph about Aaron's teaching — TODO]
  </p>
</div>
```

- [ ] **Step 2: Add animated underline that tracks the active tab**

Add refs:

```tsx
const tabsRef = useRef<HTMLDivElement>(null)
const tabButtonRefs = useRef<Record<SkillLevel, HTMLButtonElement | null>>({
  beginner: null,
  intermediate: null,
  advanced: null,
})
const underlineRef = useRef<HTMLSpanElement>(null)
```

Effect to move the underline whenever `active` changes or on mount/resize:

```tsx
useLayoutEffect(() => {
  const tabs = tabsRef.current
  const underline = underlineRef.current
  const button = tabButtonRefs.current[active]
  if (!tabs || !underline || !button) return

  const tabsRect = tabs.getBoundingClientRect()
  const buttonRect = button.getBoundingClientRect()
  const left = buttonRect.left - tabsRect.left
  const width = buttonRect.width

  if (prefersReducedMotion) {
    gsap.set(underline, { x: left, width })
  } else {
    gsap.to(underline, { x: left, width, duration: 0.32, ease: 'power2.out' })
  }
}, [active, prefersReducedMotion])
```

Wire refs onto the buttons and underline element:

```tsx
<div className="skill-tabs" role="tablist" aria-label="Skill level" ref={tabsRef}>
  {levels.map((level) => (
    <button
      key={level.id}
      type="button"
      role="tab"
      id={`skill-tab-${level.id}`}
      aria-selected={level.id === active}
      aria-controls={`skill-panel-${level.id}`}
      className={`skill-tab${level.id === active ? ' is-active' : ''}`}
      onClick={() => setActive(level.id)}
      ref={(el) => {
        tabButtonRefs.current[level.id] = el
      }}
    >
      {level.label}
    </button>
  ))}
  <span ref={underlineRef} className="skill-tab-underline" aria-hidden="true" />
</div>
```

- [ ] **Step 3: Add panel crossfade on tab change**

Add ref and effect:

```tsx
const panelRef = useRef<HTMLDivElement>(null)
const isFirstPanelRender = useRef(true)

useLayoutEffect(() => {
  const panel = panelRef.current
  if (!panel) return

  if (isFirstPanelRender.current) {
    isFirstPanelRender.current = false
    return
  }

  if (prefersReducedMotion) {
    gsap.set(panel, { opacity: 1 })
    return
  }

  gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power1.out' })
}, [active, prefersReducedMotion])
```

Attach `panelRef` to the `.skill-panel` div (keep existing `role="tabpanel"` attributes).

- [ ] **Step 4: Add keyboard arrow-key navigation between tabs**

```tsx
function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
  const currentIndex = levels.findIndex((level) => level.id === active)
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const next = levels[(currentIndex + 1) % levels.length]
    setActive(next.id)
    tabButtonRefs.current[next.id]?.focus()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prev = levels[(currentIndex - 1 + levels.length) % levels.length]
    setActive(prev.id)
    tabButtonRefs.current[prev.id]?.focus()
  }
}
```

Add `onKeyDown={handleTabKeyDown}` to each tab button.

- [ ] **Step 5: Run build and lint**

Run: `npm run build && npm run lint`
Expected: both pass with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/weekly/SkillLevelSection.tsx
git commit -m "feat(weekly): add scroll reveal, tab underline, and panel crossfade motion"
```

---

### Task 3: Browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start dev server and open `/weekly-lessons`**

Run: `npm run dev`, navigate to `http://localhost:5173/weekly-lessons` (or the port Vite reports).

- [ ] **Step 2: Verify intro reveal**

Scroll intro into view, confirm label/title lines/text fade+slide in with stagger.

- [ ] **Step 3: Verify tabs**

Click each tab, confirm: underline slides to the clicked tab, panel crossfades, layout changes shape per level (Beginner = side-by-side, Intermediate = stacked text-then-image, Advanced = image with overlay text box). Confirm arrow-key navigation moves focus and switches tabs.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` (browser devtools rendering tab or OS setting), reload, confirm: intro lines appear without stagger, underline jumps without animating, panel swaps instantly without fade.

- [ ] **Step 5: Verify mobile**

Resize to ≤760px width, confirm all three panel layouts collapse to stacked (text above placeholder image), tabs remain a single horizontal row.

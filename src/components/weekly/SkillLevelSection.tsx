import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import gsap from 'gsap'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './SkillLevelSection.css'

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
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<SkillLevel>('beginner')
  const activeLevel = levels.find((level) => level.id === active) ?? levels[0]

  const introRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<HTMLElement[]>([])

  const tabsRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<Record<SkillLevel, HTMLButtonElement | null>>({
    beginner: null,
    intermediate: null,
    advanced: null,
  })
  const underlineRef = useRef<HTMLSpanElement>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const isFirstPanelRender = useRef(true)

  useLayoutEffect(() => {
    const intro = introRef.current
    const lines = lineRefs.current
    if (!intro || lines.length === 0) return

    if (prefersReducedMotion) {
      gsap.set(lines, { opacity: 1, y: 0 })
      return
    }

    gsap.set(lines, { opacity: 0, y: 24 })

    let played = false
    const tween = gsap.to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.12,
      paused: true,
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played) {
          played = true
          tween.play()
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(intro)

    return () => {
      observer.disconnect()
      tween.kill()
    }
  }, [prefersReducedMotion])

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

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
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

  return (
    <>
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

      <div className="skill-section">
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
              onKeyDown={handleTabKeyDown}
              ref={(el) => {
                tabButtonRefs.current[level.id] = el
              }}
            >
              {level.label}
            </button>
          ))}
          <span ref={underlineRef} className="skill-tab-underline" aria-hidden="true" />
        </div>

        <div
          ref={panelRef}
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

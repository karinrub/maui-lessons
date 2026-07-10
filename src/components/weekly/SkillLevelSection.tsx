import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import gsap from 'gsap'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './SkillLevelSection.css'

const weeklyVideo = new URL('../../../assets/videos/aaron-weekly-section.mp4', import.meta.url)
  .href

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
  const clipRef = useRef<HTMLDivElement>(null)
  const titleLineRefs = useRef<HTMLElement[]>([])
  const textRef = useRef<HTMLParagraphElement>(null)

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
    const clip = clipRef.current
    const titleLines = titleLineRefs.current
    const text = textRef.current
    if (!intro || !clip || !text || titleLines.length === 0) return

    if (prefersReducedMotion) {
      gsap.set([clip, ...titleLines, text], { opacity: 1, y: 0, scale: 1 })
      return
    }

    gsap.set(clip, { opacity: 0, scale: 0.92 })
    gsap.set([...titleLines, text], { opacity: 0, y: 24 })

    let played = false
    const timeline = gsap
      .timeline({ paused: true })
      .to(clip, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(
        titleLines,
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12 },
        0.4,
      )
      .to(text, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.2)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played) {
          played = true
          timeline.play()
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(intro)

    return () => {
      observer.disconnect()
      timeline.kill()
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
        <div className="skill-intro__top">
          <div ref={clipRef} className="skill-intro__clip" aria-hidden="true">
            <video
              className="skill-intro__clip-video"
              src={weeklyVideo}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
          <div className="skill-intro__heading">
            <h1 className="skill-intro__title">
              <span
                className="skill-intro__title-line"
                ref={(el) => {
                  if (el) titleLineRefs.current[0] = el
                }}
              >
                Twenty-two years of music,
              </span>
              <span
                className="skill-intro__title-line"
                ref={(el) => {
                  if (el) titleLineRefs.current[1] = el
                }}
              >
                taught with patience.
              </span>
            </h1>
          </div>
        </div>
        <p ref={textRef} className="skill-intro__text">
          Aaron has spent over twenty years teaching music, and the ukulele has been his focus
          for the last eight. Whether you're picking one up for the first time or refining songs
          you've played for years, lessons move at your pace — patient, unhurried, and built
          around real progress.
        </p>
      </div>

      <div className="skill-section">
        <h2 className="skill-section__heading">
          Beginner, intermediate, or advanced — there's a lesson for where you are.
        </h2>
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

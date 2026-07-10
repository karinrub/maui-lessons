import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import gsap from 'gsap'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './SkillLevelSection.css'

const weeklyVideo = new URL('../../../assets/videos/aaron-weekly-section.mp4', import.meta.url)
  .href
const beginnerImage = new URL('../../../assets/images/aaron-weekly-1.jpg', import.meta.url).href
const intermediateImage = new URL('../../../assets/images/aaron-weekly-2.jpg', import.meta.url)
  .href

type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

const levels: {
  id: SkillLevel
  label: string
  question: string
  heading: string
  body: string
  bullets: string[]
  image?: string
  imageAlt?: string
}[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    question: 'Never picked up a ukulele before?',
    heading: 'Just starting out',
    body: 'No experience, no problem. Lessons start with your first chords and basic strumming, at a pace that feels comfortable — no pressure, just steady progress.',
    bullets: [
      'First chords and basic strumming, from zero',
      'A patient, no-pressure pace built around you',
      'Real songs, not just exercises',
    ],
    image: beginnerImage,
    imageAlt: 'Aaron helping a young student strum his first chords on the ukulele',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    question: 'Already comfortable with a few chords?',
    heading: 'Building real skill',
    body: 'Already know a few chords? Lessons move into reading music, new strumming patterns, and songs that stretch what you can already do.',
    bullets: [
      'Reading music and chord charts with confidence',
      'New strumming and picking patterns',
      'Songs that stretch what you can already play',
    ],
    image: intermediateImage,
    imageAlt: 'Aaron reviewing a chord chart with a student outdoors',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    question: 'Ready to take your playing further?',
    heading: 'Refining your sound',
    body: 'For players ready to go deeper — technique, style, and the kind of playing that comes from years at it. Aaron draws on his own varied musical background to help push your playing further.',
    bullets: [
      'Refined technique and your own playing style',
      'Hawaiian and other ukulele traditions',
      'Guidance shaped by twenty-two years in music',
    ],
  },
]

export default function SkillLevelSection() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<SkillLevel>('beginner')
  const activeLevel = levels.find((level) => level.id === active) ?? levels[0]

  const introRef = useRef<HTMLDivElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const clipCurtainRef = useRef<HTMLDivElement>(null)
  const titleLineRefs = useRef<HTMLElement[]>([])
  const textRef = useRef<HTMLParagraphElement>(null)
  const dividerRef = useRef<HTMLSpanElement>(null)

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
    const curtain = clipCurtainRef.current
    const titleLines = titleLineRefs.current
    const text = textRef.current
    const divider = dividerRef.current
    const panel = panelRef.current
    const tabButtons = levels
      .map((level) => tabButtonRefs.current[level.id])
      .filter((button): button is HTMLButtonElement => button !== null)

    if (
      !intro ||
      !clip ||
      !curtain ||
      !text ||
      !divider ||
      !panel ||
      titleLines.length === 0 ||
      tabButtons.length === 0
    ) {
      return
    }

    if (prefersReducedMotion) {
      gsap.set(curtain, { scaleY: 0 })
      gsap.set(titleLines, { yPercent: 0, opacity: 1 })
      gsap.set(text, { opacity: 1, y: 0 })
      gsap.set(divider, { scaleX: 1 })
      gsap.set(tabButtons, { opacity: 1, y: 0, scale: 1 })
      gsap.set(panel, { opacity: 1, y: 0 })
      return
    }

    gsap.set(curtain, { scaleY: 1, transformOrigin: 'top' })
    gsap.set(titleLines, { yPercent: 120, opacity: 0 })
    gsap.set(text, { opacity: 0, y: 20 })
    gsap.set(divider, { scaleX: 0, transformOrigin: 'left' })
    gsap.set(tabButtons, { opacity: 0, y: 16, scale: 0.94 })
    gsap.set(panel, { opacity: 0, y: 16 })

    let played = false
    // A distinct reveal idiom for this page: a solid curtain wipes off the
    // video (not a fade), title lines rise out of a clipped mask (not a
    // plain opacity fade), a drawn rule marks the intro/tabs boundary, and
    // tabs pop in with a slight overshoot — deliberately different from the
    // fade+translateY reveal used on Home/About/Vacation.
    const timeline = gsap
      .timeline({ paused: true })
      .to(curtain, { scaleY: 0, duration: 0.9, ease: 'power4.inOut' }, 0)
      .to(
        titleLines,
        { yPercent: 0, opacity: 1, duration: 0.85, ease: 'expo.out', stagger: 0.12 },
        0.25,
      )
      .to(text, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.85)
      .to(divider, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, 1.15)
      .to(
        tabButtons,
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)', stagger: 0.07 },
        1.35,
      )
      .to(panel, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.65)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played) {
          played = true
          timeline.play()
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
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
            <div ref={clipCurtainRef} className="skill-intro__clip-curtain" />
          </div>
          <div className="skill-intro__heading">
            <h1 className="skill-intro__title">
              <span className="skill-intro__title-line-mask">
                <span
                  className="skill-intro__title-line"
                  ref={(el) => {
                    if (el) titleLineRefs.current[0] = el
                  }}
                >
                  Twenty-two years of music,
                </span>
              </span>
              <span className="skill-intro__title-line-mask">
                <span
                  className="skill-intro__title-line"
                  ref={(el) => {
                    if (el) titleLineRefs.current[1] = el
                  }}
                >
                  taught with patience.
                </span>
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

      <div className="skill-divider-wrap" aria-hidden="true">
        <span ref={dividerRef} className="skill-divider" />
      </div>

      <div className="skill-section">
        <h2 className="skill-section__heading">
          Wherever you're starting from, there's a lesson built for you.
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
          {activeLevel.image ? (
            <div className="skill-panel__image">
              <img
                className="skill-panel__image-img"
                src={activeLevel.image}
                alt={activeLevel.imageAlt}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="skill-panel__image ph-block" aria-hidden="true">
              Image placeholder
            </div>
          )}
          <div className="skill-panel__body">
            <p className="skill-panel__question">{activeLevel.question}</p>
            <h2 className="skill-panel__heading">{activeLevel.heading}</h2>
            <p className="skill-panel__text">{activeLevel.body}</p>
            <ul className="skill-panel__bullets">
              {activeLevel.bullets.map((bullet) => (
                <li key={bullet} className="skill-panel__bullet">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

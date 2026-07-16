import { useId, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import playIfInView from '../../utils/playIfInView'
import './WeeklyPathways.css'

gsap.registerPlugin(ScrollTrigger)

type PathwayId = 'beginner' | 'intermediate' | 'advanced'

type Pathway = {
  id: PathwayId
  numeral: string
  label: string
  question: string
  heading: string
  body: string
  bullets: readonly string[]
}

// Copy revived verbatim from the retired SkillLevelSection (shipped 2026-07-10,
// dropped from the page in the 2026-07-15 redesign) — owner-approved text only.
const pathways: readonly Pathway[] = [
  {
    id: 'beginner',
    numeral: '01',
    label: 'Beginner',
    question: 'Never picked up a ukulele before?',
    heading: 'Just starting out',
    body: 'No experience, no problem. Lessons start with your first chords and basic strumming, at a pace that feels comfortable — no pressure, just steady progress.',
    bullets: [
      'First chords and basic strumming, from zero',
      'A patient, no-pressure pace built around you',
      'Real songs, not just exercises',
    ],
  },
  {
    id: 'intermediate',
    numeral: '02',
    label: 'Intermediate',
    question: 'Already comfortable with a few chords?',
    heading: 'Building real skill',
    body: 'Already know a few chords? Lessons move into reading music, new strumming patterns, and songs that stretch what you can already do.',
    bullets: [
      'Reading music and chord charts with confidence',
      'New strumming and picking patterns',
      'Songs that stretch what you can already play',
    ],
  },
  {
    id: 'advanced',
    numeral: '03',
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
] as const

export default function WeeklyPathways() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<PathwayId>('beginner')
  const rootRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const hasRevealedPanelRef = useRef(false)
  const baseId = useId()
  const activePathway = pathways.find((p) => p.id === active) ?? pathways[0]

  const selectByOffset = (offset: number) => {
    const index = pathways.findIndex((p) => p.id === active)
    const nextIndex = (index + offset + pathways.length) % pathways.length
    setActive(pathways[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      tl.fromTo(
        root.querySelector('.weekly-pathways__rule'),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: 'power3.inOut', transformOrigin: 'left' },
        0,
      )
        .fromTo(
          root.querySelectorAll(
            '.weekly-pathways__eyebrow, .weekly-pathways__title, .weekly-pathways__lede',
          ),
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
          0.2,
        )
        .fromTo(
          root.querySelectorAll('.weekly-pathways__tab'),
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.09 },
          0.4,
        )
        .fromTo(
          panelRef.current,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          0.55,
        )

      playIfInView(tl, root)
    }, root)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  // Crossfade the panel when the selection changes (not on the initial
  // reveal — the entrance timeline above owns that first appearance).
  useLayoutEffect(() => {
    if (!hasRevealedPanelRef.current) {
      hasRevealedPanelRef.current = true
      return
    }
    if (prefersReducedMotion || !panelRef.current) {
      return
    }
    const tween = gsap.fromTo(
      panelRef.current,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [active, prefersReducedMotion])

  return (
    <section ref={rootRef} className="weekly-pathways" aria-labelledby={`${baseId}-title`}>
      <div className="weekly-pathways__inner">
        <span className="weekly-pathways__rule" aria-hidden="true" />
        <p className="weekly-pathways__eyebrow">Where you begin</p>
        <h2 id={`${baseId}-title`} className="weekly-pathways__title">
          Find your starting point
        </h2>
        <p className="weekly-pathways__lede">
          Lessons meet your level from the first strum — pick the door that sounds like you.
        </p>
        <div className="weekly-pathways__grid">
          <div className="weekly-pathways__tabs" role="tablist" aria-label="Skill level">
            {pathways.map((pathway, index) => {
              const isActive = active === pathway.id
              return (
                <button
                  key={pathway.id}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${pathway.id}`}
                  aria-selected={isActive}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={isActive ? 0 : -1}
                  className={`weekly-pathways__tab${isActive ? ' is-active' : ''}`}
                  onClick={() => setActive(pathway.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                      event.preventDefault()
                      selectByOffset(1)
                    }
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                      event.preventDefault()
                      selectByOffset(-1)
                    }
                  }}
                >
                  <span className="weekly-pathways__tab-numeral" aria-hidden="true">
                    {pathway.numeral}
                  </span>
                  <span className="weekly-pathways__tab-label">{pathway.label}</span>
                  <span className="weekly-pathways__tab-question">{pathway.question}</span>
                </button>
              )
            })}
          </div>
          <div
            ref={panelRef}
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${activePathway.id}`}
            className="weekly-pathways__panel"
          >
            <span className="weekly-pathways__watermark" aria-hidden="true">
              {activePathway.numeral}
            </span>
            <h3 className="weekly-pathways__heading">{activePathway.heading}</h3>
            <p className="weekly-pathways__body">{activePathway.body}</p>
            <ul className="weekly-pathways__bullets">
              {activePathway.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <Link to="/book" className="weekly-pathways__cta">
              Book a Lesson{' '}
              <span className="weekly-pathways__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

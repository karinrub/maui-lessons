import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './WeeklyJourneySections.css'

gsap.registerPlugin(ScrollTrigger)

const heroTeachingImage = new URL('../../../assets/images/aaron-teaching-2.jpg', import.meta.url).href
const heroWeeklyImage = new URL('../../../assets/images/aaron-weekly-2.jpg', import.meta.url).href
const monthImages = [heroTeachingImage, heroWeeklyImage, heroTeachingImage, heroWeeklyImage] as const
const STICKY_SCROLL_MULTIPLIER = 2

const levels = [
  {
    id: 'beginner',
    label: 'Beginner',
    headline: 'Just starting out',
    summary: 'Build confidence with the basics and play real songs from day one.',
    detail:
      'No experience, no problem. Lessons begin with your first chords and a pace that feels comfortable — no pressure, just steady progress.',
    benefits: [
      'First chords and basic strumming, from zero',
      'A patient, no-pressure pace built around you',
      'Real songs, not just exercises',
    ],
    cta: 'Book a beginner lesson',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    headline: 'Ready to go further',
    summary: 'Strengthen rhythm, add techniques, and expand your song toolkit.',
    detail:
      'You already know a few songs. Together, you build smoother changes, stronger rhythm, and the confidence to make each song feel like your own.',
    benefits: [
      'Connect chords with cleaner, easier movement',
      'Find strumming patterns that make songs feel alive',
      'Choose songs that stretch your musical vocabulary',
    ],
    cta: 'Book an intermediate lesson',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    headline: 'Make the music yours',
    summary: 'Refine your voice, explore arrangements, and play with freedom.',
    detail:
      'Bring the songs and skills you want to deepen. Lessons can focus on arrangement, technique, musicality, and the small details that shape your sound.',
    benefits: [
      'Refine the techniques that support your own style',
      'Explore harmony, arranging, and musical expression',
      'Keep a challenging repertoire moving forward',
    ],
    cta: 'Book an advanced lesson',
  },
] as const

const monthBeats = [
  {
    title: 'First chords',
    copy: 'Learn a few simple shapes and sound great right away.',
    image: monthImages[0],
  },
  {
    title: 'First song',
    copy: 'Play your first complete song — yes, really.',
    image: monthImages[1],
  },
  {
    title: 'Rhythm settles',
    copy: 'Lock in steady rhythm and start adding your style.',
    image: monthImages[2],
  },
  {
    title: 'Play it through',
    copy: 'Put it all together and play with confidence.',
    image: monthImages[3],
  },
] as const

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="weekly-redesign__arrow">
      <path d="M3 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function WeeklyJourneySections() {
  const [activeLevelIndex, setActiveLevelIndex] = useState(0)
  const [activeMonthIndex, setActiveMonthIndex] = useState(0)
  const baseId = useId()
  const monthStageRef = useRef<HTMLElement>(null)
  const monthTrackRef = useRef<HTMLOListElement>(null)
  const monthProgressFillRef = useRef<HTMLSpanElement>(null)
  const activeMonthIndexRef = useRef(0)
  const activeLevel = levels[activeLevelIndex]

  useLayoutEffect(() => {
    const stage = monthStageRef.current
    const track = monthTrackRef.current

    if (!stage || !track) {
      return
    }

    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      media.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
        const progressFill = monthProgressFillRef.current
        const getTrackDistance = () => Math.max(track.scrollWidth - stage.clientWidth, 1)
        const getScrollDistance = () => getTrackDistance() * STICKY_SCROLL_MULTIPLIER

        if (progressFill) {
          gsap.set(progressFill, { scaleY: 0, transformOrigin: 'top center' })
        }

        gsap.to(track, {
          x: () => -getTrackDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            snap: {
              snapTo: 1 / (monthBeats.length - 1),
              duration: { min: 0.18, max: 0.42 },
              delay: 0.1,
              ease: 'power2.out',
              inertia: false,
              directional: false,
            },
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressFill) {
                gsap.set(progressFill, { scaleY: self.progress })
              }

              const nextMonthIndex = Math.round(self.progress * (monthBeats.length - 1))
              if (activeMonthIndexRef.current !== nextMonthIndex) {
                activeMonthIndexRef.current = nextMonthIndex
                setActiveMonthIndex(nextMonthIndex)
              }
            },
          },
        })

        ScrollTrigger.refresh()
      })
    }, stage)

    return () => {
      media.revert()
      context.revert()
    }
  }, [])

  function handleLevelKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % levels.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + levels.length) % levels.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = levels.length - 1
    } else {
      return
    }

    event.preventDefault()
    setActiveLevelIndex(nextIndex)
    document.getElementById(`${baseId}-tab-${levels[nextIndex].id}`)?.focus()
  }

  return (
    <main className="weekly-redesign">
      <section className="weekly-redesign__hero" aria-labelledby="weekly-redesign-title">
        <div className="weekly-redesign__hero-inner">
          <div className="weekly-redesign__hero-copy">
            <h1 id="weekly-redesign-title">A rhythm, not a routine.</h1>
            <span className="weekly-redesign__accent-rule" aria-hidden="true" />
            <p>Private ukulele &amp; guitar lessons that build week over week.</p>
            <div className="weekly-redesign__hero-actions">
              <a className="weekly-redesign__primary-cta" href="#lesson-pathways">
                Choose your path <Arrow />
              </a>
              <a className="weekly-redesign__text-link" href="#first-month">
                See how the first month works <Arrow />
              </a>
            </div>
          </div>

          <div className="weekly-redesign__hero-art" aria-hidden="true">
            <span className="weekly-redesign__hero-ring weekly-redesign__hero-ring--one" />
            <span className="weekly-redesign__hero-ring weekly-redesign__hero-ring--two" />
            <span className="weekly-redesign__hero-ring weekly-redesign__hero-ring--three" />
            <figure className="weekly-redesign__hero-image weekly-redesign__hero-image--primary">
              <img
                src={heroTeachingImage}
                alt=""
                width="720"
                height="960"
                fetchPriority="high"
              />
            </figure>
            <figure className="weekly-redesign__hero-image weekly-redesign__hero-image--secondary">
              <img src={heroWeeklyImage} alt="" width="720" height="960" />
            </figure>
          </div>
        </div>
      </section>

      <section id="lesson-pathways" className="weekly-redesign__pathways" aria-labelledby="pathways-title">
        <div className="weekly-redesign__section-heading">
          <p>Where you begin</p>
          <h2 id="pathways-title">Find your starting point</h2>
          <span>Lessons meet your level from the first strum.</span>
        </div>

        <div className="weekly-redesign__level-grid" role="tablist" aria-label="Choose a lesson level">
          {levels.map((level, index) => {
            const isActive = index === activeLevelIndex
            const panelId = `${baseId}-panel-${level.id}`
            const tabId = `${baseId}-tab-${level.id}`

            return (
              <article
                key={level.id}
                className={`weekly-redesign__level-card${isActive ? ' is-active' : ''}`}
              >
                <button
                  id={tabId}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveLevelIndex(index)}
                  onKeyDown={(event) => handleLevelKeyDown(event, index)}
                >
                  <span className="weekly-redesign__level-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{level.label}</span>
                </button>

                {isActive ? (
                  <div
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={tabId}
                    className="weekly-redesign__level-content"
                  >
                    <h3>{activeLevel.headline}</h3>
                    <p>{activeLevel.detail}</p>
                    <ul>
                      {activeLevel.benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                    <Link to={`/book?type=ongoing&level=${activeLevel.id}`}>
                      {activeLevel.cta} <Arrow />
                    </Link>
                  </div>
                ) : (
                  <p className="weekly-redesign__level-summary">{level.summary}</p>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="first-month"
        ref={monthStageRef}
        className="weekly-redesign__month weekly-redesign__month-stage"
        aria-labelledby="month-title"
      >
        <div className="weekly-redesign__month-heading">
          <p>Your first month</p>
          <h2 id="month-title">Small steps. Real progress.</h2>
          <span>Here’s what it can look like.</span>
        </div>
        <div className="weekly-redesign__month-progress" aria-hidden="true">
          <span ref={monthProgressFillRef} />
        </div>
        <p className="weekly-redesign__month-cue" aria-hidden="true">
          Scroll to explore <Arrow />
        </p>
        <ol ref={monthTrackRef} className="weekly-redesign__timeline">
          {monthBeats.map((beat, index) => {
            const isActive = index === activeMonthIndex

            return (
              <li
                key={beat.title}
                className={`weekly-redesign__timeline-station${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="weekly-redesign__timeline-orbit" aria-hidden="true" />
                <figure className="weekly-redesign__timeline-image">
                  <img src={beat.image} alt="" loading="lazy" />
                </figure>
                <span className="weekly-redesign__timeline-dot" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="weekly-redesign__timeline-copy">
                  <h3>{beat.title}</h3>
                  <p>{beat.copy}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="weekly-redesign__close" aria-labelledby="weekly-redesign-close-title">
        <p>Nobody learns a song in one sitting. You learn it a little every week — until one day, it’s simply yours.</p>
        <h2 id="weekly-redesign-close-title">Ready to make it a rhythm?</h2>
        <span>Lessons meet across Kihei and Wailea, and at Maipoina Beach Park.</span>
        <Link to="/book" className="weekly-redesign__close-cta">
          Book a lesson <Arrow />
        </Link>
      </section>
    </main>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import playIfInView from '../../utils/playIfInView'
import './WeeklyJourneySections.css'

gsap.registerPlugin(ScrollTrigger)

const weeklySectionVideo = new URL('../../../assets/videos/aaron-weekly-section.mp4', import.meta.url).href
const weeklyHeroImageOne = new URL('../../../assets/images/aaron-weekly-1.jpg', import.meta.url).href
const weeklyHeroImageTwo = new URL('../../../assets/images/aaron-weekly-2.jpg', import.meta.url).href
const maipoinaLocationImage = new URL(
  '../../../assets/images/aaron-personal-branding-isa-danzig-photography-2-2.jpg',
  import.meta.url,
).href
const fretboardImage = new URL('../../../assets/images/aaron-bookingForm.jpg', import.meta.url).href
const teachingImage = new URL('../../../assets/images/aaron-teaching-2.jpg', import.meta.url).href

const facts = [
  'Private, one-on-one lessons',
  'Ukulele or guitar',
  'Weekly, across Kīhei, Wailea & Maipoina Beach Park',
  'From $35 for a 30-minute lesson',
] as const

const progression = [
  {
    title: 'First chords, real songs',
    description: "You're playing actual songs from day one — not drills building toward some future payoff.",
  },
  {
    title: 'Reading & understanding',
    description:
      'As the songs get harder, you start reading music and learning why the instrument works the way it does.',
  },
  {
    title: 'Refining your style',
    description: 'Technique sharpens, and your own voice on the instrument starts to come through.',
  },
] as const

function StaffMark({ className = '' }: { className?: string }) {
  return (
    <span className={`weekly-redesign__staff-mark ${className}`.trim()} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

function ImageFigure({
  src,
  caption,
  width,
  height,
  eager = false,
  className = '',
}: {
  src: string
  caption: string
  width: number
  height: number
  eager?: boolean
  className?: string
}) {
  return (
    <figure className={`weekly-redesign__photo ${className}`.trim()}>
      <img
        src={src}
        alt={caption}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export default function WeeklyJourneySections() {
  const rootRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      return
    }

    const progressionSection = root.querySelector<HTMLElement>('.weekly-redesign__progression')
    const line = root.querySelector<SVGPathElement>('.weekly-redesign__progress-line-path')
    const dots = root.querySelectorAll<HTMLElement>('.weekly-redesign__progress-dot')
    const cards = root.querySelectorAll<HTMLElement>('.weekly-redesign__progress-card')

    if (!progressionSection || !line) {
      return
    }

    const lineLength = line.getTotalLength()
    const reveal = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: progressionSection,
        start: 'top 72%',
        toggleActions: 'play none none none',
      },
    })

    reveal
      .set(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength })
      .fromTo(line, { strokeDashoffset: lineLength }, { strokeDashoffset: 0, duration: 0.75, ease: 'power2.out' })
      .fromTo(dots, { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.16, ease: 'back.out(1.8)' }, '-=0.1')
      .fromTo(cards, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48, stagger: 0.16, ease: 'power3.out' }, '-=0.5')

    playIfInView(reveal, progressionSection)

    return () => {
      reveal.scrollTrigger?.kill()
      reveal.kill()
    }
  }, [prefersReducedMotion])

  return (
    <main className="weekly-redesign" ref={rootRef}>
      <section className="weekly-redesign__opening" aria-labelledby="weekly-redesign-title">
        <div className="weekly-redesign__opening-stage">
          <span className="weekly-redesign__ghost-word weekly-redesign__ghost-word--practice" aria-hidden="true">
            practice
          </span>
          <div className="weekly-redesign__loop-system" aria-hidden="true">
            <span className="weekly-redesign__loop-rings">
              <i />
              <i />
              <i />
            </span>
            <span className="weekly-redesign__loop-dot" />
            <span className="weekly-redesign__loop-open-arc" />
            <StaffMark className="weekly-redesign__loop-staff" />
          </div>
          <p className="weekly-redesign__loop-begin" aria-hidden="true">
            Begin again.
          </p>
          <p className="weekly-redesign__loop-transition" aria-hidden="true">
            Practice becomes <em>progress.</em>
          </p>
          <div className="weekly-redesign__resolved-hero weekly-redesign__container">
            <div className="weekly-redesign__resolved-copy">
              <h1 id="weekly-redesign-title">
                <span>Progress happens</span>
                <span>on repeat.</span>
              </h1>
              <p className="weekly-redesign__hero-lede">
                Private ukulele and guitar lessons on Maui, shaped around whoever&apos;s in front of him — not a level chart.
              </p>
            </div>

            <div className="weekly-redesign__resolved-media">
              <figure className="weekly-redesign__hero-video-frame">
                <video
                  src={weeklySectionVideo}
                  poster={weeklyHeroImageOne}
                  width={1920}
                  height={1080}
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Lesson footage — silent clip, low-fi"
                />
                <figcaption>Lesson footage — silent clip, low-fi</figcaption>
              </figure>
              <div className="weekly-redesign__contact-sheet">
                <ImageFigure
                  src={weeklyHeroImageOne}
                  caption="Aaron teaching outdoors"
                  width={720}
                  height={960}
                  eager
                />
                <ImageFigure
                  src={weeklyHeroImageTwo}
                  caption="Aaron guiding a lesson by the ocean"
                  width={698}
                  height={920}
                  eager
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="weekly-redesign__facts" aria-labelledby="weekly-facts-title">
        <div className="weekly-redesign__grain" aria-hidden="true" />
        <div className="weekly-redesign__container weekly-redesign__facts-content">
          <p id="weekly-facts-title" className="weekly-redesign__eyebrow weekly-redesign__eyebrow--ink">
            THE BASICS
          </p>
          <ul className="weekly-redesign__fact-list">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <ImageFigure
            className="weekly-redesign__location-photo"
            caption="Photo: Maipoina Beach Park, one of the regular lesson spots"
            src={maipoinaLocationImage}
            width={2200}
            height={1467}
          />
        </div>
      </section>

      <section className="weekly-redesign__progression" aria-labelledby="weekly-progression-title">
        <span className="weekly-redesign__ghost-word weekly-redesign__ghost-word--onward" aria-hidden="true">
          onward
        </span>
        <div className="weekly-redesign__container">
          <p className="weekly-redesign__eyebrow">
            HOW IT DEVELOPS
          </p>
          <h2 id="weekly-progression-title">Same instrument. A different player, every year.</h2>

          <div className="weekly-redesign__progression-layout">
            <div className="weekly-redesign__chart" aria-label="Learning progression from first chords to personal style">
              <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--one" />
              <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--two" />
              <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--three" />
              <svg className="weekly-redesign__progress-line" viewBox="0 0 820 250" aria-hidden="true">
                <path
                  className="weekly-redesign__progress-line-path"
                  d="M62 180C198 180 230 138 394 138C528 138 545 64 676 64"
                />
              </svg>
              <div className="weekly-redesign__progress-step weekly-redesign__progress-step--one">
                <span className="weekly-redesign__progress-dot" aria-hidden="true" />
                <article className="weekly-redesign__progress-card">
                  <h3>{progression[0].title}</h3>
                  <p>{progression[0].description}</p>
                </article>
              </div>
              <div className="weekly-redesign__progress-step weekly-redesign__progress-step--two">
                <span className="weekly-redesign__progress-dot" aria-hidden="true" />
                <article className="weekly-redesign__progress-card">
                  <h3>{progression[1].title}</h3>
                  <p>{progression[1].description}</p>
                </article>
              </div>
              <div className="weekly-redesign__progress-step weekly-redesign__progress-step--three">
                <span className="weekly-redesign__progress-dot" aria-hidden="true" />
                <article className="weekly-redesign__progress-card">
                  <h3>{progression[2].title}</h3>
                  <p>{progression[2].description}</p>
                </article>
              </div>
            </div>
            <ImageFigure
              className="weekly-redesign__fretboard-photo"
              caption="Photo: hands on the fretboard"
              src={fretboardImage}
              width={1467}
              height={2200}
            />
          </div>
        </div>
      </section>

      <section className="weekly-redesign__teacher" aria-labelledby="weekly-teacher-title">
        <div className="weekly-redesign__container weekly-redesign__teacher-layout">
          <div>
            <p id="weekly-teacher-title" className="weekly-redesign__eyebrow">
              <StaffMark />
              WHO YOU&apos;RE LEARNING FROM
            </p>
            <p className="weekly-redesign__teacher-copy">
              Aaron has taught guitar and ukulele on Maui for <strong>22</strong> years. For the last <strong>8</strong>, ukulele has been the focus.
            </p>
          </div>
          <ImageFigure
            className="weekly-redesign__teaching-photo"
            caption="Photo: Aaron teaching a lesson"
            src={teachingImage}
            width={1153}
            height={1153}
          />
        </div>
      </section>

      <section className="weekly-redesign__cross-link" aria-label="Vacation lesson option">
        <p>
          Just on Maui for a week or two? There&apos;s a page for that — <Link to="/tourist-lessons">Vacation Lessons</Link>
        </p>
      </section>

      <section className="weekly-redesign__finale" aria-labelledby="weekly-finale-title">
        <div className="weekly-redesign__finale-arch" aria-hidden="true" />
        <div className="weekly-redesign__grain" aria-hidden="true" />
        <div className="weekly-redesign__finale-content">
          <h2 id="weekly-finale-title">Make it a habit.</h2>
          <p>One lesson a week, for as long as it keeps being useful.</p>
          <Link to="/book" className="weekly-redesign__finale-cta">
            Start lessons <span aria-hidden="true">→</span>
          </Link>
          <small>MAUI LESSONS — KĪHEI · WAILEA · MAIPOINA BEACH PARK</small>
        </div>
      </section>
    </main>
  )
}

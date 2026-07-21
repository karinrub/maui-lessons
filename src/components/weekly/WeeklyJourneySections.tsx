import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './WeeklyJourneySections.css'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

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

function buildPracticeLoopTimeline(root: HTMLElement) {
  const q = gsap.utils.selector(root)
  const stage = q('.weekly-redesign__opening-stage')[0] as HTMLElement
  const loopSystem = q('.weekly-redesign__loop-system')[0] as HTMLElement
  const videoFrame = q('.weekly-redesign__hero-video-frame')[0] as HTMLElement
  const orbitPath = root.querySelector<SVGPathElement>('.weekly-redesign__orbit-path')!
  const getVideoStart = () => {
    const stageRect = stage.getBoundingClientRect()
    const loopRect = loopSystem.getBoundingClientRect()
    const videoRect = videoFrame.getBoundingClientRect()
    const loopCenterX = loopRect.left - stageRect.left + loopRect.width / 2
    const loopCenterY = loopRect.top - stageRect.top + loopRect.height / 2
    const videoCenterX = videoRect.left - stageRect.left + videoRect.width / 2
    const videoCenterY = videoRect.top - stageRect.top + videoRect.height / 2

    return {
      x: loopCenterX - videoCenterX,
      y: loopCenterY - videoCenterY,
      scale: Math.min(loopRect.width, loopRect.height) / videoRect.height,
    }
  }

  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  tl.addLabel('still', 0)
    .set(q('.weekly-redesign__loop-system'), { display: 'block' })
    .set(q('.weekly-redesign__loop-begin, .weekly-redesign__loop-transition'), { display: 'block' })
    .set(q('.weekly-redesign__resolved-copy, .weekly-redesign__contact-sheet'), { autoAlpha: 0 })
    .set(videoFrame, {
      x: () => getVideoStart().x,
      y: () => getVideoStart().y,
      scale: () => getVideoStart().scale,
      clipPath: 'circle(38% at 50% 50%)',
      transformOrigin: 'center center',
    })
    .set(q('.weekly-redesign__loop-transition'), { autoAlpha: 0, y: 24 })
    .addLabel('repetition', 0.2)
    .to(
      q('.weekly-redesign__loop-dot'),
      {
        motionPath: {
          path: orbitPath,
          align: orbitPath,
          alignOrigin: [0.5, 0.5],
        },
        duration: 0.28,
      },
      0.2,
    )
    .to(q('.weekly-redesign__loop-rings'), { scale: 1.06, duration: 0.28 }, 0.2)
    .to(q('.weekly-redesign__loop-begin'), { autoAlpha: 0, y: -18, duration: 0.12 }, 0.28)
    .to(q('.weekly-redesign__loop-transition'), { autoAlpha: 1, y: 0, duration: 0.16 }, 0.32)
    .addLabel('release', 0.48)
    .to(q('.weekly-redesign__loop-rings'), { autoAlpha: 0, scale: 1.18, duration: 0.2 }, 0.48)
    .to(q('.weekly-redesign__loop-open-arc'), { autoAlpha: 1, rotate: 18, duration: 0.22 }, 0.48)
    .to(q('.weekly-redesign__loop-staff'), { autoAlpha: 1, x: 0, duration: 0.24 }, 0.52)
    .to(q('.weekly-redesign__loop-transition'), { autoAlpha: 0, y: -20, duration: 0.14 }, 0.66)
    .addLabel('progress', 0.72)
    .to(q('.weekly-redesign__resolved-copy, .weekly-redesign__contact-sheet'), { autoAlpha: 1, duration: 0.18 }, 0.72)
    .fromTo(
      q('.weekly-redesign__resolved-copy > *'),
      { y: 34 },
      { y: 0, duration: 0.24, stagger: 0.035 },
      0.72,
    )
    .to(videoFrame, { x: 0, y: 0, scale: 1, clipPath: 'inset(0% round 8px)', duration: 0.28 }, 0.72)
    .to(q('.weekly-redesign__ghost-word--practice'), { xPercent: -10, duration: 1 }, 0)

  return tl
}

export default function WeeklyJourneySections() {
  const rootRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      return
    }

    const mm = gsap.matchMedia(root)
    mm.add(
      {
        isDesktop: '(min-width: 761px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',
        isMobile: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
        isShort: '(min-width: 761px) and (max-height: 679px) and (prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const q = gsap.utils.selector(root)
        const { isDesktop, isMobile, isShort } = context.conditions as {
          isDesktop: boolean
          isMobile: boolean
          isShort: boolean
        }
        const opening = root.querySelector<HTMLElement>('.weekly-redesign__opening')
        const openingStage = root.querySelector<HTMLElement>('.weekly-redesign__opening-stage')
        if (!opening || !openingStage) return

        const loop = buildPracticeLoopTimeline(root)
        ScrollTrigger.create({
          id: 'weekly-practice-loop',
          trigger: opening,
          start: 'top top',
          end: () => `+=${window.innerHeight * (isMobile ? 1.25 : isShort ? 1.05 : 1.6)}`,
          animation: loop,
          pin: openingStage,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })

        gsap
          .timeline({
            scrollTrigger: {
              id: 'weekly-facts-score',
              trigger: q('.weekly-redesign__facts')[0],
              start: 'top 86%',
              end: 'bottom 28%',
              scrub: 0.8,
            },
          })
          .fromTo(
            q('.weekly-redesign__fact-list li'),
            { y: 34, autoAlpha: 0.35 },
            { y: -12, autoAlpha: 1, stagger: 0.08 },
            0,
          )
          .fromTo(
            q('.weekly-redesign__location-photo'),
            { scale: 0.9, y: 38 },
            { scale: 1, y: -18 },
            0.15,
          )
          .fromTo(
            q('.weekly-redesign__location-photo img'),
            { yPercent: -4, scale: 1.06 },
            { yPercent: 4, scale: 1 },
            0.15,
          )

        if (isDesktop) {
          const progressStage = q('.weekly-redesign__progress-stage')[0] as HTMLElement
          const path = root.querySelector<SVGPathElement>('.weekly-redesign__progress-path')!
          const pathLength = path.getTotalLength()
          const progressTl = gsap.timeline({ defaults: { ease: 'none' } })

          progressTl
            .set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
            .fromTo(q('.weekly-redesign__progress-graphic'), { y: 76 }, { y: -64, duration: 1 }, 0)
            .to(path, { strokeDashoffset: 0, duration: 0.82 }, 0.06)
            .to(
              q('.weekly-redesign__progress-active-dot'),
              {
                motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
                duration: 0.82,
              },
              0.06,
            )
            .fromTo(
              q('.weekly-redesign__progress-milestone'),
              { autoAlpha: 0.34, y: 36 },
              { autoAlpha: 1, y: 0, stagger: 0.2, duration: 0.22 },
              0.12,
            )
            .fromTo(
              q('.weekly-redesign__fretboard-photo img'),
              { yPercent: -4, scale: 1.06 },
              { yPercent: 4, scale: 1, duration: 1 },
              0,
            )

          ScrollTrigger.create({
            id: 'weekly-progress-desktop',
            trigger: progressStage,
            start: 'top top',
            end: () => `+=${window.innerHeight * 1.65}`,
            animation: progressTl,
            pin: progressStage,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          })
        }

        if (!isDesktop) {
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                id: 'weekly-progress-mobile',
                trigger: q('.weekly-redesign__chart')[0],
                start: 'top 82%',
                end: 'bottom 28%',
                scrub: 0.8,
              },
            })
            .fromTo(
              q('.weekly-redesign__mobile-progress-line'),
              { scaleY: 0 },
              { scaleY: 1, transformOrigin: 'top' },
              0,
            )
            .fromTo(
              q('.weekly-redesign__progress-active-dot'),
              { y: 0 },
              { y: () => (q('.weekly-redesign__chart')[0] as HTMLElement).offsetHeight - 24 },
              0,
            )
            .fromTo(
              q('.weekly-redesign__progress-milestone'),
              { autoAlpha: 0.45, x: 20 },
              { autoAlpha: 1, x: 0, stagger: 0.24 },
              0,
            )
        }

        gsap
          .timeline({
            scrollTrigger: {
              id: 'weekly-teacher-score',
              trigger: q('.weekly-redesign__teacher')[0],
              start: 'top 88%',
              end: 'bottom 24%',
              scrub: 0.8,
            },
          })
          .fromTo(
            q('.weekly-redesign__teacher-copy'),
            { x: -42, autoAlpha: 0.45 },
            { x: 12, autoAlpha: 1 },
            0,
          )
          .fromTo(
            q('.weekly-redesign__teacher-copy strong'),
            { y: 28, scale: 0.82 },
            { y: -8, scale: 1 },
            0.08,
          )
          .fromTo(
            q('.weekly-redesign__teaching-photo'),
            { x: 46, scale: 0.94 },
            { x: -10, scale: 1 },
            0,
          )

        gsap
          .timeline({
            scrollTrigger: {
              id: 'weekly-cross-link-score',
              trigger: q('.weekly-redesign__cross-link')[0],
              start: 'top 94%',
              end: 'bottom 52%',
              scrub: 0.8,
            },
          })
          .fromTo(q('.weekly-redesign__cross-link p'), { y: 14 }, { y: -10 })
      },
    )

    return () => mm.revert()
  }, [prefersReducedMotion])

  useEffect(() => {
    const video = rootRef.current?.querySelector<HTMLVideoElement>('.weekly-redesign__hero-video-frame video')
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined)
        } else {
          video.pause()
        }
      },
      { rootMargin: '25% 0px', threshold: 0.01 },
    )
    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return (
    <main className="weekly-redesign" ref={rootRef}>
      <section className="weekly-redesign__opening" aria-labelledby="weekly-redesign-title">
        <div className="weekly-redesign__opening-stage">
          <span className="weekly-redesign__ghost-word weekly-redesign__ghost-word--practice" aria-hidden="true">
            practice
          </span>
          <div className="weekly-redesign__loop-system" aria-hidden="true">
            <svg
              className="weekly-redesign__loop-orbit"
              viewBox="0 0 420 420"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="weekly-redesign__orbit-path"
                d="M210 4A206 206 0 0 1 210 416A206 206 0 0 1 210 4"
              />
            </svg>
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
          <h2 id="weekly-progression-title" className="weekly-redesign__progress-heading">
            <span>Same instrument.</span>
            <span>A different player,</span>
            <span>every year.</span>
          </h2>

          <div className="weekly-redesign__progress-stage">
            <div className="weekly-redesign__progression-layout">
              <div className="weekly-redesign__chart">
                <div className="weekly-redesign__progress-graphic" aria-hidden="true">
                  <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--one" />
                  <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--two" />
                  <span className="weekly-redesign__chart-guide weekly-redesign__chart-guide--three" />
                  <svg viewBox="0 0 860 360" preserveAspectRatio="none">
                    <path
                      className="weekly-redesign__progress-path"
                      d="M54 286 C190 286 218 244 330 232 C470 216 502 144 620 132 C716 122 740 74 812 52"
                    />
                  </svg>
                  <span className="weekly-redesign__mobile-progress-line" />
                  <span className="weekly-redesign__progress-active-dot" />
                </div>
                {progression.map((item, index) => (
                  <article
                    key={item.title}
                    className={`weekly-redesign__progress-milestone weekly-redesign__progress-milestone--${index + 1}`}
                  >
                    <span className="weekly-redesign__progress-dot" aria-hidden="true" />
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
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

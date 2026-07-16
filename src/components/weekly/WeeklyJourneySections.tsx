import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import WeeklyStepVisual, { type WeeklyStepRingColors } from './WeeklyStepVisual'
import './WeeklyJourneySections.css'

gsap.registerPlugin(ScrollTrigger)

const weeklyOneToOneImage = new URL(
  '../../../assets/images/aaron-weekly-1.jpg',
  import.meta.url,
).href
const weeklyGroupImage = new URL(
  '../../../assets/images/aaron-teaching-2.jpg',
  import.meta.url,
).href
const weeklyPerformanceImage = new URL(
  '../../../assets/images/aaron-weekly-2.jpg',
  import.meta.url,
).href

const CHAPTER_STARTS = [0, 1.55, 3.1] as const
const CHAPTER_END = 4.15

type JourneyStep = {
  id: string
  numeral: string
  title: string
  body: string
  image: string
  alt: string
  loading: 'eager' | 'lazy'
  width: number
  height: number
  imagePosition: string
  ringColors: WeeklyStepRingColors
}

const steps: readonly JourneyStep[] = [
  {
    id: 'step-1',
    numeral: '01',
    title: 'Start where you are',
    body: 'Your first lesson meets you at your level — whether that means open strings or songs you already half-know. No prep, no pressure.',
    image: weeklyOneToOneImage,
    alt: 'Aaron guiding a young ukulele student through a lesson outdoors',
    loading: 'eager',
    width: 720,
    height: 960,
    imagePosition: '50% 30%',
    ringColors: {
      outer: 'rgba(211, 154, 66, 0.42)',
      middle: 'rgba(247, 216, 143, 0.64)',
      inner: 'rgba(184, 200, 160, 0.82)',
    },
  },
  {
    id: 'step-2',
    numeral: '02',
    title: 'Find your rhythm',
    body: 'Lessons become a regular part of your week, built around your pace and your goals. Each one picks up exactly where the last left off.',
    image: weeklyGroupImage,
    alt: "A small group practicing guitar together during Aaron's lesson",
    loading: 'eager',
    width: 1153,
    height: 1153,
    imagePosition: '50% 45%',
    ringColors: {
      outer: 'rgba(245, 240, 231, 0.72)',
      middle: 'rgba(184, 200, 160, 0.82)',
      inner: 'rgba(111, 134, 90, 0.78)',
    },
  },
  {
    id: 'step-3',
    numeral: '03',
    title: 'Hear it add up',
    body: 'A chord becomes a song, a song becomes a set. Week by week the progress compounds — and you can hear it.',
    image: weeklyPerformanceImage,
    alt: 'Aaron teaching chord shapes to a student outdoors',
    loading: 'eager',
    width: 698,
    height: 920,
    imagePosition: '50% 30%',
    ringColors: {
      outer: 'rgba(111, 134, 90, 0.75)',
      middle: 'rgba(23, 53, 42, 0.72)',
      inner: 'rgba(211, 154, 66, 0.52)',
    },
  },
] as const

export default function WeeklyJourneySections() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia(root)

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
      const entrance = root.querySelector<HTMLElement>('.weekly-entrance')
      const content = root.querySelector<HTMLElement>('.weekly-entrance__content')
      const label = root.querySelector<HTMLElement>('.weekly-entrance__label')
      const sage = root.querySelector<HTMLElement>('.weekly-entrance__sage')
      const lines = gsap.utils.toArray<HTMLElement>('.weekly-entrance__title-line', root)
      if (!entrance || !content || !label || !sage || lines.length === 0) return

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .fromTo(label, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.65 })
        .fromTo(
          lines,
          { yPercent: 115 },
          { yPercent: 0, duration: 1, stagger: 0.12 },
          0.12,
        )

      const transition = gsap.timeline({
        scrollTrigger: {
          trigger: entrance,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      })
      // The title drifts for the whole exit but only dims in the back half,
      // so "A rhythm, not a routine." stays readable until it is genuinely
      // leaving instead of washing out on the first wheel tick.
      transition
        .to(content, { yPercent: -20, ease: 'none', duration: 1 }, 0)
        .to(content, { autoAlpha: 0.12, ease: 'none', duration: 0.55 }, 0.45)
        .fromTo(sage, { scaleY: 0.65 }, { scaleY: 1, ease: 'none', duration: 1 }, 0)

      return () => {
        intro.kill()
        transition.scrollTrigger?.kill()
        transition.kill()
      }
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const stage = root.querySelector<HTMLElement>('.weekly-rhythm__stage')
      const track = root.querySelector<HTMLElement>('.weekly-rhythm__track')
      const spine = root.querySelector<HTMLElement>('.weekly-rhythm__spine-line')
      const panels = gsap.utils.toArray<HTMLElement>('.weekly-step', root)
      if (!stage || !track || !spine || panels.length === 0) return

      root.classList.add('weekly-journey--horizontal')

      // All lens images are already eager-loaded; decoding them up front as
      // well means the clip-path reveal never waits on a decode and the
      // aperture always opens onto pixels, not an empty ring.
      for (const image of gsap.utils.toArray<HTMLImageElement>('.weekly-step__image', root)) {
        void image.decode().catch(() => undefined)
      }

      const n = panels.length
      // Travel is based on panel width, not track.scrollWidth: the oversized
      // ghost numerals intentionally overflow their panel bounds.
      const getScrollDistance = () => panels[0].offsetWidth * (n - 1)

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        syncTouch: true,
      })
      const tick = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // Trimmed 2026-07-15 polish pass: the old 1.6×/3.1× pin left long
      // stretches of scroll where nothing on screen changed between
      // chapters. 1.3×/2.6× keeps the chapter-stepped rhythm with the dead
      // travel squeezed out.
      const getPinnedDistance = () =>
        Math.max(getScrollDistance() * 1.3, window.innerHeight * 2.6)
      // Numeric, pin-spacer-aware positions avoid refresh compensation drift.
      const getSectionTop = () => {
        const spacer = stage.parentElement?.classList.contains('pin-spacer')
          ? stage.parentElement
          : stage
        return spacer.getBoundingClientRect().top + window.scrollY
      }

      gsap.set(spine, { scaleX: 0, transformOrigin: 'left center' })

      // Size the spine so full scaleX ends exactly at the final dot's resting
      // x — which equals the first dot's initial x, since panels share width.
      const sizeSpine = () => {
        const firstDot = panels[0].querySelector<HTMLElement>('.weekly-step__dot')
        if (!firstDot) return
        const trackX = gsap.getProperty(track, 'x') as number
        const dotRect = firstDot.getBoundingClientRect()
        const spineLeft = spine.getBoundingClientRect().left
        const dotCenter = dotRect.left + dotRect.width / 2 - trackX
        gsap.set(spine, { width: Math.max(dotCenter - spineLeft, 0), right: 'auto' })
      }
      sizeSpine()
      ScrollTrigger.addEventListener('refreshInit', sizeSpine)

      panels.forEach((panel) => {
        gsap.set(panel.querySelector('.weekly-step__dot'), { scale: 0 })
        gsap.set(panel.querySelector('.weekly-step__numeral'), { autoAlpha: 0, y: 24 })
        gsap.set(panel.querySelector('.weekly-step__title'), { autoAlpha: 0, y: 16 })
        gsap.set(panel.querySelector('.weekly-step__body'), { autoAlpha: 0, y: 12 })
        gsap.set(panel.querySelectorAll('.weekly-step__ring'), { autoAlpha: 0, scale: 0.72 })
        gsap.set(panel.querySelector('.weekly-step__lens'), {
          autoAlpha: 0,
          clipPath: 'circle(0% at 50% 50%)',
        })
        gsap.set(panel.querySelector('.weekly-step__image'), { scale: 1.08 })
      })

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: () => getSectionTop(),
          end: () => getSectionTop() + getPinnedDistance(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      panels.forEach((panel, index) => {
        const chapterAt = CHAPTER_STARTS[index]
        // Later chapters bloom 0.35 early, while still traveling into view —
        // kills the empty-viewport dead frame between chapters.
        const revealAt = index === 0 ? chapterAt : chapterAt - 0.35
        // The lens follows the rings closely (+0.24, was +0.48): at scrub
        // pace the old gap held fully-drawn rings empty for a third of a
        // viewport of scroll before the photo arrived.
        const imageAt = revealAt + 0.24
        const travelAt = chapterAt + 0.95
        const rings = panel.querySelectorAll<HTMLElement>('.weekly-step__ring')
        const lens = panel.querySelector<HTMLElement>('.weekly-step__lens')
        if (chapterAt === undefined || rings.length !== 3 || !lens) return

        master
          .to(
            panel.querySelector('.weekly-step__dot'),
            { scale: 1, duration: 0.18, ease: 'back.out(2)' },
            revealAt,
          )
          .to(
            panel.querySelector('.weekly-step__numeral'),
            { autoAlpha: 0.16, y: 0, duration: 0.18, ease: 'power3.out' },
            revealAt,
          )
          .to(
            panel.querySelector('.weekly-step__title'),
            { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out' },
            revealAt,
          )
          .to(
            rings[2],
            { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'back.out(1.4)' },
            revealAt,
          )
          .to(
            rings[1],
            { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power3.out' },
            revealAt + 0.14,
          )
          .to(
            panel.querySelector('.weekly-step__body'),
            { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out' },
            revealAt + 0.14,
          )
          .to(
            rings[0],
            { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power3.out' },
            revealAt + 0.28,
          )
          .to(
            lens,
            {
              autoAlpha: 1,
              clipPath: 'circle(72% at 50% 50%)',
              duration: 0.24,
              ease: 'power2.out',
            },
            imageAt,
          )
          // Slow Ken-Burns settle keeps the held chapter alive.
          .to(
            panel.querySelector('.weekly-step__image'),
            { scale: 1, duration: travelAt - imageAt, ease: 'none' },
            imageAt,
          )
          // One metronome pulse once the chapter lands.
          .to(
            panel.querySelector('.weekly-step__dot'),
            {
              keyframes: [
                { scale: 1.22, duration: 0.06, ease: 'power2.out' },
                { scale: 1, duration: 0.08, ease: 'power2.in' },
              ],
            },
            chapterAt + 0.2,
          )

        if (index < n - 1) {
          master
            .to(
              track,
              {
                x: () => -panels[0].offsetWidth * (index + 1),
                duration: 0.6,
                ease: 'expo.inOut',
              },
              travelAt,
            )
            .to(
              spine,
              {
                scaleX: (index + 1) / (n - 1),
                duration: 0.6,
                ease: 'expo.inOut',
              },
              travelAt,
            )
            // Graceful exit: the outgoing step dissolves as it travels, so no
            // orphaned text or ring fragments bleed into the next chapter.
            .to(
              [
                panel.querySelector('.weekly-step__numeral'),
                panel.querySelector('.weekly-step__visual'),
                panel.querySelector('.weekly-step__content'),
              ],
              { autoAlpha: 0, xPercent: -8, duration: 0.45, ease: 'power2.in' },
              travelAt,
            )
        }
      })

      // Warm gold drift toward the payoff chapter — foreshadows the Book CTA.
      master.to(
        stage,
        {
          '--weekly-warm': 1,
          duration: CHAPTER_STARTS[2] + 0.37 - CHAPTER_STARTS[1],
          ease: 'none',
        },
        CHAPTER_STARTS[1],
      )

      const finalImageEnd = CHAPTER_STARTS[2] + 0.37
      // Empty tween holds the pin so the final chapter rests on screen.
      master.to({}, { duration: CHAPTER_END - finalImageEnd }, finalImageEnd)

      return () => {
        root.classList.remove('weekly-journey--horizontal')
        ScrollTrigger.removeEventListener('refreshInit', sizeSpine)
        master.scrollTrigger?.kill()
        master.kill()
        gsap.ticker.remove(tick)
        // Restore GSAP's default lag smoothing (the About page's Lenis
        // cleanup does the same); leaving it at 0 penalizes every route
        // visited after this one on a busy main thread.
        gsap.ticker.lagSmoothing(500, 33)
        lenis.destroy()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={rootRef} className="weekly-journey">
      <section className="weekly-entrance" aria-labelledby="weekly-entrance-title">
        <div className="weekly-entrance__sage" aria-hidden="true" />
        <div className="weekly-entrance__content">
          <p className="weekly-entrance__label">How it works</p>
          <h1 id="weekly-entrance-title" className="weekly-entrance__title">
            <span className="weekly-entrance__title-mask">
              <span className="weekly-entrance__title-line">A rhythm,</span>
            </span>
            <span className="weekly-entrance__title-mask">
              <span className="weekly-entrance__title-line weekly-entrance__title-line--em">
                not a routine.
              </span>
            </span>
          </h1>
        </div>
      </section>

      <section className="weekly-rhythm" aria-label="How ongoing lessons work">
        <div className="weekly-rhythm__band" aria-hidden="true" />
        <div className="weekly-rhythm__stage">
          <span className="weekly-rhythm__spine-line" aria-hidden="true" />
          <ol className="weekly-rhythm__track">
            {steps.map((step) => (
              <li
                key={step.id}
                className="weekly-step weekly-step--has-media"
              >
                <span className="weekly-step__numeral" aria-hidden="true">
                  {step.numeral}
                </span>
                <span className="weekly-step__dot" aria-hidden="true" />
                <WeeklyStepVisual
                  src={step.image}
                  alt={step.alt}
                  loading={step.loading}
                  width={step.width}
                  height={step.height}
                  imagePosition={step.imagePosition}
                  ringColors={step.ringColors}
                />
                <div className="weekly-step__content">
                  <h3 className="weekly-step__title">{step.title}</h3>
                  <p className="weekly-step__body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="weekly-close" aria-label="Book an ongoing lesson">
        {/* Same closing mechanic as HomeFinale: the section above bulges down
            into the ink field as an arch — sage here instead of the home tan. */}
        <div className="weekly-close__arch" aria-hidden="true" />
        <div className="weekly-close__inner">
          <p className="weekly-close__quote">
            Nobody learns a song in one sitting. You learn it a little every week — until one
            day, it’s simply yours.
          </p>
          <p className="weekly-close__line">Ready to make it a rhythm?</p>
          <p className="weekly-close__note">
            Lessons meet across Kihei and Wailea, and at Maipoina Beach Park.
          </p>
          <div className="weekly-close__cta-wrap">
            <Link to="/book" className="weekly-close__cta">
              Book a lesson <span className="weekly-close__cta-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="weekly-close__aside">
            Questions first? <Link to="/faq">Read the FAQ</Link>
          </p>
          <nav className="weekly-close__links" aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/tourist-lessons">Vacation Lessons</Link>
            <Link to="/weekly-lessons">Ongoing Lessons</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
          </nav>
          <p className="weekly-close__copyright">© {new Date().getFullYear()} Maui Lessons</p>
        </div>
        <div className="weekly-close__grain" aria-hidden="true" />
      </section>
    </div>
  )
}

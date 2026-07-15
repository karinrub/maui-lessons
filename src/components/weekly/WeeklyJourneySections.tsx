import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './WeeklyJourneySections.css'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    id: 'step-1',
    numeral: '01',
    title: 'Start where you are',
    body: 'Your first lesson meets you at your level — whether that means open strings or songs you already half-know. No prep, no pressure.',
  },
  {
    id: 'step-2',
    numeral: '02',
    title: 'Find your rhythm',
    body: 'Lessons become a regular part of your week, built around your pace and your goals. Each one picks up exactly where the last left off.',
  },
  {
    id: 'step-3',
    numeral: '03',
    title: 'Hear it add up',
    body: 'A chord becomes a song, a song becomes a set. Week by week the progress compounds — and you can hear it.',
  },
] as const

export default function WeeklyJourneySections() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia(root)

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
      const stage = root.querySelector<HTMLElement>('.weekly-rhythm__stage')
      const track = root.querySelector<HTMLElement>('.weekly-rhythm__track')
      const spine = root.querySelector<HTMLElement>('.weekly-rhythm__spine-line')
      const panels = gsap.utils.toArray<HTMLElement>('.weekly-step', root)
      if (!stage || !track || !spine || panels.length === 0) return

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

      // Extra pinned distance after travel lets the final step rest on screen.
      const HOLD_RATIO = 0.3
      // Numeric, pin-spacer-aware positions avoid refresh compensation drift.
      const getSectionTop = () => {
        const spacer = stage.parentElement?.classList.contains('pin-spacer')
          ? stage.parentElement
          : stage
        return spacer.getBoundingClientRect().top + window.scrollY
      }

      gsap.set(spine, { scaleX: 0, transformOrigin: 'left center' })
      panels.forEach((panel) => {
        gsap.set(panel.querySelector('.weekly-step__dot'), { scale: 0 })
        gsap.set(panel.querySelector('.weekly-step__numeral'), { autoAlpha: 0, y: 24 })
        gsap.set(panel.querySelector('.weekly-step__content'), { autoAlpha: 0, y: 22 })
      })

      ScrollTrigger.create({
        trigger: stage,
        start: () => getSectionTop(),
        end: () => getSectionTop() + getScrollDistance() * (1 + HOLD_RATIO),
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          start: () => getSectionTop(),
          end: () => getSectionTop() + getScrollDistance(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      gsap.to(spine, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: () => getSectionTop(),
          end: () => getSectionTop() + getScrollDistance(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      const reveal = gsap.timeline({
        scrollTrigger: {
          start: () => getSectionTop(),
          end: () => getSectionTop() + getScrollDistance(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
      panels.forEach((panel, index) => {
        const at = (n > 1 ? index / (n - 1) : 0) * 0.9
        reveal
          .to(
            panel.querySelector('.weekly-step__dot'),
            { scale: 1, duration: 0.12, ease: 'back.out(2)' },
            at,
          )
          .to(
            panel.querySelector('.weekly-step__numeral'),
            { autoAlpha: 0.16, y: 0, duration: 0.14, ease: 'power3.out' },
            at,
          )
          .to(
            panel.querySelector('.weekly-step__content'),
            { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power3.out' },
            at + 0.02,
          )
      })

      return () => {
        gsap.ticker.remove(tick)
        lenis.destroy()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={rootRef} className="weekly-journey">
      <div className="weekly-rhythm__prelude" aria-hidden="true" />
      <section className="weekly-rhythm" aria-label="How ongoing lessons work">
        <div className="weekly-rhythm__band" aria-hidden="true" />
        <div className="weekly-rhythm__head">
          <p className="weekly-rhythm__eyebrow">How it works</p>
          <h2 className="weekly-rhythm__title">
            <span className="weekly-rhythm__title-mask">
              <span className="weekly-rhythm__title-line">A rhythm,</span>
            </span>
            <span className="weekly-rhythm__title-mask">
              <span className="weekly-rhythm__title-line weekly-rhythm__title-line--em">
                not a routine.
              </span>
            </span>
          </h2>
        </div>

        <div className="weekly-rhythm__stage">
          <span className="weekly-rhythm__spine-line" aria-hidden="true" />
          <ol className="weekly-rhythm__track">
            {steps.map((step) => (
              <li key={step.id} className="weekly-step">
                <span className="weekly-step__numeral" aria-hidden="true">
                  {step.numeral}
                </span>
                <span className="weekly-step__dot" aria-hidden="true" />
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
        <p className="weekly-close__quote">
          Nobody learns a song in one sitting. You learn it a little every week — until one day,
          it’s simply yours.
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
      </section>
    </div>
  )
}

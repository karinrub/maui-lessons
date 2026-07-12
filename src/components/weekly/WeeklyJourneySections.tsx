import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

const quoteLines = [
  { id: 'quote-1', text: 'Nobody learns a song in one sitting.' },
  { id: 'quote-2', text: 'You learn it a little every week —' },
  { id: 'quote-3', text: 'until one day, it’s simply yours.' },
] as const

export default function WeeklyJourneySections() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const mm = gsap.matchMedia(root)

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Section title rises out of clipped rows — the same reveal idiom the
      // page's intro established, so the new sections read as one voice.
      const rhythm = root.querySelector('.weekly-rhythm')

      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.weekly-rhythm__title-line', root),
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: rhythm,
            start: 'top 74%',
            toggleActions: 'play none none none',
          },
        },
      )

      gsap.fromTo(
        root.querySelector('.weekly-rhythm__eyebrow'),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: rhythm,
            start: 'top 74%',
            toggleActions: 'play none none none',
          },
        },
      )

      // Quote lines rise out of their masks one after another.
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.weekly-close__quote-line-inner', root),
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.14,
          scrollTrigger: {
            trigger: root.querySelector('.weekly-close__quote'),
            start: 'top 72%',
            toggleActions: 'play none none none',
          },
        },
      )

      // Once-only CTA entrance — same rule as the home finale: a footer CTA
      // popping back out on upward scroll reads as broken, not cinematic.
      gsap.fromTo(
        root.querySelector('.weekly-close__cta-wrap'),
        { scale: 0.94, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root.querySelector('.weekly-close__cta-wrap'),
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    // Desktop: the timeline becomes a pinned, scrubbed sequence — the same
    // pin-and-scrub idiom as the home deck. The steps hold in place while
    // the spine draws down and each beat (dot pop, ghost numeral, copy)
    // arrives on the reader's own scroll.
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
      const stepsWrap = root.querySelector<HTMLElement>('.weekly-rhythm__steps')
      const spine = root.querySelector<HTMLElement>('.weekly-rhythm__spine-line')
      const stepEls = gsap.utils.toArray<HTMLElement>('.weekly-step', root)

      if (!stepsWrap || !spine || stepEls.length === 0) {
        return
      }

      gsap.set(spine, { scaleY: 0, transformOrigin: 'top' })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stepsWrap,
          start: 'top 22%',
          end: '+=220%',
          scrub: 1,
          pin: stepsWrap,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      stepEls.forEach((step, index) => {
        const dot = step.querySelector('.weekly-step__dot')
        const numeral = step.querySelector('.weekly-step__numeral')
        const body = step.querySelector('.weekly-step__content')

        gsap.set(dot, { scale: 0 })
        gsap.set(numeral, { autoAlpha: 0, y: 26 })
        gsap.set(body, { autoAlpha: 0, y: 24 })

        timeline
          .to(
            spine,
            { scaleY: (index + 1) / stepEls.length, duration: 0.5, ease: 'none' },
            index === 0 ? 0 : '>+=0.18',
          )
          .to(dot, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, '<+=0.22')
          .to(numeral, { autoAlpha: 0.16, y: 0, duration: 0.42, ease: 'power3.out' }, '<')
          .to(body, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '<+=0.06')
      })

      // Settle beat so the third step is readable before the pin releases.
      timeline.to({}, { duration: 0.35 })
    })

    // Mobile keeps the unpinned flow: the spine scrubs with the scroll and
    // each step reveals as it enters — pinning a near-viewport-height block
    // on a phone would trap the reader.
    mm.add('(prefers-reduced-motion: no-preference) and (max-width: 760px)', () => {
      gsap.fromTo(
        root.querySelector('.weekly-rhythm__spine-line'),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: {
            trigger: root.querySelector('.weekly-rhythm__steps'),
            start: 'top 72%',
            end: 'bottom 58%',
            scrub: 0.6,
          },
        },
      )

      for (const step of gsap.utils.toArray<HTMLElement>('.weekly-step', root)) {
        const dot = step.querySelector('.weekly-step__dot')
        const numeral = step.querySelector('.weekly-step__numeral')
        const body = step.querySelector('.weekly-step__content')

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        })

        timeline
          .fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, 0)
          .fromTo(
            numeral,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 0.16, y: 0, duration: 0.7, ease: 'power3.out' },
            0.05,
          )
          .fromTo(
            body,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out' },
            0.12,
          )
      }
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="weekly-journey">
      {/* ── How it works: timeline on deepening sage ── */}
      <section className="weekly-rhythm" aria-label="How ongoing lessons work">
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

        <div className="weekly-rhythm__steps">
          <div className="weekly-rhythm__spine" aria-hidden="true">
            <span className="weekly-rhythm__spine-line" />
          </div>
          <ol className="weekly-rhythm__list">
            {steps.map((step) => (
              <li key={step.id} className="weekly-step">
                <span className="weekly-step__dot" aria-hidden="true" />
                <span className="weekly-step__numeral" aria-hidden="true">
                  {step.numeral}
                </span>
                <div className="weekly-step__content">
                  <h3 className="weekly-step__title">{step.title}</h3>
                  <p className="weekly-step__body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Deep-green close: pull quote, then the booking CTA ── */}
      <section className="weekly-close" aria-label="Book an ongoing lesson">
        <blockquote className="weekly-close__quote">
          {quoteLines.map((line) => (
            <span key={line.id} className="weekly-close__quote-line">
              <span className="weekly-close__quote-line-inner">{line.text}</span>
            </span>
          ))}
        </blockquote>

        <div className="weekly-close__cta-wrap">
          <p className="weekly-close__line">Ready to make it a rhythm?</p>
          <p className="weekly-close__note">
            Lessons meet across Kihei and Wailea, and at Maipoina Beach Park.
          </p>
          <Link to="/book" className="weekly-close__cta">
            Book a Lesson
            <span className="weekly-close__cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <p className="weekly-close__aside">
            Questions first? <Link to="/faq">Read the FAQ</Link>
          </p>
        </div>

        <div className="weekly-close__grain" aria-hidden="true" />
      </section>
    </div>
  )
}

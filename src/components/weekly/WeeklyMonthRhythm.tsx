import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import playIfInView from '../../utils/playIfInView'
import './WeeklyMonthRhythm.css'

gsap.registerPlugin(ScrollTrigger)

// A qualitative arc, deliberately promise-free: no song counts, rates, or
// scheduling policy — those stay owner-supplied facts elsewhere.
const beats = [
  {
    id: 'week-1',
    week: 'Week one',
    copy: 'First song foundations. A few chords, a simple strum, something that already sounds like music.',
  },
  {
    id: 'week-2',
    week: 'Week two',
    copy: 'Chords into changes. The shapes you know start moving — slowly, then smoothly.',
  },
  {
    id: 'week-3',
    week: 'Week three',
    copy: 'Rhythm settles in. Strumming patterns click, and practice starts feeling like playing.',
  },
  {
    id: 'week-4',
    week: 'Week four',
    copy: 'The song is yours. You play it start to finish — and pick what’s next.',
  },
] as const

export default function WeeklyMonthRhythm() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      const heading = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })
      heading.fromTo(
        root.querySelectorAll(
          '.weekly-month__eyebrow, .weekly-month__title, .weekly-month__framing',
        ),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
      )
      playIfInView(heading, root)

      // The spine draws with the scroll (same scrubbed-line device as the
      // journey), while beats pop once as play-once reveals. Desktop only:
      // below the breakpoint the line runs vertically, where a horizontal
      // scaleX draw is meaningless — it stays static there.
      if (window.matchMedia('(min-width: 761px)').matches) {
        gsap.fromTo(
          root.querySelector('.weekly-month__line'),
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.weekly-month__spine'),
              start: 'top 78%',
              end: 'top 30%',
              scrub: 0.8,
            },
          },
        )
      }

      const beatReveal = gsap.timeline({
        scrollTrigger: {
          trigger: root.querySelector('.weekly-month__spine'),
          start: 'top 74%',
          toggleActions: 'play none none none',
        },
      })
      beatReveal
        .fromTo(
          root.querySelectorAll('.weekly-month__dot'),
          { scale: 0 },
          { scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.16 },
          0,
        )
        .fromTo(
          root.querySelectorAll('.weekly-month__beat-content'),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.16 },
          0.1,
        )
      const spine = root.querySelector('.weekly-month__spine')
      if (spine) {
        playIfInView(beatReveal, spine)
      }
    }, root)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section ref={rootRef} className="weekly-month" aria-labelledby="weekly-month-title">
      <div className="weekly-month__inner">
        <p className="weekly-month__eyebrow">A typical first month</p>
        <h2 id="weekly-month-title" className="weekly-month__title">
          A month in rhythm
        </h2>
        <p className="weekly-month__framing">
          Every student moves differently — a first month often sounds like this.
        </p>
        <ol className="weekly-month__spine">
          <span className="weekly-month__line" aria-hidden="true" />
          {beats.map((beat, index) => (
            <li key={beat.id} className="weekly-month__beat">
              <span
                className={`weekly-month__dot${
                  index === beats.length - 1 ? ' weekly-month__dot--gold' : ''
                }`}
                aria-hidden="true"
              />
              <div className="weekly-month__beat-content">
                <h3 className="weekly-month__week">{beat.week}</h3>
                <p className="weekly-month__copy">{beat.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

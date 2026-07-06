import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import type { HomeScrollSequenceApi } from '../../hooks/useHomeScrollSequence'
import './StackedServicesDeck.css'

gsap.registerPlugin(ScrollTrigger)

const playingImage = new URL('../../../assets/images/aaron-playing-1.jpg', import.meta.url).href
const teachingImage = new URL('../../../assets/images/aaron-teaching-1.jpg', import.meta.url).href
const touristsImage = new URL('../../../assets/images/aaron-tourists-1.jpg', import.meta.url).href

const services = [
  {
    title: 'Private Ukulele Lessons',
    eyebrow: 'Private lesson',
    description:
      '[Placeholder] A one-on-one ukulele lesson shaped around you — a few warm sentences about what this experience feels like will live here.',
    image: playingImage,
  },
  {
    title: 'Private Guitar Lessons',
    eyebrow: 'Private lesson',
    description:
      '[Placeholder] A one-on-one guitar lesson at your pace — a few warm sentences about what this experience feels like will live here.',
    image: teachingImage,
  },
  {
    title: 'Group Ukulele Experience',
    eyebrow: 'Group experience',
    description:
      '[Placeholder] A shared ukulele session for families and friends — a few warm sentences about what this experience feels like will live here.',
    image: touristsImage,
  },
]

// Back cards peek out centered below the front card, receding with scale,
// so the resting stack stays inside the canvas padding at every breakpoint.
const headingText = 'Choose your experience'
const headingLines = ['Choose your', 'experience']

const stackPositions = {
  front: { x: 0, y: 0, scale: 1, opacity: 1 },
  second: { x: 0, y: 26, scale: 0.955, opacity: 1 },
  third: { x: 0, y: 52, scale: 0.91, opacity: 1 },
  exit: { yPercent: -128 },
}

type StackedServicesDeckProps = {
  scrollSequence: HomeScrollSequenceApi
}

export default function StackedServicesDeck({ scrollSequence }: StackedServicesDeckProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsShellRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    const canvas = canvasRef.current
    const heading = headingRef.current
    const cardsShell = cardsShellRef.current
    const cards = cardsRef.current

    if (!section || !pin || !canvas || !heading || !cardsShell || cards.length !== services.length) {
      return
    }

    const [firstCard, secondCard, thirdCard] = cards
    const sectionElement = section
    const pinElement = pin
    const canvasElement = canvas
    const headingElement = heading
    const cardsShellElement = cardsShell
    const headingLineElements = heading.querySelectorAll<HTMLElement>('.stacked-services-deck__heading-line')

    let stackContext: gsap.Context | null = null
    let entranceContext: gsap.Context | null = null
    let unregisterDeck: (() => void) | null = null

    stackContext = gsap.context(() => {
      gsap.set(firstCard, {
        ...stackPositions.front,
        transformOrigin: 'center center',
      })
      // Back cards start hidden behind the front card and fan out on
      // entrance; reduced motion skips straight to the stacked layout.
      gsap.set(secondCard, {
        ...(prefersReducedMotion ? stackPositions.second : stackPositions.front),
        transformOrigin: 'center center',
      })
      gsap.set(thirdCard, {
        ...(prefersReducedMotion ? stackPositions.third : stackPositions.front),
        transformOrigin: 'center center',
      })

      gsap.set(headingElement, {
        opacity: prefersReducedMotion ? 1 : 0,
        scale: prefersReducedMotion ? 1 : 0.9,
        y: prefersReducedMotion ? 0 : 68,
        transformOrigin: 'center center',
      })

      gsap.set(headingLineElements, {
        opacity: prefersReducedMotion ? 1 : 0,
        yPercent: prefersReducedMotion ? 0 : 118,
        rotateX: prefersReducedMotion ? 0 : -16,
        transformOrigin: 'center bottom',
      })

      // The canvas arrives as the transition surface, with the section title
      // leading the cards inside that same surface.
      gsap.set(canvasElement, {
        y: prefersReducedMotion ? 0 : 130,
        scale: prefersReducedMotion ? 1 : 0.94,
        transformOrigin: 'center bottom',
      })

      gsap.set(cardsShellElement, {
        y: prefersReducedMotion ? 0 : 48,
        opacity: prefersReducedMotion ? 1 : 0,
      })
    }, sectionElement)

    if (!prefersReducedMotion) {
      // Not registered with the shared authority: this trigger is unpinned,
      // so it doesn't affect pin-spacer geometry/refresh timing. It plays
      // during the natural (unpinned) scroll between the hero's pin release
      // and the deck's own pin engaging, so the canvas settles in right as
      // the hero's tagline finishes fading, instead of a hard cut.
      entranceContext = gsap.context(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionElement,
              start: 'top bottom',
              end: 'top top',
              scrub: 1,
            },
          })
          .to(canvasElement, { y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0)
          .to(
            headingElement,
            { y: 0, scale: 1, opacity: 0.86, duration: 0.9, ease: 'power2.out' },
            0,
          )
          .to(
            headingLineElements,
            {
              yPercent: 8,
              rotateX: -2,
              opacity: 0.92,
              duration: 0.9,
              stagger: 0.1,
              ease: 'power3.out',
            },
            0,
          )
      }, sectionElement)
    }

    if (!prefersReducedMotion) {
      // Registered outside gsap.context: the hook owns this ScrollTrigger's
      // lifecycle (see useHomeScrollSequence), not this component's context revert.
      unregisterDeck = scrollSequence.registerDeck({
        sectionEl: sectionElement,
        pinEl: pinElement,
        end: '+=320%',
        buildTimeline: () =>
          gsap
            .timeline({ paused: true })
            .addLabel('title')
            .to(
              headingElement,
              { y: 0, scale: 1, opacity: 1, duration: 0.26, ease: 'power2.out' },
              'title',
            )
            .to(
              headingLineElements,
              {
                yPercent: 0,
                rotateX: 0,
                opacity: 1,
                duration: 0.32,
                stagger: 0.08,
                ease: 'power3.out',
              },
              'title+=0.04',
            )
            .to(cardsShellElement, { y: 0, opacity: 1, duration: 0.44, ease: 'power2.out' }, 'title+=0.28')
            .to(secondCard, { ...stackPositions.second, duration: 0.58, ease: 'power2.out' }, 'title+=0.36')
            .to(thirdCard, { ...stackPositions.third, duration: 0.58, ease: 'power2.out' }, 'title+=0.44')
            .to(headingElement, { y: -18, scale: 0.78, opacity: 0.9, duration: 0.42, ease: 'power2.inOut' }, 'title+=0.58')
            .to({}, { duration: 0.14 })
            // The leaving card slides out fully opaque — the canvas edge
            // masks it — and only fades in the last stretch of its travel,
            // so its text never double-exposes over the card underneath.
            .addLabel('swap1')
            .to(
              firstCard,
              { x: 0, yPercent: stackPositions.exit.yPercent, duration: 1, ease: 'none' },
              'swap1',
            )
            .to(firstCard, { opacity: 0, duration: 0.3, ease: 'none' }, 'swap1+=0.7')
            .to(
              secondCard,
              { ...stackPositions.front, yPercent: 0, duration: 1, ease: 'none' },
              'swap1',
            )
            .to(
              thirdCard,
              { ...stackPositions.second, yPercent: 0, duration: 1, ease: 'none' },
              'swap1',
            )
            .to({}, { duration: 0.12 })
            .addLabel('swap2')
            .to(
              secondCard,
              { x: 0, yPercent: stackPositions.exit.yPercent, duration: 1, ease: 'none' },
              'swap2',
            )
            .to(secondCard, { opacity: 0, duration: 0.3, ease: 'none' }, 'swap2+=0.7')
            .to(thirdCard, { ...stackPositions.front, yPercent: 0, duration: 1, ease: 'none' }, 'swap2'),
      })
    }

    return () => {
      unregisterDeck?.()
      entranceContext?.revert()
      stackContext?.revert()
    }
  }, [prefersReducedMotion, scrollSequence])

  return (
    <section
      ref={sectionRef}
      className={[
        'stacked-services-deck',
        prefersReducedMotion ? 'is-reduced-motion' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Lesson experiences"
    >
      <div ref={pinRef} className="stacked-services-deck__pin">
        <div className="stacked-services-deck__stage">
          <div ref={headingRef} className="stacked-services-deck__heading">
            <h2 className="stacked-services-deck__heading-text" aria-label={headingText}>
              {headingLines.map((line) => (
                <span key={line} className="stacked-services-deck__heading-mask" aria-hidden="true">
                  <span className="stacked-services-deck__heading-line">{line}</span>
                </span>
              ))}
            </h2>
          </div>
          <div ref={canvasRef} className="stacked-services-deck__canvas">
            <div
              ref={cardsShellRef}
              className="stacked-services-deck__cards"
              role="list"
              aria-label="Lesson experiences"
            >
              {services.map((service, index) => (
                <article
                  key={service.title}
                  ref={(element) => {
                    if (element) {
                      cardsRef.current[index] = element
                    }
                  }}
                  className="stacked-services-deck__card"
                  data-card-index={index + 1}
                  role="listitem"
                >
                  <div className="stacked-services-deck__media" aria-hidden="true">
                    <img
                      className="stacked-services-deck__media-image"
                      src={service.image}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                    <span className="stacked-services-deck__media-mark">{`0${index + 1}`}</span>
                  </div>
                  <div className="stacked-services-deck__body">
                    <div className="stacked-services-deck__meta">
                      <p className="stacked-services-deck__eyebrow">{service.eyebrow}</p>
                      <span className="stacked-services-deck__count" aria-hidden="true">
                        {`0${index + 1} / 03`}
                      </span>
                    </div>
                    <h3 className="stacked-services-deck__title">{service.title}</h3>
                    <p className="stacked-services-deck__description">{service.description}</p>
                    <Link className="stacked-services-deck__cta" to="/book">
                      Book this experience
                      <span className="stacked-services-deck__cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

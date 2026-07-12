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
    title: 'Ukulele Lessons',
    eyebrow: 'One-on-one',
    description:
      'A private ukulele lesson shaped entirely around you — your pace, your favorite songs, your ear. No classroom, no crowd, just the beach and the instrument.',
    image: playingImage,
    imageAlt: 'Aaron playing ukulele outdoors on Maui',
  },
  {
    title: 'Guitar Lessons',
    eyebrow: 'One-on-one',
    description:
      'The same one-on-one attention, on guitar — for players starting from scratch or picking the instrument back up after years away.',
    image: teachingImage,
    imageAlt: 'Aaron teaching a one-on-one music lesson',
  },
  {
    title: 'Group Experience',
    eyebrow: 'Small group',
    description:
      'A shared session for families and friends traveling together — everyone learns the same song, side by side, on the sand.',
    image: touristsImage,
    imageAlt: 'Two visitors playing ukulele together during a beachside group lesson',
  },
]

// Back cards peek out centered below the front card, receding with scale,
// so the resting stack stays inside the canvas padding at every breakpoint.
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
  const cardsShellRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const ghostRef = useRef<HTMLDivElement>(null)
  const blobOneRef = useRef<HTMLDivElement>(null)
  const blobTwoRef = useRef<HTMLDivElement>(null)
  const progressNumsRef = useRef<HTMLSpanElement[]>([])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    const canvas = canvasRef.current
    const cardsShell = cardsShellRef.current
    const cards = cardsRef.current

    if (!section || !pin || !canvas || !cardsShell || cards.length !== services.length) {
      return
    }

    const [firstCard, secondCard, thirdCard] = cards
    const sectionElement = section
    const pinElement = pin
    const cardsShellElement = cardsShell

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

      gsap.set(cardsShellElement, {
        y: prefersReducedMotion ? 0 : 48,
        opacity: prefersReducedMotion ? 1 : 0,
      })
    }, sectionElement)

    if (!prefersReducedMotion) {
      // Not registered with the shared authority: this trigger is unpinned,
      // so it doesn't affect pin-spacer geometry/refresh timing. The section
      // sits in normal flow for about one viewport's worth of scroll before
      // its own pin engages (trigger 'top top') — without this, the cards
      // would stay at their opacity:0 resting state for that whole stretch,
      // reading as a large empty gap right under the hero's arch title.
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
          .to(cardsShellElement, { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }, 0)
      }, sectionElement)

      // Registered outside gsap.context: the hook owns this ScrollTrigger's
      // lifecycle (see useHomeScrollSequence), not this component's context revert.
      unregisterDeck = scrollSequence.registerDeck({
        sectionEl: sectionElement,
        pinEl: pinElement,
        end: '+=320%',
        buildTimeline: () => {
          const tl = gsap
            .timeline({ paused: true })
            .addLabel('start')
            .to(secondCard, { ...stackPositions.second, duration: 0.58, ease: 'power2.out' }, 'start')
            .to(thirdCard, { ...stackPositions.third, duration: 0.58, ease: 'power2.out' }, 'start+=0.08')
            .to({}, { duration: 0.5 })
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
            .to(thirdCard, { ...stackPositions.front, yPercent: 0, duration: 1, ease: 'none' }, 'swap2')

          // Progress counter: crossfade 01→02 and 02→03 halfway through each
          // card swap, riding the same scrubbed timeline as the cards.
          const nums = progressNumsRef.current
          if (nums.length === 3) {
            tl.to(nums[0], { autoAlpha: 0, duration: 0.2, ease: 'none' }, 'swap1+=0.5')
              .to(nums[1], { autoAlpha: 1, duration: 0.2, ease: 'none' }, 'swap1+=0.5')
              .to(nums[1], { autoAlpha: 0, duration: 0.2, ease: 'none' }, 'swap2+=0.5')
              .to(nums[2], { autoAlpha: 1, duration: 0.2, ease: 'none' }, 'swap2+=0.5')
          }

          // Ghost word parallax spanning the full pin: added last, with the
          // timeline's already-final duration, so it never extends the scrub.
          const ghost = ghostRef.current
          if (ghost) {
            tl.fromTo(
              ghost,
              { yPercent: 10 },
              { yPercent: -10, duration: tl.duration(), ease: 'none' },
              0,
            )
          }

          return tl
        },
      })
    }

    return () => {
      unregisterDeck?.()
      entranceContext?.revert()
      stackContext?.revert()
    }
  }, [prefersReducedMotion, scrollSequence])

  // Ambient drifting washes: two blurred-gradient blobs on slow yoyo loops.
  // Gated by IntersectionObserver (same reasoning as MeetAaron's gating:
  // pin-spacer geometry above keeps shifting, so visibility observation is
  // more robust than scroll-position triggers) so they cost nothing while
  // the section is off-screen. Reduced motion: blobs stay static.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const blobOne = blobOneRef.current
    const blobTwo = blobTwoRef.current

    if (!section || !blobOne || !blobTwo || prefersReducedMotion) {
      return
    }

    const tweens = [
      gsap.to(blobOne, {
        xPercent: 14,
        yPercent: -10,
        duration: 34,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      }),
      gsap.to(blobTwo, {
        xPercent: -12,
        yPercent: 12,
        duration: 40,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      }),
    ]

    const observer = new IntersectionObserver(
      ([entry]) => {
        tweens.forEach((tween) => {
          if (entry.isIntersecting) {
            tween.play()
          } else {
            tween.pause()
          }
        })
      },
      { threshold: 0 },
    )
    observer.observe(section)

    return () => {
      observer.disconnect()
      tweens.forEach((tween) => tween.kill())
    }
  }, [prefersReducedMotion])

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
          <div
            ref={blobOneRef}
            className="stacked-services-deck__blob stacked-services-deck__blob--jungle"
            aria-hidden="true"
          />
          <div
            ref={blobTwoRef}
            className="stacked-services-deck__blob stacked-services-deck__blob--amber"
            aria-hidden="true"
          />
          <div ref={ghostRef} className="stacked-services-deck__ghost" aria-hidden="true">
            experiences
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
                  <div className="stacked-services-deck__media">
                    <img
                      className="stacked-services-deck__media-image"
                      src={service.image}
                      alt={service.imageAlt}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  <div className="stacked-services-deck__body">
                    <p className="stacked-services-deck__eyebrow">{service.eyebrow}</p>
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
          <div className="stacked-services-deck__progress" aria-hidden="true">
            <span className="stacked-services-deck__progress-line" />
            <span className="stacked-services-deck__progress-count">
              {['01', '02', '03'].map((num, index) => (
                <span
                  key={num}
                  ref={(element) => {
                    if (element) {
                      progressNumsRef.current[index] = element
                    }
                  }}
                  className="stacked-services-deck__progress-num"
                >
                  {num}
                </span>
              ))}
              <span className="stacked-services-deck__progress-total">/ 03</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

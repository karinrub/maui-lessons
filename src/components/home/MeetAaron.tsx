import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './MeetAaron.css'

gsap.registerPlugin(ScrollTrigger)

const portraitImage = new URL('../../../assets/images/aaron-playing-close-2.jpg', import.meta.url).href

// Real student quote goes here (see plan Task 10). Rendering nothing beats
// rendering placeholder text: the section reads as complete either way.
const MEET_AARON_VOICE: { quote: string; attribution: string } | null = null

export default function MeetAaron() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const cardRef = useRef<HTMLAnchorElement>(null)
  const contentSectionRef = useRef<HTMLDivElement>(null)
  const circlesRef = useRef<HTMLDivElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const refreshAfterHomeSequence = () => {
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    window.addEventListener('home-scroll-sequence-ready', refreshAfterHomeSequence)
    return () => window.removeEventListener('home-scroll-sequence-ready', refreshAfterHomeSequence)
  }, [])

  useLayoutEffect(() => {
    const content = contentSectionRef.current
    const circles = circlesRef.current

    if (!content || !circles) {
      return
    }

    const circleLayers = Array.from(
      circles.querySelectorAll<HTMLElement>('.meet-aaron__circle'),
    )
    const portrait = circles.querySelector<HTMLElement>('.meet-aaron__portrait')
    const outerCircle = circleLayers[0]
    const middleCircle = circleLayers[1]
    const innerCircle = circleLayers[2]

    if (!outerCircle || !middleCircle || !innerCircle || !portrait) {
      return
    }

    if (prefersReducedMotion) {
      gsap.set([...circleLayers, portrait], { clearProps: 'all' })
      return
    }

    gsap.set([...circleLayers, portrait], { scale: 0.72, autoAlpha: 0 })

    // This animation follows the element's live viewport position instead of
    // caching a document start point. The hero and experience deck both add
    // pin spacers after mount, so a tiny rAF-driven progress loop keeps the
    // rings correct even while that layout settles.
    let targetProgress = 0
    let renderedProgress = 0
    let frameId: number | null = null

    const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
    const easeOut = (value: number) => 1 - (1 - value) ** 3

    const render = () => {
      // Use the same spring-like interpolation in both directions. A slightly
      // quicker return on scroll-up keeps the reverse reveal responsive while
      // preserving the softer forward entrance.
      const isReversing = targetProgress < renderedProgress
      const smoothing = isReversing ? 0.22 : 0.16
      renderedProgress += (targetProgress - renderedProgress) * smoothing
      const innerProgress = easeOut(clamp01(renderedProgress / 0.26))
      const portraitProgress = easeOut(clamp01((renderedProgress - 0.16) / 0.22))
      const middleProgress = easeOut(clamp01((renderedProgress - 0.34) / 0.26))
      const outerProgress = easeOut(clamp01((renderedProgress - 0.56) / 0.32))

      gsap.set(innerCircle, { scale: 0.72 + innerProgress * 0.28, autoAlpha: innerProgress })
      gsap.set(portrait, { scale: 0.72 + portraitProgress * 0.28, autoAlpha: portraitProgress })
      gsap.set(middleCircle, { scale: 0.72 + middleProgress * 0.28, autoAlpha: middleProgress })
      gsap.set(outerCircle, { scale: 0.72 + outerProgress * 0.28, autoAlpha: outerProgress })
      gsap.set(circles, { yPercent: -5 * renderedProgress })

      if (Math.abs(targetProgress - renderedProgress) > 0.001) {
        frameId = window.requestAnimationFrame(render)
      } else {
        frameId = null
      }
    }

    // getBoundingClientRect forces a synchronous layout, and this listener
    // fires on every scroll frame of the whole page — including while the
    // experience deck above is mid-scrub, where the extra reflow after GSAP's
    // transform writes showed up as visible stutter on the cards. The
    // IntersectionObserver arms the read only while this section is anywhere
    // near the viewport; everywhere else the scroll handler is a no-op.
    let isNearViewport = false

    const updateTarget = () => {
      if (!isNearViewport) {
        return
      }

      const rect = content.getBoundingClientRect()
      const start = window.innerHeight * 0.92
      const end = window.innerHeight * 0.18
      targetProgress = clamp01((start - rect.top) / (start - end))

      if (frameId === null) {
        frameId = window.requestAnimationFrame(render)
      }
    }

    const proximityObserver = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting
        if (isNearViewport) {
          updateTarget()
        }
      },
      // One viewport of margin on each side: armed before the reveal range
      // (which starts at 92% of the viewport) can begin, even while the pin
      // spacers above are still shifting geometry.
      { rootMargin: '100% 0px 100% 0px' },
    )
    proximityObserver.observe(content)

    window.addEventListener('scroll', updateTarget, { passive: true })
    window.addEventListener('resize', updateTarget, { passive: true })
    updateTarget()

    return () => {
      proximityObserver.disconnect()
      window.removeEventListener('scroll', updateTarget)
      window.removeEventListener('resize', updateTarget)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [prefersReducedMotion])

  useLayoutEffect(() => {
    const content = contentSectionRef.current
    const statement = statementRef.current
    const details = detailsRef.current
    const card = cardRef.current

    if (!content || !statement || !details || !card || prefersReducedMotion) {
      return
    }

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: content,
        start: 'top 84%',
        end: 'top 48%',
        // Same smoothing as the deck's entrance trigger: entrances share one
        // glide feel; only the long pinned scenes use the longer 1.2 scrub.
        scrub: 0.9,
        refreshPriority: -1,
        invalidateOnRefresh: true,
      },
    })

    reveal
      .fromTo(statement, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' }, 0)
      .fromTo(details, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' }, 0.14)
      .fromTo(card, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' }, 0.28)

    return () => {
      reveal.scrollTrigger?.kill()
      reveal.kill()
    }
  }, [prefersReducedMotion])

  return (
    <section
      className={['meet-aaron', prefersReducedMotion ? 'is-reduced-motion' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="Meet Aaron"
    >
      <div ref={contentSectionRef} className="meet-aaron__content-section">
        <div className="meet-aaron__inner">
          <div className="meet-aaron__layout">
            <div ref={circlesRef} className="meet-aaron__circles">
              <span className="meet-aaron__circle meet-aaron__circle--outer" />
              <span className="meet-aaron__circle meet-aaron__circle--middle" />
              <span className="meet-aaron__circle meet-aaron__circle--inner" />
              <img
                className="meet-aaron__portrait"
                src={portraitImage}
                alt="Aaron playing ukulele"
                loading="lazy"
              />
            </div>
            <div className="meet-aaron__copy">
              <p className="meet-aaron__eyebrow">The teacher</p>
              <p ref={statementRef} className="meet-aaron__statement">
                Music should feel personal, playful, and easy to begin.
              </p>
              <div ref={detailsRef} className="meet-aaron__details" aria-label="About Aaron">
                <div>
                  <strong>22</strong>
                  <span>years making music</span>
                </div>
                <div>
                  <strong>1:1</strong>
                  <span>lessons shaped around you</span>
                </div>
                <div>
                  <strong>Maui</strong>
                  <span>where Aaron teaches</span>
                </div>
              </div>
              <Link ref={cardRef} to="/about" className="meet-aaron__content">
                <span className="meet-aaron__card-kicker">A note from Aaron</span>
                <p className="meet-aaron__description">
                  Aaron teaches with patience, warmth, and a genuine love for helping people learn.
                  The ukulele has been his focus for the last eight of his twenty-two years in music —
                  most Thursday nights, you can catch him playing at Keolahou Church in Kihei.
                </p>
                <span className="meet-aaron__cta">
                  Get to know Aaron
                  <span className="meet-aaron__cta-arrow" aria-hidden="true">→</span>
                </span>
              </Link>

              {MEET_AARON_VOICE ? (
                <figure className="meet-aaron__voice">
                  <blockquote className="meet-aaron__voice-quote">{MEET_AARON_VOICE.quote}</blockquote>
                  <figcaption className="meet-aaron__voice-attribution">
                    {MEET_AARON_VOICE.attribution}
                  </figcaption>
                </figure>
              ) : null}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

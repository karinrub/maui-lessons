import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './MeetAaron.css'

gsap.registerPlugin(ScrollTrigger)

const portraitImage = new URL('../../../assets/images/aaron-playing-close-2.jpg', import.meta.url).href

const HEADLINE = 'Meet Aaron'

export default function MeetAaron() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const media = mediaRef.current
    const image = imageRef.current

    if (!media || !image) {
      return
    }

    if (prefersReducedMotion) {
      gsap.set(image, { clipPath: 'inset(0% 0% 0% 0%)' })
      return
    }

    // Center-expanding reveal: the image starts clipped to a single point
    // at its own center and the mask grows outward on all four sides at
    // once, so it reads as expanding from the middle rather than sliding
    // open left-right. Using a single fromTo() (not a separate set() + to())
    // matters here: equal-valued inset() sides collapse to a single-token
    // computed value ("inset(50%)") once applied to the DOM, and a plain
    // .to() with no explicit `from` reads that collapsed computed style back
    // as its start value — a 1-token start against a 4-token end breaks
    // GSAP's per-token interpolation, so it silently snaps instead of
    // animating. fromTo() parses the `from` string literally (4 tokens),
    // sidestepping the DOM readback entirely.
    //
    // The hero's own pin-spacers don't exist yet at mount (they wait on
    // image/video load), so this section briefly sits much closer to the
    // top of a shorter document than it will once those land. A plain
    // once-off onEnter would misfire against that stale layout and never
    // get a second chance. toggleActions' reverse leg self-corrects: when
    // the shared ScrollTrigger.refresh() (fired once the hero is ready)
    // recalculates this trigger's real position, GSAP notices we're now
    // above the (correct) start and reverses the tween back to its hidden
    // state, so it can play forward for real when the user actually
    // scrolls here.
    const tween = gsap.fromTo(
      image,
      { clipPath: 'inset(50% 50% 50% 50%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: media,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  // Stair-step headline reveal + card entrance. Letters live in individual
  // overflow-hidden masks; the mask span carries the static staircase offset
  // (--ma-step, set inline per letter) while only the inner span is tweened,
  // so the entrance animation and the stair shape never fight. Sequential
  // stagger + descending final baselines = the cascade reads as stairs
  // descending left→right, and masked spans make glyph overlap impossible.
  //
  // Same pin-spacer caveat as the portrait reveal above: toggleActions'
  // reverse leg self-corrects if the shared refresh moves this trigger.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const headline = headlineRef.current
    const card = cardRef.current

    if (!section || !headline || !card || prefersReducedMotion) {
      return
    }

    const letters = headline.querySelectorAll<HTMLElement>('.meet-aaron__letter-inner')
    if (letters.length === 0) {
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    })

    timeline.fromTo(
      letters,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.055 },
    )
    timeline.fromTo(
      card,
      { x: 40, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' },
      '>-0.25',
    )

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  }, [prefersReducedMotion])

  // Gentle portrait parallax against the tan field. Scrubbed over the whole
  // section's viewport transit; scrub triggers recompute cleanly on the
  // shared ScrollTrigger.refresh(), so the hero pin-spacer timing above
  // doesn't strand it with stale coordinates.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const media = mediaRef.current

    if (!section || !media || prefersReducedMotion) {
      return
    }

    const tween = gsap.fromTo(
      media,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className={['meet-aaron', prefersReducedMotion ? 'is-reduced-motion' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="Meet Aaron"
    >
      <div className="meet-aaron__inner">
        <p className="meet-aaron__eyebrow">The teacher</p>
        <h2 ref={headlineRef} className="meet-aaron__headline" aria-label={HEADLINE}>
          {HEADLINE.split('').map((char, index) =>
            char === ' ' ? (
              <span
                key={index}
                className="meet-aaron__letter meet-aaron__letter--space"
                aria-hidden="true"
              />
            ) : (
              <span
                key={index}
                className="meet-aaron__letter"
                aria-hidden="true"
                style={{ '--ma-step': index } as CSSProperties}
              >
                <span className="meet-aaron__letter-inner">{char}</span>
              </span>
            ),
          )}
        </h2>

        <div className="meet-aaron__row">
          <div ref={mediaRef} className="meet-aaron__media">
            <img
              ref={imageRef}
              className="meet-aaron__media-image"
              src={portraitImage}
              alt="Aaron playing ukulele"
              loading="lazy"
            />
          </div>

          <Link ref={cardRef} to="/about" className="meet-aaron__content">
            <p className="meet-aaron__description">
              Aaron teaches with patience, warmth, and a genuine love for helping people learn.
              With more than 20 years of playing and teaching experience, he creates relaxed
              lessons where students of any age can feel comfortable, capable, and connected
              through music.
            </p>
            <span className="meet-aaron__cta">
              Learn more about Aaron
              <span className="meet-aaron__cta-arrow" aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

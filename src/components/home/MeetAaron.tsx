import { useLayoutEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './MeetAaron.css'

gsap.registerPlugin(ScrollTrigger)

const portraitImage = new URL('../../../assets/images/aaron-playing-close-2.jpg', import.meta.url).href

// True staircase: each cycle is a flat horizontal "tread" (a straight line,
// zero curvature — the previous design curved everywhere, which read as a
// wave) followed by a short "riser" drop between levels. The riser is a
// symmetric cubic-bezier whose control points sit at the riser's own
// horizontal midpoint (one level with its start, one level with its end),
// which flattens the slope to near-zero right where it meets each tread
// (no visible corner) and is steepest only in the riser's own middle — so
// it still reads as eased, not a sharp mechanical corner, but the flat
// treads are what make it read as stairs rather than a wave. The riser
// spans a minority of each cycle's width (treads dominate) and the
// amplitude is kept modest, both to keep curvature gentle enough that
// large glyphs riding the path don't overlap at the steepest point. Four
// treads alternate top/bottom and land back on the starting level, so the
// path tiles seamlessly for the infinite marquee loop.
const RIBBON_PATH_DESKTOP =
  'M 0,55 L 165,55 C 232.5,55 232.5,165 300,165 L 465,165 C 532.5,165 532.5,55 600,55 L 765,55 C 832.5,55 832.5,165 900,165 L 1065,165 C 1132.5,165 1132.5,55 1200,55'

// Same construction, two tread/riser cycles across the narrower mobile viewBox.
const RIBBON_PATH_MOBILE =
  'M 0,40 L 115,40 C 162.5,40 162.5,160 210,160 L 325,160 C 372.5,160 372.5,40 420,40'

const RIBBON_UNIT = 'MEET AARON  '
const RIBBON_SPEED_PX_PER_SEC = 60

type RibbonRefs = {
  path: RefObject<SVGPathElement | null>
  textPath: RefObject<SVGTextPathElement | null>
  measureText: RefObject<SVGTextElement | null>
  pathId: string
}

export default function MeetAaron() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const pathDesktopRef = useRef<SVGPathElement>(null)
  const textPathDesktopRef = useRef<SVGTextPathElement>(null)
  const measureTextDesktopRef = useRef<SVGTextElement>(null)

  const pathMobileRef = useRef<SVGPathElement>(null)
  const textPathMobileRef = useRef<SVGTextPathElement>(null)
  const measureTextMobileRef = useRef<SVGTextElement>(null)

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

  // Ambient "meet Aaron" text ribbon: each breakpoint variant gets its own
  // self-contained path + textPath, so there's never a cross-viewBox
  // reference to reconcile. CSS shows only one variant at a time; both are
  // wired up here (cheap — one is always paused/hidden) rather than
  // swapping DOM at a matchMedia boundary.
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const variants: RibbonRefs[] = [
      {
        path: pathDesktopRef,
        textPath: textPathDesktopRef,
        measureText: measureTextDesktopRef,
        pathId: 'meet-aaron-ribbon-path-desktop',
      },
      {
        path: pathMobileRef,
        textPath: textPathMobileRef,
        measureText: measureTextMobileRef,
        pathId: 'meet-aaron-ribbon-path-mobile',
      },
    ]

    const tweens: gsap.core.Tween[] = []

    variants.forEach(({ path, textPath, measureText, pathId }) => {
      const pathEl = path.current
      const textPathEl = textPath.current
      const measureTextEl = measureText.current

      if (!pathEl || !textPathEl || !measureTextEl) {
        return
      }

      textPathEl.setAttribute('href', `#${pathId}`)
      textPathEl.setAttribute('xlink:href', `#${pathId}`)

      const pathLength = pathEl.getTotalLength()
      const unitWidth = measureTextEl.getComputedTextLength() || 1
      const repeatCount = Math.max(1, Math.ceil(pathLength / unitWidth))
      const loop = RIBBON_UNIT.repeat(repeatCount)
      textPathEl.textContent = loop + loop

      gsap.set(textPathEl, { attr: { startOffset: '0%' } })

      if (prefersReducedMotion) {
        return
      }

      // The wrap point must land exactly one repeating "loop" cycle further
      // along the path — not an arbitrary 50% of the path length — or the
      // text pattern won't line back up with itself on repeat and the loop
      // visibly snaps/jumps every cycle. Measure the actual rendered width
      // of one loop cycle and convert it to a percentage of the path length
      // so the reset is imperceptible, then size the duration off that same
      // real distance so playback speed stays constant regardless of path
      // or text length.
      measureTextEl.textContent = loop
      const loopWidth = measureTextEl.getComputedTextLength() || unitWidth * repeatCount
      const wrapOffsetPercent = (loopWidth / pathLength) * 100

      const tween = gsap.to(textPathEl, {
        attr: { startOffset: `${wrapOffsetPercent}%` },
        duration: loopWidth / RIBBON_SPEED_PX_PER_SEC,
        ease: 'none',
        repeat: -1,
        paused: true,
      })
      tweens.push(tween)
    })

    // Gated by IntersectionObserver rather than a ScrollTrigger instance:
    // this section's page position keeps shifting as the hero/deck pin
    // spacers above it resolve asynchronously (see useHomeScrollSequence),
    // which would leave a scroll-position-based trigger holding stale
    // start/end coordinates from before those pins existed. Visibility
    // observation doesn't depend on document height, so it stays correct
    // through those later layout shifts.
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
    <section ref={sectionRef} className="meet-aaron" aria-label="Meet Aaron">
      <div className="meet-aaron__ribbon" aria-hidden="true">
        <svg
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          className="meet-aaron__ribbon-svg meet-aaron__ribbon-svg--desktop"
        >
          <defs>
            <path id="meet-aaron-ribbon-path-desktop" ref={pathDesktopRef} d={RIBBON_PATH_DESKTOP} />
          </defs>
          <text className="meet-aaron__ribbon-text" xmlSpace="preserve">
            <textPath
              ref={textPathDesktopRef}
              xlinkHref="#meet-aaron-ribbon-path-desktop"
              startOffset="0%"
            />
          </text>
          <text
            ref={measureTextDesktopRef}
            className="meet-aaron__ribbon-text meet-aaron__ribbon-measure"
            xmlSpace="preserve"
            x="-9999"
            y="-9999"
          >
            {RIBBON_UNIT}
          </text>
        </svg>

        <svg
          viewBox="0 0 420 200"
          preserveAspectRatio="none"
          className="meet-aaron__ribbon-svg meet-aaron__ribbon-svg--mobile"
        >
          <defs>
            <path id="meet-aaron-ribbon-path-mobile" ref={pathMobileRef} d={RIBBON_PATH_MOBILE} />
          </defs>
          <text className="meet-aaron__ribbon-text" xmlSpace="preserve">
            <textPath
              ref={textPathMobileRef}
              xlinkHref="#meet-aaron-ribbon-path-mobile"
              startOffset="0%"
            />
          </text>
          <text
            ref={measureTextMobileRef}
            className="meet-aaron__ribbon-text meet-aaron__ribbon-measure"
            xmlSpace="preserve"
            x="-9999"
            y="-9999"
          >
            {RIBBON_UNIT}
          </text>
        </svg>
      </div>

      <div className="meet-aaron__inner">
        <div ref={mediaRef} className="meet-aaron__media">
          <img
            ref={imageRef}
            className="meet-aaron__media-image"
            src={portraitImage}
            alt="Aaron playing ukulele"
            loading="lazy"
          />
        </div>

        <Link to="/about" className="meet-aaron__content">
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
    </section>
  )
}

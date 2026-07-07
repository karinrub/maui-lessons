import { useLayoutEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './MeetAaron.css'

gsap.registerPlugin(ScrollTrigger)

const portraitImage = new URL('../../../assets/images/aaron-playing-close-2.jpg', import.meta.url).href

// Gentle hand-drawn double wave running left to right, touching both
// viewBox edges (x=0 and x=viewBox width) so the curve spans the section
// edge-to-edge with the svg stretched via preserveAspectRatio="none" —
// no inset margin, no letterboxed dead space on either side.
const RIBBON_PATH_DESKTOP =
  'M 0,150 C 192,60 364,40 557,90 C 750,140 878,170 1028,110 C 1114,80 1168,65 1200,55'

// Same shape, hand-tuned into a narrower viewBox so the wave ratio holds up
// at mobile widths instead of flattening into a straight line.
const RIBBON_PATH_MOBILE =
  'M 0,130 C 77,70 144,50 210,80 C 276,110 321,140 365,110 C 398,90 420,75 420,55'

const RIBBON_UNIT = 'meet Aaron  '
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

    // Center-out horizontal reveal: the image starts clipped to a sliver at
    // its own center and the clip expands outward to both edges at once.
    gsap.set(image, { clipPath: 'inset(0% 50% 0% 50%)' })

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
    const tween = gsap.to(image, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.1,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: media,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })

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

      const tween = gsap.to(textPathEl, {
        attr: { startOffset: '50%' },
        duration: pathLength / RIBBON_SPEED_PX_PER_SEC,
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
            [Placeholder] A few warm sentences introducing Aaron — his story, his teaching
            style, and why he loves sharing music on Maui — will live here.
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

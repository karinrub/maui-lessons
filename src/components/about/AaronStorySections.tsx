import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './AaronStorySections.css'

gsap.registerPlugin(ScrollTrigger)

const portraitImage = new URL('../../../assets/images/aaron-portrait-1.jpeg', import.meta.url).href
const teachingTreeImage = new URL('../../../assets/images/aaron-teaching-tree-1.jpg', import.meta.url).href
const onlyMeImage = new URL('../../../assets/images/aaron-onlyMe.jpg', import.meta.url).href

const journeyBeats = [
  {
    id: 'illinois',
    numeral: '01',
    title: 'Illinois State University, 1999',
    body: 'Aaron picks up the guitar, enrolls in musical studies, and starts his first band — the beginning of a lifelong love of live performance.',
  },
  {
    id: 'asheville',
    numeral: '02',
    title: 'Asheville, North Carolina',
    body: 'At 23, private lessons in music theory and song development lead him to the mandolin and banjo, playing bluegrass style.',
  },
  {
    id: 'california',
    numeral: '03',
    title: 'College of San Mateo, California',
    body: 'At 24, he studies sound creation — sampling and synthesis, electronic music, and Afro-Latin percussion ensemble.',
  },
] as const

const CHAPTER_COUNT = 4

export default function AaronStorySections() {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const progressFillRef = useRef<HTMLSpanElement>(null)
  const progressCountRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current

    if (!root || !track) {
      return
    }

    const mm = gsap.matchMedia(root)

    /* Entrance: chapter 1 is owned by a mount timeline, not the scroll
       reveal system, so the page opens with intent instead of popping in. */
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const firstPanel = root.querySelector<HTMLElement>('[data-panel-index="0"]')

      if (!firstPanel) {
        return
      }

      const media = firstPanel.querySelector<HTMLElement>('.aaron-story__panel-media')
      const eyebrow = firstPanel.querySelector<HTMLElement>('.aaron-story__eyebrow')
      const headingLine = firstPanel.querySelector<HTMLElement>('.aaron-story__heading-line')
      const body = firstPanel.querySelector<HTMLElement>('.aaron-story__body')

      gsap.set(firstPanel.querySelector('.aaron-story__reveal'), {
        autoAlpha: 1,
        filter: 'blur(0px)',
        scale: 1,
      })

      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })

      entrance
        .to(veilRef.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
        .fromTo(
          media,
          { clipPath: 'inset(14% 10% 14% 10% round 24px)', autoAlpha: 0 },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', autoAlpha: 1, duration: 1.1 },
          '-=0.35',
        )
        .fromTo(eyebrow, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.75')
        .fromTo(headingLine, { yPercent: 110 }, { yPercent: 0, duration: 0.9 }, '-=0.5')
        .fromTo(body, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.6')
    })

    /* Keyed as matchMedia conditions (not a one-time isMobile read) so gsap
       tears down and rebuilds this whole pinned sequence automatically when
       the viewport crosses the mobile/desktop breakpoint mid-session — e.g.
       rotating a phone — instead of running stale mobile-tuned constants
       against a now-desktop-width layout until the next full reload. */
    mm.add(
      {
        isMobile: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
        isDesktop: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
      },
      (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean; isDesktop: boolean }
      const panels = gsap.utils.toArray<HTMLElement>('.aaron-story__panel', root)
      /* Re-measured on every ScrollTrigger refresh so window resizes never
         leave the tween distance and the pin distance out of sync. Derived
         from panel width, not track.scrollWidth — the watermark numerals
         overflow the panels and inflate scrollWidth. */
      const getScrollDistance = () => panels[0].offsetWidth * (panels.length - 1)

      /* Lenis smooths the raw wheel input; the scrub then rides an
         already-eased scroll value, which is what makes the track glide. */
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        syncTouch: true,
      })

      if (isMobile) {
        // Touch-sync can restore the browser's previous scroll offset while
        // the pinned sequence is being created. The story must begin at its
        // horizontal chapter 01 position every time it loads.
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        lenis.scrollTo(0, { immediate: true })
      }
      const tickLenis = (time: number) => {
        lenis.raf(time * 1000)
      }
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tickLenis)
      gsap.ticker.lagSmoothing(0)

      /* Extra pinned scroll after the final chapter so the page rests on
         the dusk panel instead of immediately unpinning into the footer. */
      const HOLD_RATIO = isMobile ? 1.25 : 0.35
      const MOBILE_TRAVEL_SCALE = 1.85

      /* True document-space top of the section, measured directly (pins
         are reverted during ScrollTrigger refresh, so this is stable).
         Both triggers derive their positions from it — cross-referencing
         one trigger's .start from the other is refresh-order dependent
         and drifts. */
      const getSectionTop = () => {
        const spacer = root.parentElement?.classList.contains('pin-spacer')
          ? root.parentElement
          : root
        return spacer.getBoundingClientRect().top + window.scrollY
      }

      /* The pin lives on its own trigger with the hold appended, while the
         horizontal tween's trigger ends at the exact travel distance —
         keeping that tween strictly linear so containerAnimation trigger
         math for the panel reveals stays accurate. */
      const pinTrigger = ScrollTrigger.create({
        trigger: root,
        start: () => getSectionTop(),
        end: () => getSectionTop() + getScrollDistance() * (1 + HOLD_RATIO),
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })

      if (progressFillRef.current) {
        gsap.set(progressFillRef.current, { scaleX: 0, transformOrigin: 'left center' })
      }

      const progressFillTo = progressFillRef.current
        ? gsap.quickTo(progressFillRef.current, 'scaleX', { duration: 0.35, ease: 'power2.out' })
        : null

      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          /* Numeric positions, self-measured — a 'top top' string here
             would get pin-compensated and land past the hold. */
          start: () => getSectionTop(),
          end: () =>
            getSectionTop() + getScrollDistance() * (isMobile ? MOBILE_TRAVEL_SCALE : 1),
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressFillTo?.(self.progress)
            if (progressCountRef.current) {
              const chapter = Math.round(self.progress * (panels.length - 1)) + 1
              progressCountRef.current.textContent = `0${chapter}`
            }
          },
        },
      })

      /* Chapter snap, hand-rolled: GSAP's built-in snap writes scroll
         position directly and fights Lenis' rAF loop, so instead we wait
         for the scroll to settle and glide to the nearest chapter through
         Lenis itself. Targets come from the horizontal trigger so they
         land exactly on chapter positions; the pin's end is the final
         resting point after the hold.

         The snap is direction-biased: it only ever completes the journey
         the user started, never pulls the page back against their last
         input — a nearest-target snap yanked the scroll backwards whenever
         a wheel burst crossed a chapter midpoint, which read as the page
         resisting the wheel. */
      let snapTimer: number | undefined
      let lastScroll = window.scrollY
      let scrollDirection = 1

      const scheduleSnap = () => {
        const current = window.scrollY
        if (current !== lastScroll) {
          scrollDirection = current > lastScroll ? 1 : -1
          lastScroll = current
        }

        window.clearTimeout(snapTimer)
        snapTimer = window.setTimeout(() => {
          const hst = horizontalTween.scrollTrigger

          if (!hst) {
            return
          }

          const scroll = window.scrollY

          if (scroll <= pinTrigger.start || scroll >= pinTrigger.end) {
            return
          }

          const travel = hst.end - hst.start
          const targets = [
            hst.start,
            hst.start + travel / 3,
            hst.start + (travel * 2) / 3,
            hst.end,
            pinTrigger.end,
          ]
          /* Prefer targets ahead of the travel direction; fall back to the
             plain nearest only when already past the last one that way. */
          const ahead = targets.filter((t) =>
            scrollDirection > 0 ? t >= scroll : t <= scroll,
          )
          const pool = ahead.length > 0 ? ahead : targets
          const nearest = pool.reduce((a, b) =>
            Math.abs(b - scroll) < Math.abs(a - scroll) ? b : a,
          )

          const distance = Math.abs(nearest - scroll)

          if (distance < 2) {
            return
          }

          /* Glide time scales with how far there is left to travel, so a
             short settle doesn't take the same near-second as a full
             chapter and the sequence stays responsive under the wheel. */
          const chapterSpan = travel / 3
          const durationScale = Math.min(Math.max(distance / chapterSpan, 0.35), 1)

          lenis.scrollTo(nearest, {
            duration: (isMobile ? 1.15 : 0.9) * durationScale,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })
        }, isMobile ? 300 : 180)
      }

      lenis.on('scroll', scheduleSnap)

      panels.forEach((panel, index) => {
        const revealTarget = panel.querySelector<HTMLElement>('.aaron-story__reveal')
        const image = panel.querySelector<HTMLImageElement>('.aaron-story__panel-media img')
        const beats = gsap.utils.toArray<HTMLElement>('.aaron-story__beat', panel)
        const watermark = panel.querySelector<HTMLElement>('.aaron-story__watermark')

        /* Watermark numerals drift against the travel direction — a slower
           background layer that gives the sequence depth. */
        if (watermark) {
          gsap.fromTo(
            watermark,
            { xPercent: 14, yPercent: -52 },
            {
              xPercent: -14,
              yPercent: -52,
              ease: 'none',
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 100%',
                end: 'right 0%',
                scrub: true,
              },
            },
          )
        }

        /* Chapter 1 is handled by the entrance timeline. */
        if (index > 0 && revealTarget) {
          /* opacity (not autoAlpha) so links inside unrevealed panels stay
             keyboard-focusable — visibility:hidden would break the focusin
             chapter-jump below.

             The window leads the travel ('left 92%' → 'left 48%'): the
             incoming chapter is already substantially legible while it
             slides in, and fully so by mid-viewport. The old 75% → 25%
             window kept copy-only chapters blank deep into the travel —
             the blank sage frames between chapters. */
          gsap.fromTo(
            revealTarget,
            { filter: 'blur(14px)', opacity: 0, scale: 1.06 },
            {
              filter: 'blur(0px)',
              opacity: 1,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 92%',
                end: 'left 48%',
                scrub: true,
              },
            },
          )
        }

        if (index > 0 && image) {
          gsap.fromTo(
            image,
            { scale: 1.08, xPercent: -4 },
            {
              scale: 1,
              xPercent: 0,
              ease: 'none',
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 90%',
                end: 'left 10%',
                scrub: true,
              },
            },
          )
        }

        if (beats.length > 0) {
          /* Same leading bias as the panel reveal: beats begin rising while
             the chapter is still travelling in, not after it has parked. */
          gsap.fromTo(
            beats,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              ease: 'none',
              stagger: 0.12,
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 84%',
                end: 'left 34%',
                scrub: true,
              },
            },
          )
        }
      })

      /* Keyboard access: tabbing into an off-screen panel jumps the pinned
         sequence to that chapter, and stray native scrollLeft (which the
         browser applies to the overflow-hidden root) is reset. */
      const onFocusIn = (event: FocusEvent) => {
        root.scrollLeft = 0

        const panel = (event.target as HTMLElement).closest<HTMLElement>('.aaron-story__panel')
        const st = horizontalTween.scrollTrigger

        if (!panel || !st) {
          return
        }

        const index = Number(panel.dataset.panelIndex ?? 0)
        const target = st.start + ((st.end - st.start) * index) / (panels.length - 1)
        lenis.scrollTo(target, { immediate: true })
      }

      root.addEventListener('focusin', onFocusIn)

      return () => {
        root.removeEventListener('focusin', onFocusIn)
        window.clearTimeout(snapTimer)
        gsap.ticker.remove(tickLenis)
        gsap.ticker.lagSmoothing(500, 33)
        lenis.destroy()
      }
    })

    /* Magnetic CTA: fine pointers with motion allowed. */
    mm.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
      const cta = root.querySelector<HTMLElement>('.aaron-story__cta')

      if (!cta) {
        return
      }

      const ctaX = gsap.quickTo(cta, 'x', { duration: 0.4, ease: 'power3.out' })
      const ctaY = gsap.quickTo(cta, 'y', { duration: 0.4, ease: 'power3.out' })

      const onCtaMove = (event: PointerEvent) => {
        const rect = cta.getBoundingClientRect()
        ctaX((event.clientX - rect.left - rect.width / 2) * 0.3)
        ctaY((event.clientY - rect.top - rect.height / 2) * 0.3)
      }

      const onCtaLeave = () => {
        ctaX(0)
        ctaY(0)
      }

      cta.addEventListener('pointermove', onCtaMove)
      cta.addEventListener('pointerleave', onCtaLeave)

      return () => {
        cta.removeEventListener('pointermove', onCtaMove)
        cta.removeEventListener('pointerleave', onCtaLeave)
      }
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="aaron-story">
      <h1 className="aaron-story__sr-only">About Aaron</h1>

      <div ref={veilRef} className="aaron-story__veil" aria-hidden="true" />

      <div className="aaron-story__progress" aria-hidden="true">
        <span ref={progressCountRef} className="aaron-story__progress-count">
          01
        </span>
        <span className="aaron-story__progress-bar">
          <span ref={progressFillRef} className="aaron-story__progress-fill" />
        </span>
        <span className="aaron-story__progress-total">0{CHAPTER_COUNT}</span>
      </div>

      <div ref={trackRef} className="aaron-story__track">
        {/* ── Chapter 1: Meet Aaron ── */}
        <article className="aaron-story__panel" data-panel-index="0" aria-label="Meet Aaron">
          <span className="aaron-story__watermark" aria-hidden="true">
            01
          </span>
          <div className="aaron-story__panel-media">
            <img
              src={portraitImage}
              alt="Portrait of Aaron Grzanich holding a ukulele"
              width={900}
              height={1125}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="aaron-story__panel-copy aaron-story__reveal">
            <p className="aaron-story__eyebrow">Your instructor</p>
            <h2 className="aaron-story__heading aaron-story__heading--mask">
              <span className="aaron-story__heading-line">Meet Aaron</span>
            </h2>
            <p className="aaron-story__body">
              His goal is to help students feel comfortable with the ukulele, with a no-pressure
              approach — patient, unhurried, and focused on the joy of playing.
            </p>
          </div>
        </article>

        {/* ── Chapter 2: The mainland years ── */}
        <article
          className="aaron-story__panel aaron-story__panel--sage"
          data-panel-index="1"
          aria-label="Twenty-two years chasing music"
        >
          <span className="aaron-story__watermark" aria-hidden="true">
            02
          </span>
          <div className="aaron-story__panel-copy aaron-story__panel-copy--wide aaron-story__reveal">
            <h2 className="aaron-story__heading">Twenty-two years chasing music</h2>
            <ol className="aaron-story__beats">
              {journeyBeats.map((beat) => (
                <li key={beat.id} className="aaron-story__beat">
                  <span className="aaron-story__beat-numeral" aria-hidden="true">
                    {beat.numeral}
                  </span>
                  <h3 className="aaron-story__beat-title">{beat.title}</h3>
                  <p className="aaron-story__beat-body">{beat.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </article>

        {/* ── Chapter 3: The turning point ── */}
        <article
          className="aaron-story__panel"
          data-panel-index="2"
          aria-label="Then he found the ukulele"
        >
          <span className="aaron-story__watermark" aria-hidden="true">
            03
          </span>
          <div className="aaron-story__panel-media">
            <img
              src={teachingTreeImage}
              alt="Aaron teaching a ukulele lesson outdoors under a tree"
              width={1000}
              height={750}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="aaron-story__panel-copy aaron-story__reveal">
            <p className="aaron-story__eyebrow">Fort Collins, Colorado — age 35</p>
            <h2 className="aaron-story__heading">Then he found the ukulele</h2>
            <p className="aaron-story__body">
              He joins The Music District, a nonprofit music campus, working alongside industry
              professionals in workshops, production, and events. It's here he first studies the
              ukulele.
            </p>
            <p className="aaron-story__pull-line">His primary instrument and focus ever since.</p>
          </div>
        </article>

        {/* ── Chapter 4: Home in Maui (dusk chapter) ── */}
        <article
          className="aaron-story__panel aaron-story__panel--dusk"
          data-panel-index="3"
          aria-label="Home in Maui"
        >
          <span className="aaron-story__watermark" aria-hidden="true">
            04
          </span>
          <div className="aaron-story__panel-media">
            <img
              src={onlyMeImage}
              alt="Aaron teaching a ukulele lesson on Maui"
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="aaron-story__panel-copy aaron-story__reveal">
            <p className="aaron-story__eyebrow">2023 — present</p>
            <h2 className="aaron-story__heading">Home in Maui</h2>
            <p className="aaron-story__body">
              Aaron moves to Maui to devote himself to traditional Hawaiian style and other ukulele
              music, teaching beginners of any age with the same patient, no-pressure approach. You
              can also catch him playing at Keolahou Church on Thursday nights.
            </p>
            <Link to="/book" className="aaron-story__cta">
              Book a Lesson
              <span className="aaron-story__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}

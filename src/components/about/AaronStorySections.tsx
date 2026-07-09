import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

export default function AaronStorySections() {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current

    if (!root || !track) {
      return
    }

    const mm = gsap.matchMedia(root)

    mm.add('(prefers-reduced-motion: no-preference) and (max-width: 760px)', () => {
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.aaron-story__reveal', root),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.aaron-story__reveal',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
      const panels = gsap.utils.toArray<HTMLElement>('.aaron-story__panel', root)
      const scrollDistance = track.scrollWidth - window.innerWidth

      const horizontalTween = gsap.to(track, {
        x: () => -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      })

      panels.forEach((panel) => {
        const revealTarget = panel.querySelector<HTMLElement>('.aaron-story__reveal')
        const image = panel.querySelector<HTMLImageElement>('.aaron-story__panel-media img')

        if (revealTarget) {
          gsap.fromTo(
            revealTarget,
            { filter: 'blur(14px)', autoAlpha: 0, scale: 1.06 },
            {
              filter: 'blur(0px)',
              autoAlpha: 1,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                containerAnimation: horizontalTween,
                trigger: panel,
                start: 'left 75%',
                end: 'left 25%',
                scrub: true,
              },
            },
          )
        }

        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.08 },
            {
              scale: 1,
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
      })

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        horizontalTween.kill()
      }
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="aaron-story">
      <div ref={trackRef} className="aaron-story__track">
        {/* ── Chapter 1: Meet Aaron ── */}
        <article className="aaron-story__panel" data-panel-index="0" aria-label="Meet Aaron">
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
            <h2 className="aaron-story__heading">Meet Aaron</h2>
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

        {/* ── Chapter 4: Home in Maui ── */}
        <article
          className="aaron-story__panel aaron-story__panel--sage"
          data-panel-index="3"
          aria-label="Home in Maui"
        >
          <div className="aaron-story__panel-media">
            <img
              src={onlyMeImage}
              alt="Aaron Grzanich on Maui"
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

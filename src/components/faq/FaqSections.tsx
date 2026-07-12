import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './FaqSections.css'

gsap.registerPlugin(ScrollTrigger)

type FaqItem = { id: string; q: string; a: string }
type FaqCategory = { label: string; items: FaqItem[] }

const faqCategories: FaqCategory[] = [
  {
    label: 'Getting started',
    items: [
      {
        id: 'experience',
        q: 'Do I need any experience?',
        a: 'None at all. Most vacation students have never held a ukulele before — the hour moves at your pace, one chord at a time. If you already play, ongoing lessons pick up wherever you are, all the way to advanced technique.',
      },
      {
        id: 'ages',
        q: 'What ages do you teach?',
        a: 'All of them. Aaron teaches students of any age with the same patient, no-pressure approach, and families often learn side by side.',
      },
      {
        id: 'instruments',
        q: 'Ukulele or guitar?',
        a: 'Both. The ukulele has been Aaron’s focus for the last eight years; guitar lessons come with the same one-on-one attention.',
      },
    ],
  },
  {
    label: 'The lessons',
    items: [
      {
        id: 'vacation',
        q: 'What happens in a vacation lesson?',
        a: 'One private hour on a Maui beach. You’ll learn your first chords, then a real song — one you keep long after the trip ends.',
      },
      {
        id: 'ongoing',
        q: 'How do ongoing lessons work?',
        a: 'They become a regular part of your week. Each lesson picks up exactly where the last left off — from first chords, through reading music, to refining your own style.',
      },
      {
        id: 'group',
        q: 'Can we book as a group or family?',
        a: 'Yes. The group experience is made for families and friends traveling together — everyone learns the same song, side by side.',
      },
    ],
  },
  {
    label: 'Booking',
    items: [
      {
        id: 'how-to-book',
        q: 'How do I book?',
        a: 'Through the booking page: choose your lesson, tell Aaron about your group and your dates, and he’ll take it from there.',
      },
      {
        id: 'pricing',
        q: 'What does a lesson cost?',
        a: 'Rates depend on the lesson type and how often you’d like to meet. Send a booking request and Aaron will confirm current pricing with you directly.',
      },
    ],
  },
]

export default function FaqSections() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<string | null>('experience')

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Intro: title lines rise from clipped rows — the site's shared reveal
      // grammar — then the lede fades up.
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.faq-intro__title-line', root),
        { yPercent: 120 },
        { yPercent: 0, duration: 0.85, ease: 'expo.out', stagger: 0.12, delay: 0.1 },
      )
      gsap.fromTo(
        root.querySelectorAll('.faq-intro__eyebrow, .faq-intro__lede'),
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1, delay: 0.5 },
      )

      // Intro drifts up slightly faster than the scroll as the shelf takes
      // over — a quiet parallax handoff between the two surfaces.
      gsap.fromTo(
        root.querySelector('.faq-intro'),
        { yPercent: 0 },
        {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.faq-intro'),
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      )

      // Ghost word runs counter to the scroll behind the accordion — the
      // same loose-type device as the deck's "experiences".
      gsap.fromTo(
        root.querySelector('.faq-shelf__ghost'),
        { y: 60 },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.faq-shelf'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      )

      // Each category: its rule draws across, then label and rows fade up
      // in a short stagger.
      for (const category of gsap.utils.toArray<HTMLElement>('.faq-category', root)) {
        const trigger = {
          trigger: category,
          start: 'top 84%',
          toggleActions: 'play none none none' as const,
        }

        const rule = category.querySelector('.faq-category__rule')
        if (rule) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              ease: 'power3.inOut',
              transformOrigin: 'left',
              scrollTrigger: trigger,
            },
          )
        }

        gsap.fromTo(
          category.querySelectorAll('.faq-category__label, .faq-row'),
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: trigger,
          },
        )
      }

      gsap.fromTo(
        root.querySelector('.faq-close__inner'),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root.querySelector('.faq-close'),
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    }, root)

    return () => {
      ctx.revert()
    }
  }, [prefersReducedMotion])

  return (
    <div ref={rootRef} className="faq-page">
      <section className="faq-intro" aria-label="Frequently asked questions">
        <p className="faq-intro__eyebrow">FAQ</p>
        <h1 className="faq-intro__title">
          <span className="faq-intro__title-mask">
            <span className="faq-intro__title-line">Good questions,</span>
          </span>
          <span className="faq-intro__title-mask">
            <span className="faq-intro__title-line">honest answers.</span>
          </span>
        </h1>
        <p className="faq-intro__lede">
          The things people usually want to know before their first lesson. Anything else —
          just ask when you book.
        </p>
      </section>

      <div className="faq-shelf">
        <span className="faq-shelf__ghost" aria-hidden="true">
          curious
        </span>
        {faqCategories.map((category) => (
        <section key={category.label} className="faq-category" aria-label={category.label}>
          <span className="faq-category__rule" aria-hidden="true" />
          <p className="faq-category__label">{category.label}</p>
          <div className="faq-category__rows">
            {category.items.map((item) => {
              const isOpen = open === item.id
              return (
                <div key={item.id} className={`faq-row${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-row__question"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                  >
                    <span className="faq-row__question-text">{item.q}</span>
                    <span className="faq-row__icon" aria-hidden="true" />
                  </button>
                  <div
                    className="faq-row__answer"
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                  >
                    <div className="faq-row__answer-clip">
                      <p className="faq-row__answer-text">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

        <section className="faq-close" aria-label="Book a lesson">
          <div className="faq-close__inner">
            <p className="faq-close__line">Still wondering about something?</p>
            <Link to="/book" className="faq-close__cta">
              Book a Lesson
              <span className="faq-close__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

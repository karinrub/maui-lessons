import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './FaqSections.css'

gsap.registerPlugin(ScrollTrigger)

type FaqItem = { id: string; q: string; a: string }
type FaqCategory = {
  id: string
  label: string
  descriptor: string
  ghostWord: string
  items: FaqItem[]
}

const faqCategories: FaqCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting started',
    descriptor: 'Before your first lesson',
    ghostWord: 'begin',
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
    id: 'the-lessons',
    label: 'The lessons',
    descriptor: 'While you’re here',
    ghostWord: 'play',
    items: [
      {
        id: 'vacation',
        q: 'What happens in a vacation lesson?',
        a: 'One private hour on a Maui beach. You’ll learn your first chords, then a real song — one you keep long after the trip ends.',
      },
      {
        id: 'where',
        q: 'Where do lessons happen?',
        a: 'Around South Maui. Vacation lessons usually meet at Maipoina Beach Park or along the coast through Kihei and Wailea — and if it’s easier, Aaron will come to you, whether you’re staying at a hotel or an Airbnb. Ongoing students meet across Kihei and Wailea, and at Maipoina Beach Park.',
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
    id: 'booking',
    label: 'Booking',
    descriptor: 'Making it regular',
    ghostWord: 'book',
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
  const compassRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<string | null>('experience')
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].id)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const categories = gsap.utils.toArray<HTMLElement>('.faq-category', root)
    if (categories.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible) {
          setActiveCategory(visible.target.getAttribute('data-category') ?? faqCategories[0].id)
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75] },
    )

    categories.forEach((category) => observer.observe(category))
    return () => observer.disconnect()
  }, [])

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

      const compass = compassRef.current
      const compassRings = compass?.querySelectorAll<HTMLElement>('.faq-compass__ring')

      if (compass && compassRings) {
        gsap.set(compassRings, { scale: 0.72, autoAlpha: 0 })

        const compassEntrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
        compassEntrance
          .to(compassRings[2], { scale: 1, autoAlpha: 1, duration: 0.38 }, 0.2)
          .to(compassRings[1], { scale: 1, autoAlpha: 1, duration: 0.38 }, 0.38)
          .to(compassRings[0], { scale: 1, autoAlpha: 1, duration: 0.38 }, 0.56)
      }

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

      if (compass) {
        gsap.fromTo(
          compass,
          { y: 0 },
          {
            y: -34,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.faq-shelf'),
              start: 'top bottom',
              end: 'top top',
              scrub: 1,
            },
          },
        )
      }

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
          category.querySelectorAll('.faq-category__index, .faq-category__label, .faq-category__descriptor, .faq-row'),
          { opacity: 0, y: 22 },
          {
            opacity: 1,
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
          Everything you might want to know before picking up an instrument with Aaron. Anything
          else — just ask when you book.
        </p>
        <div className="faq-intro__compass-window" aria-hidden="true">
          <div ref={compassRef} className="faq-compass">
            <span className="faq-compass__ring faq-compass__ring--outer" />
            <span className="faq-compass__ring faq-compass__ring--middle" />
            <span className="faq-compass__ring faq-compass__ring--inner" />
          </div>
        </div>
      </section>

      <div className="faq-shelf">
        <span className="faq-shelf__ghost" aria-hidden="true">
          {faqCategories.find((category) => category.id === activeCategory)?.ghostWord ?? 'begin'}
        </span>
        <div className="faq-shelf__layout">
          <nav className="faq-category-nav" aria-label="FAQ categories">
            <p className="faq-category-nav__eyebrow">In this guide</p>
            {faqCategories.map((category, index) => (
              <a
                key={category.id}
                href={`#faq-category-${category.id}`}
                className={`faq-category-nav__link${activeCategory === category.id ? ' is-active' : ''}`}
                aria-current={activeCategory === category.id ? 'location' : undefined}
              >
                <span className="faq-category-nav__index">0{index + 1}</span>
                <span>{category.label}</span>
              </a>
            ))}
          </nav>

          <div className="faq-shelf__content">
            {faqCategories.map((category, index) => (
              <section
                key={category.id}
                id={`faq-category-${category.id}`}
                data-category={category.id}
                className={`faq-category${activeCategory === category.id ? ' is-active' : ''}`}
                aria-label={category.label}
              >
                <span className="faq-category__rule" aria-hidden="true" />
                <div className="faq-category__meta">
                  <span className="faq-category__index">0{index + 1}</span>
                  <p className="faq-category__label">{category.label}</p>
                  <p className="faq-category__descriptor">{category.descriptor}</p>
                </div>
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
                            <span className="faq-row__answer-kicker">Aaron’s note</span>
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
                <p className="faq-close__promise">Bring the questions. Leave with a song.</p>
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
      </div>
    </div>
  )
}

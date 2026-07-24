import { Fragment, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HomeFinale from '../home/HomeFinale'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import playIfInView from '../../utils/playIfInView'
import {
  faqCategories,
  faqGuideRoutes,
  faqProof,
  faqQuickFacts,
  faqStructuredData,
} from './faqContent'
import './FaqSections.css'

gsap.registerPlugin(ScrollTrigger)

const allFaqItems = faqCategories.flatMap((category) => category.items)

function getFaqFixedClearance(target: Element) {
  const targetRect = target.getBoundingClientRect()
  const headerBottom =
    document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
  const categoryNav = document.querySelector('.faq-category-nav')
  if (!categoryNav) return headerBottom

  const navRect = categoryNav.getBoundingClientRect()
  const navStyle = getComputedStyle(categoryNav)
  const navOverlapsTarget =
    navStyle.position === 'sticky' &&
    navStyle.visibility !== 'hidden' &&
    navStyle.display !== 'none' &&
    navRect.width > 0 &&
    navRect.height > 0 &&
    navRect.right > targetRect.left &&
    navRect.left < targetRect.right

  const stickyTop = Number.parseFloat(navStyle.top)
  const stickyNavBottom =
    navOverlapsTarget && Number.isFinite(stickyTop) ? stickyTop + navRect.height : 0

  return Math.max(headerBottom, stickyNavBottom)
}

function scrollToFaqTarget(target: Element, behavior: ScrollBehavior) {
  const top =
    target.getBoundingClientRect().top + window.scrollY - getFaqFixedClearance(target) - 24
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior })
}

const getInitialOpenItem = () => {
  if (typeof window === 'undefined') return 'experience'
  const hash = window.location.hash.replace('#', '')
  return (
    allFaqItems.find((item) => item.id === hash || `faq-answer-${item.id}` === hash)?.id ??
    'experience'
  )
}

export default function FaqSections() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const compassRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState<string | null>(getInitialOpenItem)
  const [activeCategory, setActiveCategory] = useState<string>(faqCategories[0].id)
  const [ghostWord, setGhostWord] = useState(faqCategories[0].ghostWord)

  // Deep links: /faq#pricing opens that row; /faq#faq-category-pricing lands
  // on the category. Runs once, after SiteLayout's scroll-to-top.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const item = allFaqItems.find((i) => i.id === hash || `faq-answer-${i.id}` === hash)
    const categoryId = item
      ? faqCategories.find((c) => c.items.some((i) => i.id === item.id))?.id
      : faqCategories.find((c) => c.id === hash || `faq-category-${c.id}` === hash)?.id
    if (!categoryId) return

    if (item) setOpen(item.id)
    let cancelled = false
    let animationFrameId = 0
    const getTarget = () =>
      item
        ? document.getElementById(`faq-question-${item.id}`)?.closest('.faq-row')
        : document.getElementById(`faq-category-${categoryId}`)

    const scrollToTarget = () => {
      if (cancelled) return
      const target = getTarget()
      if (!target) return
      scrollToFaqTarget(target, 'auto')
    }

    const activateTargetReveal = () => {
      getTarget()?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }

    const scrollAfterRevealSettles = (framesRemaining = 180, framesElapsed = 0) => {
      if (cancelled) return
      const target = getTarget()
      if (!target) return
      const transform = getComputedStyle(target).transform
      const translateY = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42
      if ((framesElapsed >= 8 && Math.abs(translateY) < 0.5) || framesRemaining === 0) {
        scrollToTarget()
        return
      }
      animationFrameId = requestAnimationFrame(() =>
        scrollAfterRevealSettles(framesRemaining - 1, framesElapsed + 1),
      )
    }

    requestAnimationFrame(() => {
      activateTargetReveal()
      void document.fonts?.ready.then(() => {
        activateTargetReveal()
        animationFrameId = requestAnimationFrame(() => scrollAfterRevealSettles())
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Ghost word crossfade: dip out, swap, ease back — the hard text cut was
  // the page's least designed transition.
  useEffect(() => {
    const next =
      faqCategories.find((category) => category.id === activeCategory)?.ghostWord ?? 'begin'
    if (next === ghostWord) return
    const ghost = ghostRef.current
    if (prefersReducedMotion || !ghost) {
      setGhostWord(next)
      return
    }
    const tween = gsap.to(ghost, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => setGhostWord(next),
    })
    return () => {
      tween.kill()
    }
  }, [activeCategory, ghostWord, prefersReducedMotion])

  useLayoutEffect(() => {
    const ghost = ghostRef.current
    if (!ghost || prefersReducedMotion) return
    const tween = gsap.to(ghost, {
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out',
      clearProps: 'opacity',
    })
    return () => {
      tween.kill()
    }
  }, [ghostWord, prefersReducedMotion])

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
        root.querySelectorAll('.faq-intro__eyebrow, .faq-intro__lede, .faq-intro__reassurance'),
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

      // Each category: one timeline so the drawn rule "delivers" its content —
      // rows start while the rule is still travelling instead of racing it
      // from a second trigger.
      for (const category of gsap.utils.toArray<HTMLElement>('.faq-category', root)) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: category,
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        })

        const rule = category.querySelector('.faq-category__rule')
        if (rule) {
          tl.fromTo(
            rule,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.9, ease: 'power3.inOut', transformOrigin: 'left' },
            0,
          )
        }

        tl.fromTo(
          category.querySelectorAll('.faq-category__index, .faq-category__label, .faq-category__descriptor, .faq-row'),
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
          0.35,
        )

        playIfInView(tl, category)
      }

      const faqProof = root.querySelector('.faq-proof')
      if (faqProof) {
        const proofTween = gsap.fromTo(
          faqProof,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: faqProof,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
        playIfInView(proofTween, faqProof)
      }

      // Warm gold drift scrubbed in as Pricing and booking approaches — the
      // same high-intent foreshadowing device as the weekly journey.
      const shelf = root.querySelector('.faq-shelf')
      const pricingCategory = root.querySelector('#faq-category-pricing')
      if (shelf && pricingCategory) {
        gsap.fromTo(
          shelf,
          { '--faq-warm': 0 },
          {
            '--faq-warm': 1,
            ease: 'none',
            scrollTrigger: {
              trigger: pricingCategory,
              start: 'top 92%',
              end: 'top 38%',
              scrub: 0.8,
            },
          },
        )
      }

    }, root)

    return () => {
      ctx.revert()
    }
  }, [prefersReducedMotion])

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    event.preventDefault()
    const target = document.getElementById(`faq-category-${categoryId}`)
    if (!target) return
    scrollToFaqTarget(target, prefersReducedMotion ? 'auto' : 'smooth')
    window.history.replaceState(null, '', `#faq-category-${categoryId}`)
  }

  return (
    <div ref={rootRef} className="faq-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqStructuredData }} />
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
          Everything you might want to know before picking up an instrument with Aaron. Choose the
          path below that sounds most like you.
        </p>
        <p className="faq-intro__reassurance">
          Whether you’re here for a week or you’ve called Maui home for years, a lesson is meant to
          feel like an experience worth having — not one more thing on the list.
        </p>
        <nav className="faq-guide-routes" aria-label="Choose your FAQ path">
          {faqGuideRoutes.map((route) => (
            <a
              key={route.targetId}
              href={`#${route.targetId}`}
              onClick={(event) =>
                handleNavClick(event, route.targetId.replace('faq-category-', ''))
              }
            >
              <span>{route.label}</span>
              <small>{route.detail}</small>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h9M8 3l5 5-5 5" />
              </svg>
            </a>
          ))}
        </nav>
        <div className="faq-intro__compass-window" aria-hidden="true">
          <div ref={compassRef} className="faq-compass">
            <span className="faq-compass__ring faq-compass__ring--outer" />
            <span className="faq-compass__ring faq-compass__ring--middle" />
            <span className="faq-compass__ring faq-compass__ring--inner" />
          </div>
        </div>
      </section>

      <div className="faq-shelf">
        <span ref={ghostRef} className="faq-shelf__ghost" aria-hidden="true">
          {ghostWord}
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
                onClick={(event) => handleNavClick(event, category.id)}
              >
                <span className="faq-category-nav__index">0{index + 1}</span>
                <span>{category.label}</span>
              </a>
            ))}
          </nav>

          <div className="faq-shelf__content">
            <ul className="faq-quick-facts" aria-label="Lesson essentials">
              {faqQuickFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            {faqCategories.map((category, index) => (
              <Fragment key={category.id}>
                <section
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

                {category.id === 'ongoing' && (
                  <aside className="faq-proof" aria-label="Why learn with Aaron">
                    <div className="faq-proof__copy">
                      <p>{faqProof.eyebrow}</p>
                      <h2>{faqProof.heading}</h2>
                      <ul>
                        {faqProof.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                      <Link to="/about">
                        Meet Aaron <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <figure className="faq-proof__media">
                      <img
                        src={faqProof.imageSrc}
                        alt={faqProof.imageAlt}
                        width={2400}
                        height={1603}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  </aside>
                )}
              </Fragment>
            ))}

          </div>
        </div>
      </div>
      <HomeFinale />
    </div>
  )
}

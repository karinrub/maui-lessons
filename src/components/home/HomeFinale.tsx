import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import './HomeFinale.css'

gsap.registerPlugin(ScrollTrigger)

export default function HomeFinale() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const cta = ctaRef.current

    if (!section || !cta || prefersReducedMotion) {
      return
    }

    // Once-only entrance (no reverse: a footer CTA popping back out on
    // upward scroll would read as broken, not cinematic).
    const tween = gsap.fromTo(
      cta,
      { scale: 0.92, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  return (
    <section ref={sectionRef} className="home-finale" aria-label="Book a lesson">
      {/* Inverted bookend of the hero's sage arch: same radius language,
          tan dome hanging into the ink field. */}
      <div className="home-finale__arch" aria-hidden="true" />
      <div className="home-finale__inner">
        <p className="home-finale__line">Ready to play your first song?</p>
        <Link ref={ctaRef} to="/book" className="home-finale__cta">
          Book a Lesson
          <span className="home-finale__cta-arrow" aria-hidden="true">→</span>
        </Link>
        <nav className="home-finale__links" aria-label="Footer navigation">
          <Link to="/tourist-lessons">Vacation Lessons</Link>
          <Link to="/weekly-lessons">Ongoing Lessons</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
        <p className="home-finale__copyright">© {new Date().getFullYear()} Maui Lessons</p>
      </div>
      <div className="home-finale__grain" aria-hidden="true" />
    </section>
  )
}

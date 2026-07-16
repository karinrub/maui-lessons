import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import playIfInView from '../../utils/playIfInView'
import './VacationStorySections.css'

gsap.registerPlugin(ScrollTrigger)

const touristImage1 = new URL('../../../assets/images/aaron-tourists-1.jpg', import.meta.url).href
const touristImage2 = new URL('../../../assets/images/aaron-tourists-2.jpg', import.meta.url).href
const touristImage3 = new URL('../../../assets/images/aaron-tourists-3.jpg', import.meta.url).href

const statementLines = [
  { id: 'line-1', text: 'One private hour.', emphasis: false },
  { id: 'line-2', text: 'One Maui beach.', emphasis: false },
  { id: 'line-3', text: 'One song you keep.', emphasis: true },
] as const

const pullQuoteWords =
  'Most vacation activities end when you fly home. This one doesn’t.'.split(' ')

// Real student quotes go here (see plan Task 10). The section is skipped
// entirely while this is empty so no placeholder text ever ships.
const vacationVoices: Array<{ id: string; quote: string; attribution: string }> = []

export default function VacationStorySections() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const mm = gsap.matchMedia(root)

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const statement = root.querySelector('.vacation-statement')

      // Statement lines rise out of their clipped rows one after another.
      const statementTween = gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.vacation-statement__line-inner', root),
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.16,
          scrollTrigger: {
            trigger: statement,
            start: 'top 74%',
            toggleActions: 'play none none none',
          },
        },
      )
      if (statement) {
        playIfInView(statementTween, statement)
      }

      // After the entrance, the lines stay live: each row drifts sideways at
      // its own rate while the statement crosses the viewport. Drift sits on
      // the clip row, entrance on the inner span — no transform conflict.
      const statementDrift = [-5, 4, -3]

      gsap.utils.toArray<HTMLElement>('.vacation-statement__line', root).forEach((line, index) => {
        gsap.fromTo(
          line,
          { xPercent: 0 },
          {
            xPercent: statementDrift[index % statementDrift.length],
            ease: 'none',
            scrollTrigger: {
              trigger: statement,
              start: 'top 60%',
              end: 'bottom top',
              scrub: 1,
            },
          },
        )
      })

      // Images wipe open from a tighter inset while the photo inside settles
      // from a zoom — the classic editorial "appear on scroll" reveal.
      for (const frame of gsap.utils.toArray<HTMLElement>('.vacation-collage__frame', root)) {
        const image = frame.querySelector('img')

        const frameTween = gsap.fromTo(
          frame,
          { clipPath: 'inset(14% 10% 14% 10% round 22px)', autoAlpha: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 22px)',
            autoAlpha: 1,
            duration: 1.15,
            ease: 'power3.out',
            // Drop the clip once done so the CSS border-radius rules the
            // corners again at every viewport size.
            onComplete: () => gsap.set(frame, { clearProps: 'clipPath' }),
            scrollTrigger: {
              trigger: frame,
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          },
        )
        playIfInView(frameTween, frame)

        if (image) {
          const imageTween = gsap.fromTo(
            image,
            { scale: 1.22 },
            {
              scale: 1.02,
              duration: 1.5,
              ease: 'power2.out',
              // Hand transform back to CSS so the hover zoom keeps working.
              onComplete: () => gsap.set(image, { clearProps: 'transform' }),
              scrollTrigger: {
                trigger: frame,
                start: 'top 86%',
                toggleActions: 'play none none none',
              },
            },
          )
          playIfInView(imageTween, frame)
        }
      }

      // Collage numerals run counter to the scroll so the type feels loose
      // from the copy it labels.
      for (const numeral of gsap.utils.toArray<HTMLElement>('.vacation-collage__numeral', root)) {
        gsap.fromTo(
          numeral,
          { y: 34 },
          {
            y: -34,
            ease: 'none',
            scrollTrigger: {
              trigger: numeral,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.4,
            },
          },
        )
      }

      // Finale line breathes up to full size as the band arrives.
      const finaleLine = root.querySelector('.vacation-story__finale-line')

      if (finaleLine) {
        gsap.fromTo(
          finaleLine,
          { scale: 0.9 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.vacation-story__finale'),
              start: 'top 90%',
              end: 'top 40%',
              scrub: 0.8,
            },
          },
        )
      }

      // Generic fade-up reveals (collage copy blocks, finale).
      for (const group of gsap.utils.toArray<HTMLElement>('[data-vacation-reveal]', root)) {
        const items = group.hasAttribute('data-vacation-reveal-group')
          ? Array.from(group.children)
          : [group]

        const revealTween = gsap.fromTo(
          items,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.14,
            scrollTrigger: {
              trigger: group,
              start: 'top 84%',
              toggleActions: 'play none none none',
            },
          },
        )
        playIfInView(revealTween, group)
      }

      // Pull-quote fills in word by word as the band scrolls through.
      const quote = root.querySelector('.vacation-quote')

      if (quote) {
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>('.vacation-quote__word', root),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.5,
            scrollTrigger: {
              trigger: quote,
              start: 'top 72%',
              end: 'center 42%',
              scrub: 0.6,
            },
          },
        )
      }
    })

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
      // Collage figures drift at different speeds; the ghost word drifts the
      // opposite way so the whole composition feels layered.
      for (const el of gsap.utils.toArray<HTMLElement>('[data-vacation-parallax]', root)) {
        const drift = Number(el.dataset.vacationParallax) || 0

        gsap.fromTo(
          el,
          { y: -drift },
          {
            y: drift,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          },
        )
      }

      // Sage panel grows down behind the collage as it enters.
      const panel = root.querySelector<HTMLElement>('.vacation-collage__panel')

      if (panel) {
        gsap.fromTo(
          panel,
          { scaleY: 0.35, autoAlpha: 0 },
          {
            scaleY: 1,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.vacation-collage'),
              start: 'top 88%',
              end: 'top 30%',
              scrub: 0.8,
            },
          },
        )
      }
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="vacation-story">
      {/* ── Statement: dramatic stacked headline straight off the hero ── */}
      <section className="vacation-statement" aria-label="Vacation lessons introduction">
        <p className="vacation-statement__eyebrow" data-vacation-reveal>
          For visitors to Maui
        </p>
        <h2 className="vacation-statement__heading">
          {statementLines.map((line) => (
            <span key={line.id} className="vacation-statement__line">
              <span
                className={[
                  'vacation-statement__line-inner',
                  line.emphasis ? 'is-emphasized' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {line.text}
              </span>
            </span>
          ))}
        </h2>
        <p className="vacation-statement__lede" data-vacation-reveal>
          A private ukulele lesson taught by a local musician, made for complete beginners, and
          yours to remember long after the trip ends.
        </p>
      </section>

      {/* ── Collage: images + copy woven over a sage panel ── */}
      <section className="vacation-collage" aria-label="Moments from past vacation lessons">
        <div className="vacation-collage__panel" aria-hidden="true" />
        <span className="vacation-collage__ghost" aria-hidden="true" data-vacation-parallax="-38">
          play
        </span>

        <div className="vacation-collage__grid">
          <figure
            className="vacation-collage__figure vacation-collage__figure--wide"
            data-vacation-parallax="20"
          >
            <div className="vacation-collage__frame">
              <img
                src={touristImage2}
                alt="A group of visitors playing ukulele together during a lesson"
                width={750}
                height={422}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="vacation-collage__caption">Learning together</figcaption>
          </figure>

          <div className="vacation-collage__block vacation-collage__block--01" data-vacation-reveal>
            <span className="vacation-collage__numeral" aria-hidden="true">
              01
            </span>
            <h3 className="vacation-collage__title">Made for beginners</h3>
            <p className="vacation-collage__body">
              Never held a ukulele before? That is exactly the point. The whole hour moves at your
              pace, one chord at a time. Aaron has plenty of ukuleles for visitors, so there is no
              need to bring or buy one.
            </p>
          </div>

          <figure
            className="vacation-collage__figure vacation-collage__figure--portrait"
            data-vacation-parallax="-26"
          >
            <div className="vacation-collage__frame">
              <img
                src={touristImage1}
                alt="Two visitors playing ukulele together during a beachside lesson"
                width={720}
                height={960}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="vacation-collage__caption">A lesson in progress</figcaption>
          </figure>

          <div className="vacation-collage__block vacation-collage__block--02" data-vacation-reveal>
            <span className="vacation-collage__numeral" aria-hidden="true">
              02
            </span>
            <h3 className="vacation-collage__title">A private, unhurried hour</h3>
            <p className="vacation-collage__body">
              No classroom, no crowd. An instrument in your hands, and time to actually learn.
            </p>
          </div>

          <figure
            className="vacation-collage__figure vacation-collage__figure--landscape"
            data-vacation-parallax="14"
          >
            <div className="vacation-collage__frame">
              <img
                src={touristImage3}
                alt="A family gathered around a table for a ukulele lesson in the shade"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="vacation-collage__caption">All ages, all levels</figcaption>
          </figure>

          <div className="vacation-collage__block vacation-collage__block--03" data-vacation-reveal>
            <span className="vacation-collage__numeral" aria-hidden="true">
              03
            </span>
            <h3 className="vacation-collage__title">A song, not a souvenir</h3>
            <p className="vacation-collage__body">
              You leave playing something real. Long after the trip ends, the song is still yours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pull quote: full-bleed sage band, words fill in on scroll ── */}
      <section className="vacation-quote" aria-label="Why it stays with you">
        <p className="vacation-quote__text">
          {pullQuoteWords.map((word, index) => (
            <span key={`${word}-${index}`} className="vacation-quote__word">
              {word}{' '}
            </span>
          ))}
        </p>
        <div className="vacation-quote__grain" aria-hidden="true" />
      </section>

      {/* ── Voices: short, specific student quotes — rendered only once real
           testimonials exist (keep them specific, never generic) ── */}
      {vacationVoices.length > 0 ? (
        <section className="vacation-voices" aria-label="What past students say">
          <p className="vacation-voices__eyebrow" data-vacation-reveal>
            From past lessons
          </p>
          <div className="vacation-voices__grid" data-vacation-reveal data-vacation-reveal-group>
            {vacationVoices.map((voice) => (
              <figure key={voice.id} className="vacation-voices__item">
                <blockquote className="vacation-voices__quote">{voice.quote}</blockquote>
                <figcaption className="vacation-voices__attribution">{voice.attribution}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Finale CTA ── */}
      <section className="vacation-story__finale" aria-label="Book a vacation lesson">
        <div className="vacation-story__finale-inner" data-vacation-reveal data-vacation-reveal-group>
          <p className="vacation-story__finale-line">Long after the tan fades, the music stays.</p>
          <p className="vacation-story__finale-note">
            Lessons meet at Maipoina Beach Park and along the coast through Kihei and Wailea — or
            Aaron will come to you, wherever you're staying.
          </p>
          <Link to="/book" className="vacation-story__finale-cta">
            Book a Lesson
            <span className="vacation-story__finale-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <p className="vacation-story__finale-aside">
            Questions first? <Link to="/faq">Read the FAQ</Link>
          </p>
        </div>
        <div className="vacation-story__finale-grain" aria-hidden="true" />
      </section>
    </div>
  )
}

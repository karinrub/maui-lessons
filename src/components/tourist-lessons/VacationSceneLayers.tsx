import { useEffect, useRef, useState } from 'react'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'

export function VacationEditorialSurfaceLayer() {
  return (
    <div
      className="vacation-cinematic-scene__editorial-surface"
      data-vacation-layer="editorial-surface"
      aria-hidden="true"
    />
  )
}

const editorialStorySteps = [
  {
    id: 'place',
    label: 'The Place',
    body: 'A quiet stretch of Maui beach, chosen for the view as much as the lesson.',
  },
  {
    id: 'lesson',
    label: 'The Lesson',
    body: 'A private hour taught at your pace. Complete beginners are always welcome.',
  },
  {
    id: 'memory',
    label: 'The Memory',
    body: 'You leave with a song you can really play, and a Maui memory that lasts.',
  },
] as const

type EditorialStepId = (typeof editorialStorySteps)[number]['id']

function VacationStepIcon({ id }: { id: EditorialStepId }) {
  const sharedProps = {
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (id === 'place') {
    return (
      <svg {...sharedProps}>
        <path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12Z" />
        <circle cx="12" cy="9" r="2.4" />
      </svg>
    )
  }

  if (id === 'lesson') {
    return (
      <svg {...sharedProps}>
        <path d="M9 18V5.5L19 4v12.5" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2.4M12 18.6V21M4.2 12H6.6M17.4 12h2.4M6.3 6.3l1.7 1.7M16 16l1.7 1.7M17.7 6.3 16 8M8 16l-1.7 1.7" />
    </svg>
  )
}

export function VacationEditorialContinuation() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const stepsRef = useRef<HTMLOListElement>(null)
  const [stepsRevealed, setStepsRevealed] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) {
      setStepsRevealed(true)
      return
    }

    const node = stepsRef.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry.isIntersecting) {
          setStepsRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [prefersReducedMotion])

  return (
    <section
      className="vacation-editorial-continuation"
      data-vacation-layer="editorial-continuation"
      aria-label="Vacation lessons editorial continuation"
    >
      <div className="vacation-editorial-continuation__center">
        <div className="vacation-editorial-continuation__title-card">
          <p className="vacation-editorial-continuation__eyebrow">For visitors to Maui</p>
          <p className="vacation-editorial-continuation__lede">
            A private ukulele lesson on a Maui beach, taught by a local musician, made for complete
            beginners, and yours to remember long after the trip ends.
          </p>
        </div>
        <span className="vacation-editorial-continuation__divider" aria-hidden="true" />

        <ol
          ref={stepsRef}
          className={[
            'vacation-editorial-continuation__steps',
            stepsRevealed ? 'is-revealed' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {editorialStorySteps.map((step) => (
            <li key={step.id} className="vacation-editorial-continuation__step">
              <span className="vacation-editorial-continuation__step-index" aria-hidden="true">
                <VacationStepIcon id={step.id} />
              </span>
              <div className="vacation-editorial-continuation__step-copy">
                <p className="vacation-editorial-continuation__step-label">{step.label}</p>
                <p className="vacation-editorial-continuation__step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}


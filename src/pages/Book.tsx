import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BookingCalendar from '../components/booking/BookingCalendar'
import {
  ONGOING_LESSON_OPTIONS,
  VACATION_LESSON_OPTIONS,
} from '../config/lessonOptions'
import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'
import './Book.css'

gsap.registerPlugin(ScrollTrigger)

type StepId = 'type' | 'participants' | 'datetime' | 'contact' | 'confirm'

type LessonType = 'vacation' | 'ongoing'

type ProgressStepId = 'lesson' | 'datetime' | 'summary' | 'confirm'

type BookingData = {
  lessonType: LessonType | null
  participants: string | null
  duration: string | null
  date: string
  timeSlot: string | null
  name: string
  email: string
  phone: string
  message: string
}

const TIME_SLOTS = Array.from({ length: 11 }, (_, index) => {
  const hour24 = index + 7
  const hour12 = hour24 <= 12 ? hour24 : hour24 - 12
  const suffix = hour24 < 12 ? 'AM' : 'PM'

  return {
    id: `${hour24}:00`,
    label: `${hour12}:00 ${suffix}`,
  }
})

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  vacation: 'Vacation Lessons / Ukulele Experience',
  ongoing: 'Ongoing Lessons',
}

// Placeholder-friendly line only — real business voice TBD.
const ENTRANCE_HEADLINE = "let's set up your lesson"
const BOOKING_STEPS: StepId[] = ['type', 'participants', 'datetime', 'contact', 'confirm']
const PROGRESS_STEPS: Array<{ id: ProgressStepId; label: string }> = [
  { id: 'lesson', label: 'Lesson Type' },
  { id: 'datetime', label: 'Date & Time' },
  { id: 'summary', label: 'Booking Summary' },
  { id: 'confirm', label: 'Confirmation' },
]

function stepsFor(): StepId[] {
  return BOOKING_STEPS
}

function progressStepFor(stepId: StepId): ProgressStepId {
  if (stepId === 'type' || stepId === 'participants') {
    return 'lesson'
  }

  if (stepId === 'contact') {
    return 'summary'
  }

  return stepId === 'confirm' ? 'confirm' : 'datetime'
}

function formatDate(iso: string) {
  if (!iso) {
    return 'No date chosen yet'
  }
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getLessonPrice(booking: BookingData) {
  if (!booking.lessonType || !booking.duration) {
    return null
  }

  const options =
    booking.lessonType === 'vacation' ? VACATION_LESSON_OPTIONS : ONGOING_LESSON_OPTIONS

  return options.find(
    (option) =>
      option.participants === booking.participants && option.duration === booking.duration,
  )?.price ?? null
}

function formatPrice(price: number | null) {
  return price === null ? '—' : `$${price}`
}

function formatBookingContext(booking: BookingData) {
  const parts: string[] = []

  if (booking.lessonType) {
    parts.push(booking.lessonType === 'vacation' ? 'Vacation lesson' : 'Ongoing lesson')
  }
  if (booking.participants) {
    parts.push(booking.participants)
  }
  if (booking.duration) {
    parts.push(booking.duration)
  }

  const price = getLessonPrice(booking)
  if (price !== null) {
    parts.push(formatPrice(price))
  }
  if (booking.date) {
    parts.push(formatDate(booking.date))
  }
  if (booking.timeSlot) {
    parts.push(TIME_SLOTS.find((slot) => slot.id === booking.timeSlot)?.label ?? booking.timeSlot)
  }

  return parts.length > 0 ? parts.join(' · ') : 'Choose an experience to begin'
}

// Hard fallback for GSAP entrance/transition tweens below: if rAF stalls
// (backgrounded tab, throttled device) a tween's onComplete/end-state may
// never arrive, which would otherwise leave step content permanently
// invisible. Mirrors the hero-video stall fallback in OpeningScene.tsx.
function armStallFallback(ms: number, apply: () => void) {
  const id = window.setTimeout(apply, ms)
  return () => window.clearTimeout(id)
}

const INITIAL_DATA: BookingData = {
  lessonType: null,
  participants: null,
  duration: null,
  date: '',
  timeSlot: null,
  name: '',
  email: '',
  phone: '',
  message: '',
}

export default function Book() {
  useDocumentTitle('Book | Maui Lessons')
  useDocumentMeta({
    title: 'Book a Lesson | Maui Lessons',
    description:
      "Book a private ukulele or guitar lesson with Aaron on Maui — choose a vacation lesson or an ongoing lesson, then pick your date and time.",
    path: '/book',
  })

  const prefersReducedMotion = usePrefersReducedMotion()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<StepId>('type')
  const [data, setData] = useState<BookingData>(INITIAL_DATA)
  const heroRef = useRef<HTMLElement>(null)
  const belowRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const summaryCardRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const transitionRef = useRef<gsap.core.Tween | null>(null)
  const directionRef = useRef(1)
  const hasMountedRef = useRef(false)
  const lastAdvancedDatetimeRef = useRef<string | null>(null)

  const steps = stepsFor()
  const stepIndex = steps.indexOf(step)
  const progressStep = progressStepFor(step)
  const progressIndex = PROGRESS_STEPS.findIndex(({ id }) => id === progressStep)

  /*
    Entrance: word-by-word headline reveal (OpeningScene tagline spirit), then
    everything below the hero (progress rail, context line, step panel) rises
    in as one block. Runs once on arrival; reduced-motion users get the
    fully-visible static layout (CSS defaults) with no tween work.
  */
  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      return
    }
    const words = heroRef.current?.querySelectorAll('.bw-hero-word-inner')
    const below = belowRef.current
    if (!words || words.length === 0 || !below) {
      return
    }

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    timeline
      .set(below, { autoAlpha: 0, y: 24 })
      .fromTo(
        words,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.9, stagger: 0.1 },
      )
      .to(below, { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.35')

    const disarm = armStallFallback(2500, () => {
      timeline.kill()
      gsap.set(words, { yPercent: 0 })
      gsap.set(below, { autoAlpha: 1, y: 0 })
    })

    return () => {
      disarm()
      timeline.kill()
    }
  }, [prefersReducedMotion])

  /*
    Type-step title card: the display title rises line-by-line out of overflow
    masks before the choice rows arrive, so the step opens on its own beat.
    On first arrival the timeline waits out the page entrance (hero words +
    below-block rise) and holds the rows back until the title has landed; on
    returns to this step it plays immediately alongside the panel fade, and
    the shared step-change effect below keeps ownership of the rows.
  */
  useLayoutEffect(() => {
    if (step !== 'type' || prefersReducedMotion) {
      return
    }
    const panel = panelRef.current
    const lines = panel?.querySelectorAll('.bw-step-title-line-inner')
    if (!panel || !lines || lines.length === 0) {
      return
    }

    const firstArrival = !hasMountedRef.current
    const rows = firstArrival ? panel.querySelectorAll('.bw-rows [data-bw-item]') : null

    // Pre-hide before the delayed timeline's first tick so nothing flashes
    // while the entrance is still playing.
    gsap.set(lines, { yPercent: 112 })
    if (rows) {
      gsap.set(rows, { autoAlpha: 0, y: 26 })
    }

    const timeline = gsap.timeline({ delay: firstArrival ? 1.2 : 0.1 })
    timeline.to(lines, { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.13 })
    if (rows) {
      timeline.to(
        rows,
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.09 },
        '-=0.3',
      )
    }

    const disarm = armStallFallback((firstArrival ? 1.2 : 0.1) * 1000 + 2500, () => {
      timeline.kill()
      gsap.set(lines, { yPercent: 0 })
      if (rows) {
        gsap.set(rows, { autoAlpha: 1, y: 0 })
      }
    })

    return () => {
      disarm()
      timeline.kill()
    }
  }, [step, prefersReducedMotion])

  // Subtle scroll drift on the review summary while the contact step is up.
  useLayoutEffect(() => {
    const card = summaryCardRef.current
    if (prefersReducedMotion || step !== 'contact' || !card) {
      return
    }
    const drift = gsap.to(card, {
      y: -12,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    })
    return () => {
      drift.scrollTrigger?.kill()
      drift.kill()
    }
  }, [step, prefersReducedMotion])

  function goTo(next: StepId, updated?: Partial<BookingData>) {
    if (updated) {
      setData((prev) => ({ ...prev, ...updated }))
    }
    if (next === step) {
      return
    }

    const nextSteps = stepsFor()
    directionRef.current = nextSteps.indexOf(next) >= nextSteps.indexOf(step) ? 1 : -1

    const panel = panelRef.current
    if (prefersReducedMotion || !panel) {
      setStep(next)
      return
    }

    transitionRef.current?.kill()
    let advanced = false
    const advance = () => {
      if (advanced) {
        return
      }
      advanced = true
      setStep(next)
    }
    transitionRef.current = gsap.to(panel, {
      autoAlpha: 0,
      y: -22 * directionRef.current,
      duration: 0.26,
      ease: 'power2.in',
      onComplete: advance,
    })
    // If this tween's onComplete never fires (stalled rAF), the wizard
    // would otherwise be stuck unable to advance past the current step.
    window.setTimeout(advance, 800)
  }

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) {
      return
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    // The page scrolls normally now (no internal panel scroll container), so
    // bring the wizard back to the top of the viewport on each step change —
    // otherwise a selection made low on the page (e.g. a late time slot)
    // would land the next step's heading off-screen.
    belowRef.current?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })

    if (prefersReducedMotion) {
      gsap.set(panel, { clearProps: 'opacity,visibility,transform' })
      headingRef.current?.focus({ preventScroll: true })
      return
    }

    transitionRef.current?.kill()
    transitionRef.current = gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 28 * directionRef.current },
      { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' },
    )
    // Focus only once the panel is visible again: autoAlpha starts the panel
    // at visibility:hidden, and focusing a hidden element silently falls
    // back to <body>, which would drop the heading announcement.
    let focused = false
    const focusHeading = () => {
      if (focused) {
        return
      }
      focused = true
      headingRef.current?.focus({ preventScroll: true })
    }
    transitionRef.current.eventCallback('onComplete', focusHeading)

    const items = panel.querySelectorAll('[data-bw-item]')
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out', stagger: 0.055, delay: 0.08 },
      )
    }

    const disarm = armStallFallback(1200, () => {
      gsap.set(panel, { autoAlpha: 1, y: 0 })
      if (items.length > 0) {
        gsap.set(items, { autoAlpha: 1, y: 0 })
      }
      focusHeading()
    })

    return () => {
      disarm()
      transitionRef.current?.kill()
    }
  }, [step, prefersReducedMotion])

  // Datetime is the one step with two required selections (date + time
  // slot), so it can't auto-advance on a single onClick like the other
  // steps do. Wait for both, then hold briefly so the user sees both
  // selections highlighted before the panel transitions. Guarded by
  // lastAdvancedDatetimeRef so arriving here via a "Change" link with the
  // same date/timeSlot as before doesn't immediately re-fire.
  useEffect(() => {
    if (step !== 'datetime' || !data.date || !data.timeSlot) {
      return
    }

    const key = `${data.date}|${data.timeSlot}`

    if (lastAdvancedDatetimeRef.current === key) {
      return
    }

    const timeout = window.setTimeout(() => {
      lastAdvancedDatetimeRef.current = key
      goTo('contact')
    }, 500)

    return () => {
      window.clearTimeout(timeout)
    }
    // goTo is a plain function recreated every render; including it would
    // re-arm this effect (and the timeout) on every render instead of only
    // when step/date/timeSlot actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data.date, data.timeSlot])

  function selectLessonType(lessonType: LessonType) {
    // Switching type invalidates the selected length/group price option.
    goTo('participants', { lessonType, participants: null, duration: null })
  }

  // Prefill from a referring page's query params (e.g. the weekly-lessons
  // pathways panel links here with ?type=ongoing&level=…). `level` has no
  // field in BookingData yet, so it's read but not stored — inert context
  // for now rather than an invented data-model field.
  useEffect(() => {
    const type = searchParams.get('type')
    if ((type === 'ongoing' || type === 'vacation') && data.lessonType === null) {
      setData((prev) => ({ ...prev, lessonType: type }))
      setStep('participants')
    }
    // Only ever meant to run once, off the URL present on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goBack() {
    if (stepIndex > 0) {
      goTo(steps[stepIndex - 1])
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    /*
      Formspree attach point — structure-only for now. When real submission is
      wired up, POST this form here (action="https://formspree.io/f/{form_id}"
      or a fetch() with new FormData(event.currentTarget)); the hidden
      booking-context fields are already part of the form payload. Keep
      goTo('confirm') as the success path once the request succeeds.
    */
    goTo('confirm')
  }

  const quotedPrice = getLessonPrice(data)
  const quotedPriceField = quotedPrice === null ? '' : formatPrice(quotedPrice)
  const bookingContext = formatBookingContext(data)
  const lessonOptions =
    data.lessonType === 'ongoing' ? ONGOING_LESSON_OPTIONS : VACATION_LESSON_OPTIONS

  const summaryRows: Array<{ label: string; value: string }> = [
    {
      label: 'Lesson',
      value: data.lessonType ? LESSON_TYPE_LABELS[data.lessonType] : '—',
    },
    ...(data.lessonType === 'vacation'
      ? [
          { label: 'Group size', value: data.participants ?? '—' },
          { label: 'Duration', value: data.duration ?? '—' },
          { label: 'Price', value: formatPrice(quotedPrice) },
        ]
      : data.lessonType === 'ongoing'
        ? [
            { label: 'Duration', value: data.duration ?? '—' },
            { label: 'Price', value: formatPrice(quotedPrice) },
          ]
      : []),
    {
      label: 'Date',
      value: formatDate(data.date),
    },
    {
      label: 'Time',
      value: TIME_SLOTS.find((slot) => slot.id === data.timeSlot)?.label ?? '—',
    },
  ]

  const summaryDl = (
    <dl className="bw-summary">
      {summaryRows.map((row) => (
        <div key={row.label} className="bw-summary-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )

  return (
    <section className="bw" aria-label="Booking wizard">
      <header ref={heroRef} className="bw-hero">
        <p className="cp-section-label">Book a Lesson</p>
        <h1 className="bw-hero-headline">
          <span className="bw-sr-only">{ENTRANCE_HEADLINE}</span>
          <span aria-hidden="true" className="bw-hero-words">
            {ENTRANCE_HEADLINE.split(' ').map((word, index) => (
              <span key={index} className="bw-hero-word">
                <span className="bw-hero-word-inner">{word}</span>
              </span>
            ))}
          </span>
        </h1>
      </header>

      <div ref={belowRef} className="bw-below">
        <ol className="bw-progress" aria-label="Booking progress">
          {PROGRESS_STEPS.map(({ id, label }, index) => (
            <li
              key={id}
              className={`bw-progress-step${index === progressIndex ? ' is-active' : ''}${
                index < progressIndex ? ' is-done' : ''
              }`}
              aria-current={index === progressIndex ? 'step' : undefined}
            >
              {label}
            </li>
          ))}
        </ol>
        {/* Hairline rule with a gold fill segment — the active step's share
            of the journey. Purely decorative; the ol above carries the
            semantics. */}
        <div className="bw-progress-rule" aria-hidden="true">
          <span
            className="bw-progress-fill"
            style={{ transform: `scaleX(${(progressIndex + 1) / PROGRESS_STEPS.length})` }}
          />
        </div>

        <div className="bw-context" aria-live="polite" aria-atomic="true">
          <span className="bw-context-label">Your lesson</span>
          <span className="bw-context-value">{bookingContext}</span>
        </div>

        <div ref={panelRef} className="bw-panel">
          {/* Ghost watermark: the current progress numeral, About-chapter
              idiom. Fades with the panel on step changes. */}
          <span className="bw-watermark" aria-hidden="true">
            {progressIndex + 1}
          </span>

          {step === 'type' && (
            <>
              <h2 ref={headingRef} className="bw-step-heading bw-step-title" tabIndex={-1}>
                <span className="bw-sr-only">Choose your experience</span>
                <span className="bw-step-title-lines" aria-hidden="true">
                  <span className="bw-step-title-line">
                    <span className="bw-step-title-line-inner">Choose your</span>
                  </span>
                  <span className="bw-step-title-line">
                    <span className="bw-step-title-line-inner bw-step-title-line-inner--display">
                      experience
                    </span>
                  </span>
                </span>
              </h2>
              <p className="bw-step-support">
                Start with the kind of lesson you’re looking for.
              </p>
              <div className="bw-rows">
                <button
                  type="button"
                  data-bw-item
                  className={`bw-row bw-row--major${data.lessonType === 'vacation' ? ' is-selected' : ''}`}
                  onClick={() => selectLessonType('vacation')}
                >
                  <span className="bw-row-main">
                    <span className="bw-row-title">Vacation Lessons / Ukulele Experience</span>
                    <span className="bw-row-sub">
                      A relaxed beachside ukulele session for visitors, families, and new
                      players who want to leave Maui with a song they can actually play.
                    </span>
                  </span>
                  <span className="bw-row-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <button
                  type="button"
                  data-bw-item
                  className={`bw-row bw-row--major${data.lessonType === 'ongoing' ? ' is-selected' : ''}`}
                  onClick={() => selectLessonType('ongoing')}
                >
                  <span className="bw-row-main">
                    <span className="bw-row-title">Ongoing Lessons</span>
                    <span className="bw-row-sub">
                      Steady private lessons for local students who want to build real skill over
                      time on ukulele or guitar, at a patient and comfortable pace.
                    </span>
                  </span>
                  <span className="bw-row-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </>
          )}

          {step === 'participants' && (
            <>
              <h2 ref={headingRef} className="bw-step-heading" tabIndex={-1}>
                {data.lessonType === 'ongoing'
                  ? 'Choose your ongoing lesson length'
                  : 'Choose your vacation lesson'}
              </h2>
              <p className="bw-step-support">
                Choose the pace and group size that feels right.
              </p>
              <div className="bw-rows">
                {lessonOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    data-bw-item
                    className={`bw-row${
                      data.participants === option.participants && data.duration === option.duration
                        ? ' is-selected'
                        : ''
                    }`}
                    onClick={() =>
                      goTo('datetime', {
                        participants: option.participants,
                        duration: option.duration,
                      })
                    }
                  >
                    <span className="bw-row-main">
                      <span className="bw-row-title">{option.title}</span>
                      <span className="bw-row-sub">{option.detail}</span>
                    </span>
                    <span className="bw-row-price">${option.price}</span>
                    <span className="bw-row-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
              <div className="bw-footer">
                <button type="button" className="bw-back" onClick={goBack}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 'datetime' && (
            <>
              <h2 ref={headingRef} className="bw-step-heading" tabIndex={-1}>
                When would you like to play?
              </h2>
              <p className="bw-step-support">Find a time that feels easy.</p>
              <div className="bw-datetime" data-bw-item>
                <BookingCalendar
                  value={data.date}
                  onChange={(iso) => setData((prev) => ({ ...prev, date: iso, timeSlot: null }))}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <div className="bw-datetime-side">
                  <p className="bw-datetime-chosen">{formatDate(data.date)}</p>
                  {data.date ? (
                    <>
                      <p className="bw-datetime-label">Choose an hour</p>
                      <div className="bw-slots">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`bw-slot${data.timeSlot === slot.id ? ' is-selected' : ''}`}
                            aria-pressed={data.timeSlot === slot.id}
                            onClick={() => setData((prev) => ({ ...prev, timeSlot: slot.id }))}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="bw-datetime-empty">Choose a date to see available lesson times.</p>
                  )}
                </div>
              </div>
              <div className="bw-footer">
                <button type="button" className="bw-back" onClick={goBack}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 'contact' && (
            <>
              <h2 ref={headingRef} className="bw-step-heading" tabIndex={-1}>
                Almost there — your details
              </h2>
              <p className="bw-step-support">
                A few details, then Aaron will take it from here.
              </p>
              <div ref={summaryCardRef} className="bw-review" data-bw-item>
                <p className="bw-block-label">Your request</p>
                {summaryDl}
                <button type="button" className="bw-change-link bw-summary-change" onClick={() => goTo('type')}>
                  Change selections
                </button>
              </div>
              <form
                id="booking-request-form"
                name="booking-request-form"
                className="bw-form"
                aria-label="Contact details"
                onSubmit={handleSubmit}
                data-bw-item
              >
                {/* Full booking context rides along as hidden fields so a
                    future Formspree POST includes more than the raw contact
                    inputs. Names are stable — do not rename casually. */}
                <input type="hidden" name="lessonType" value={data.lessonType ?? ''} />
                <input type="hidden" name="participants" value={data.participants ?? ''} />
                <input type="hidden" name="duration" value={data.duration ?? ''} />
                <input type="hidden" name="price" value={quotedPriceField} />
                <input type="hidden" name="date" value={data.date} />
                <input type="hidden" name="timeSlot" value={data.timeSlot ?? ''} />
                <div className="cp-form-row">
                  <div className="cp-form-field">
                    <label className="cp-form-label" htmlFor="bw-name">
                      Name
                    </label>
                    <input
                      id="bw-name"
                      name="name"
                      className="cp-form-control"
                      required
                      autoComplete="name"
                      value={data.name}
                      onChange={(event) => setData((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="cp-form-field">
                    <label className="cp-form-label" htmlFor="bw-email">
                      Email
                    </label>
                    <input
                      id="bw-email"
                      name="email"
                      type="email"
                      className="cp-form-control"
                      required
                      autoComplete="email"
                      value={data.email}
                      onChange={(event) => setData((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="cp-form-field">
                  <label className="cp-form-label" htmlFor="bw-phone">
                    Phone
                  </label>
                  <input
                    id="bw-phone"
                    name="phone"
                    type="tel"
                    className="cp-form-control"
                    autoComplete="tel"
                    value={data.phone}
                    onChange={(event) => setData((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
                <div className="cp-form-field">
                  <label className="cp-form-label" htmlFor="bw-message">
                    Message
                  </label>
                  <textarea
                    id="bw-message"
                    name="message"
                    className="cp-form-control cp-form-control--textarea"
                    placeholder="Anything else Aaron should know?"
                    value={data.message}
                    onChange={(event) => setData((prev) => ({ ...prev, message: event.target.value }))}
                  />
                </div>
                <div className="bw-footer">
                  <button type="button" className="bw-back" onClick={goBack}>
                    ← Back
                  </button>
                  <button type="submit" className="cp-button">
                    Send booking request
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h2 ref={headingRef} className="bw-step-heading" tabIndex={-1}>
                Request received
              </h2>
              <p className="bw-confirm-lede" data-bw-item>
                Here’s your lesson request. Aaron will follow up by email to confirm the time and
                next steps.
              </p>
              <div className="bw-review" data-bw-item>
                <p className="bw-block-label">Your request</p>
                <dl className="bw-summary">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="bw-summary-row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                  <div className="bw-summary-row">
                    <dt>Name</dt>
                    <dd>{data.name || '—'}</dd>
                  </div>
                  <div className="bw-summary-row">
                    <dt>Email</dt>
                    <dd>{data.email || '—'}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

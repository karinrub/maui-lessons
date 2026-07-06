import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import gsap from 'gsap'

type BookingCalendarProps = {
  /** ISO date string (yyyy-mm-dd) or '' when nothing is selected. */
  value: string
  onChange: (isoDate: string) => void
  prefersReducedMotion: boolean
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export default function BookingCalendar({ value, onChange, prefersReducedMotion }: BookingCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(value ? new Date(`${value}T00:00:00`) : new Date()),
  )
  const gridRef = useRef<HTMLDivElement>(null)
  const monthTweenRef = useRef<gsap.core.Tween | null>(null)
  // +1 when paging forward, -1 backward — drives the slide direction.
  const directionRef = useRef(1)
  const hasMountedRef = useRef(false)

  useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    const grid = gridRef.current
    if (prefersReducedMotion || !grid) {
      return
    }
    monthTweenRef.current?.kill()
    monthTweenRef.current = gsap.fromTo(
      grid,
      { autoAlpha: 0, x: 26 * directionRef.current },
      { autoAlpha: 1, x: 0, duration: 0.34, ease: 'power2.out' },
    )
    return () => {
      monthTweenRef.current?.kill()
    }
  }, [viewMonth, prefersReducedMotion])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const leadingBlanks = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isViewingCurrentMonth = viewMonth.getTime() <= startOfMonth(today).getTime()

  function shiftMonth(delta: number) {
    directionRef.current = delta
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  function selectDay(event: MouseEvent<HTMLButtonElement>, day: number) {
    onChange(toIso(year, month, day))
    if (!prefersReducedMotion) {
      gsap.fromTo(
        event.currentTarget,
        { scale: 0.82 },
        { scale: 1, duration: 0.38, ease: 'back.out(2.4)', clearProps: 'scale' },
      )
    }
  }

  return (
    <div className="bwc" aria-label={`Calendar, ${monthLabel}`}>
      <div className="bwc-header">
        <button
          type="button"
          className="bwc-nav"
          onClick={() => shiftMonth(-1)}
          disabled={isViewingCurrentMonth}
          aria-label="Previous month"
        >
          ←
        </button>
        <p className="bwc-month" aria-live="polite">
          {monthLabel}
        </p>
        <button type="button" className="bwc-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
          →
        </button>
      </div>
      <div className="bwc-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div ref={gridRef} className="bwc-grid">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const iso = toIso(year, month, day)
          const date = new Date(year, month, day)
          const isPast = date.getTime() < today.getTime()
          const isSelected = value === iso
          const isToday = date.getTime() === today.getTime()
          return (
            <button
              key={iso}
              type="button"
              className={`bwc-day${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
              disabled={isPast}
              aria-pressed={isSelected}
              aria-label={date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              onClick={(event) => selectDay(event, day)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

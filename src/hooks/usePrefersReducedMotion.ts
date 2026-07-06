import { useEffect, useState } from 'react'

export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    setPrefersReducedMotion(motionQuery.matches)

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches)
    }

    motionQuery.addEventListener('change', handleChange)

    return () => {
      motionQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

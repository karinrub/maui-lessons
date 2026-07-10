import { useEffect, useRef, useState } from 'react'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import VacationHeadlineLayer from './VacationHeadlineLayer'
import VacationImageLayer from './VacationImageLayer'
import { VacationEditorialSurfaceLayer } from './VacationSceneLayers'
import VacationStorySections from './VacationStorySections'
import { useVacationSceneProgress } from './useVacationSceneProgress'
import { vacationSceneScroll } from './vacationSceneConfig'
import './VacationCinematicScene.css'

function getDesktopSceneMatch() {
  return window.matchMedia(vacationSceneScroll.desktopQuery).matches
}

export default function VacationCinematicScene() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isDesktop, setIsDesktop] = useState(getDesktopSceneMatch)
  const sceneRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const desktopQuery = window.matchMedia(vacationSceneScroll.desktopQuery)

    function handleChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches)
    }

    setIsDesktop(desktopQuery.matches)
    desktopQuery.addEventListener('change', handleChange)

    return () => {
      desktopQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useVacationSceneProgress({
    sceneRef,
    pinRef,
    isDesktop,
    prefersReducedMotion,
  })

  const sceneClassName = [
    'vacation-cinematic-scene',
    isDesktop ? 'is-desktop-scene' : 'is-mobile-scene',
    prefersReducedMotion ? 'is-reduced-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <section
        ref={sceneRef}
        className={sceneClassName}
        aria-label="Vacation lessons cinematic introduction"
      >
        <div ref={pinRef} className="vacation-cinematic-scene__pin">
          <VacationEditorialSurfaceLayer />
          <VacationImageLayer />
          <VacationHeadlineLayer />
        </div>
      </section>

      <VacationStorySections />
    </>
  )
}

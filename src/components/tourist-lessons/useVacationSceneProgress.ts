import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getVacationSceneVisualState,
  vacationSceneScroll,
  type VacationSceneVisualState,
} from './vacationSceneConfig'

gsap.registerPlugin(ScrollTrigger)

type VacationSceneProgressOptions = {
  sceneRef: RefObject<HTMLElement | null>
  pinRef: RefObject<HTMLDivElement | null>
  isDesktop: boolean
  prefersReducedMotion: boolean
}

function applyVisualState(scene: HTMLElement, visualState: VacationSceneVisualState) {
  scene.style.setProperty('--vac-progress', visualState.progress.toFixed(4))
  scene.style.setProperty('--vac-composition-progress', visualState.compositionProgress.toFixed(4))
  scene.style.setProperty('--vac-surface-progress', visualState.surfaceProgress.toFixed(4))
  scene.style.setProperty('--vac-environment-progress', visualState.environmentProgress.toFixed(4))
  scene.style.setProperty('--vac-frame-scale', visualState.frameScale.toFixed(4))
  scene.style.setProperty('--vac-image-scale', visualState.imageScale.toFixed(4))
  scene.style.setProperty('--vac-frame-radius', `${visualState.frameRadius.toFixed(2)}px`)
  scene.style.setProperty('--vac-stage-bg-progress', visualState.stageBgProgress.toFixed(4))
  scene.style.setProperty('--vac-headline-progress', visualState.headlineProgress.toFixed(4))
  scene.style.setProperty('--vac-headline-scale', visualState.headlineScale.toFixed(4))
  scene.style.setProperty('--vac-headline-opacity', visualState.headlineOpacity.toFixed(4))
  scene.style.setProperty('--vac-headline-x', `${visualState.headlineX.toFixed(2)}px`)
  scene.style.setProperty('--vac-headline-y', `${visualState.headlineY.toFixed(2)}px`)
  scene.style.setProperty('--vac-headline-tracking', `${visualState.headlineTracking.toFixed(4)}em`)
  scene.style.setProperty(
    '--vac-headline-color-progress',
    visualState.headlineColorProgress.toFixed(4),
  )
  scene.style.setProperty('--vac-headline-color-r', visualState.headlineColorR.toFixed(0))
  scene.style.setProperty('--vac-headline-color-g', visualState.headlineColorG.toFixed(0))
  scene.style.setProperty('--vac-headline-color-b', visualState.headlineColorB.toFixed(0))
}

export function useVacationSceneProgress({
  sceneRef,
  pinRef,
  isDesktop,
  prefersReducedMotion,
}: VacationSceneProgressOptions) {
  useLayoutEffect(() => {
    const scene = sceneRef.current
    const pin = pinRef.current

    if (!scene) {
      return
    }

    applyVisualState(scene, getVacationSceneVisualState(isDesktop && !prefersReducedMotion ? 0 : 1))

    if (!pin || !isDesktop || prefersReducedMotion) {
      return
    }

    window.scrollTo({ top: 0, left: 0 })

    let refreshFrame = 0
    let removeLoadListener: (() => void) | undefined

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: vacationSceneScroll.scrollDistance,
        scrub: 1,
        pin,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          applyVisualState(scene, getVacationSceneVisualState(self.progress))
        },
        onRefresh: (self) => {
          applyVisualState(scene, getVacationSceneVisualState(self.progress))
        },
      })

      refreshFrame = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })

      if (document.readyState !== 'complete') {
        const handleWindowLoad = () => {
          ScrollTrigger.refresh()
        }

        window.addEventListener('load', handleWindowLoad, { once: true })
        removeLoadListener = () => window.removeEventListener('load', handleWindowLoad)
      }
    }, pin)

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      removeLoadListener?.()
      context.revert()
      applyVisualState(scene, getVacationSceneVisualState(0))
    }
  }, [isDesktop, pinRef, prefersReducedMotion, sceneRef])
}

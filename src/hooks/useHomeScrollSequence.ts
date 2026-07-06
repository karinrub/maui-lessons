import { useCallback, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type HomeScrollSectionConfig = {
  sectionEl: HTMLElement
  pinEl: HTMLElement
  end: string
  buildTimeline: () => gsap.core.Timeline
  onScrollUpdate?: (self: ScrollTrigger) => void
}

export type HomeScrollSequenceApi = {
  registerHero: (config: HomeScrollSectionConfig) => () => void
  registerDeck: (config: HomeScrollSectionConfig) => () => void
}

type SectionHandle = {
  config: HomeScrollSectionConfig
  timeline: gsap.core.Timeline | null
  scrollTrigger: ScrollTrigger | null
}

function createSection(config: HomeScrollSectionConfig): SectionHandle {
  const timeline = config.buildTimeline()
  const scrollTrigger = ScrollTrigger.create({
    trigger: config.sectionEl,
    start: 'top top',
    end: config.end,
    scrub: 1,
    pin: config.pinEl,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      timeline.progress(self.progress)
      config.onScrollUpdate?.(self)
    },
  })

  return { config, timeline, scrollTrigger }
}

/**
 * Single authority for the hero+deck pin/refresh geometry. Both sections
 * register once their DOM is ready; ScrollTriggers for both are created
 * together in one pass, then refreshed once, so neither section's cached
 * geometry can go stale relative to the other's pin-spacer.
 */
export default function useHomeScrollSequence(): HomeScrollSequenceApi {
  const heroRef = useRef<SectionHandle | null>(null)
  const deckRef = useRef<SectionHandle | null>(null)
  const heroPendingRef = useRef<HomeScrollSectionConfig | null>(null)
  const deckPendingRef = useRef<HomeScrollSectionConfig | null>(null)

  const createTriggers = useCallback(() => {
    const heroConfig = heroPendingRef.current
    const deckConfig = deckPendingRef.current

    if (!heroConfig || !deckConfig || heroRef.current || deckRef.current) {
      return
    }

    heroRef.current = createSection(heroConfig)
    deckRef.current = createSection(deckConfig)

    ScrollTrigger.refresh()
  }, [])

  const teardown = useCallback(() => {
    heroRef.current?.scrollTrigger?.kill()
    heroRef.current?.timeline?.kill()
    heroRef.current = null
    heroPendingRef.current = null

    deckRef.current?.scrollTrigger?.kill()
    deckRef.current?.timeline?.kill()
    deckRef.current = null
    deckPendingRef.current = null
  }, [])

  const registerHero = useCallback(
    (config: HomeScrollSectionConfig) => {
      heroPendingRef.current = config
      createTriggers()
      return teardown
    },
    [createTriggers, teardown],
  )

  const registerDeck = useCallback(
    (config: HomeScrollSectionConfig) => {
      deckPendingRef.current = config
      createTriggers()
      return teardown
    },
    [createTriggers, teardown],
  )

  const apiRef = useRef<HomeScrollSequenceApi | null>(null)

  if (!apiRef.current) {
    apiRef.current = { registerHero, registerDeck }
  }

  return apiRef.current
}

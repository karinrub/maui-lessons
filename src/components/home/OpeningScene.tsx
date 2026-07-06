import Lenis from 'lenis'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { useOutletContext } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import type { HomeScrollSequenceApi } from '../../hooks/useHomeScrollSequence'
import type { SiteLayoutOutletContext } from '../../layout/SiteLayout'
import './OpeningScene.css'

gsap.registerPlugin(ScrollTrigger)

const landscapeImage = new URL('../../../assets/images/aaron-beach-1.jpg', import.meta.url).href
const heroVideo = new URL('../../../assets/videos/aaron-ukelele-vid.MP4', import.meta.url).href

const TAGLINE_WORDS = "Learn your first ukulele song on one of the world's most beautiful beaches.".split(' ')

type FrameRect = {
  top: number
  left: number
  width: number
  height: number
}

type FocusScrollState = {
  bodyOverflow: string
  lenisWasStopped: boolean
}

type FixedFrameOffset = {
  top: number
  left: number
}

function getFocusTargetRect(sourceRect: FrameRect): FrameRect {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const maxWidth = viewportWidth * (viewportWidth <= 760 ? 0.94 : 0.9)
  const maxHeight = viewportHeight * (viewportWidth <= 760 ? 0.82 : 0.85)
  const aspectRatio = sourceRect.width / sourceRect.height || 16 / 9

  let width = maxWidth
  let height = width / aspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    top: (viewportHeight - height) / 2,
    left: (viewportWidth - width) / 2,
    width,
    height,
  }
}

type OpeningSceneProps = {
  scrollSequence: HomeScrollSequenceApi
}

export default function OpeningScene({ scrollSequence }: OpeningSceneProps) {
  const { setHeaderSuppressed } = useOutletContext<SiteLayoutOutletContext>()
  const prefersReducedMotion = usePrefersReducedMotion()
  const sceneRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const landscapeRef = useRef<HTMLImageElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)

  const lenisRef = useRef<Lenis | null>(null)
  const unregisterHeroRef = useRef<(() => void) | null>(null)
  const landscapeFadeRef = useRef<gsap.core.Tween | null>(null)
  const focusTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const tickerCallbackRef = useRef<((time: number) => void) | null>(null)
  const focusBackdropRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const focusFrameRectRef = useRef<FrameRect | null>(null)
  const focusFrameOffsetRef = useRef<FixedFrameOffset>({ top: 0, left: 0 })
  const focusScrollStateRef = useRef<FocusScrollState | null>(null)
  const isFocusModeRef = useRef(false)
  const introCompleteRef = useRef(false)
  const isMutedRef = useRef(false)
  const hasPlaybackStartedRef = useRef(false)
  const isVideoVisibleRef = useRef(false)
  const isFocusAvailableRef = useRef(false)
  const autoplayAttemptedRef = useRef(false)
  const autoplayBlockedRef = useRef(false)
  const userMuteChoiceRef = useRef<'muted' | 'unmuted' | null>(null)
  const scrollAudioPausedRef = useRef(false)
  const heroPlaybackTriggeredRef = useRef(false)
  const introStartedRef = useRef(false)
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const loopEndRef = useRef<number | null>(null)
  const videoFrameRequestRef = useRef<number | null>(null)
  const animationFrameRequestRef = useRef<number | null>(null)
  const heroTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [landscapeReady, setLandscapeReady] = useState(false)
  const [landscapeVisible, setLandscapeVisible] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [hasPlaybackStarted, setHasPlaybackStarted] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [isFocusAvailable, setIsFocusAvailable] = useState(false)

  const updateMutedState = useCallback((muted: boolean) => {
    const video = videoRef.current

    if (video) {
      video.muted = muted
      video.defaultMuted = muted
    }

    isMutedRef.current = muted
    setIsMuted(muted)
  }, [])

  const markPlaybackStarted = useCallback(() => {
    if (hasPlaybackStartedRef.current) {
      return
    }

    hasPlaybackStartedRef.current = true
    setHasPlaybackStarted(true)
  }, [])

  const markVideoVisible = useCallback(() => {
    if (isVideoVisibleRef.current) {
      return
    }

    isVideoVisibleRef.current = true
    setIsVideoVisible(true)
  }, [])

  const restartHeroVideo = useCallback(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    try {
      video.currentTime = 0
    } catch {
      // Some browsers reject seeks until metadata is fully available.
    }

    if (autoplayAttemptedRef.current) {
      void video.play().catch(() => undefined)
      return
    }

    autoplayAttemptedRef.current = true

    video.defaultMuted = false
    video.muted = false
    video.volume = 1
    updateMutedState(false)

    void video
      .play()
      .then(() => {
        autoplayBlockedRef.current = false
        markPlaybackStarted()
      })
      .catch(() => {
        autoplayBlockedRef.current = true
        updateMutedState(true)

        void video.play().then(markPlaybackStarted).catch(() => {
          // Autoplay policy can still block playback; the visible scene remains renderable.
        })
      })
  }, [markPlaybackStarted, updateMutedState])

  const setFocusAvailableState = useCallback((available: boolean) => {
    if (isFocusAvailableRef.current === available) {
      return
    }

    isFocusAvailableRef.current = available
    setIsFocusAvailable(available)
  }, [])

  const syncFocusAvailabilityFromFrame = useCallback(() => {
    const frame = frameRef.current
    const video = videoRef.current
    const media = mediaRef.current

    if (!frame || !video || !media) {
      setFocusAvailableState(false)
      return
    }

    const frameRect = frame.getBoundingClientRect()
    const frameStyle = getComputedStyle(frame)
    const videoStyle = getComputedStyle(video)
    const mediaStyle = getComputedStyle(media)
    const intersectsViewport =
      frameRect.bottom > 0 &&
      frameRect.right > 0 &&
      frameRect.top < window.innerHeight &&
      frameRect.left < window.innerWidth
    const frameOpacity = Number.parseFloat(frameStyle.opacity || '1')
    const videoOpacity = Number.parseFloat(videoStyle.opacity || '1')

    setFocusAvailableState(
      intersectsViewport &&
        mediaStyle.visibility !== 'hidden' &&
        frameStyle.visibility !== 'hidden' &&
        videoStyle.visibility !== 'hidden' &&
        frameOpacity > 0.05 &&
        videoOpacity > 0.05,
    )
  }, [setFocusAvailableState])

  const markIntroComplete = useCallback(() => {
    introCompleteRef.current = true
  }, [])

  // Scroll-controlled audio: sound plays while the video is the featured
  // moment and stops once the scrub scrolls past it; scrolling back up
  // restores whatever was audible before, unless the user chose mute.
  const handleAudioZoneChange = useCallback(
    (inAudioZone: boolean) => {
      const video = videoRef.current

      if (!video || !introCompleteRef.current || isFocusModeRef.current) {
        return
      }

      if (!inAudioZone) {
        if (!isMutedRef.current) {
          scrollAudioPausedRef.current = true
          updateMutedState(true)
        }
        return
      }

      if (!scrollAudioPausedRef.current) {
        return
      }

      scrollAudioPausedRef.current = false

      if (userMuteChoiceRef.current === 'muted') {
        return
      }

      updateMutedState(false)
      void video.play().catch(() => {
        updateMutedState(true)
      })
    },
    [updateMutedState],
  )

  const retryUnmutedPlaybackFromGesture = useCallback(() => {
    const video = videoRef.current

    if (
      !video ||
      !autoplayBlockedRef.current ||
      scrollAudioPausedRef.current ||
      userMuteChoiceRef.current === 'muted' ||
      !isMutedRef.current
    ) {
      return
    }

    updateMutedState(false)
    void video.play().catch(() => {
      updateMutedState(true)
    })
  }, [updateMutedState])

  const restoreFocusScroll = useCallback(() => {
    const focusScrollState = focusScrollStateRef.current

    if (!focusScrollState) {
      return
    }

    document.body.style.overflow = focusScrollState.bodyOverflow

    if (!focusScrollState.lenisWasStopped) {
      lenisRef.current?.start()
    }

    focusScrollStateRef.current = null
  }, [])

  const enterFocusMode = useCallback(() => {
    const frame = frameRef.current
    const video = videoRef.current
    const backdrop = focusBackdropRef.current

    if (isFocusModeRef.current || !isFocusAvailableRef.current || !frame || !video || !backdrop) {
      return
    }

    const frameRect = frame.getBoundingClientRect()

    if (!frameRect.width || !frameRect.height) {
      return
    }

    const sourceRect = {
      top: frameRect.top,
      left: frameRect.left,
      width: frameRect.width,
      height: frameRect.height,
    }
    const targetRect = getFocusTargetRect(sourceRect)

    focusTimelineRef.current?.kill()
    focusFrameRectRef.current = sourceRect
    focusScrollStateRef.current = {
      bodyOverflow: document.body.style.overflow,
      lenisWasStopped: Boolean(lenisRef.current?.isStopped),
    }
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    isFocusModeRef.current = true
    setIsFocusMode(true)
    document.body.style.overflow = 'hidden'
    lenisRef.current?.stop()

    gsap.set(backdrop, { autoAlpha: prefersReducedMotion ? 1 : 0, pointerEvents: 'auto' })
    gsap.set(frame, {
      position: 'fixed',
      top: sourceRect.top,
      left: sourceRect.left,
      width: sourceRect.width,
      height: sourceRect.height,
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      zIndex: 42,
    })

    const fixedFrameRect = frame.getBoundingClientRect()
    const fixedFrameOffset = {
      top: fixedFrameRect.top - sourceRect.top,
      left: fixedFrameRect.left - sourceRect.left,
    }
    const adjustedTargetRect = {
      ...targetRect,
      top: targetRect.top - fixedFrameOffset.top,
      left: targetRect.left - fixedFrameOffset.left,
    }

    focusFrameOffsetRef.current = fixedFrameOffset

    const focusVideo = () => {
      video.focus({ preventScroll: true })
    }

    if (prefersReducedMotion) {
      gsap.set(frame, adjustedTargetRect)
      focusVideo()
      return
    }

    focusTimelineRef.current = gsap
      .timeline({ onComplete: focusVideo })
      .to(backdrop, { autoAlpha: 1, duration: 0.22, ease: 'power1.out' }, 0)
      .to(
        frame,
        {
          top: adjustedTargetRect.top,
          left: adjustedTargetRect.left,
          width: adjustedTargetRect.width,
          height: adjustedTargetRect.height,
          duration: 0.58,
          ease: 'power3.inOut',
        },
        0,
      )
  }, [prefersReducedMotion])

  const exitFocusMode = useCallback(() => {
    const frame = frameRef.current
    const backdrop = focusBackdropRef.current
    const sourceRect = focusFrameRectRef.current

    if (!isFocusModeRef.current || !frame || !backdrop || !sourceRect) {
      return
    }

    const fixedFrameOffset = focusFrameOffsetRef.current
    const adjustedSourceRect = {
      ...sourceRect,
      top: sourceRect.top - fixedFrameOffset.top,
      left: sourceRect.left - fixedFrameOffset.left,
    }

    const finishExit = () => {
      focusTimelineRef.current = null
      focusFrameRectRef.current = null
      focusFrameOffsetRef.current = { top: 0, left: 0 }
      isFocusModeRef.current = false
      setIsFocusMode(false)
      gsap.set(backdrop, { autoAlpha: 0, pointerEvents: 'none' })
      gsap.set(frame, { clearProps: 'position,top,left,width,height,zIndex,transform' })
      restoreFocusScroll()
      ScrollTrigger.update()

      const previouslyFocusedElement = previouslyFocusedElementRef.current
      previouslyFocusedElementRef.current = null

      if (previouslyFocusedElement && document.contains(previouslyFocusedElement)) {
        previouslyFocusedElement.focus({ preventScroll: true })
      }
    }

    focusTimelineRef.current?.kill()

    if (prefersReducedMotion) {
      gsap.set(frame, adjustedSourceRect)
      finishExit()
      return
    }

    focusTimelineRef.current = gsap
      .timeline({ onComplete: finishExit })
      .to(backdrop, { autoAlpha: 0, duration: 0.18, ease: 'power1.in' }, 0)
      .to(
        frame,
        {
          top: adjustedSourceRect.top,
          left: adjustedSourceRect.left,
          width: adjustedSourceRect.width,
          height: adjustedSourceRect.height,
          duration: 0.46,
          ease: 'power3.inOut',
        },
        0,
      )
  }, [prefersReducedMotion, restoreFocusScroll])

  useLayoutEffect(() => {
    setHeaderSuppressed(!prefersReducedMotion)

    return () => {
      setHeaderSuppressed(false)
    }
  }, [prefersReducedMotion, setHeaderSuppressed])

  useEffect(() => {
    const lenis = new Lenis()
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    const removeScrollListener = lenis.on('scroll', () => {
      ScrollTrigger.update()
    })

    lenisRef.current = lenis
    tickerCallbackRef.current = tickerCallback
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)
    lenis.start()

    return () => {
      removeScrollListener()
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      lenisRef.current = null
      tickerCallbackRef.current = null
    }
  }, [])

  useEffect(() => {
    const landscape = landscapeRef.current
    const video = videoRef.current

    if (landscape?.complete) {
      setLandscapeReady(true)
    }

    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true)
    }

    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      loopEndRef.current = Math.max(video.duration - 2, 0)
    }

    video?.pause()
  }, [])

  useEffect(() => {
    if (!prefersReducedMotion || !landscapeRef.current || !frameRef.current || !videoRef.current) {
      return
    }

    const header = document.querySelector<HTMLElement>('.site-header')

    gsap.set([landscapeRef.current, frameRef.current, videoRef.current, header], {
      autoAlpha: 1,
      clearProps: 'transform',
    })
    restartHeroVideo()
    lenisRef.current?.start()
    setHeaderSuppressed(false)
    markVideoVisible()
    syncFocusAvailabilityFromFrame()
    markIntroComplete()
  }, [
    markIntroComplete,
    markVideoVisible,
    prefersReducedMotion,
    restartHeroVideo,
    setHeaderSuppressed,
    syncFocusAvailabilityFromFrame,
  ])

  useEffect(() => {
    if (prefersReducedMotion || !landscapeReady || landscapeVisible || !landscapeRef.current) {
      return
    }

    landscapeFadeRef.current = gsap.to(landscapeRef.current, {
      opacity: 1,
      duration: 0.35,
      ease: 'power1.inOut',
      onComplete: () => {
        setLandscapeVisible(true)
      },
    })

    return () => {
      landscapeFadeRef.current?.kill()
    }
  }, [landscapeReady, landscapeVisible, prefersReducedMotion])

  // Load-time intro: the video frame fades in as soon as the beach image and
  // first video frames are ready, so the hero video is visible almost
  // immediately instead of waiting for a scroll-driven reveal.
  useEffect(() => {
    if (
      prefersReducedMotion ||
      introStartedRef.current ||
      !landscapeVisible ||
      !videoReady ||
      !frameRef.current ||
      !videoRef.current
    ) {
      return
    }

    introStartedRef.current = true

    const frame = frameRef.current
    const video = videoRef.current
    const header = document.querySelector<HTMLElement>('.site-header')

    const timeline = gsap
      .timeline({
        onComplete: () => {
          markIntroComplete()
          setHeaderSuppressed(false)
        },
      })
      .to(frame, { autoAlpha: 1, duration: 0.55, ease: 'power1.inOut' })
      .to(video, { autoAlpha: 1, duration: 0.45, ease: 'power1.inOut' }, '<+=0.1')
      .call(
        () => {
          markVideoVisible()
          syncFocusAvailabilityFromFrame()

          if (!heroPlaybackTriggeredRef.current) {
            heroPlaybackTriggeredRef.current = true
            restartHeroVideo()
          }
        },
        undefined,
        '<+=0.05',
      )
      .to(header, { autoAlpha: 1, duration: 0.4, ease: 'power1.inOut' }, '<+=0.25')

    introTimelineRef.current = timeline

    return () => {
      timeline.kill()
      introTimelineRef.current = null
    }
  }, [
    landscapeVisible,
    markIntroComplete,
    markVideoVisible,
    prefersReducedMotion,
    restartHeroVideo,
    setHeaderSuppressed,
    syncFocusAvailabilityFromFrame,
    videoReady,
  ])

  useEffect(() => {
    if (
      prefersReducedMotion ||
      !landscapeVisible ||
      !videoReady ||
      !sceneRef.current ||
      !pinRef.current ||
      !mediaRef.current ||
      !landscapeRef.current ||
      !frameRef.current ||
      !videoRef.current ||
      !taglineRef.current
    ) {
      return
    }

    const scene = sceneRef.current
    const pin = pinRef.current
    const media = mediaRef.current
    const frame = frameRef.current
    const video = videoRef.current
    const tagline = taglineRef.current
    const words = tagline.querySelectorAll<HTMLElement>('.tagline-word')

    gsap.set(media, { visibility: 'visible' })
    gsap.set(tagline, { opacity: 0 })
    gsap.set(words, { color: 'rgba(250,245,238,0.12)' })

    // Registered outside gsap.context: the hook owns this ScrollTrigger's
    // lifecycle (see useHomeScrollSequence), not this component's context revert.
    unregisterHeroRef.current = scrollSequence.registerHero({
      sectionEl: scene,
      pinEl: pin,
      end: '+=120%',
      onScrollUpdate: (self) => {
        // Any real scroll while the load intro is mid-flight hands control
        // to the scrub immediately instead of letting the two tweens fight.
        // The scrub timeline has already rendered this tick and may have
        // captured mid-intro opacities as tween start values, so invalidate
        // it to re-record from the completed-intro state.
        if (!introCompleteRef.current && self.progress > 0.002) {
          introTimelineRef.current?.progress(1)
          heroTimelineRef.current?.invalidate()
        }

        syncFocusAvailabilityFromFrame()

        const timeline = heroTimelineRef.current
        const fadeTime = timeline?.labels.videoFadeStart
        const totalDuration = timeline?.duration() ?? 0

        if (fadeTime !== undefined && totalDuration > 0) {
          handleAudioZoneChange(self.progress < fadeTime / totalDuration)
        }
      },
      buildTimeline: () => {
        const timeline = gsap
          .timeline({ paused: true })
          // Hold: the video is the featured moment for the first stretch
          // of the pin. Audio is scroll-gated to this segment.
          .to({}, { duration: 0.4 })
          .addLabel('videoFadeStart')
          .to(video, { opacity: 0, duration: 0.16, ease: 'none' })
          .to(frame, { opacity: 0, duration: 0.14, ease: 'none' }, '<+=0.10')
          .to(tagline, { opacity: 1, duration: 0.06, ease: 'none' })
          .to(words, { color: 'rgb(250,245,238)', duration: 0.04, stagger: 0.028, ease: 'none' })
          .to({}, { duration: 0.06 })
          // Handoff: the tagline dissolves right as the pin releases, so the
          // services deck heading can crossfade in underneath it — the beach
          // backdrop itself lives outside this timeline and persists.
          .to(tagline, { opacity: 0, duration: 0.22, ease: 'none' })
          .set(media, { visibility: 'hidden' })
          .call(() => setFocusAvailableState(false))

        heroTimelineRef.current = timeline
        return timeline
      },
    })

    return () => {
      unregisterHeroRef.current?.()
      unregisterHeroRef.current = null
      heroTimelineRef.current = null
    }
  }, [
    handleAudioZoneChange,
    landscapeVisible,
    prefersReducedMotion,
    scrollSequence,
    setFocusAvailableState,
    syncFocusAvailabilityFromFrame,
    videoReady,
  ])

  useEffect(() => {
    const focusBackdrop = focusBackdropRef.current
    const frame = frameRef.current

    return () => {
      landscapeFadeRef.current?.kill()
      focusTimelineRef.current?.kill()
      gsap.set(focusBackdrop, { clearProps: 'all' })
      gsap.set(frame, { clearProps: 'position,top,left,width,height,zIndex,transform' })
      setHeaderSuppressed(false)
      restoreFocusScroll()
    }
  }, [restoreFocusScroll, setHeaderSuppressed])

  useEffect(() => {
    if (!isFocusMode) {
      return
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        exitFocusMode()
      }
    }

    function handleResize() {
      const frame = frameRef.current
      const sourceRect = focusFrameRectRef.current

      if (!frame || !sourceRect) {
        return
      }

      const fixedFrameOffset = focusFrameOffsetRef.current
      const targetRect = getFocusTargetRect(sourceRect)

      gsap.set(frame, {
        ...targetRect,
        top: targetRect.top - fixedFrameOffset.top,
        left: targetRect.left - fixedFrameOffset.left,
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [exitFocusMode, isFocusMode])

  useEffect(() => {
    const video = videoRef.current

    if (!hasPlaybackStarted || !video) {
      return
    }

    const playbackVideo = video
    let cancelled = false

    function cancelScheduledFrame() {
      if (videoFrameRequestRef.current !== null && typeof playbackVideo.cancelVideoFrameCallback === 'function') {
        playbackVideo.cancelVideoFrameCallback(videoFrameRequestRef.current)
        videoFrameRequestRef.current = null
      }

      if (animationFrameRequestRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRequestRef.current)
        animationFrameRequestRef.current = null
      }
    }

    function keepVideoInsideTrimmedLoop() {
      const loopEnd = loopEndRef.current

      if (loopEnd !== null && loopEnd > 0 && playbackVideo.currentTime >= loopEnd) {
        const wasPlaying = !playbackVideo.paused

        playbackVideo.currentTime = 0

        if (wasPlaying) {
          void playbackVideo.play().catch(() => undefined)
        }
      }
    }

    function schedulePlaybackCheck() {
      if (cancelled) {
        return
      }

      if (typeof playbackVideo.requestVideoFrameCallback === 'function') {
        videoFrameRequestRef.current = playbackVideo.requestVideoFrameCallback(() => {
          keepVideoInsideTrimmedLoop()
          schedulePlaybackCheck()
        })
        return
      }

      animationFrameRequestRef.current = window.requestAnimationFrame(() => {
        keepVideoInsideTrimmedLoop()
        schedulePlaybackCheck()
      })
    }

    schedulePlaybackCheck()

    return () => {
      cancelled = true
      cancelScheduledFrame()
    }
  }, [hasPlaybackStarted])

  function handleVideoCanPlay() {
    setVideoReady(true)
  }

  function handleVideoLoadedMetadata() {
    const video = videoRef.current

    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      loopEndRef.current = null
      return
    }

    loopEndRef.current = Math.max(video.duration - 2, 0)
  }

  function handleVideoPlay() {
    markPlaybackStarted()
  }

  function handleVideoEnded() {
    const video = videoRef.current

    if (!video) {
      return
    }

    video.currentTime = 0
    void video.play().catch(() => undefined)
  }

  function handleMuteClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()

    const video = videoRef.current
    const nextMuted = !isMuted
    userMuteChoiceRef.current = nextMuted ? 'muted' : 'unmuted'
    scrollAudioPausedRef.current = false

    if (video) {
      const wasPlaying = !video.paused
      updateMutedState(nextMuted)

      if (wasPlaying) {
        void video.play().catch(() => undefined)
      }
    } else {
      updateMutedState(nextMuted)
    }
  }

  function handleMutePressStart(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
  }

  function toggleFocusModeFromGesture() {
    retryUnmutedPlaybackFromGesture()

    if (isFocusModeRef.current) {
      exitFocusMode()
      return
    }

    if (isFocusAvailableRef.current) {
      enterFocusMode()
    }
  }

  function handleVideoClick(event: MouseEvent<HTMLVideoElement>) {
    event.stopPropagation()
    toggleFocusModeFromGesture()
  }

  function handleVideoKeyDown(event: KeyboardEvent<HTMLVideoElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      exitFocusMode()
      return
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    toggleFocusModeFromGesture()
  }

  const sceneClassName = [
    'opening-scene',
    prefersReducedMotion ? 'is-reduced-motion' : '',
    isFocusMode ? 'is-focus-mode' : '',
    isFocusAvailable ? 'is-focus-available' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={sceneRef}
      className={sceneClassName}
      aria-label="Homepage opening scene"
    >
      <div className="opening-scene__backdrop">
        <img
          ref={landscapeRef}
          className="opening-scene__landscape"
          src={landscapeImage}
          alt=""
          decoding="async"
          fetchPriority="high"
          onLoad={() => setLandscapeReady(true)}
        />
      </div>

      <div ref={pinRef} className="opening-scene__pin">
        <div ref={mediaRef} className="opening-scene__media">
          <div
            ref={focusBackdropRef}
            className="opening-scene__focus-backdrop"
            aria-hidden="true"
            onClick={exitFocusMode}
          />

          <div ref={frameRef} className="opening-scene__frame">
            <video
              ref={videoRef}
              className="opening-scene__video"
              src={heroVideo}
              muted={isMuted}
              playsInline
              preload="auto"
              tabIndex={isFocusAvailable || isFocusMode ? 0 : -1}
              role={isFocusAvailable || isFocusMode ? 'button' : undefined}
              aria-label={
                isFocusMode
                  ? 'Exit Focus Mode for ukulele lesson video'
                  : isFocusAvailable
                    ? 'Enter Focus Mode for ukulele lesson video'
                    : 'Ukulele lesson video'
              }
              onLoadedMetadata={handleVideoLoadedMetadata}
              onCanPlay={handleVideoCanPlay}
              onPlay={handleVideoPlay}
              onEnded={handleVideoEnded}
              onClick={handleVideoClick}
              onKeyDown={handleVideoKeyDown}
            />
            {hasPlaybackStarted && isVideoVisible && (isFocusAvailable || isFocusMode) ? (
              <button
                className="opening-scene__mute-button"
                type="button"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                aria-pressed={!isMuted}
                onPointerDown={handleMutePressStart}
                onClick={handleMuteClick}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                  {isMuted ? (
                    <>
                      <path d="M4 9.2v5.6h3.7l4.9 4.1V5.1L7.7 9.2H4Z" />
                      <path d="m16 9 4 4m0-4-4 4" />
                    </>
                  ) : (
                    <>
                      <path d="M4 9.2v5.6h3.7l4.9 4.1V5.1L7.7 9.2H4Z" />
                      <path d="M16 8.3c1.1 1 1.7 2.3 1.7 3.7s-.6 2.8-1.7 3.7" />
                      <path d="M18.8 5.7A8.7 8.7 0 0 1 21.3 12a8.7 8.7 0 0 1-2.5 6.3" />
                    </>
                  )}
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        <div ref={taglineRef} className="opening-scene__tagline">
          <p className="opening-scene__tagline-text">
            {TAGLINE_WORDS.map((word, i) => (
              <span key={i} className="tagline-word">{word}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}

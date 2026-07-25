import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'
import NavGradient from './NavGradient'

const menuLinks = [
  { to: '/tourist-lessons', label: 'Vacation Lessons' },
  { to: '/weekly-lessons', label: 'Ongoing Lessons' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/book', label: 'Book a Lesson', emphasis: true },
]

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

type GlobalNavigationProps = {
  isSuppressed?: boolean
}

function getRevealRadius(originX: number, originY: number) {
  return Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY),
  )
}

export default function GlobalNavigation({ isSuppressed = false }: GlobalNavigationProps) {
  const navigate = useNavigate()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHeadingCollision, setIsHeadingCollision] = useState(false)
  const [isMenuInteractive, setIsMenuInteractive] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const playOpenTimelineRef = useRef<() => void>(() => undefined)
  const closeMenuRef = useRef<(restoreFocus?: boolean) => void>(() => undefined)
  const gradientOriginRef = useRef({ x: 0, y: 0 })
  const previousBodyOverflowRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    previousBodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      restoreBodyOverflow()
    }
  }, [isMenuOpen])

  // The focus trap normally receives Escape through the header's bubbling
  // handler. Keep the expected close affordance available when focus moves
  // outside that subtree (for example, with an external keyboard on mobile).
  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const onDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }
      event.preventDefault()
      closeMenuRef.current()
    }

    document.addEventListener('keydown', onDocumentKeyDown, true)
    return () => document.removeEventListener('keydown', onDocumentKeyDown, true)
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      playOpenTimelineRef.current()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [isMenuOpen])

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  // Past ~24px the fixed wordmark/hamburger start crossing body headings; a
  // blur veil (CSS .is-scrolled) keeps them readable without giving the
  // header a solid bar. The ref gate means React sees a setState only on the
  // threshold crossing itself, not on every scroll frame.
  useEffect(() => {
    let wasScrolled: boolean | null = null
    const onScroll = () => {
      const scrolled = window.scrollY > 24
      if (scrolled !== wasScrolled) {
        wasScrolled = scrolled
        setIsScrolled(scrolled)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The is-scrolled veil isn't enough against every heading/background
  // combo (confirmed on real device emulation on FAQ at phone width and
  // tablet landscape — docs/audit run 25.7). Rather than a heavier uniform
  // veil, watch semantic text-bearing content and controls in the document
  // and fade the wordmark only while one is actually intersecting the
  // header's own rect. The original headings-only list missed paragraphs,
  // FAQ questions, and booking calendar buttons. The header is fixed, so
  // its rect only moves on resize (its clamp()-based inset), not on scroll.
  useEffect(() => {
    const header = headerRef.current
    if (!header) {
      return
    }

    const collisionSelector = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'button',
      'a',
      'label',
      '[class*="__eyebrow"]',
      '[class*="__label"]',
      '[class*="__descriptor"]',
    ].join(', ')
    const intersecting = new Set<Element>()
    let observer: IntersectionObserver | null = null

    function updateCollisionState() {
      setIsHeadingCollision(intersecting.size > 0)
    }

    function handleIntersect(entries: IntersectionObserverEntry[]) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          intersecting.add(entry.target)
        } else {
          intersecting.delete(entry.target)
        }
      }
      updateCollisionState()
    }

    function observeHeadings() {
      if (!observer) {
        return
      }
      document.querySelectorAll(collisionSelector).forEach((element) => {
        if (!header!.contains(element) && element.textContent?.trim()) {
          observer!.observe(element)
        }
      })
    }

    function rebuildObserver() {
      observer?.disconnect()
      intersecting.clear()

      const rect = header!.getBoundingClientRect()
      const rootMargin = [
        `${-Math.round(rect.top)}px`,
        `${-Math.round(window.innerWidth - rect.right)}px`,
        `${-Math.round(window.innerHeight - rect.bottom)}px`,
        `${-Math.round(rect.left)}px`,
      ].join(' ')

      observer = new IntersectionObserver(handleIntersect, { rootMargin })
      observeHeadings()
      updateCollisionState()
    }

    rebuildObserver()

    const resizeObserver = new ResizeObserver(() => rebuildObserver())
    resizeObserver.observe(header)

    let rescanFrame: number | null = null
    const mutationObserver = new MutationObserver(() => {
      if (rescanFrame !== null) {
        return
      }
      rescanFrame = window.requestAnimationFrame(() => {
        rescanFrame = null
        observeHeadings()
      })
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer?.disconnect()
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (rescanFrame !== null) {
        window.cancelAnimationFrame(rescanFrame)
      }
    }
  }, [])

  function getMenuElements() {
    const menuButton = menuButtonRef.current
    const overlay = overlayRef.current
    const nav = navRef.current

    if (!menuButton || !overlay || !nav) {
      return null
    }

    const lines = Array.from(menuButton.querySelectorAll('span'))
    const links = Array.from(nav.querySelectorAll<HTMLElement>('.fullscreen-nav-link'))

    return {
      lines,
      links,
      menuButton,
      nav,
      overlay,
    }
  }

  function setRevealOrigin() {
    const overlay = overlayRef.current
    const menuButton = menuButtonRef.current

    if (!overlay || !menuButton) {
      return 0
    }

    const buttonRect = menuButton.getBoundingClientRect()
    const originX = buttonRect.left + buttonRect.width / 2
    const originY = buttonRect.top + buttonRect.height / 2
    const radius = getRevealRadius(originX, originY)

    overlay.style.setProperty('--nav-origin-x', `${originX}px`)
    overlay.style.setProperty('--nav-origin-y', `${originY}px`)
    gradientOriginRef.current = { x: originX, y: originY }

    return radius
  }

  function restoreBodyOverflow() {
    if (previousBodyOverflowRef.current === null) {
      return
    }

    document.body.style.overflow = previousBodyOverflowRef.current
    previousBodyOverflowRef.current = null
  }

  function playOpenTimeline() {
    const elements = getMenuElements()

    if (!elements) {
      return
    }

    const { lines, links, menuButton, overlay } = elements
    const radius = setRevealOrigin()

    timelineRef.current?.kill()
    setIsMenuInteractive(false)

    gsap.set(overlay, {
      autoAlpha: 1,
      pointerEvents: 'auto',
      '--nav-radius': prefersReducedMotion ? `${radius}px` : '0px',
    })
    gsap.set(links, { autoAlpha: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 18 })

    if (prefersReducedMotion) {
      gsap.set(lines[0], { y: 10, rotation: 36 })
      gsap.set(lines[1], { autoAlpha: 0, scaleX: 0.4 })
      gsap.set(lines[2], { y: -10, rotation: -36 })
      setIsMenuInteractive(true)
      overlay.focus({ preventScroll: true })
      return
    }

    timelineRef.current = gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          setIsMenuInteractive(true)
          overlay.focus({ preventScroll: true })
        },
      })
      .to(lines[0], { y: 10, rotation: 36, duration: 0.22 }, 0)
      .to(lines[1], { autoAlpha: 0, scaleX: 0.4, duration: 0.16 }, 0)
      .to(lines[2], { y: -10, rotation: -36, duration: 0.22 }, 0)
      .to(menuButton, { color: '#ead2a9', duration: 0.28 }, 0.06)
      .to(
        overlay,
        {
          '--nav-radius': `${radius}px`,
          duration: 0.62,
          ease: 'power3.out',
        },
        0.08,
      )
      .to(
        links,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.44,
          stagger: 0.055,
          ease: 'power3.out',
        },
        0.52,
      )
  }

  playOpenTimelineRef.current = playOpenTimeline

  function playCloseTimeline(restoreFocus = true, onClosed?: () => void) {
    const elements = getMenuElements()

    if (!elements) {
      restoreBodyOverflow()
      setIsMenuOpen(false)
      onClosed?.()
      return
    }

    const { lines, links, menuButton, overlay } = elements
    const radius = setRevealOrigin()

    timelineRef.current?.kill()
    setIsMenuInteractive(false)

    if (prefersReducedMotion) {
      gsap.set(links, { autoAlpha: 0, y: 12 })
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none', '--nav-radius': '0px' })
      gsap.set(lines, { clearProps: 'all' })
      gsap.set(menuButton, { clearProps: 'color' })
      restoreBodyOverflow()
      setIsMenuOpen(false)
      onClosed?.()

      if (restoreFocus) {
        window.requestAnimationFrame(() => {
          menuButton.focus({ preventScroll: true })
        })
      }

      return
    }

    gsap.set(overlay, { '--nav-radius': `${radius}px` })

    timelineRef.current = gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' })
          gsap.set(lines, { clearProps: 'all' })
          gsap.set(menuButton, { clearProps: 'color' })
          restoreBodyOverflow()
          setIsMenuOpen(false)
          onClosed?.()

          if (restoreFocus) {
            window.requestAnimationFrame(() => {
              menuButton.focus({ preventScroll: true })
            })
          }
        },
      })
      .to(links, { autoAlpha: 0, y: 12, duration: 0.18, stagger: { each: 0.025, from: 'end' } }, 0)
      .to(
        overlay,
        {
          '--nav-radius': '0px',
          duration: 0.52,
          ease: 'power2.inOut',
        },
        0.2,
      )
      .to(lines[0], { y: 0, rotation: 0, duration: 0.2 }, 0.58)
      .to(lines[1], { autoAlpha: 1, scaleX: 1, duration: 0.18 }, 0.58)
      .to(lines[2], { y: 0, rotation: 0, duration: 0.2 }, 0.58)
      .to(menuButton, { color: '#1f1d18', duration: 0.2 }, 0.56)
  }

  function openMenu() {
    if (isMenuOpen) {
      return
    }

    setIsMenuOpen(true)
  }

  function closeMenu(restoreFocus = true) {
    if (!isMenuOpen) {
      return
    }

    playCloseTimeline(restoreFocus)
  }

  closeMenuRef.current = closeMenu

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu()
      return
    }

    openMenu()
  }

  function handleMenuButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (isMenuOpen && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
    }
  }

  function handleOverlayKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = [
      menuButtonRef.current,
      ...(overlayRef.current
        ? Array.from(overlayRef.current.querySelectorAll<HTMLElement>(focusableSelector))
        : []),
    ].filter(Boolean)

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (!firstElement || !lastElement) {
      return
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  function handleMenuLinkClick(event: MouseEvent<HTMLAnchorElement>, to: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return
    }

    event.preventDefault()
    playCloseTimeline(false, () => {
      navigate(to)
    })
  }

  return (
    <header
      ref={headerRef}
      className={[
        'site-header',
        isSuppressed ? 'is-suppressed' : '',
        isMenuOpen ? 'is-menu-open' : '',
        isScrolled ? 'is-scrolled' : '',
        isHeadingCollision && !isMenuOpen ? 'is-heading-collision' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={isSuppressed ? true : undefined}
      onKeyDown={isMenuOpen ? handleOverlayKeyDown : undefined}
    >
      <button
        ref={menuButtonRef}
        className="menu-toggle"
        type="button"
        tabIndex={isSuppressed ? -1 : undefined}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="fullscreen-navigation"
        aria-expanded={isMenuOpen}
        onClick={toggleMenu}
        onKeyDown={handleMenuButtonKeyDown}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <Link
        className="nav-mark"
        to="/"
        aria-label="Aaron Grzanich home"
        tabIndex={isMenuOpen || isSuppressed ? -1 : undefined}
        onClick={() => closeMenu(false)}
      >
        Aaron Grzanich
      </Link>

      <div className="header-spacer" aria-hidden="true" />

      <div
        ref={overlayRef}
        id="fullscreen-navigation"
        className={isMenuInteractive ? 'fullscreen-nav is-interactive' : 'fullscreen-nav'}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isMenuOpen}
        tabIndex={-1}
      >
        <NavGradient isVisible={isMenuOpen} originRef={gradientOriginRef} />
        <nav ref={navRef} className="fullscreen-nav-inner" aria-label="Fullscreen navigation">
          {menuLinks.map((link, index) => (
            <Link
              key={link.to}
              className={link.emphasis ? 'fullscreen-nav-link is-emphasized' : 'fullscreen-nav-link'}
              style={{ '--item-index': index } as CSSProperties}
              to={link.to}
              tabIndex={isMenuInteractive ? 0 : -1}
              onClick={(event) => handleMenuLinkClick(event, link.to)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

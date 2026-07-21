import { Suspense, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AtmosphericBackground from '../components/atmospheric-background/AtmosphericBackground'
import GlobalNavigation from '../components/GlobalNavigation'
import PageTransition from '../components/PageTransition'
import SiteFooter from '../components/SiteFooter'
import StructuredData from '../components/StructuredData'

export type SiteLayoutOutletContext = {
  setHeaderSuppressed: Dispatch<SetStateAction<boolean>>
}

export default function SiteLayout() {
  const location = useLocation()
  // GitHub Pages serves each prerendered route at a directory URL
  // ('/about/'), so direct loads arrive with a trailing slash that
  // client-side navigation never adds — normalize before the exact
  // matches below or every flag is false on a hard load.
  const pathname = location.pathname.replace(/\/+$/, '') || '/'
  const isHome = pathname === '/'
  const isWeeklyLessons = pathname === '/weekly-lessons'
  const isTouristLessons = pathname === '/tourist-lessons'
  const isAbout = pathname === '/about'
  const isCinematic = isTouristLessons || isAbout || isWeeklyLessons
  const hasAtmosphericBackground = isTouristLessons
  const [isHeaderSuppressed, setHeaderSuppressed] = useState(false)
  const shellClassName = isHome
    ? 'home-hero home-hero--opening'
    : [
        'route-shell',
        hasAtmosphericBackground ? 'route-shell--atmospheric' : '',
        isCinematic ? 'route-shell--cinematic' : '',
      ]
        .filter(Boolean)
        .join(' ')
  const mainClassName = isHome
    ? 'home-main'
    : ['page-main', isCinematic ? 'page-main--cinematic' : ''].filter(Boolean).join(' ')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  // Webfonts settle after first paint and shift the geometry every route's
  // ScrollTriggers were measured from — one site-wide re-measure once they
  // load. Lives here (not per page) so every route gets it for free.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) {
        ScrollTrigger.refresh()
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isHome) {
      setHeaderSuppressed(false)
    }
  }, [isHome])

  return (
    <div className="site-shell">
      <StructuredData />
      <div className={shellClassName}>
        {hasAtmosphericBackground ? <AtmosphericBackground /> : null}
        <GlobalNavigation isSuppressed={isHome && isHeaderSuppressed} />
        <PageTransition>
          <main className={mainClassName}>
            {/* Lazy route chunks load behind the persistent header; null
                fallback keeps the cream canvas rather than flashing a spinner. */}
            <Suspense fallback={null}>
              <Outlet context={{ setHeaderSuppressed } satisfies SiteLayoutOutletContext} />
            </Suspense>
          </main>
        </PageTransition>
      </div>
      {/* Home ends on HomeFinale and Ongoing on its weekly-close band — both
          already carry this same footer content (nav links + copyright), so a
          cream SiteFooter strip below would break their ink fields. */}
      {isHome || isWeeklyLessons ? null : <SiteFooter />}
    </div>
  )
}

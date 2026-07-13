import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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
  const isHome = location.pathname === '/'
  const isTouristLessons = location.pathname === '/tourist-lessons'
  const isAbout = location.pathname === '/about'
  const isCinematic = isTouristLessons || isAbout
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
  }, [location.pathname])

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
            <Outlet context={{ setHeaderSuppressed } satisfies SiteLayoutOutletContext} />
          </main>
        </PageTransition>
      </div>
      {/* Home ends on HomeFinale, which already carries this same footer
          content (nav links + copyright) inside its closing band. */}
      {isHome ? null : <SiteFooter />}
    </div>
  )
}

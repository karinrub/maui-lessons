import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AtmosphericBackground from '../components/atmospheric-background/AtmosphericBackground'
import GlobalNavigation from '../components/GlobalNavigation'
import PageTransition from '../components/PageTransition'
import SiteFooter from '../components/SiteFooter'

export type SiteLayoutOutletContext = {
  setHeaderSuppressed: Dispatch<SetStateAction<boolean>>
}

export default function SiteLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isTouristLessons = location.pathname === '/tourist-lessons'
  const hasAtmosphericBackground = isTouristLessons
  const [isHeaderSuppressed, setHeaderSuppressed] = useState(false)
  const shellClassName = isHome
    ? 'home-hero home-hero--opening'
    : [
        'route-shell',
        hasAtmosphericBackground ? 'route-shell--atmospheric' : '',
        isTouristLessons ? 'route-shell--cinematic' : '',
      ]
        .filter(Boolean)
        .join(' ')
  const mainClassName = isHome
    ? 'home-main'
    : ['page-main', isTouristLessons ? 'page-main--cinematic' : ''].filter(Boolean).join(' ')

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
      <div className={shellClassName}>
        {hasAtmosphericBackground ? <AtmosphericBackground /> : null}
        <GlobalNavigation isSuppressed={isHome && isHeaderSuppressed} />
        <PageTransition>
          <main className={mainClassName}>
            <Outlet context={{ setHeaderSuppressed } satisfies SiteLayoutOutletContext} />
          </main>
        </PageTransition>
      </div>
      <SiteFooter />
    </div>
  )
}

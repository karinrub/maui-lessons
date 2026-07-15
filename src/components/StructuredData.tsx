import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL } from '../config/seo'

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Maui Lessons',
  description:
    'Private ukulele and guitar lessons on Maui, taught by Aaron Grzanich, for vacationing visitors and local students.',
  url: `${SITE_URL}/`,
  areaServed: { '@type': 'Place', name: 'South Maui (Kihei, Wailea)' },
  founder: { '@type': 'Person', name: 'Aaron Grzanich' },
}

// No `logo` field: public/favicon.svg is the only site mark and is generic/
// unbranded (per CLAUDE.md Task 10), off-palette from the site's forest-
// green/gold/cream system. Add `logo` once an approved brand asset exists.
const ORGANIZATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Maui Lessons',
  url: `${SITE_URL}/`,
  sameAs: ['https://www.facebook.com/aaron.grzanich/'],
}

// No SearchAction: the site has no internal search feature.
const WEBSITE_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Maui Lessons',
  url: `${SITE_URL}/`,
}

// Mirrors the real nav hierarchy in GlobalNavigation.tsx (Home > <page>) —
// keep in sync if a route's label or path changes.
const ROUTE_BREADCRUMBS: Record<string, string> = {
  '/tourist-lessons': 'Vacation Lessons',
  '/weekly-lessons': 'Ongoing Lessons',
  '/about': 'About',
  '/faq': 'FAQ',
  '/book': 'Book',
}

function buildBreadcrumbData(pathname: string) {
  const label = ROUTE_BREADCRUMBS[pathname]
  if (!label) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${pathname}` },
    ],
  }
}

// Renders nothing visible — injects sitewide LocalBusiness/Organization/
// WebSite JSON-LD plus a per-route BreadcrumbList (found-or-created by id so
// remounts/route changes never duplicate scripts; the breadcrumb script is
// removed on home, which has no parent to break out to).
export default function StructuredData() {
  const location = useLocation()

  useEffect(() => {
    const sitewideBlocks: Array<[string, unknown]> = [
      ['structured-data-local-business', STRUCTURED_DATA],
      ['structured-data-organization', ORGANIZATION_DATA],
      ['structured-data-website', WEBSITE_DATA],
    ]

    for (const [id, data] of sitewideBlocks) {
      let script = document.querySelector<HTMLScriptElement>(`script#${id}`)
      if (!script) {
        script = document.createElement('script')
        script.id = id
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(data)
    }
  }, [])

  useEffect(() => {
    const breadcrumbData = buildBreadcrumbData(location.pathname)
    let script = document.querySelector<HTMLScriptElement>('script#structured-data-breadcrumb')

    if (!breadcrumbData) {
      script?.remove()
      return
    }

    if (!script) {
      script = document.createElement('script')
      script.id = 'structured-data-breadcrumb'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(breadcrumbData)
  }, [location.pathname])

  return null
}

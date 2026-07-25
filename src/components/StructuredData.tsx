import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL } from '../config/seo'
import {
  ONGOING_LESSON_OPTIONS,
  VACATION_LESSON_OPTIONS,
} from '../config/lessonOptions'

const AARON_PORTRAIT_URL = new URL(
  '../../assets/images/aaron-portrait-1.jpeg',
  import.meta.url,
).href

// Explicit ImageObject (not a bare URL string) with real dimensions — this
// is Google's documented preference for image eligibility in search
// results, and >1200px wide with a clear, uncropped face is exactly what
// their image-selection guidance asks for. Dimensions confirmed against the
// actual source file, not assumed.
const AARON_PORTRAIT_IMAGE = {
  '@type': 'ImageObject',
  url: AARON_PORTRAIT_URL,
  width: 2200,
  height: 1467,
}

// Real prices sourced from the same config the booking page renders from —
// never hand-duplicated here, so this can't drift out of sync if pricing
// changes.
const ALL_PRICES = [...VACATION_LESSON_OPTIONS, ...ONGOING_LESSON_OPTIONS].map(
  (option) => option.price,
)
const MIN_PRICE = Math.min(...ALL_PRICES)
const MAX_PRICE = Math.max(...ALL_PRICES)

// @id anchors let the three sitewide blocks below reference each other as a
// single connected graph (Person <-> LocalBusiness) instead of duplicating
// each other's data inline.
const PERSON_ID = `${SITE_URL}/#aaron-grzanich`
const LOCAL_BUSINESS_ID = `${SITE_URL}/#local-business`
const ORGANIZATION_ID = `${SITE_URL}/#organization`

const PERSON_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Aaron Grzanich',
  jobTitle: 'Ukulele & Guitar Instructor',
  description:
    'Ukulele and guitar instructor based in South Maui with 22 years in music, teaching private lessons to visiting tourists and local students in Kihei and Wailea.',
  image: AARON_PORTRAIT_IMAGE,
  url: `${SITE_URL}/about`,
  worksFor: { '@id': LOCAL_BUSINESS_ID },
  sameAs: ['https://www.facebook.com/aaron.grzanich/'],
}

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_ID,
  name: 'Maui Lessons',
  description:
    'Private ukulele and guitar lessons on Maui, taught by Aaron Grzanich, for vacationing visitors and local students in Kihei and Wailea.',
  url: `${SITE_URL}/`,
  image: AARON_PORTRAIT_IMAGE,
  priceRange: `$${MIN_PRICE}-$${MAX_PRICE}`,
  areaServed: [
    { '@type': 'Place', name: 'Maui, Hawaii' },
    { '@type': 'Place', name: 'Kihei, Hawaii' },
    { '@type': 'Place', name: 'Wailea, Hawaii' },
  ],
  founder: { '@id': PERSON_ID },
  employee: { '@id': PERSON_ID },
  makesOffer: [
    {
      '@type': 'Offer',
      name: 'Vacation Ukulele Lesson',
      description:
        'A private beach ukulele lesson for visitors to Maui, no experience required.',
      priceCurrency: 'USD',
      price: VACATION_LESSON_OPTIONS[0].price,
      url: `${SITE_URL}/tourist-lessons`,
    },
    {
      '@type': 'Offer',
      name: 'Ongoing Ukulele & Guitar Lessons',
      description:
        'Private, recurring ukulele and guitar lessons for Maui locals in Kihei and Wailea.',
      priceCurrency: 'USD',
      price: ONGOING_LESSON_OPTIONS[0].price,
      url: `${SITE_URL}/weekly-lessons`,
    },
  ],
}

// No `logo` field: public/favicon.svg is the only site mark and is generic/
// unbranded (per CLAUDE.md Task 10), off-palette from the site's forest-
// green/gold/cream system. Add `logo` once an approved brand asset exists.
const ORGANIZATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
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

// SiteNavigationElement — mirrors the real global nav in GlobalNavigation.tsx
// and the footer in SiteFooter.tsx exactly (keep in sync with both if a
// route's label or path ever changes). This doesn't guarantee Google
// Sitelinks (those are algorithmic and tied to site authority/branded search
// volume, which no on-page markup can force), but explicitly publishing the
// site's primary sections this way is a standard, low-risk technique for
// improving the odds Google recognizes and surfaces them. It works together
// with the rest of this file's job: a flat, shallow URL structure, one
// unique title/description per page, and every page reachable from the same
// consistent global nav + footer link set.
const SITE_NAVIGATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SiteNavigationElement',
  name: [
    'Home',
    'Vacation Lessons',
    'Ongoing Lessons',
    'About',
    'FAQ',
    'Book a Lesson',
  ],
  url: [
    `${SITE_URL}/`,
    `${SITE_URL}/tourist-lessons`,
    `${SITE_URL}/weekly-lessons`,
    `${SITE_URL}/about`,
    `${SITE_URL}/faq`,
    `${SITE_URL}/book`,
  ],
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

function buildBreadcrumbData(rawPathname: string) {
  // Direct loads from GitHub Pages carry a trailing slash ('/about/') that
  // client-side navigation never adds; without normalizing, the lookup
  // misses and the breadcrumb baked into the prerendered HTML gets removed.
  const pathname = rawPathname.replace(/\/+$/, '') || '/'
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
      ['structured-data-person', PERSON_DATA],
      ['structured-data-organization', ORGANIZATION_DATA],
      ['structured-data-website', WEBSITE_DATA],
      ['structured-data-site-navigation', SITE_NAVIGATION_DATA],
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

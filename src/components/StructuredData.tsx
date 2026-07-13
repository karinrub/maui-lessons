import { useEffect } from 'react'
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

// Renders nothing visible — injects a single sitewide LocalBusiness JSON-LD
// script into <head>, found-or-created by id so remounts (route changes)
// never duplicate it.
export default function StructuredData() {
  useEffect(() => {
    let script = document.querySelector<HTMLScriptElement>('script#structured-data-local-business')
    if (!script) {
      script = document.createElement('script')
      script.id = 'structured-data-local-business'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(STRUCTURED_DATA)
  }, [])

  return null
}

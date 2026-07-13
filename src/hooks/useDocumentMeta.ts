import { useEffect } from 'react'
import { SITE_URL } from '../config/seo'

// Sitewide fallback social-share image for routes that don't specify their
// own. A purpose-built 1200×630 social card is a follow-up design task, not
// a coding blocker — this reuses the existing home hero photo.
const DEFAULT_IMAGE = new URL('../../assets/images/aaron-beach-1.jpg', import.meta.url).href

export type DocumentMetaOptions = {
  title: string
  description: string
  /** Route path, e.g. '/tourist-lessons' — used to build canonical URL and og:url. */
  path: string
  /** Absolute URL; falls back to the sitewide default hero photo if omitted. */
  image?: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"][data-managed="true"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute('data-managed', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonicalLink(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"][data-managed="true"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    el.setAttribute('data-managed', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function useDocumentMeta({ title, description, path, image }: DocumentMetaOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const resolvedImage = image ?? DEFAULT_IMAGE

    setMetaTag('name', 'description', description)
    setCanonicalLink(url)

    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:image', resolvedImage)

    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', resolvedImage)
  }, [title, description, path, image])
}

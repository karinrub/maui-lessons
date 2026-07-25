import { useEffect } from 'react'
import { SITE_URL } from '../config/seo'

// Sitewide fallback social-share image for routes that don't specify their
// own. A purpose-built 1200×630 social card is a follow-up design task, not
// a coding blocker — this reuses the existing portrait, chosen deliberately
// over the wider beach establishing shot because it shows Aaron's face
// clearly and un-cropped: it's already a 2200×1467 (3:2) landscape photo
// with his face centered in the upper-middle of the frame, so a standard
// crop to social platforms' ~1.91:1 share ratio only trims sky/sand at the
// top and bottom — it doesn't cut into his face. Real source dimensions
// below (confirmed via the actual file, not assumed) so platforms don't
// have to guess before choosing how to crop it.
const DEFAULT_IMAGE = new URL('../../assets/images/aaron-portrait-1.jpeg', import.meta.url).href
const DEFAULT_IMAGE_WIDTH = 2200
const DEFAULT_IMAGE_HEIGHT = 1467
const DEFAULT_IMAGE_ALT = 'Aaron Grzanich smiling and playing ukulele on a Maui beach'

export type DocumentMetaOptions = {
  title: string
  description: string
  /** Route path, e.g. '/tourist-lessons' — used to build canonical URL and og:url. */
  path: string
  /** Absolute URL; falls back to the sitewide default portrait if omitted. */
  image?: string
  /** Describes the image itself (not the page) — falls back to a description of the default portrait. Only meaningful when `image` is also provided. */
  imageAlt?: string
  /** Real pixel dimensions of `image` — lets platforms render/crop it without fetching it first. Only meaningful when `image` is also provided; falls back to the default portrait's real dimensions otherwise. */
  imageWidth?: number
  imageHeight?: number
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  // Adopt any existing tag with this attr+key first — index.html ships a
  // static fallback <meta name="description"> for crawlers that fetch raw
  // HTML without running JS (see the comment there). Always creating a new
  // `data-managed` tag instead of reusing that one would leave two
  // <meta name="description"> tags in the document, which is invalid HTML
  // and leaves it ambiguous which one a crawler should trust.
  let el =
    document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"][data-managed="true"]`) ??
    document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('data-managed', 'true')
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

export default function useDocumentMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
}: DocumentMetaOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const resolvedImage = image ?? DEFAULT_IMAGE
    const resolvedImageAlt = imageAlt ?? DEFAULT_IMAGE_ALT
    const resolvedImageWidth = image ? imageWidth : DEFAULT_IMAGE_WIDTH
    const resolvedImageHeight = image ? imageHeight : DEFAULT_IMAGE_HEIGHT

    // Single source of truth for the page title: this is what search engines
    // read from <title>, so it must be the same string used for og:title/
    // twitter:title below, not a separate, less-specific label set elsewhere.
    document.title = title

    setMetaTag('name', 'description', description)
    setCanonicalLink(url)

    setMetaTag('property', 'og:site_name', 'Maui Lessons')
    setMetaTag('property', 'og:locale', 'en_US')
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:image', resolvedImage)
    setMetaTag('property', 'og:image:alt', resolvedImageAlt)
    if (resolvedImageWidth) setMetaTag('property', 'og:image:width', String(resolvedImageWidth))
    if (resolvedImageHeight) setMetaTag('property', 'og:image:height', String(resolvedImageHeight))

    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', resolvedImage)
    setMetaTag('name', 'twitter:image:alt', resolvedImageAlt)
  }, [title, description, path, image, imageAlt, imageWidth, imageHeight])
}

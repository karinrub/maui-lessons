// Post-build prerender step: visits every route against a `vite preview`
// server of the just-built dist/, waits for each page's own bounded
// stall-fallback to settle, and writes the fully-rendered HTML into
// dist/<route>/index.html. `src/main.tsx` uses createRoot (not
// hydrateRoot), so a real browser simply re-renders over this snapshot on
// load — the point is real content for crawlers that don't execute JS.
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import { preview } from 'vite'

const ROUTES = ['', 'tourist-lessons', 'weekly-lessons', 'about', 'faq', 'book']
const SITE_URL = 'https://karinrub.github.io/maui-lessons'

// Longest known bounded stall-fallback across the site (Book's type-step
// title reveal: 1.2s delay + 2.5s fallback = 3.7s) plus margin, so every
// route's entrance/reveal animation has settled before we snapshot it.
const SETTLE_MS = 4500

async function main() {
  const server = await preview()
  const baseUrl = server.resolvedUrls?.local?.[0]

  if (!baseUrl) {
    throw new Error('Could not resolve the vite preview server URL.')
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    for (const route of ROUTES) {
      const url = new URL(route, baseUrl).toString()
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForFunction(() => document.body.innerText.trim().length > 100, {
        timeout: 10000,
      })
      await page.waitForTimeout(SETTLE_MS)

      // Rewrite the preview server's origin+base prefix (not the origin
      // alone) to the deployed origin+base. The build's base differs by
      // environment — '/' locally, '/maui-lessons/' in CI where
      // GITHUB_REPOSITORY is set (see vite.config.ts) — and an origin-only
      // rewrite doubled the base in CI output
      // (…github.io/maui-lessons/maui-lessons/assets/…, 404 for crawlers).
      const previewUrl = new URL(baseUrl)
      const previewPrefix = previewUrl.origin + previewUrl.pathname.replace(/\/$/, '')
      const html = (await page.content()).replaceAll(previewPrefix, SITE_URL)
      const outDir = route === '' ? 'dist' : path.join('dist', route)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html)
      console.log(`Prerendered ${url} -> ${path.join(outDir, 'index.html')}`)
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

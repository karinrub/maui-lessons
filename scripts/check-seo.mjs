// Regression smoke test: every route must render exactly one <h1> and zero
// <img> without alt text. Reuses the vite preview server + Playwright
// already set up for scripts/prerender.mjs. Run against a fresh `npm run
// build` output.
import { chromium } from 'playwright'
import { preview } from 'vite'

const ROUTES = ['', 'tourist-lessons', 'weekly-lessons', 'about', 'faq', 'book']
const SETTLE_MS = 4500

async function main() {
  const server = await preview()
  const baseUrl = server.resolvedUrls?.local?.[0]

  if (!baseUrl) {
    throw new Error('Could not resolve the vite preview server URL.')
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const failures = []

  try {
    for (const route of ROUTES) {
      const url = new URL(route, baseUrl).toString()
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(SETTLE_MS)

      const h1Count = await page.locator('h1').count()
      const missingAltCount = await page.locator('img:not([alt])').count()

      if (h1Count !== 1) {
        failures.push(`${url}: expected exactly 1 <h1>, found ${h1Count}`)
      }
      if (missingAltCount !== 0) {
        failures.push(`${url}: ${missingAltCount} <img> missing alt text`)
      }
      console.log(`Checked ${url} — h1: ${h1Count}, missing alt: ${missingAltCount}`)
    }
  } finally {
    await browser.close()
    await server.close()
  }

  if (failures.length > 0) {
    console.error('\nSEO smoke test failed:')
    for (const failure of failures) {
      console.error(`  - ${failure}`)
    }
    process.exitCode = 1
    return
  }

  console.log('\nSEO smoke test passed: every route has exactly 1 <h1> and 0 images missing alt text.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

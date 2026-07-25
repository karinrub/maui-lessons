import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = process.env.LAUNCH_CHECK_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ headless: true })

const checks = []
const check = async (name, fn) => {
  try {
    await fn()
    checks.push({ name, ok: true })
  } catch (error) {
    checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) })
  }
}

const newPage = async (viewport) => {
  const page = await browser.newPage({ viewport })
  page.on('pageerror', (error) => checks.push({ name: `page error at ${viewport.width}px`, ok: false, error: error.message }))
  return page
}

await check('FAQ heading is visible before scrolling', async () => {
  const page = await newPage({ width: 1440, height: 900 })
  await page.goto(`${baseUrl}/faq`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(350)
  const heading = page.locator('.faq-intro__title')
  await assert.doesNotReject(() => heading.waitFor({ state: 'visible' }))
  const state = await heading.evaluate((element) => {
    const line = element.querySelector('.faq-intro__title-line')
    return { opacity: Number(getComputedStyle(element).opacity), transform: getComputedStyle(line ?? element).transform }
  })
  assert.ok(state.opacity > 0.99, `FAQ heading opacity was ${state.opacity}`)
  assert.equal(state.transform, 'none', `FAQ heading remains transformed: ${state.transform}`)
  await page.close()
})

for (const { route, selector, label } of [
  { route: '/', selector: '.meet-aaron__description', label: 'Home paragraph' },
  { route: '/tourist-lessons', selector: '.vacation-quote__text', label: 'Vacation paragraph' },
  { route: '/faq', selector: '#faq-question-experience', label: 'FAQ question' },
]) {
  await check(`header wordmark yields to ${label}`, async () => {
    const page = await newPage({ width: 390, height: 844 })
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(350)
    await page.locator(selector).evaluate((element) => {
      const header = document.querySelector('.site-header')
      if (!header) throw new Error('Missing site header')
      window.scrollTo({ top: Math.max(0, window.scrollY + element.getBoundingClientRect().top - header.getBoundingClientRect().top - 8) })
    })
    await page.waitForTimeout(650)
    const state = await page.locator('.nav-mark').evaluate((wordmark) => Number(getComputedStyle(wordmark).opacity))
    assert.ok(state < 0.1, `wordmark opacity was ${state}`)
    await page.close()
  })
}

await check('FAQ phone rail releases before closing CTA', async () => {
  const page = await newPage({ width: 390, height: 844 })
  await page.goto(`${baseUrl}/faq`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(350)
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }))
  await page.waitForTimeout(120)
  const overlapsFinale = await page.evaluate(() => {
    const rail = document.querySelector('.faq-category-nav')?.getBoundingClientRect()
    const finale = document.querySelector('.home-finale')?.getBoundingClientRect()
    return Boolean(rail && finale && rail.bottom > finale.top && rail.top < finale.bottom)
  })
  assert.equal(overlapsFinale, false, 'FAQ category rail overlays closing CTA/footer')
  await page.close()
})

if (!process.env.VITE_BOOKING_ENDPOINT) {
  await check('booking preview completes without falsely claiming delivery', async () => {
    const page = await newPage({ width: 390, height: 844 })
    await page.goto(`${baseUrl}/book`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)

    await page.getByRole('button', { name: 'Vacation Lessons / Ukulele Experience A relaxed beachside ukulele session for visitors, families, and new players who want to leave Maui with a song they can actually play.' }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: '1 person 30 minutes $35' }).click()
    await page.waitForTimeout(900)

    const dates = page.locator('.bwc-day:not([disabled])')
    const dateCount = await dates.count()
    assert.ok(dateCount > 0, 'No selectable calendar day')
    await dates.nth(0).click()
    await page.getByRole('button', { name: '7:00 AM' }).click()
    await page.waitForTimeout(1200)

    await page.getByLabel('Name').fill('Maui Visitor')
    await page.getByLabel('Email').fill('visitor@example.com')
    await page.getByRole('button', { name: 'Send booking request' }).click()
    await page.waitForTimeout(900)

    assert.equal(await page.getByRole('heading', { name: 'Request details ready' }).count(), 1)
    assert.equal(
      await page.getByText('Online delivery will be connected before public booking opens.').count(),
      1,
    )
    await page.close()
  })
}

for (const width of [320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1440]) {
  await check(`no horizontal overflow at ${width}px`, async () => {
    const page = await newPage({ width, height: 900 })
    for (const route of ['/', '/tourist-lessons', '/weekly-lessons', '/about', '/faq', '/book']) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(200)
      const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
      assert.ok(sizes.scroll <= sizes.client, `${route}: ${sizes.scroll}px > ${sizes.client}px`)
    }
    await page.close()
  })
}

await browser.close()
const failures = checks.filter((checkResult) => !checkResult.ok)
for (const checkResult of checks) {
  console.log(`${checkResult.ok ? 'PASS' : 'FAIL'} ${checkResult.name}${checkResult.error ? ` — ${checkResult.error}` : ''}`)
}
if (failures.length > 0) process.exitCode = 1

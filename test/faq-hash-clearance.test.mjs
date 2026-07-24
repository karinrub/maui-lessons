import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
let baseUrl
let browser
let vite

before(async () => {
  vite = await createServer({
    root,
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0 },
  })
  await vite.listen()
  const address = vite.httpServer.address()
  assert.ok(address && typeof address === 'object')
  baseUrl = `http://127.0.0.1:${address.port}`
  browser = await chromium.launch({ headless: true })
})

after(async () => {
  await browser?.close()
  await vite?.close()
})

async function measureSettledHash({ hash, selector, viewport }) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  await page.goto(`${baseUrl}/faq${hash}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1600)
  const measurement = await page.evaluate((targetSelector) => {
    const target = document.querySelector(targetSelector)
    const header = document.querySelector('.site-header')
    const nav = document.querySelector('.faq-category-nav')
    assertElement(target, targetSelector)
    assertElement(header, '.site-header')

    const targetRect = target.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    const navRect = nav?.getBoundingClientRect()
    const navStyle = nav ? getComputedStyle(nav) : null
    const navOverlapsTarget =
      navRect &&
      navStyle?.position === 'sticky' &&
      navStyle.visibility !== 'hidden' &&
      navStyle.display !== 'none' &&
      navRect.right > targetRect.left &&
      navRect.left < targetRect.right
    const requiredBottom = Math.max(
      headerRect.bottom,
      navOverlapsTarget ? navRect?.bottom ?? 0 : 0,
    )
    const transform = getComputedStyle(target).transform
    const translateY = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42

    return {
      expanded: document.querySelector('#faq-question-pricing')?.getAttribute('aria-expanded'),
      requiredBottom,
      targetTop: targetRect.top,
      translateY,
    }

    function assertElement(element, label) {
      if (!element) throw new Error(`Missing ${label}`)
    }
  }, selector)
  await context.close()
  return measurement
}

async function measureClickedCategory({ linkSelector, targetSelector, viewport }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`${baseUrl}/faq`, { waitUntil: 'networkidle' })
  await page.locator(linkSelector).click()
  await page.waitForTimeout(100)
  const measurement = await page.evaluate((selector) => {
    const target = document.querySelector(selector)
    const header = document.querySelector('.site-header')
    const nav = document.querySelector('.faq-category-nav')
    assertElement(target, selector)
    assertElement(header, '.site-header')

    const targetRect = target.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    const navRect = nav?.getBoundingClientRect()
    const navStyle = nav ? getComputedStyle(nav) : null
    const navOverlapsTarget =
      navRect &&
      navStyle?.position === 'sticky' &&
      navStyle.visibility !== 'hidden' &&
      navStyle.display !== 'none' &&
      navRect.right > targetRect.left &&
      navRect.left < targetRect.right

    return {
      hash: window.location.hash,
      requiredBottom: Math.max(
        headerRect.bottom,
        navOverlapsTarget ? navRect?.bottom ?? 0 : 0,
      ),
      targetTop: targetRect.top,
    }

    function assertElement(element, label) {
      if (!element) throw new Error(`Missing ${label}`)
    }
  }, targetSelector)
  await context.close()
  return measurement
}

test('fresh desktop answer hash clears the fixed header after reveal', async () => {
  const result = await measureSettledHash({
    hash: '#pricing',
    selector: '.faq-row:has(#faq-question-pricing)',
    viewport: { width: 1440, height: 900 },
  })
  assert.equal(result.expanded, 'true')
  assert.ok(Math.abs(result.translateY) < 0.5, `target transform is still ${result.translateY}px`)
  assert.ok(
    result.targetTop >= result.requiredBottom + 16,
    `target top ${result.targetTop}px lacks 16px after fixed clearance ${result.requiredBottom}px`,
  )
})

test('fresh mobile answer hash clears the sticky category navigation', async () => {
  const result = await measureSettledHash({
    hash: '#pricing',
    selector: '.faq-row:has(#faq-question-pricing)',
    viewport: { width: 390, height: 844 },
  })
  assert.equal(result.expanded, 'true')
  assert.ok(Math.abs(result.translateY) < 0.5, `target transform is still ${result.translateY}px`)
  assert.ok(
    result.targetTop >= result.requiredBottom + 16,
    `target top ${result.targetTop}px lacks 16px after sticky clearance ${result.requiredBottom}px`,
  )
})

test('fresh mobile category hash clears the sticky category navigation', async () => {
  const result = await measureSettledHash({
    hash: '#faq-category-vacation',
    selector: '#faq-category-vacation',
    viewport: { width: 390, height: 844 },
  })
  assert.ok(
    result.targetTop >= result.requiredBottom + 16,
    `target top ${result.targetTop}px lacks 16px after sticky clearance ${result.requiredBottom}px`,
  )
})

test('desktop guide click clears the fixed header with the shared clearance behavior', async () => {
  const result = await measureClickedCategory({
    linkSelector: '.faq-guide-routes a[href="#faq-category-vacation"]',
    targetSelector: '#faq-category-vacation',
    viewport: { width: 1440, height: 900 },
  })
  assert.equal(result.hash, '#faq-category-vacation')
  assert.ok(
    result.targetTop >= result.requiredBottom + 16,
    `clicked target top ${result.targetTop}px lacks 16px after fixed clearance ${result.requiredBottom}px`,
  )
})

test('mobile category click clears both fixed header and sticky guide nav', async () => {
  const result = await measureClickedCategory({
    linkSelector: '.faq-category-nav a[href="#faq-category-pricing"]',
    targetSelector: '#faq-category-pricing',
    viewport: { width: 390, height: 844 },
  })
  assert.equal(result.hash, '#faq-category-pricing')
  assert.ok(
    result.targetTop >= result.requiredBottom + 16,
    `clicked target top ${result.targetTop}px lacks 16px after sticky clearance ${result.requiredBottom}px`,
  )
})

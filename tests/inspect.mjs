import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('console', msg => console.log('browser', msg.text()))
  await page.route(/\/src\/hooks\/useMotion\.ts(?:\?.*)?$/, async route => {
    const response = await route.fetch()
    let body = await response.text()
    body = body.replace('const media = gsap.matchMedia()', 'console.log("effect", enabled); const media = gsap.matchMedia()')
      .replace('const desktop = context.conditions?.desktop', 'console.log("media", JSON.stringify(context.conditions), innerWidth, innerHeight); const desktop = context.conditions?.desktop')
    await route.fulfill({ response, body })
  })
  await page.addInitScript(() => { addEventListener('resize', () => console.log('resize',innerWidth,innerHeight)); matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e=>console.log('reduce',e.matches)) })
  await page.goto('http://127.0.0.1:5180')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1800)
  const inspect = async name => console.log(name, await page.evaluate(() => ({
    scroll: scrollY, height: innerHeight,
    title: getComputedStyle(document.querySelector('.hero-title-line')).opacity,
    reveal: [...document.querySelectorAll('[data-reveal]')].map(e => [e.className, getComputedStyle(e).opacity, e.getBoundingClientRect().top]),
  })))
  await inspect('initial')
  for (const id of ['collection', 'numbers', 'journey', 'scenes', 'about']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(850)
  }
  await page.locator('.site-footer').scrollIntoViewIfNeeded()
  await page.waitForTimeout(850)
  await inspect('footer')
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(1200)
  await inspect('top again')
  await page.screenshot({ path: 'test-results/inspect-full.png', fullPage: true })
  await inspect('after full')
  await page.locator('#collection').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await page.screenshot({ path: 'test-results/collection.png' })
} finally { await browser.close() }

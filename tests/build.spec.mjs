import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []
const base = process.env.GALLERY_URL || 'http://127.0.0.1:5181'
const settle = page => page.waitForFunction(() => !document.querySelector('[data-transitioning]'))
const escape = async page => { await page.keyboard.press('Escape'); await page.locator('dialog').waitFor({ state: 'hidden' }) }
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1800)
    await page.getByRole('button', { name: '观展导览', exact: true }).click()
    assert.equal(await page.getByRole('dialog').count(), 1)
    await escape(page)
    await page.getByRole('button', { name: '查看远岫含烟' }).click()
    await page.waitForTimeout(800)
    const overflow = await page.getByRole('dialog').evaluate(el => el.scrollWidth > el.clientWidth + 2)
    assert.equal(overflow, false, 'Artwork book overflows')
    if (viewport.width === 390) await page.screenshot({ path: 'test-results/detail-mobile.png' })
    await escape(page)
    await page.getByRole('button', { name: '观展簿下一页' }).click()
    await settle(page)
    assert.equal(await page.locator('.ledger-records tbody tr').count(), 6)
    await page.getByRole('button', { name: '合上观展簿' }).click()
    await settle(page)
    assert.equal(await page.locator('.ledger-pages').isVisible(), false)
    await page.locator('.ledger-cover').click()
    await settle(page)
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), '合上观展簿')
    await page.locator('#about').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    if (viewport.width === 390) {
      const columns = await page.locator('#about').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
      assert.equal(columns, 1, 'Mobile notes must use one column')
      await page.screenshot({ path: 'test-results/about-mobile.png' })
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.equal(await page.evaluate(() => document.fonts.check('400 30px "Chongxi Seal"')), true)
    assert.deepEqual(errors, [])
    results.push({ viewport, passed: true, interactions: ['guide', 'artwork book', 'ledger pages', 'cover focus return'], font: 'Chongxi Seal' })
    await page.close()
  }
  console.log(JSON.stringify(results))
  await writeFile('test-results/build-report.json', JSON.stringify(results, null, 2))
} finally { await browser.close() }

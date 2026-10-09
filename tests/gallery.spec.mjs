import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { Converter } from 'opencc-js/cn2t'
const traditional = Converter({ from: 'cn', to: 't' })

const base = process.env.GALLERY_URL || 'http://127.0.0.1:5180'
const output = new URL('../test-results/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []
const failures = []
const record = (name, detail) => results.push({ name, passed: true, detail })
const settle = page => page.waitForFunction(() => !document.querySelector('[data-transitioning]'))
const escape = async page => { await page.keyboard.press('Escape'); await page.locator('dialog').waitFor({ state: 'hidden' }) }
try {
  for (const width of [1920, 1440, 1366, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
    await page.goto(base)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1800)
    const nextSectionHint = await page.locator('#collection .section-heading').evaluate(element => ({
      top: element.getBoundingClientRect().top, opacity: Number(getComputedStyle(element).opacity), viewport: innerHeight,
    }))
    assert.ok(nextSectionHint.top < nextSectionHint.viewport && nextSectionHint.opacity > 0.9, `Next section hint missing at ${width}`)
    await page.screenshot({ path: new URL(`hero-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') })
    for (const id of ['collection', 'numbers', 'journey', 'scenes', 'about']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await page.waitForTimeout(750)
    }
    await page.locator('.site-footer').scrollIntoViewIfNeeded()
    await page.waitForTimeout(750)
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src),
      headings: [...document.querySelectorAll('h1,h2,h3')].filter(element => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1 || element.scrollWidth > element.clientWidth + 2)
      }).map(element => element.textContent),
      smallText: [...document.querySelectorAll('.button,.nav-entry')].filter(element => element.scrollWidth > element.clientWidth + 2).map(element => element.textContent),
      fontLoaded: document.fonts.check('400 32px "Chongxi Seal"'),
      arabicText: document.body.innerText.match(/\d+/g) || [],
      chineseFonts: [...document.querySelectorAll('*')].filter(el => [...el.childNodes].some(node => node.nodeType === 3 && /[\u3400-\u9fff]/.test(node.textContent))).filter(el => !getComputedStyle(el).fontFamily.includes('Chongxi Seal')).map(el => el.tagName),
    }))
    assert.equal(layout.overflow, false, `Horizontal overflow at ${width}`)
    assert.deepEqual(layout.brokenImages, [], `Broken images at ${width}`)
    assert.deepEqual(layout.headings, [], `Heading overflow at ${width}`)
    assert.deepEqual(layout.smallText, [], `Button text overflow at ${width}`)
    assert.equal(layout.fontLoaded, true, 'Local small-seal font failed to load')
    assert.deepEqual(layout.chineseFonts, [], 'Chinese text does not use small-seal font')
    assert.deepEqual(layout.arabicText, [], 'Arabic numerals remain in visible page text')
    const seal = await page.locator('.closing-signature').evaluate(el => {
      const grid = el.querySelector('.seal-characters')
      const style = getComputedStyle(grid), rect = el.getBoundingClientRect()
      return { columns: style.gridTemplateColumns.split(' ').length, rows: style.gridTemplateRows.split(' ').length, square: Math.abs(rect.width - rect.height) < 1, glyphs: [...grid.children].map(child => child.textContent) }
    })
    assert.deepEqual(seal, { columns: 2, rows: 2, square: true, glyphs: ['山', '水', '之', '間'] })
    if (width === 1440 || width === 390) await page.locator('.closing').screenshot({ path: new URL(`seal-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') })
    assert.deepEqual(errors, [], `Browser errors at ${width}`)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(1200)
    if (width === 1440 || width === 390) {
      await page.screenshot({ path: new URL(`full-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true })
      await page.waitForTimeout(600)
      const hidden = await page.locator('[data-reveal],.hero-title-line').evaluateAll(elements => elements.filter(el => Number(getComputedStyle(el).opacity) < 0.99).map(el => el.className))
      assert.deepEqual(hidden, [], 'Previously revealed content became hidden after viewport resize')
      assert.deepEqual(await page.locator('[data-count]').allTextContents(), ['三', '二', '四'], 'Counter reset after responsive animation teardown')
    }
    if (width === 1440) {
      await page.waitForFunction(() => {
        const canvas = document.querySelector('canvas.water')
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        return data.some((value, index) => index % 4 === 3 && value > 0)
      }, { timeout: 3000 })
      const waterPixels = await page.locator('canvas.water').evaluate(canvas => {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        let nonblank = 0
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) nonblank++
        return nonblank
      })
      assert.ok(waterPixels > 100, 'Water canvas is blank')
      await page.getByRole('button', { name: '观展导览', exact: true }).click()
      await page.getByRole('dialog').waitFor()
      assert.equal(await page.getByRole('dialog').getByRole('heading', { name: '一卷山水，如何观之' }).count(), 1)
      for (let i = 0; i < 9; i++) await page.keyboard.press('Tab')
      assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog')), 'Dialog focus escaped')
      await escape(page)
      assert.equal(await page.getByRole('dialog').count(), 0)
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), '观展导览')
      record('Dialog', 'Guide opens, focus stays inside, Escape closes and focus returns')

      await page.getByRole('button', { name: '收藏远岫含烟', exact: true }).click()
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('shanshui-favorites'))), ['mountain'])
      await page.reload()
      await page.waitForLoadState('networkidle')
      assert.equal(await page.getByRole('button', { name: '取消收藏远岫含烟' }).getAttribute('aria-pressed'), 'true')
      await page.getByRole('button', { name: /我的册页/ }).first().click()
      await page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${traditional('远岫含烟')}`) }).click()
      assert.equal(await page.getByRole('dialog').getByRole('heading', { name: '远岫含烟' }).count(), 1)
      await escape(page)
      record('Favorites', 'Collection saved locally, survives reload and opens artwork detail')

      await page.getByRole('button', { name: '下一幅画境', exact: true }).click()
      await settle(page)
      assert.equal(await page.locator('.scene-counter').innerText(), '二 / 三')
      assert.equal(await page.locator('.scene-title h3').innerText(), traditional('烟水归舟'))
      await page.getByRole('button', { name: '切换到松风入怀' }).click()
      await settle(page)
      assert.equal(await page.locator('.scene-title h3').innerText(), traditional('松风入怀'))
      await page.getByRole('button', { name: '细看此景' }).click()
      assert.equal(await page.getByRole('dialog').getByRole('heading', { name: '松间有声' }).count(), 1)
      await escape(page)
      await page.getByRole('button', { name: '上一幅画境' }).click()
      await settle(page)
      assert.equal(await page.locator('.scene-counter').innerText(), '二 / 三')
      record('Scenes', 'Next, previous, direct selection and scene-specific detail work')

      await page.getByRole('button', { name: '九月，二百四十六人次' }).focus()
      assert.match(await page.locator('.chart-tooltip').textContent(), /二百四十六/)
      assert.equal(await page.getByRole('button', { name: '九月，二百四十六人次' }).getAttribute('aria-pressed'), 'true')
      record('Chart', 'Keyboard focus highlights correct month and 246 person-visits')
      await page.getByRole('button', { name: '观展簿下一页' }).click()
      await settle(page)
      assert.equal(await page.locator('.ledger-records tbody tr').count(), 6)
      assert.equal(await page.locator('.ledger-records tbody tr').last().locator('td').innerText(), '二百四十六')
      await page.waitForTimeout(800)
      await page.screenshot({ path: new URL('ledger.png', output).pathname.replace(/^\/(\w:)/, '$1') })
      await page.getByRole('button', { name: '合上观展簿' }).click()
      await settle(page)
      assert.equal(await page.locator('.ledger-pages').isVisible(), false)
      await page.getByRole('button', { name: '打开观展簿', exact: true }).first().click()
      await settle(page)
      await page.getByRole('button', { name: '观展簿上一页' }).click()
      await settle(page)
      assert.equal(await page.locator('.visit-chart').count(), 1)
      record('Classical ledger', 'Cover closes/reopens; page turning shows six correct monthly records and returns to chart')
      await page.getByRole('button', { name: '展开一水知秋' }).click()
      await settle(page)
      assert.equal(await page.locator('.scroll-colophon h3').innerText(), traditional('一水知秋'))
      await page.getByRole('button', { name: '收起画卷' }).click()
      assert.equal(await page.locator('#collection-scroll').getAttribute('inert'), '')
      await page.waitForTimeout(1000)
      await page.getByRole('button', { name: '展开画卷', exact: true }).click()
      await page.waitForTimeout(1000)
      assert.equal(await page.locator('#collection-scroll').getAttribute('aria-hidden'), 'false')
      await page.getByRole('button', { name: '细观此卷' }).click()
      assert.equal(await page.locator('.artwork-book').count(), 1)
      await page.waitForTimeout(800)
      await page.screenshot({ path: new URL('detail-book.png', output).pathname.replace(/^\/(\w:)/, '$1') })
      await escape(page)
      record('Handscroll and art book', 'Volume selection, roll closed/open, inert closed content, correct two-page artwork detail')
      await page.getByRole('button', { name: '联系与反馈' }).click()
      await page.getByRole('button', { name: '保存到本机' }).click()
      assert.match(await page.locator('#feedback-error').innerText(), /至少 五/)
      await page.getByLabel('观展感受', { exact: true }).fill('山水之间，想再停留一会儿。')
      await page.getByRole('button', { name: '保存到本机' }).click()
      assert.equal(await page.getByRole('dialog').count(), 0)
      assert.equal(await page.evaluate(() => localStorage.getItem('shanshui-feedback')), '山水之间，想再停留一会儿。')
      record('Feedback', 'Empty input is rejected; valid input is saved locally with honest status')
      await page.getByRole('button', { name: '暂停动态效果' }).click()
      assert.equal(await page.locator('.gallery').getAttribute('data-motion'), 'off')
      assert.deepEqual(await page.locator('[data-count]').allTextContents(), ['三', '二', '四'], 'Paused counters became inaccurate')
      assert.equal(await page.locator('#hero-title').evaluate(el => getComputedStyle(el).opacity), '1')
      await page.getByRole('button', { name: '播放动态效果' }).click()
      record('Motion preference', `Manual pause/resume works; water canvas contains ${waterPixels} painted pixels`)
      const copy = []
      copy.push(await page.locator('body').innerText())
      for (const name of ['观展导览', '我的册页', '展馆手记', '作品说明', '联系与反馈']) {
        await page.getByRole('button', { name, exact: true }).first().click()
        copy.push(await page.getByRole('dialog').innerText())
        await escape(page)
      }
      for (const name of ['远岫含烟', '一水知秋', '松间有声']) {
        await page.getByRole('button', { name: `展开${name}` }).click()
        await settle(page)
        await page.getByRole('button', { name: '细观此卷' }).click()
        copy.push(await page.getByRole('dialog').innerText())
        await escape(page)
      }
      await writeFile(new URL('copy.json', output), JSON.stringify(copy))
      assert.equal(copy.some(text => /\d/.test(text)), false, 'Arabic numerals remain in dialogs or details')
      record('Chinese numerals and seal', 'Visible page/dialog numbers are Chinese; animated counters retain correct values; four seal glyphs form a square two-by-two grid')
    }
    if (width === 390) {
      await page.getByRole('button', { name: '打开菜单' }).click()
      assert.equal(await page.getByRole('button', { name: '关闭菜单', exact: true }).getAttribute('aria-expanded'), 'true')
      for (let i = 0; i < 9; i++) await page.keyboard.press('Tab')
      assert.ok(await page.evaluate(() => !!document.activeElement.closest('#mobile-menu')), 'Mobile focus escaped')
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('#mobile-menu').count(), 0)
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), '打开菜单')
      await page.getByRole('button', { name: '打开菜单' }).click()
      await page.locator('#mobile-menu').getByRole('link', { name: /移步换景/ }).click()
      assert.equal(await page.locator('#mobile-menu').count(), 0)
      assert.equal(await page.evaluate(() => location.hash), '#scenes')
      await page.locator('.scroll-view').evaluate(element => {
        const start = new Touch({ identifier: 1, target: element, clientX: 250, clientY: 100 })
        const end = new Touch({ identifier: 1, target: element, clientX: 90, clientY: 100 })
        element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }))
        element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }))
      })
      assert.equal(await page.locator('.scene-counter').innerText(), '二 / 三')
      record('Mobile menu and swipe', 'Menu opens/closes, traps focus, responds to Escape and anchors; scene swipe works')
    }
    record(`Viewport ${width}`, 'Next-section hint visible; no overflow, heading truncation, missing images or browser errors; local font loaded')
    await context.close()
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(base); await page.waitForLoadState('networkidle')
  assert.equal(await page.locator('.gallery').getAttribute('data-motion'), 'off')
  assert.equal(await page.locator('.mist').first().evaluate(el => getComputedStyle(el).display), 'none')
  assert.equal(await page.locator('.hero-title-line').first().evaluate(el => getComputedStyle(el).opacity), '1')
  assert.equal(await page.locator('.scroll-painting').evaluate(el => getComputedStyle(el).clipPath), 'none')
  assert.deepEqual(await page.locator('[data-count]').allTextContents(), ['三', '二', '四'])
  await page.getByRole('button', { name: '下一幅画境' }).click()
  assert.equal(await page.locator('.scene-title h3').innerText(), traditional('烟水归舟'))
  record('Reduced motion', 'No mist/parallax/scroll mask, text and accurate numbers immediately visible; interactions work')
  await context.close()

  const fallback = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const staticPage = await fallback.newPage()
  let injected = false
  await staticPage.route(/\/src\/hooks\/useMotion\.ts(?:\?.*)?$/, async route => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/try\s*\{\s*media\.add\(/,
      'try { throw new Error("Simulated animation initialization failure"); media.add(')
    assert.ok(body.includes('Simulated animation'), 'Fault injection did not match Vite response')
    injected = true
    await route.fulfill({ response, body })
  })
  await staticPage.goto(base); await staticPage.waitForLoadState('networkidle')
  assert.equal(injected, true, 'Animation hook request was not intercepted')
  assert.equal(await staticPage.locator('.hero-title-line').first().evaluate(el => getComputedStyle(el).opacity), '1')
  await staticPage.getByRole('button', { name: '观展导览', exact: true }).click()
  assert.equal(await staticPage.getByRole('dialog').count(), 1)
  await escape(staticPage)
  record('Animation failure fallback', 'Injected initialization exception; headline and guide remain visible and usable')
  await fallback.close()
} catch (error) {
  failures.push({ error: error.stack || String(error) })
  console.error(error)
} finally {
  await browser.close()
  await writeFile(new URL('report.json', output), JSON.stringify({ results, failures }, null, 2))
  console.log(JSON.stringify({ passed: results.length, failures }, null, 2))
  if (failures.length) process.exitCode = 1
}

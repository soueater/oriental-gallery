import sharp from 'sharp'
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const assets = resolve('public/assets')
await mkdir(assets, { recursive: true })
const originals = resolve('design/original-assets')
await mkdir(originals, { recursive: true })
const input = [
  ['hero', process.argv[2]],
  ['scroll', process.argv[3]],
  ['hero-background', process.argv[4]],
  ['hero-foreground', process.argv[5]],
]
for (const [name, file] of input) {
  if (!file) {
    if (name === 'hero' || name === 'scroll') throw new Error(`Missing ${name} image path`)
    continue
  }
  await copyFile(file, resolve(originals, `${name}-original.png`))
  for (const width of [768, 1536]) {
    await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 85 }).toFile(resolve(assets, `${name}-${width}.webp`))
  }
}

const content = await readFile('src/content.ts', 'utf8') + await readFile('src/App.tsx', 'utf8')
const chinese = [...new Set(content.match(/[\u3400-\u9FFF]/g) || [])].join('')
const query = new URLSearchParams({ family: 'Noto Serif SC:wght@400;600', text: chinese, display: 'swap' })
const response = await fetch(`https://fonts.googleapis.com/css2?${query}`, {
  headers: { 'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
})
if (!response.ok) throw new Error(`Font metadata request failed: ${response.status}`)
const css = await response.text()
const url = css.match(/url\((https:[^)]+)\)/)?.[1]
if (!url) throw new Error('Font URL missing from Google Fonts CSS')
const font = await fetch(url)
if (!font.ok) throw new Error(`Font download failed: ${font.status}`)
await writeFile(resolve(assets, 'serif-subset.woff2'), Buffer.from(await font.arrayBuffer()))
const license = await fetch('https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Serif/LICENSE')
if (license.ok) await writeFile(resolve(assets, 'FONT-LICENSE.txt'), await license.text())
console.log('Two original landscapes, responsive WebP assets and a local Chinese serif subset prepared.')

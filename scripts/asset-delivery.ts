import type { Plugin } from 'vite'
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { resolve, relative, extname, sep } from 'node:path'
import { promisify } from 'node:util'
import { gzip, brotliCompress, constants } from 'node:zlib'

const zip = promisify(gzip), brotli = promisify(brotliCompress)
const types: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.svg': 'image/svg+xml' }

export function assetDelivery(): Plugin {
  let output = ''
  let building = false
  return {
    name: 'gallery-asset-delivery',
    configResolved(config) { output = resolve(config.root, config.build.outDir); building = config.command === 'build' },
    async closeBundle() {
      if (!building) return
      const report: Array<{ file: string; original: number; gzip: number; brotli: number }> = []
      const compress = async (directory: string): Promise<void> => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const path = resolve(directory, entry.name)
          if (entry.isDirectory()) { await compress(path); continue }
          if (!types[extname(path)]) continue
          const source = await readFile(path)
          if (source.length < 1024) continue
          const gz = await zip(source, { level: 9 })
          const br = await brotli(source, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
          await writeFile(`${path}.gz`, gz)
          await writeFile(`${path}.br`, br)
          report.push({ file: relative(output, path).split(sep).join('/'), original: source.length, gzip: gz.length, brotli: br.length })
        }
      }
      await compress(output)
      await writeFile(resolve(output, 'delivery-summary.json'), JSON.stringify(report, null, 2))
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!['GET', 'HEAD'].includes(request.method || '') || request.headers.range) { next(); return }
        try {
          const url = new URL(request.url || '/', 'http://localhost')
          const pathname = decodeURIComponent(url.pathname)
          if (!pathname.startsWith('/assets/')) { next(); return }
          const target = resolve(output, `.${pathname}`)
          if (!target.startsWith(`${output}${sep}`)) { next(); return }
          const asset = await stat(target).catch(error => {
            if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null
            throw error
          })
          if (!asset?.isFile()) {
            response.statusCode = 404
            response.setHeader('Cache-Control', 'no-store')
            response.end()
            return
          }
          const versioned = /-[\w-]{8,}\.(js|css)$/.test(pathname) || (pathname.endsWith('chongxi-seal.otf') && url.searchParams.get('v') === '1.0')
          response.setHeader('Cache-Control', versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=86400')
          const mime = types[extname(target)]
          if (!mime) { next(); return }
          const preferences = (request.headers['accept-encoding'] || '').split(',').map(value => {
            const [name, ...options] = value.trim().split(';')
            const q = options.find(option => option.trim().startsWith('q='))
            return { name, q: q ? Number(q.trim().slice(2)) : 1 }
          })
          const quality = (name: string) => (preferences.find(item => item.name === name) || preferences.find(item => item.name === '*'))?.q || 0
          const encoding = ['br', 'gzip'].filter(name => quality(name) > 0).sort((a, b) => quality(b) - quality(a))[0]
          response.setHeader('Vary', 'Accept-Encoding')
          if (!encoding) { next(); return }
          const compressed = `${target}.${encoding === 'br' ? 'br' : 'gz'}`
          const metadata = await stat(compressed)
          const etag = `"${metadata.size.toString(16)}-${Math.trunc(metadata.mtimeMs).toString(16)}-${encoding}"`
          response.setHeader('Content-Type', mime)
          response.setHeader('Content-Encoding', encoding)
          response.setHeader('ETag', etag)
          if (request.headers['if-none-match'] === etag) { response.statusCode = 304; response.end(); return }
          response.setHeader('Content-Length', metadata.size)
          if (request.method === 'HEAD') { response.end(); return }
          const stream = createReadStream(compressed)
          stream.on('error', () => response.destroy())
          response.on('close', () => stream.destroy())
          stream.pipe(response)
        } catch { next() }
      })
    },
  }
}

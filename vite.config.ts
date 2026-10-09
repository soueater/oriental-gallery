import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { assetDelivery } from './scripts/asset-delivery.ts'

export default defineConfig({
  plugins: [react({ jsxImportSource: '@seal' }), assetDelivery(), {
    name: 'live-seal-typography',
    configResolved(config) {
      // Local JSX adapters must remain source modules, not cached dependencies.
      config.optimizeDeps.include = config.optimizeDeps.include?.filter(id => !id.startsWith('@seal/'))
    },
  }],
  resolve: { alias: { '@seal': new URL('./src/typography', import.meta.url).pathname.replace(/^\/(\w:)/, '$1') } },
  optimizeDeps: { exclude: ['@seal/jsx-runtime', '@seal/jsx-dev-runtime'] },
  server: { port: 5180, strictPort: true, watch: { ignored: ['**/test-results/**', '**/design/**', '**/tests/**'] } },
})

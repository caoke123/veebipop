import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'src/test/setup.ts')],
    globals: true,
    exclude: ['e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
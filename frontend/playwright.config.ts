import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start -- -p 3002',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
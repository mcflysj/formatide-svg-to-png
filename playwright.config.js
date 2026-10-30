import { defineConfig, devices } from '@playwright/test'

const remote = process.env.DEMO_BASE_URL
export default defineConfig({
  testDir: './tests',
  workers: 2,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: { baseURL: remote || 'http://127.0.0.1:8086', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: process.platform === 'darwin' ? 'chrome' : undefined } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: remote ? undefined : { command: 'python3 -m http.server 8086 --bind 127.0.0.1 --directory _site', url: 'http://127.0.0.1:8086', reuseExistingServer: false },
})

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run start -- -p 3100',
    env: {
      ...process.env,
      NEXT_PUBLIC_USE_APP_API: process.env.NEXT_PUBLIC_USE_APP_API || 'true',
      ADVOCACY_ADMIN_WALLETS: process.env.ADVOCACY_ADMIN_WALLETS || '0xadmin-test,0xlegal-test',
      ADVOCACY_LEGAL_OPS_WALLETS: process.env.ADVOCACY_LEGAL_OPS_WALLETS || '0xlegal-test',
      ADVOCACY_PAYMENT_WEBHOOK_SECRET: process.env.ADVOCACY_PAYMENT_WEBHOOK_SECRET || 'test-webhook-secret',
      MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET: process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET || 'test-materials-webhook-secret'
    },
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});

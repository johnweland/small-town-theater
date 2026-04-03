import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";
const e2ePort = 3100;
const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: e2eBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: `E2E_TEST_MODE=1 NEXT_PUBLIC_E2E_TEST_MODE=1 npm run build && E2E_TEST_MODE=1 NEXT_PUBLIC_E2E_TEST_MODE=1 npm run start -- --hostname 127.0.0.1 --port ${e2ePort}`,
        url: e2eBaseUrl,
        reuseExistingServer: false,
      },
});

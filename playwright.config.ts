import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: { ...devices['Desktop Chrome'] },
  webServer: [
    { command: 'node tests/e2e/serve.mjs dist 4321', port: 4321, reuseExistingServer: false },
    { command: 'node tests/e2e/serve.mjs dist-fixtures 4322', port: 4322, reuseExistingServer: false },
  ],
});

// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Directory for test files
  timeout: 30 * 1000, // Maximum test time (30 seconds)
  retries: 1, // Retry failed tests once
  use: {
    headless: true, // Run in headless mode
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true, // Ignore HTTPS errors
    baseURL: 'http://localhost:3000', // Base URL for your app
  },
});
/* eslint-env node */
/* eslint-disable no-undef */
// If running in Node.js, you may need to register tsconfig-paths or module-alias to use @ aliases.
// Example: require('tsconfig-paths/register');
const dotenv = require('dotenv');
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';
dotenv.config({ path: envFile });

// This file should be renamed to playwright.config.cjs for compatibility with ES module projects.
// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './e2e',
  testMatch: /.*\.spec\.(js|ts)$/,
  timeout: 30000,
  retries: 0,
  use: {
    // Use TEST_MODE from environment files, with SHOW_BROWSER as override
    // SHOW_BROWSER=true forces headed mode regardless of TEST_MODE
    // SHOW_BROWSER=false respects TEST_MODE setting
    headless:
      process.env.SHOW_BROWSER === 'true'
        ? false
        : process.env.TEST_MODE === 'headless' || !process.env.TEST_MODE,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: process.env.COLLECT_VIDEO === 'true' ? 'on' : 'off',
  },
  globalSetup: require.resolve('./playwright.global-setup.cjs'),
};

// Warn if TEST_MODE=ui but not running with --ui flag
// Check for --ui flag in process.argv and also check if we're in UI mode via environment
const isRunningUI = process.argv.includes('--ui') || process.env.PLAYWRIGHT_UI_MODE === '1';
if (process.env.TEST_MODE === 'ui' && !isRunningUI) {
  console.warn('\x1b[33m⚠️  TEST_MODE=ui is set, but Playwright is not running in UI mode.\x1b[0m');
  console.warn(
    '\x1b[33m   Use `npm run test:pw:ui` or `npm run test:pw:ui:dev` to launch Playwright UI mode.\x1b[0m'
  );
  console.warn('\x1b[33m   Or run `playwright test --ui` directly.\x1b[0m\n');
}

// Log the headless mode decision for debugging
if (process.env.SHOW_BROWSER === 'true') {
  console.log('\x1b[36mℹ️  SHOW_BROWSER=true: Forcing headed mode regardless of TEST_MODE\x1b[0m');
} else if (process.env.TEST_MODE === 'headed') {
  console.log('\x1b[36mℹ️  TEST_MODE=headed: Running in headed mode\x1b[0m');
} else if (process.env.TEST_MODE === 'headless' || !process.env.TEST_MODE) {
  console.log('\x1b[36mℹ️  TEST_MODE=headless: Running in headless mode\x1b[0m');
}

module.exports = config;

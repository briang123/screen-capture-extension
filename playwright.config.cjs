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
  testDir: './tests',
  testMatch: /.*\.spec\.(js|ts)$/,
  timeout: 30000,
  retries: 0,
  use: {
    headless:
      process.env.CI === 'true' ||
      process.env.GITHUB_ACTIONS === 'true' ||
      process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: process.env.COLLECT_VIDEO === 'true' ? 'on' : 'off',
  },
  globalSetup: require.resolve('./playwright.global-setup.cjs'),
};

module.exports = config;

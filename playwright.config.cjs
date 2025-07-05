/* eslint-env node */
/* eslint-disable no-undef */

// This file should be renamed to playwright.config.cjs for compatibility with ES module projects.
// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */

const config = {
  testDir: './tests',
  testMatch: /.*\.spec\.(js|ts)$/,
  timeout: 30000,
  retries: 0,

  // Base configuration for all modes
  use: {
    connectOptions: {
      wsEndpoint: 'ws://localhost:9222/devtools/browser',
    },
    headless:
      process.env.TEST_MODE === 'headed' ? false : process.env.TEST_MODE === 'ui' ? false : true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: process.env.COLLECT_VIDEO === 'true' ? 'on' : 'off',
    trace: process.env.TEST_MODE === 'ui' ? 'on' : 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Projects for different UI modes
  projects: [
    {
      name: 'popup-mode',
      use: {
        connectOptions: {
          wsEndpoint: 'ws://localhost:9222/devtools/browser',
        },
        headless:
          process.env.TEST_MODE === 'headed'
            ? false
            : process.env.TEST_MODE === 'ui'
              ? false
              : true,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
        video: process.env.COLLECT_VIDEO === 'true' ? 'on' : 'off',
        trace: process.env.TEST_MODE === 'ui' ? 'on' : 'on-first-retry',
        screenshot: 'only-on-failure',
        // Test popup interface
        launchOptions: {
          args: [
            '--enable-extensions',
            '--disable-extensions-except=./dist',
            '--load-extension=./dist',
          ],
        },
      },
    },
    {
      name: 'sidebar-mode',
      use: {
        connectOptions: {
          wsEndpoint: 'ws://localhost:9222/devtools/browser',
        },
        headless:
          process.env.TEST_MODE === 'headed'
            ? false
            : process.env.TEST_MODE === 'ui'
              ? false
              : true,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
        video: process.env.COLLECT_VIDEO === 'true' ? 'on' : 'off',
        trace: process.env.TEST_MODE === 'ui' ? 'on' : 'on-first-retry',
        screenshot: 'only-on-failure',
        // Test sidebar overlay
        launchOptions: {
          args: [
            '--enable-extensions',
            '--disable-extensions-except=./dist',
            '--load-extension=./dist',
          ],
        },
      },
    },
    {
      name: 'window-mode',
      use: {
        connectOptions: {
          wsEndpoint: 'ws://localhost:9222/devtools/browser',
        },
        headless:
          process.env.TEST_MODE === 'headed'
            ? false
            : process.env.TEST_MODE === 'ui'
              ? false
              : true,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
        video: process.env.COLLECT_VIDEO === 'true' ? 'on' : 'off',
        trace: process.env.TEST_MODE === 'ui' ? 'on' : 'on-first-retry',
        screenshot: 'only-on-failure',
        // Test new window interface
        launchOptions: {
          args: [
            '--enable-extensions',
            '--disable-extensions-except=./dist',
            '--load-extension=./dist',
          ],
        },
      },
    },
  ],

  globalSetup: require.resolve('./playwright.global-setup.cjs'),
};

module.exports = config;

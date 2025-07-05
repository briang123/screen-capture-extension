'use strict';
const path = require('path');
const chromeLauncher = require('chrome-launcher');
const process = require('process');
const console = require('console');
const __dirname = path.resolve();
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const extensionPath = path.resolve(__dirname, '../dist');
const testUrl = process.env.TEST_URL || 'https://cleanshot.com';

(async () => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions-file-access-check',
      '--disable-extensions-http-throttling',
      '--allow-running-insecure-content',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--allow-legacy-extension-manifests',
      `--app=${testUrl}?test=1`,
    ],
    startingUrl: `${testUrl}?test=1`,
    logLevel: 'info',
    // headless: false, // Set to true if you want headless
  });
  console.log('Chrome launched for Playwright tests. PID:', chrome.pid);
  // Keep process alive
  process.stdin.resume();
})();

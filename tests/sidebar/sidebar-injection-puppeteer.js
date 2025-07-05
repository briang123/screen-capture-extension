const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const TEST_URL = 'https://cleanshot.com/';
const EXTENSION_PATH = path.resolve(__dirname, '../../dist');
const SIDEBAR_ROOT_SELECTOR = '#sc-sidebar-root';
const SYSTEM_CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const MANUAL_PROFILE_DIR = path.resolve(__dirname, '../../.pw-manual-test-profile');

(async () => {
  if (!fs.existsSync(EXTENSION_PATH)) {
    console.error('[DEBUG] Extension build directory ./dist does not exist!');
    process.exit(1);
  }
  if (!fs.existsSync(path.join(EXTENSION_PATH, 'manifest.json'))) {
    console.error('[DEBUG] manifest.json not found in ./dist!');
    process.exit(1);
  }
  console.log('[DEBUG] Extension build and manifest.json found.');
  console.log('[DEBUG] Using system Chrome executable:', SYSTEM_CHROME_PATH);
  console.log('[DEBUG] Using user data dir:', MANUAL_PROFILE_DIR);

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: SYSTEM_CHROME_PATH,
    userDataDir: MANUAL_PROFILE_DIR,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[PAGE ERROR]', msg.text());
    }
  });
  await page.goto(TEST_URL);
  console.log('[DEBUG] Navigated to', page.url());

  try {
    await page.waitForSelector(SIDEBAR_ROOT_SELECTOR, { timeout: 15000, visible: true });
    console.log('[DEBUG] Sidebar root found and visible.');
  } catch (err) {
    console.error('[DEBUG] Sidebar root NOT found. Taking screenshot for diagnostics.');
    await page.screenshot({ path: 'sidebar-injection-puppeteer-fail.png' });
    throw err;
  } finally {
    await browser.close();
  }
})();

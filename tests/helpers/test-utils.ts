import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import { TEST_URL, EXTENSION_ID_PATTERN } from './test-constants';
import {
  getImageByPosition,
  getSelectedImage,
  getSelectedImageOpenButton,
  getSelectedImageCopyButton,
  getSelectedImageDeleteButton,
  SIDEBAR_CAPTURE_BUTTON_SELECTOR,
  AREA_CAPTURE_BUTTON_SELECTOR,
  SCREENSHOT_THUMBNAIL_SELECTOR,
} from './test-selectors';
import type { BrowserContext, Page, ConsoleMessage, ElementHandle } from '@playwright/test';
import { expect } from '@playwright/test';

declare global {
  interface Window {
    SC_DEV_MODE?: boolean;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extensionPath = path.resolve(__dirname, '..', '..', 'dist');
export const userDataDir = path.join(process.cwd(), '.pw-chrome-profile');

export function getLaunchArgs() {
  const args = [
    // Essential extension loading arguments
    '--enable-extensions',
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
    // Additional arguments for better extension support
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--safebrowsing-disable-auto-update',
    '--allow-legacy-extension-manifests',
  ];

  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const shouldUseHeadless = isCI || process.env.HEADLESS === 'true';

  if (shouldUseHeadless) {
    // Use --headless=new for better extension support
    args.push('--headless=new');
    // Additional headless-specific arguments
    args.push('--disable-gpu');
    args.push('--disable-software-rasterizer');
    args.push('--disable-background-timer-throttling');
    args.push('--disable-backgrounding-occluded-windows');
    args.push('--disable-renderer-backgrounding');
  }

  if (process.env.DEVTOOLS === '1') {
    args.push('--auto-open-devtools-for-tabs');
  }

  return args;
}

export async function getExtensionId(context: BrowserContext): Promise<string | null> {
  console.log('Getting extension ID...');

  // Wait a bit for extension to load
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Try multiple times to get the extension ID
  for (let attempt = 0; attempt < 15; attempt++) {
    console.log(`Attempt ${attempt + 1} to get extension ID...`);

    // Method 1: Check background pages and service workers
    const allTargets = [...context.backgroundPages(), ...context.serviceWorkers()];
    console.log(`Found ${allTargets.length} targets (background pages + service workers)`);

    for (const target of allTargets) {
      const url = target.url();
      console.log('Target URL:', url);
      const match = url.match(EXTENSION_ID_PATTERN);
      if (match) {
        console.log('Extension ID found from target URL:', match[1]);
        return match[1];
      }
    }

    // Method 2: Try to get extension ID from chrome.management API
    try {
      const page = await context.newPage();
      // Try to access chrome://extensions/ but handle the error gracefully
      try {
        await page.goto('chrome://extensions/');

        // Wait for extensions page to load
        await page.waitForTimeout(2000);

        // Try to get extension ID from the page
        const extensionIdFromPage = await page.evaluate(() => {
          // Look for extension cards and extract IDs
          const cards = document.querySelectorAll('.extension-card');
          for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const idElement = card.querySelector('.extension-id');
            if (idElement) {
              return idElement.textContent?.trim();
            }
          }
          return null;
        });

        if (extensionIdFromPage) {
          console.log('Extension ID found from extensions page:', extensionIdFromPage);
          await page.close();
          return extensionIdFromPage;
        }
      } catch {
        console.log('Chrome://extensions/ not accessible, skipping this method');
      }

      await page.close();
    } catch (error) {
      console.log('Error getting extension ID from chrome://extensions/:', error);
    }

    // Method 3: Try to get extension ID from chrome.runtime.id in a test page
    try {
      const page = await context.newPage();
      await page.goto(
        'data:text/html,<html><body><script>console.log(chrome.runtime.id);</script></body></html>'
      );

      // Wait for any console messages
      await page.waitForTimeout(1000);

      // Check if we can access chrome.runtime.id
      const runtimeId = await page.evaluate(() => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          return chrome.runtime.id;
        }
        return null;
      });

      if (runtimeId) {
        console.log('Extension ID found from chrome.runtime.id:', runtimeId);
        await page.close();
        return runtimeId;
      }

      await page.close();
    } catch (error) {
      console.log('Error getting extension ID from chrome.runtime.id:', error);
    }

    // Wait before next attempt
    if (attempt < 14) {
      console.log('Waiting before next attempt...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log('Failed to get extension ID after all attempts');
  return null;
}

export async function launchExtensionContext(): Promise<BrowserContext> {
  // Only use headless mode if explicitly requested
  const shouldUseHeadless = process.env.HEADLESS === 'true';
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

  console.log('Launching Chrome with extension support...');
  console.log('Extension path:', extensionPath);
  console.log('Headless mode:', shouldUseHeadless);
  console.log('CI environment:', isCI);

  // Check if extension directory exists and has required files
  const fs = await import('fs');
  const manifestPath = path.join(extensionPath, 'manifest.json');
  const backgroundPath = path.join(extensionPath, 'background.js');

  console.log('Checking extension files...');
  console.log('Manifest exists:', fs.existsSync(manifestPath));
  console.log('Background script exists:', fs.existsSync(backgroundPath));

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Extension manifest not found at ${manifestPath}`);
  }

  if (!fs.existsSync(backgroundPath)) {
    throw new Error(`Extension background script not found at ${backgroundPath}`);
  }

  const contextOptions: Parameters<typeof chromium.launchPersistentContext>[1] = {
    headless: shouldUseHeadless,
    args: getLaunchArgs(),
  };

  if (process.env.COLLECT_VIDEO === 'true') {
    contextOptions.recordVideo = {
      dir: path.resolve(__dirname, '..', '..', 'tests', 'media'),
    };
  }

  const context = await chromium.launchPersistentContext(userDataDir, contextOptions);

  // Log context info
  console.log('Chrome context created successfully');
  console.log('Background pages:', context.backgroundPages().length);
  console.log('Service workers:', context.serviceWorkers().length);

  return context;
}

export async function setupExtensionPage(
  context: BrowserContext,
  devMode: boolean = true
): Promise<Page> {
  const page = await context.newPage();
  // Logging
  page.on('console', (msg: ConsoleMessage) => {
    const type = msg.type();
    const location = msg.location();
    console.log(`[PAGE ${type.toUpperCase()}]`, msg.text(), location);
  });
  // Dev mode flag
  await page.addInitScript((mode: boolean) => {
    window.SC_DEV_MODE = mode;
  }, devMode);
  // Go to test page
  await page.goto(TEST_URL);
  return page;
}

export async function triggerSidebarOverlay(page: Page, extensionId: string): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Runtime.evaluate', {
    expression: `chrome.runtime.sendMessage('${extensionId}', { action: 'openSidebar' });`,
    includeCommandLineAPI: true,
  });
}

export type CaptureButtonSelector =
  | typeof SIDEBAR_CAPTURE_BUTTON_SELECTOR
  | typeof AREA_CAPTURE_BUTTON_SELECTOR;

export async function captureImage(
  page: Page,
  buttonSelector: CaptureButtonSelector = SIDEBAR_CAPTURE_BUTTON_SELECTOR
): Promise<ElementHandle | null> {
  console.log(`Starting captureImage function with selector: ${buttonSelector}`);

  // Wait for the correct capture button to be available
  console.log(`Waiting for button ${buttonSelector}...`);
  await page.waitForSelector(buttonSelector, { timeout: 15000 });
  console.log('Capture button found!');

  // Wait a bit more for the button to be fully interactive
  await page.waitForTimeout(2000);

  // Click the button
  await page.click(buttonSelector);
  console.log('Button clicked successfully');

  // Wait for the thumbnail to appear in the sidebar
  await page.waitForSelector(SCREENSHOT_THUMBNAIL_SELECTOR, { timeout: 7000 });
  console.log('Screenshot thumbnail found');

  return page.$(SCREENSHOT_THUMBNAIL_SELECTOR);
}

export async function selectImageByPosition(
  page: Page,
  position: number
): Promise<ElementHandle | null> {
  const selector = getImageByPosition(position);
  await page.click(selector);
  return page.$(getSelectedImage());
}

export async function clickSelectedImageOpenButton(page: Page): Promise<void> {
  await page.click(getSelectedImageOpenButton());
}

export async function clickSelectedImageCopyButton(page: Page): Promise<void> {
  await page.click(getSelectedImageCopyButton());
}

export async function clickSelectedImageDeleteButton(page: Page): Promise<void> {
  await page.click(getSelectedImageDeleteButton());
}

export function isDirectScriptRun(
  importMetaUrl: string = import.meta.url,
  argv1: string = process.argv[1]
): boolean {
  return importMetaUrl === `file://${argv1}`;
}

function getTimestampString(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('-');
}

export function generateTestArtifactFilename(
  testInfo: { status: string; title: string },
  ext: string = 'png'
): string {
  const timestamp = getTimestampString();
  const status = testInfo.status === 'passed' ? 'passed' : 'failed';
  const testName = testInfo.title.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${timestamp}-${testName}-${status}.${ext}`;
}

/**
 * Simulates a mouse drag to select an area on the page.
 * @param page - The Playwright page object
 * @param startX - The starting x coordinate
 * @param startY - The starting y coordinate
 * @param endX - The ending x coordinate
 * @param endY - The ending y coordinate
 * @param steps - Number of steps for the drag (default 10)
 */
export async function dragToSelectArea(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  steps: number = 10
): Promise<void> {
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps });
  await page.mouse.up();
}

/**
 * Waits for a button (by selector) to appear and clicks it.
 * @param page Playwright page object
 * @param selector CSS selector for the button
 */
export async function waitForAndClickButton(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.click(selector);
}

export async function captureAndVerifyImage(
  page: Page,
  buttonSelector: CaptureButtonSelector
): Promise<ElementHandle | null> {
  const thumbnail = await captureImage(page, buttonSelector);
  expect(thumbnail).not.toBeNull();
  if (thumbnail) {
    expect(await thumbnail.isVisible()).toBe(true);
  }
  return thumbnail;
}

import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import { TEST_URL, EXTENSION_ID_PATTERN } from './test-constants';
import {
  getButtonByLabel,
  SCREENSHOT_THUMBNAIL_SELECTOR,
  getImageByPosition,
  getSelectedImage,
  getSelectedImageOpenButton,
  getSelectedImageCopyButton,
  getSelectedImageDeleteButton,
} from './test-selectors';
import type { BrowserContext, Page, ConsoleMessage, ElementHandle } from '@playwright/test';

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
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
  ];
  // Add --headless=chrome for better extension support in headless mode
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const shouldUseHeadless = isCI || process.env.HEADLESS === 'true';
  if (shouldUseHeadless) {
    args.push('--headless=chrome');
  }
  if (process.env.DEVTOOLS === '1') {
    args.push('--auto-open-devtools-for-tabs');
  }
  return args;
}

export async function getExtensionId(context: BrowserContext): Promise<string | null> {
  console.log('Getting extension ID...');

  // Wait a bit for extension to load
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Try multiple times to get the extension ID
  for (let attempt = 0; attempt < 5; attempt++) {
    console.log(`Attempt ${attempt + 1} to get extension ID...`);

    const allTargets = [...context.backgroundPages(), ...context.serviceWorkers()];
    console.log(`Found ${allTargets.length} targets (background pages + service workers)`);

    for (const target of allTargets) {
      const url = target.url();
      console.log('Target URL:', url);
      const match = url.match(EXTENSION_ID_PATTERN);
      if (match) {
        console.log('Extension ID found:', match[1]);
        return match[1];
      }
    }

    // Wait before next attempt
    if (attempt < 4) {
      console.log('Waiting before next attempt...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('Extension ID not found after all attempts');
  return null;
}

export async function launchExtensionContext(): Promise<BrowserContext> {
  // Detect CI environment and force headless mode
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const shouldUseHeadless = isCI || process.env.HEADLESS === 'true';

  const contextOptions: Parameters<typeof chromium.launchPersistentContext>[1] = {
    headless: shouldUseHeadless,
    args: getLaunchArgs(),
  };
  if (process.env.COLLECT_VIDEO === 'true') {
    contextOptions.recordVideo = {
      dir: path.resolve(__dirname, '..', '..', 'tests', 'media'),
    };
  }
  return chromium.launchPersistentContext(userDataDir, contextOptions);
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

export async function captureImage(page: Page): Promise<ElementHandle | null> {
  console.log('Starting captureImage function...');

  // Wait for the sidebar to be fully loaded and the capture button to be available
  console.log('Waiting for capture button...');
  await page.waitForSelector('[data-testid="capture-button"]', { timeout: 15000 });
  console.log('Capture button found!');

  // Wait a bit more for the button to be fully interactive
  await page.waitForTimeout(2000);
  console.log('Waited for button to be interactive');

  // Try to find the button and log its state
  const button = page.getByRole('button', getButtonByLabel('capture image'));
  console.log('Looking for button with label "capture image"');

  // Check if button is visible
  const isVisible = await button.isVisible();
  console.log('Button visible:', isVisible);

  await button.click();
  console.log('Button clicked successfully');

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

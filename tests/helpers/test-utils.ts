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

export const extensionPath = path.join(__dirname, '../dist');
export const userDataDir = path.join(__dirname, '../.pw-chrome-profile');

export function getLaunchArgs() {
  const args = [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ];
  if (process.env.DEVTOOLS === '1') {
    args.push('--auto-open-devtools-for-tabs');
  }
  return args;
}

export async function getExtensionId(context: BrowserContext): Promise<string | null> {
  const allTargets = [...context.backgroundPages(), ...context.serviceWorkers()];
  for (const target of allTargets) {
    const url = target.url();
    const match = url.match(EXTENSION_ID_PATTERN);
    if (match) return match[1];
  }
  return null;
}

export async function launchExtensionContext(): Promise<BrowserContext> {
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: getLaunchArgs(),
  });
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
  await page.getByRole('button', getButtonByLabel('capture image')).click();
  await page.waitForSelector(SCREENSHOT_THUMBNAIL_SELECTOR, { timeout: 7000 });
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

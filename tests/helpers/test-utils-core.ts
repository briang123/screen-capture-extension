import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import { TEST_URL, EXTENSION_ID_PATTERN } from './test-constants';
import type { BrowserContext, Page, ConsoleMessage } from '@playwright/test';

// Re-export from specialized utility files
export * from './sidebar-utils';
export * from './capture-utils';
export * from './area-selection-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extensionPath = path.resolve(__dirname, '..', '..', 'dist');
export const userDataDir = path.join(process.cwd(), '.pw-chrome-profile');

/**
 * Returns the launch arguments for Chromium with extension support and test optimizations.
 */
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

/**
 * Attempts to retrieve the extension ID from the browser context using several strategies.
 * @param context Playwright browser context
 * @returns The extension ID as a string, or null if not found
 */
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

/**
 * Launches a persistent Chromium context with the extension loaded.
 * @param customUserDataDir Optional custom user data directory. If not provided, uses the default.
 * @returns The Playwright browser context
 */
export async function launchExtensionContext(customUserDataDir?: string): Promise<BrowserContext> {
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

  const userDataDirToUse = customUserDataDir || userDataDir;
  const context = await chromium.launchPersistentContext(userDataDirToUse, contextOptions);

  // Grant clipboard permissions for the test URL
  if (TEST_URL) {
    try {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: TEST_URL });
      console.log(`Granted clipboard permissions for ${TEST_URL}`);
    } catch (err) {
      console.warn(`Failed to grant clipboard permissions for ${TEST_URL}:`, err);
    }
  }

  // Log context info
  console.log('Chrome context created successfully');
  console.log('Background pages:', context.backgroundPages().length);
  console.log('Service workers:', context.serviceWorkers().length);
  console.log('Initial pages:', context.pages().length);

  return context;
}

/**
 * Sets up a new page in the given context and navigates to the test URL.
 * @param context Playwright browser context
 * @param devMode Whether to enable dev mode (default: true)
 * @returns The Playwright page
 */
export async function setupExtensionPage(
  context: BrowserContext,
  devMode: boolean = true
): Promise<Page> {
  // Try to reuse the initial about:blank page if it exists
  let page: Page | undefined;
  const pages = context.pages();
  if (pages.length === 1 && pages[0].url() === 'about:blank') {
    page = pages[0];
  } else {
    page = await context.newPage();
  }

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

/**
 * Triggers the sidebar overlay in the extension by sending a runtime message.
 * @param page Playwright page object
 * @param extensionId The extension ID
 */
export async function triggerSidebarOverlay(page: Page, extensionId: string): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Runtime.evaluate', {
    expression: `chrome.runtime.sendMessage('${extensionId}', { action: 'openSidebar' });`,
    includeCommandLineAPI: true,
  });
}

/**
 * Returns true if the current script is run directly (not imported).
 * @param importMetaUrl The import.meta.url value
 * @param argv1 The process.argv[1] value
 * @returns True if the script is run directly
 */
export function isDirectScriptRun(
  importMetaUrl: string = import.meta.url,
  argv1: string = process.argv[1]
): boolean {
  return importMetaUrl === `file://${argv1}`;
}

/**
 * Generates a timestamp string in the format YYYY-MM-DD-HH-mm-ss.
 * @returns The timestamp string
 */
export function getTimestampString(): string {
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

export function generateTestArtifactBaseName(artifactInfo: {
  status: string;
  title: string;
}): string {
  // Use the same logic as generateTestArtifactFilename, but do not add an extension
  const { status, title } = artifactInfo;
  // Sanitize title for filenames
  const prettyTitle = title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
  return `${prettyTitle}-${status}`;
}

export function generateTestArtifactFilename(
  artifactInfo: { status: string; title: string },
  ext: string
): string {
  // Use the new base name function and add the extension if provided
  const base = generateTestArtifactBaseName(artifactInfo);
  return ext ? `${base}.${ext}` : base;
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

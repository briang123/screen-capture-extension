import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import { TEST_URL, EXTENSION_ID_PATTERN } from './test-constants';
import type { BrowserContext, Page, ConsoleMessage } from '@playwright/test';
import fs from 'fs';
import os from 'os';

// Re-export from specialized utility files
export * from './sidebar-utils';
export * from './capture-utils';
export * from './area-selection-utils';

/**
 * Sanitizes a string for safe use in filenames.
 * @param str The string to sanitize
 * @returns The sanitized string
 */
export const sanitizeFilename = (str: string) => str.replace(/[^a-zA-Z0-9-_.]/g, '_');

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

/**
 * Generates a base name for test artifacts using status and title.
 * @param artifactInfo Object containing status and title
 * @returns The artifact base name string
 */
export function generateTestArtifactBaseName(artifactInfo: {
  status: string;
  title: string;
}): string {
  const { status, title } = artifactInfo;
  // Sanitize title for filenames
  const prettyTitle = title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
  return `${prettyTitle} [${status}]`;
}

/**
 * Generates a test artifact filename with extension.
 * @param artifactInfo Object containing status and title
 * @param ext File extension
 * @returns The artifact filename string
 */
export function generateTestArtifactFilename(
  artifactInfo: { status: string; title: string },
  ext: string
): string {
  // Use the new base name function and add the extension if provided
  const base = generateTestArtifactBaseName(artifactInfo);
  return ext ? `${base}.${ext}` : base;
}

/**
 * Generates a timestamped artifact base name for test outputs.
 * @param testInfo Object containing status and title
 * @returns The artifact base name string
 */
export const getArtifactBaseName = (testInfo: { status?: string; title?: string }) => {
  const timestamp = getTimestampString();
  return `[${timestamp}] ${generateTestArtifactBaseName({
    status: testInfo.status ? testInfo.status.toUpperCase() : 'UNKNOWN',
    title: testInfo.title || 'unknown',
  })}`;
};

/**
 * Generates a log file path for a test, ensuring the results directory exists.
 * @param testInfo Object containing test title
 * @param currentTestTimestamp Optional timestamp string for the test
 * @returns The log file path
 */
export const getTestLogFile = (testInfo?: { title?: string }, currentTestTimestamp?: string) => {
  const timestamp = currentTestTimestamp || new Date().toISOString().replace(/[:.]/g, '-');
  const title = testInfo?.title ? sanitizeFilename(testInfo.title) : 'unknown';
  const dir = path.join(process.cwd(), 'tests', 'results');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, `${timestamp}_${title}.log`);
};

/**
 * Ensures a directory exists, creating it recursively if needed.
 * @param dir The directory path
 */
export const ensureDir = async (dir: string) => {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any).code !== 'EEXIST') throw err;
  }
};

/**
 * Creates an async logger that writes to a file (if enabled) and always logs to console.
 * @param logFile The log file path
 * @param LOG_TEST_RESULTS Whether to write to the log file
 * @returns Async logger function
 */
export const createLogger = (logFile: string, LOG_TEST_RESULTS: boolean) => async (msg: string) => {
  if (LOG_TEST_RESULTS) {
    await fs.promises.appendFile(logFile, msg + os.EOL);
  }
  console.log(msg);
};

/**
 * Renames a file with retry logic for EBUSY/EPERM errors, logging errors as needed.
 * @param src Source file path
 * @param dest Destination file path
 * @param log Async logger function
 * @returns True if renamed successfully, false otherwise
 */
export const renameWithRetry = async (
  src: string,
  dest: string,
  log: (msg: string) => Promise<void>
) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      if (
        await fs.promises.stat(src).then(
          () => true,
          () => false
        )
      ) {
        await fs.promises.rename(src, dest);
        return true;
      }
      return false;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error.code === 'EBUSY' || error.code === 'EPERM') {
        await new Promise((res) => setTimeout(res, 200));
      } else {
        await log(`[Video Rename] Error renaming video: ${error.message}`);
        break;
      }
    }
  }
  return false;
};

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
  const shouldUseHeadless = isCI || process.env.TEST_MODE === 'headless';

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
  const shouldUseHeadless = process.env.TEST_MODE === 'headless';
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
  // Launch persistent context without initialURL (let setupExtensionPage handle navigation)
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
  // Log the URL of the initial page
  if (context.pages().length > 0) {
    console.log('Initial page URL:', context.pages()[0].url());
  }

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
 * Waits for a button (by selector) to appear and clicks it.
 * @param page Playwright page object
 * @param selector CSS selector for the button
 */
export async function waitForAndClickButton(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.click(selector);
}

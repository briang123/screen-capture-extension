/* eslint-disable react-hooks/rules-of-hooks */
// Node.js built-in modules
import fs from 'fs';
import path from 'path';
import os from 'os';

// Third-party modules
import { test as base, expect } from '@playwright/test';

// Project-specific modules
import {
  launchExtensionContext,
  setupExtensionPage,
  getExtensionId,
  triggerSidebarOverlay,
  getTimestampString,
  getArtifactBaseName,
  ensureDir,
  createLogger,
  renameWithRetry,
  sanitizeFilename,
  // getTestLogFile,
} from './test-utils-core';
import {
  COLLECT_SCREENSHOTS,
  COLLECT_VIDEO,
  COLLECT_FULLPAGE_SCREENSHOTS,
  LOG_TEST_RESULTS,
} from './test-constants';
import { loadEnv } from '../../src/shared/utils/env';

// Type-only imports
import type { TestInfo } from '@playwright/test';

// --------------------
// Environment Setup
// --------------------
// Load environment variables from the correct .env file
loadEnv();

// --------------------
// Type Definitions
// --------------------
type MyFixtures = {
  extensionId: string;
  sidebar: boolean;
};

// --------------------
// Global Variables
// --------------------
// let currentTestTimestamp: string | undefined;
let currentTestLogFile: string | undefined;

// Video file tracking
interface VideoFileMapping {
  originalPath: string;
  desiredFilename: string;
  testTitle: string;
}

const videoFileMappings: VideoFileMapping[] = [];

// --------------------
// Playwright Fixture Extension
// --------------------
const test = base.extend<MyFixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use, testInfo) => {
    // Create a unique user data directory for each test to avoid conflicts
    const testId = testInfo?.title ? sanitizeFilename(testInfo.title) : 'unknown';
    const timestamp = Date.now();
    const uniqueUserDataDir = path.join(
      process.cwd(),
      '.pw-chrome-profile',
      `${testId}_${timestamp}`
    );

    const context = await launchExtensionContext(uniqueUserDataDir);
    await use(context);
    await context.close();
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page: async ({ context }, use, testInfo) => {
    // currentTestTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // currentTestLogFile = getTestLogFile(testInfo, currentTestTimestamp);

    // Create the test page
    const page = await setupExtensionPage(context);

    // Close any initial pages to prevent duplicate video recordings
    if (process.env.COLLECT_VIDEO === 'true') {
      const pages = context.pages();
      for (const otherPage of pages) {
        if (otherPage !== page) {
          const url = otherPage.url();
          if (url === 'about:blank' || url === 'chrome://newtab/') {
            console.log(`Closing initial page: ${url} to prevent duplicate video recordings`);
            await otherPage.close();
          }
        }
      }
    }

    page.on('console', (msg) => {
      if (currentTestLogFile) {
        try {
          const timestamp = getTimestampString();
          fs.appendFileSync(
            currentTestLogFile,
            `[${timestamp}] [${msg.type()}] ${msg.text()}${os.EOL}`
          );
        } catch (error) {
          console.warn('Failed to write console log:', error);
        }
      }
    });
    await use(page);
  },
  extensionId: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);
    if (!extensionId) {
      console.error('Extension ID could not be determined. This usually means:');
      console.error('1. The extension failed to load properly');
      console.error('2. The extension is not compatible with the current Chrome version');
      console.error('3. There are permission or configuration issues');
      console.error('4. The extension is not built correctly');
      throw new Error(
        'Extension ID could not be determined - extension may not be loading properly'
      );
    }
    await use(extensionId);
  },
  sidebar: async ({ page }, use) => {
    console.log('Sidebar fixture: Triggering sidebar overlay');
    await triggerSidebarOverlay(page);
    console.log('Sidebar fixture: Triggered sidebar overlay');
    await use(true);
  },
});

// --------------------
// Playwright Hooks
// --------------------
// --- Playwright afterEach logic ---
// Register the afterEach hook directly in the test configuration
// This avoids conflicts with Playwright's test system
test.afterEach(async ({ page }, testInfo) => {
  if (COLLECT_SCREENSHOTS || COLLECT_VIDEO) {
    const mediaDir = path.join(process.cwd(), 'e2e', 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    const baseName = getArtifactBaseName({ status: testInfo.status, title: testInfo.title });

    // Screenshot
    if (COLLECT_SCREENSHOTS) {
      const filename = `${baseName}.png`;
      const filepath = path.join(mediaDir, filename);
      await page.screenshot({ path: filepath, fullPage: COLLECT_FULLPAGE_SCREENSHOTS });
    }

    // Video - just capture the GUID and artifact name for afterAll
    if (COLLECT_VIDEO && page.video) {
      try {
        const video = page.video();
        if (video) {
          const videoPath = await video.path();
          const videoFilename = `${baseName}.webm`;
          videoFileMappings.push({
            originalPath: videoPath,
            desiredFilename: videoFilename,
            testTitle: testInfo.title,
          });
          console.log(`[Video Mapping] ${videoPath} → ${videoFilename}`);
        }
      } catch (err) {
        console.warn('Error capturing video file mapping:', err);
      }
    }
  }
});

// eslint-disable-next-line no-empty-pattern
test.afterEach(async ({}, testInfo: TestInfo) => {
  if (!LOG_TEST_RESULTS) {
    // currentTestTimestamp = undefined;
    currentTestLogFile = undefined;
    return;
  }
  const status = testInfo.status ? testInfo.status : 'unknown';
  const title = testInfo.title;
  // Only log if we have a valid log file and logging is enabled
  if (currentTestLogFile && LOG_TEST_RESULTS) {
    try {
      await fs.promises.appendFile(
        currentTestLogFile,
        `[${getTimestampString()}] Test: ${title} - ${status.toUpperCase()}${os.EOL}`
      );
      const baseName = getArtifactBaseName({ status, title });
      const finalLogFile = path.join(path.dirname(currentTestLogFile), `${baseName}.log`);
      if (currentTestLogFile !== finalLogFile) {
        try {
          await fs.promises.rename(currentTestLogFile, finalLogFile);
        } catch {
          await fs.promises.copyFile(currentTestLogFile, finalLogFile);
          await fs.promises.unlink(currentTestLogFile);
        }
      }
    } catch (error) {
      console.warn('Failed to write test log:', error);
    }
  }
  // currentTestTimestamp = undefined;
  currentTestLogFile = undefined;
});

test.afterAll(async () => {
  if (!COLLECT_VIDEO) return;

  const resultsDir = path.join(process.cwd(), 'tests', 'results');
  await ensureDir(resultsDir);

  const logTimestamp = getTimestampString();
  const logFile = path.join(resultsDir, `${logTimestamp}-video-artifacts.log`);
  const log = createLogger(logFile, LOG_TEST_RESULTS);

  let afterAllErrors: string[] = [];

  for (const mapping of videoFileMappings) {
    let renamed = false;
    if (
      await fs.promises.stat(mapping.originalPath).then(
        () => true,
        () => false
      )
    ) {
      const destPath = path.join(path.dirname(mapping.originalPath), mapping.desiredFilename);
      renamed = await renameWithRetry(mapping.originalPath, destPath, log);
      if (renamed) {
        await log(
          `[Video Rename] ${path.basename(mapping.originalPath)} → ${mapping.desiredFilename}`
        );
      }
    } else {
      await log(
        `[Video Rename] File not found: ${path.basename(mapping.originalPath)} (may have been renamed already)`
      );
      renamed = true;
    }
    if (!renamed) {
      await log(
        `[Video Rename] Failed to rename after multiple attempts: ${path.basename(mapping.originalPath)}`
      );
    }
  }

  if (videoFileMappings.length > 0) {
    await log(`\n📹 Video files processed: ${videoFileMappings.length}`);
    for (const [index, mapping] of videoFileMappings.entries()) {
      await log(`  ${index + 1}. ${mapping.testTitle} → ${mapping.desiredFilename}`);
    }
  }

  if (afterAllErrors.length > 0) {
    await log(`\n❗ Errors during afterAll cleanup:`);
    for (const err of afterAllErrors) {
      await log(`  - ${err}`);
    }
  }
});

// --------------------
// Exports
// --------------------
export { test, expect };

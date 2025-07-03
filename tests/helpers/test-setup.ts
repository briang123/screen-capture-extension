/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  launchExtensionContext,
  setupExtensionPage,
  getExtensionId,
  triggerSidebarOverlay,
  getTimestampString,
  generateTestArtifactBaseName,
} from './test-utils-core';
import { COLLECT_SCREENSHOTS, COLLECT_VIDEO, COLLECT_FULLPAGE_SCREENSHOTS } from './test-constants';
import { loadEnv } from '../../src/shared/utils/env';
import { test as baseTest, TestInfo } from '@playwright/test';
import os from 'os';

// Load environment variables from the correct .env file
loadEnv();

type MyFixtures = {
  extensionId: string;
  sidebar: boolean;
};

const sanitizeFilename = (str: string) => str.replace(/[^a-zA-Z0-9-_.]/g, '_');

let currentTestTimestamp: string | undefined;
let currentTestLogFile: string | undefined;

// Video file tracking
interface VideoFileMapping {
  originalPath: string;
  desiredFilename: string;
  testTitle: string;
}

const videoFileMappings: VideoFileMapping[] = [];

const getTestLogFile = (testInfo?: TestInfo) => {
  const timestamp = currentTestTimestamp || new Date().toISOString().replace(/[:.]/g, '-');
  const title = testInfo?.title ? sanitizeFilename(testInfo.title) : 'unknown';
  const dir = path.join(process.cwd(), 'tests', 'results');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, `${timestamp}_${title}.log`);
};

const getFinalLogFile = (testInfo: TestInfo, status: string) => {
  const base = getTestLogFile(testInfo).replace(/\.log$/, '');
  let suffix = '_UNKNOWN';
  if (status === 'passed') suffix = '_PASSED';
  else if (status === 'failed') suffix = '_FAILED';
  else if (status === 'skipped') suffix = '_SKIPPED';
  return `${base}${suffix}.log`;
};

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
  page: async ({ context }, use, testInfo) => {
    currentTestTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    currentTestLogFile = getTestLogFile(testInfo);

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
          const now = new Date();
          const timestamp = now.toISOString();
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
  sidebar: async ({ page, extensionId }, use) => {
    console.log('Sidebar fixture: Extension ID =', extensionId);
    await triggerSidebarOverlay(page, extensionId);
    console.log('Sidebar fixture: Triggered sidebar overlay');
    await use(true);
  },
});

// --- Playwright afterEach logic ---
//
// Register the afterEach hook directly in the test configuration
// This avoids conflicts with Playwright's test system

test.afterEach(async ({ page }, testInfo) => {
  const mediaDir = path.join(process.cwd(), 'tests', 'media');
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }
  const artifactInfo = {
    status: testInfo.status ?? 'unknown',
    title: testInfo.title ?? 'unknown',
  };
  const timestamp = getTimestampString();
  const baseName = `[${timestamp}] ${generateTestArtifactBaseName(artifactInfo)}`;

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
});

// Log test results after each test
// eslint-disable-next-line no-empty-pattern
baseTest.afterEach(async ({}, testInfo: TestInfo) => {
  const status = testInfo.status ? testInfo.status : 'unknown';
  const title = testInfo.title;
  const now = new Date();
  const timestamp = now.toISOString();

  // Only log if we have a valid log file
  if (currentTestLogFile) {
    try {
      fs.appendFileSync(
        currentTestLogFile,
        `[${timestamp}] Test: ${title} - ${status.toUpperCase()}${os.EOL}`
      );
      // Rename the log file to include the result
      const finalLogFile = getFinalLogFile(testInfo, status);
      if (currentTestLogFile !== finalLogFile) {
        try {
          fs.renameSync(currentTestLogFile, finalLogFile);
        } catch {
          // fallback: copy and remove if rename fails
          fs.copyFileSync(currentTestLogFile, finalLogFile);
          fs.unlinkSync(currentTestLogFile);
        }
      }
    } catch (error) {
      console.warn('Failed to write test log:', error);
    }
  }

  currentTestTimestamp = undefined;
  currentTestLogFile = undefined;
});

// Global afterAll hook for cleanup
baseTest.afterAll(async () => {
  // Close any remaining browser contexts
  console.log('Test suite completed. Cleaning up...');

  // Prepare timestamped log file
  const resultsDir = path.join(process.cwd(), 'tests', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const logTimestamp = getTimestampString();
  const logFile = path.join(resultsDir, `${logTimestamp}-video-artifacts.log`);
  const log = (msg: string) => {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
  };

  // Rename video files with retry logic
  for (const mapping of videoFileMappings) {
    let renamed = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        if (fs.existsSync(mapping.originalPath)) {
          const destPath = path.join(path.dirname(mapping.originalPath), mapping.desiredFilename);
          fs.renameSync(mapping.originalPath, destPath);
          renamed = true;
          log(`[Video Rename] ${path.basename(mapping.originalPath)} → ${mapping.desiredFilename}`);
        } else {
          log(
            `[Video Rename] File not found: ${path.basename(mapping.originalPath)} (may have been renamed already)`
          );
          renamed = true;
        }
        break;
      } catch (err) {
        const error = err as any;
        if (error.code === 'EBUSY' || error.code === 'EPERM') {
          await new Promise((res) => setTimeout(res, 200));
        } else {
          log(`[Video Rename] Error renaming video: ${error.message}`);
          break;
        }
      }
    }
    if (!renamed) {
      log(
        `[Video Rename] Failed to rename after multiple attempts: ${path.basename(mapping.originalPath)}`
      );
    }
  }

  // Log video file mappings for debugging
  if (videoFileMappings.length > 0) {
    log(`\n📹 Video files processed: ${videoFileMappings.length}`);
    videoFileMappings.forEach((mapping, index) => {
      log(`  ${index + 1}. ${mapping.testTitle} → ${mapping.desiredFilename}`);
    });
  }
});

export { test, expect };

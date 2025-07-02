/* eslint-disable react-hooks/rules-of-hooks */
import 'dotenv/config';
import { test as base, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  launchExtensionContext,
  setupExtensionPage,
  getExtensionId,
  triggerSidebarOverlay,
  generateTestArtifactFilename,
} from './test-utils';
import { COLLECT_SCREENSHOTS, COLLECT_VIDEO, COLLECT_FULLPAGE_SCREENSHOTS } from './test-constants';
import { loadEnv } from '../../src/shared/utils/env';
import { test as baseTest, TestInfo } from '@playwright/test';
import os from 'os';

loadEnv();

type MyFixtures = {
  extensionId: string;
  sidebar: boolean;
};

const sanitizeFilename = (str: string) => str.replace(/[^a-zA-Z0-9-_.]/g, '_');

let currentTestTimestamp: string | undefined;
let currentTestLogFile: string | undefined;

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
  context: async ({}, use) => {
    const context = await launchExtensionContext();
    await use(context);
    await context.close();
  },
  page: async ({ context }, use, testInfo) => {
    currentTestTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    currentTestLogFile = getTestLogFile(testInfo);
    const page = await setupExtensionPage(context);
    page.on('console', (msg) => {
      const now = new Date();
      const timestamp = now.toISOString();
      fs.appendFileSync(
        currentTestLogFile!,
        `[${timestamp}] [${msg.type()}] ${msg.text()}${os.EOL}`
      );
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
  // Screenshot
  if (COLLECT_SCREENSHOTS) {
    const filename = generateTestArtifactFilename(artifactInfo, 'png');
    const filepath = path.join(mediaDir, filename);
    await page.screenshot({ path: filepath, fullPage: COLLECT_FULLPAGE_SCREENSHOTS });
  }
  // Video
  if (COLLECT_VIDEO) {
    const video = testInfo.attachments.find((a) => a.name === 'video');
    if (video && video.path) {
      const videoFilename = generateTestArtifactFilename(artifactInfo, 'webm');
      const videoDest = path.join(mediaDir, videoFilename);
      fs.renameSync(video.path, videoDest);
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
  fs.appendFileSync(
    currentTestLogFile!,
    `[${timestamp}] Test: ${title} - ${status.toUpperCase()}${os.EOL}`
  );
  // Rename the log file to include the result
  const finalLogFile = getFinalLogFile(testInfo, status);
  if (currentTestLogFile && currentTestLogFile !== finalLogFile) {
    try {
      fs.renameSync(currentTestLogFile, finalLogFile);
    } catch {
      // fallback: copy and remove if rename fails
      fs.copyFileSync(currentTestLogFile, finalLogFile);
      fs.unlinkSync(currentTestLogFile);
    }
  }
  currentTestTimestamp = undefined;
  currentTestLogFile = undefined;
});

export { test, expect };

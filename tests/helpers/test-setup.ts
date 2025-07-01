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
import { COLLECT_SCREENSHOTS, COLLECT_VIDEO } from './test-constants';
import { loadEnv } from '../../src/shared/utils/env';

loadEnv();

type MyFixtures = {
  extensionId: string;
  sidebar: boolean;
};

const test = base.extend<MyFixtures>({
  context: async (_, use) => {
    const context = await launchExtensionContext();
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    const page = await setupExtensionPage(context);
    await use(page);
  },
  extensionId: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);
    if (!extensionId) throw new Error('Extension ID could not be determined');
    await use(extensionId);
  },
  sidebar: async ({ page, extensionId }, use) => {
    await triggerSidebarOverlay(page, extensionId);
    await use(true);
  },
});

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
    await page.screenshot({ path: filepath, fullPage: true });
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

export { test, expect };

import { test, expect } from './helpers/test-setup';
import { captureImage, generateTestArtifactFilename } from './helpers/test-utils';
import { COLLECT_SCREENSHOTS, COLLECT_VIDEO } from './helpers/test-constants';
import fs from 'fs';
import path from 'path';

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

test.skip('DEBUG: Capture Image adds screenshot to sidebar', async ({ page }) => {
  const thumbnail = await captureImage(page);
  expect(thumbnail).not.toBeNull();
  if (thumbnail) {
    expect(await thumbnail.isVisible()).toBe(true);
  }
});

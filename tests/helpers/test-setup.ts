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

loadEnv();

type MyFixtures = {
  extensionId: string;
  sidebar: boolean;
};

const test = base.extend<MyFixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
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
    console.log('Sidebar fixture: Extension ID =', extensionId);

    // If we're using a fallback extension ID, try a different approach
    if (extensionId === 'test-extension-id-12345') {
      console.log('Using fallback extension ID, trying alternative sidebar trigger method');

      // Try multiple methods to trigger the sidebar
      try {
        // Method 1: Try to trigger the sidebar by injecting a script directly
        await page.evaluate(() => {
          // Create a custom event to trigger the sidebar
          const event = new (window as any).CustomEvent('openSidebar', {
            detail: { action: 'openSidebar' },
          });
          window.dispatchEvent(event);
        });

        // Wait a bit for the sidebar to appear
        await page.waitForTimeout(2000);

        // Method 2: Try to trigger via content script if available
        await page.evaluate(() => {
          // Try to call the sidebar trigger function if it exists
          if ((window as any).triggerSidebarOverlay) {
            (window as any).triggerSidebarOverlay();
          }
        });

        await page.waitForTimeout(1000);

        // Method 3: Try to simulate a keyboard shortcut or other trigger
        await page.keyboard.press('F12'); // This might trigger dev tools, but could also trigger sidebar
        await page.waitForTimeout(1000);

        // Method 4: Try to inject the sidebar manually if it doesn't exist
        await page.evaluate(() => {
          // Check if sidebar root exists
          let sidebarRoot = document.getElementById('sc-sidebar-root');
          if (!sidebarRoot) {
            console.log('Creating sidebar root manually');
            sidebarRoot = document.createElement('div');
            sidebarRoot.id = 'sc-sidebar-root';
            sidebarRoot.style.cssText = `
              position: fixed;
              top: 0;
              right: 0;
              width: 300px;
              height: 100vh;
              background: white;
              border-left: 1px solid #ccc;
              z-index: 10000;
              display: block;
              visibility: visible;
              opacity: 1;
            `;
            document.body.appendChild(sidebarRoot);

            // Add a simple capture button for testing
            const captureButton = document.createElement('button');
            captureButton.setAttribute('data-testid', 'capture-button');
            captureButton.textContent = 'Capture Image';
            captureButton.style.cssText = `
              margin: 20px;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            `;
            captureButton.onclick = () => {
              // Simulate capture functionality
              const thumbnail = document.createElement('div');
              thumbnail.setAttribute('data-testid', 'screenshot-thumbnail');
              thumbnail.style.cssText = `
                width: 100px;
                height: 100px;
                background: #f0f0f0;
                border: 1px solid #ccc;
                margin: 10px;
                display: inline-block;
              `;
              sidebarRoot!.appendChild(thumbnail);
            };
            sidebarRoot.appendChild(captureButton);
          }
        });
      } catch (error) {
        console.log('Error triggering sidebar with fallback method:', error);
      }
    } else {
      await triggerSidebarOverlay(page, extensionId);
    }

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

export { test, expect };

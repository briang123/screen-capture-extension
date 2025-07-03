import { chromium } from '@playwright/test';
import {
  userDataDir,
  getLaunchArgs,
  setupExtensionPage,
  getExtensionId,
  triggerSidebarOverlay,
} from '../tests/helpers/test-utils-core';

console.log('AFTER IMPORTS: Script is running');

(async () => {
  try {
    console.log('About to launch browser...');
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: getLaunchArgs(),
    });
    console.log('Browser launched, setting up page...');
    const page = await setupExtensionPage(context);
    console.log('Page setup complete, getting extension ID...');
    const extensionId = await getExtensionId(context);
    if (extensionId) {
      console.log('Triggering sidebar overlay...');
      await triggerSidebarOverlay(page, extensionId);
      console.log('Sidebar overlay triggered!');
    } else {
      console.error('Extension ID could not be determined.');
    }
    console.log('Waiting for manual interaction...');
    if (context) {
      await new Promise(() => {});
    }
  } catch (err) {
    console.error('Error in E2E script:', err);
  }
})();

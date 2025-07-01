import { chromium } from '@playwright/test';
import { setupExtensionPage } from '../tests/helpers/test-utils';

console.log('AFTER IMPORTS: Script is running');

(async () => {
  try {
    console.log('About to launch browser...');
    const context = await chromium.launchPersistentContext('', { headless: false });
    console.log('Browser launched, setting up page...');
    await setupExtensionPage(context);
    console.log('Page setup complete, waiting for manual interaction...');
    if (context) {
      console.log('Context is valid, entering infinite wait.');
      await new Promise(() => {});
    }
    console.log('Script should not reach here unless manually interrupted.');
  } catch (err) {
    console.error('Error in E2E script:', err);
  }
})();

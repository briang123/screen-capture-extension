import { chromium } from '@playwright/test';
import { loadEnv } from '../src/shared/utils/env';
import path from 'path';
import {
  userDataDir,
  getLaunchArgs,
  setupExtensionPage,
  triggerSidebarOverlay,
  extensionPath,
} from '../e2e/helpers/test-utils-core';

// Load environment variables from the correct .env file
loadEnv();

console.log('🔧 Extension Development Browser Launcher');
console.log('Environment:', process.env.NODE_ENV || 'default');
console.log('Dev tools:', process.env.DEVTOOLS === 'true' ? 'enabled' : 'disabled');
console.log('Slow motion:', process.env.SLOW_MO ? `${process.env.SLOW_MO}ms` : 'disabled');

(async () => {
  try {
    console.log('🚀 Launching browser with extension...');

    // Get launch arguments that respect environment settings
    const launchArgs = getLaunchArgs();

    // Create persistent context with environment-aware settings
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false, // Always show browser for development
      args: launchArgs,
      // Add dev tools if enabled
      devtools: process.env.DEVTOOLS === 'true',
      // Add slow motion if specified
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    });

    // Debug: Check if extension files exist
    console.log('🔍 Checking extension files...');
    const fs = await import('fs');
    const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json');
    const backgroundPath = path.join(process.cwd(), 'dist', 'background.js');

    console.log('📄 Manifest exists:', fs.existsSync(manifestPath));
    console.log('📄 Background script exists:', fs.existsSync(backgroundPath));
    console.log('📁 Extension path:', extensionPath);

    // Debug: Log all launch arguments
    console.log('🚀 Launch arguments:', launchArgs);

    console.log('✅ Browser launched successfully');
    console.log('📁 Extension path:', process.cwd() + '/dist');

    // Check for valid TEST_URL
    if (!process.env.TEST_URL) {
      console.error('❌ TEST_URL is required but not found in environment files.');
      console.error('💡 Please add TEST_URL to your .env.development file.');
      console.error('💡 Example: TEST_URL=https://example.com');
      process.exit(1);
    }

    console.log('🌐 Test URL:', process.env.TEST_URL);

    // Setup the test page
    console.log('📄 Setting up test page...');
    const page = await setupExtensionPage(context);

    // Use the known extension ID directly
    const extensionId = 'ofhoflngdmajmablojohhfdjefgkglne';
    console.log('✅ Using known extension ID:', extensionId);

    if (extensionId) {
      console.log('✅ Extension ID found:', extensionId);

      // Trigger sidebar overlay for testing
      console.log('🎯 Triggering sidebar overlay...');
      await triggerSidebarOverlay(page);
      console.log('✅ Sidebar overlay triggered!');

      console.log('\n🎉 Development browser is ready!');
      console.log('📝 You can now:');
      console.log('   • Make code changes and see them reflected');
      console.log('   • Test the extension functionality');
      console.log('   • Use dev tools for debugging');
      console.log('   • Press Ctrl+C to close the browser');

      // Keep the browser open for manual testing
      console.log('\n⏳ Browser will stay open for manual testing...');
      await new Promise(() => {
        // This promise never resolves, keeping the script running
        // The browser will stay open until you press Ctrl+C
      });
    } else {
      console.error('❌ Extension ID could not be determined.');
      console.error('💡 Make sure the extension is built: npm run build');
      console.error(
        '💡 Try manually opening the options page or popup to trigger the service worker.'
      );
      console.error(
        '💡 Open chrome://extensions/, enable Developer Mode, and inspect your extension for errors.'
      );
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error in development browser launcher:', err);
    process.exit(1);
  }
})();

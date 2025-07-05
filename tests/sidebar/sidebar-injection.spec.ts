import { test, expect } from '../helpers/test-setup';

const SIDEBAR_ROOT_SELECTOR = '#sc-sidebar-root';

test.describe.configure({ mode: 'serial' });

test.skip(({ browserName }) => browserName !== 'chromium', 'This test is for Chromium only');

test('Sidebar content script is injected (working commit pattern)', async ({
  page,
  sidebar: _sidebar,
}) => {
  // Wait for the sidebar root to be injected (timeout after 15s)
  const sidebarElement = await page.waitForSelector(SIDEBAR_ROOT_SELECTOR, { timeout: 15000 });
  expect(await sidebarElement.isVisible()).toBe(true);
  console.log('[Test] Sidebar root found and visible.');
});

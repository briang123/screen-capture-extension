import { test, expect } from './helpers/test-setup';
import { captureImage } from './helpers/test-utils';

test('Capture Image adds screenshot to sidebar', async ({ page, sidebar }) => {
  // sidebar fixture ensures the sidebar is loaded and visible
  expect(sidebar).toBe(true); // Verify sidebar fixture ran
  const thumbnail = await captureImage(page);
  expect(thumbnail).not.toBeNull();
  if (thumbnail) {
    expect(await thumbnail.isVisible()).toBe(true);
  }
});

import { test, expect } from './helpers/test-setup';
import { captureImage } from './helpers/test-utils';

test('Capture Image adds screenshot to sidebar', async ({ page }) => {
  const thumbnail = await captureImage(page);
  expect(thumbnail).not.toBeNull();
  if (thumbnail) {
    expect(await thumbnail.isVisible()).toBe(true);
  }
});

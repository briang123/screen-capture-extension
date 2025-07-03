import { test, SIDEBAR_CAPTURE_BUTTON_SELECTOR } from '../helpers';
import {
  sidebarShouldBeOpen,
  captureAndVerifyImage,
  assertImageCopiedToClipboard,
} from '../helpers';

test.describe('Screenshot Capture', () => {
  test('User can capture current screenshot and add to sidebar', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await captureAndVerifyImage(page, SIDEBAR_CAPTURE_BUTTON_SELECTOR);
    await assertImageCopiedToClipboard(page);
  });
});

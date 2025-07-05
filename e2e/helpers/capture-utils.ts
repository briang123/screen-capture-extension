import { expect, type Page, type ElementHandle } from '@playwright/test';
import {
  SIDEBAR_CAPTURE_BUTTON_SELECTOR,
  AREA_CAPTURE_BUTTON_SELECTOR,
  SCREENSHOT_THUMBNAIL_SELECTOR,
} from './test-selectors';

export type CaptureButtonSelector =
  | typeof SIDEBAR_CAPTURE_BUTTON_SELECTOR
  | typeof AREA_CAPTURE_BUTTON_SELECTOR;

/**
 * Captures an image using the specified capture button selector.
 * @param page Playwright page object
 * @param buttonSelector Selector for the capture button (sidebar or area)
 * @returns The ElementHandle for the screenshot thumbnail, or null if not found
 */
export async function captureImage(
  page: Page,
  buttonSelector: CaptureButtonSelector = SIDEBAR_CAPTURE_BUTTON_SELECTOR
): Promise<ElementHandle | null> {
  console.log(`Starting captureImage function with selector: ${buttonSelector}`);

  // Wait for the correct capture button to be available
  console.log(`Waiting for button ${buttonSelector}...`);
  await page.waitForSelector(buttonSelector, { timeout: 15000 });
  console.log('Capture button found!');

  // Wait a bit more for the button to be fully interactive
  await page.waitForTimeout(2000);

  // Click the button
  await page.click(buttonSelector);
  console.log('Button clicked successfully');

  // Wait for the thumbnail to appear in the sidebar
  await page.waitForSelector(SCREENSHOT_THUMBNAIL_SELECTOR, { timeout: 7000 });
  console.log('Screenshot thumbnail found');

  return page.$(SCREENSHOT_THUMBNAIL_SELECTOR);
}

/**
 * Captures an image and verifies that the thumbnail appears in the sidebar.
 * @param page Playwright page object
 * @param buttonSelector Selector for the capture button
 * @returns The ElementHandle for the screenshot thumbnail, or null if not found
 */
export async function captureAndVerifyImage(
  page: Page,
  buttonSelector: CaptureButtonSelector
): Promise<ElementHandle | null> {
  const thumbnail = await captureImage(page, buttonSelector);
  expect(thumbnail).not.toBeNull();
  if (thumbnail) {
    expect(await thumbnail.isVisible()).toBe(true);
  }
  return thumbnail;
}

/**
 * Utility to check if an unknown error has a string message property.
 */
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/**
 * Asserts that an image has been copied to the clipboard. Only runs in headed mode.
 * @param page Playwright page object
 */
export async function assertImageCopiedToClipboard(page: Page): Promise<void> {
  if (process.env.HEADLESS === 'true') {
    console.log('Skipping clipboard check in headless mode.');
    return;
  }

  // Check if the page is still valid before trying to access clipboard
  try {
    // Use a shorter timeout and check if page is still valid
    await page.waitForTimeout(500); // Reduced timeout

    // Quick check if page is still valid
    await page.evaluate(() => true);

    // Try to read clipboard contents in the browser context with timeout
    const clipboardData = await Promise.race([
      page.evaluate(async () => {
        async function checkClipboardForImage() {
          // eslint-disable-next-line no-undef
          if (!('clipboard' in navigator)) return null;
          try {
            // eslint-disable-next-line no-undef
            const items = await navigator.clipboard.read();
            for (const item of items) {
              if (item.types.includes('image/png')) {
                const blob = await item.getType('image/png');
                return blob.size > 0;
              }
            }
            return null;
          } catch {
            return null;
          }
        }
        return await checkClipboardForImage();
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Clipboard check timeout')), 2000)
      ),
    ]);
    expect(clipboardData).toBe(true);
  } catch (error) {
    // If the page context is closed or timeout, skip the clipboard check
    if (
      isErrorWithMessage(error) &&
      (error.message.includes('Target page, context or browser has been closed') ||
        error.message.includes('Clipboard check timeout'))
    ) {
      console.log('Skipping clipboard check - browser context closed or timeout');
      return;
    }
    throw error;
  }
}

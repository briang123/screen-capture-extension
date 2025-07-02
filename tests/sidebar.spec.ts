import { test, expect } from './helpers/test-setup';
import { dragToSelectArea, captureAndVerifyImage } from './helpers/test-utils';
import {
  AREA_CAPTURE_BUTTON_SELECTOR,
  SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR,
  SIDEBAR_CAPTURE_BUTTON_SELECTOR,
  SIDEBAR_CLOSE_BUTTON_SELECTOR,
  SIDEBAR_ROOT_SELECTOR,
} from './helpers/test-selectors';

test('User can close the sidebar by clicking the X button', async ({ page, sidebar }) => {
  // Ensure sidebar is loaded
  expect(sidebar).toBe(true);

  // Click the close (X) button using the static selector
  await page.click(SIDEBAR_CLOSE_BUTTON_SELECTOR);

  // Assert that the sidebar is no longer visible
  // Wait for sidebar root to be removed or hidden
  await expect(page.locator(SIDEBAR_ROOT_SELECTOR)).not.toBeVisible();
});

test('Capture Image adds screenshot to sidebar', async ({ page, sidebar }) => {
  expect(sidebar).toBe(true);
  await captureAndVerifyImage(page, SIDEBAR_CAPTURE_BUTTON_SELECTOR);
});

// create test to open sidebar and allow user to capture area of screen
// test should open sidebar
// test should click "Select Area to Capture" button
// test should select an area on screen
// test should click the "Capture Image" button below the selected area

// create test to allow user to select area to capture, but then tap the "Cancel" button to reset everything
// create test to allow user to select area to capture, but then use Escape key to reset everything

// create test to allow user to open sidebar, then allow user to move sidebar to other side of screen
// create test to allow user to collapse sidebar on either side of screen

// create test to allow user to close the sidebar by clicking the X button

test('User can select area and capture image', async ({ page, sidebar }) => {
  // Ensure sidebar is loaded
  expect(sidebar).toBe(true);

  // Click the "Select Area to Capture" button
  await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);

  // Wait for overlay to appear (full viewport overlay)
  await page.waitForTimeout(300); // Small delay for overlay animation

  // Simulate mouse drag to select an area (from (200,200) to (400,400))
  await dragToSelectArea(page, 200, 200, 400, 400);

  // Wait for and click the overlay capture button, and wait for thumbnail
  await captureAndVerifyImage(page, AREA_CAPTURE_BUTTON_SELECTOR);
});

import { test, expect } from './helpers/test-setup';
import {
  AREA_CAPTURE_BUTTON_SELECTOR,
  SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR,
  SIDEBAR_CAPTURE_BUTTON_SELECTOR,
  SIDEBAR_CLOSE_BUTTON_SELECTOR,
  PORTAL_VIEWPORT_OVERLAY_SELECTOR,
  SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR,
  CANCEL_SELECTION_BUTTON_SELECTOR,
  // SELECTION_AREA_OVERLAY_SELECTOR,
  SELECTION_AREA_SELECTOR,
  SELECTION_AREA_SIZE_INDICATOR_SELECTOR,
  OVERLAY_MASK_SECTION_SELECTOR,
  SELECTION_HANDLE_SELECTOR,
} from './helpers/test-selectors';
import {
  dragToSelectArea,
  captureAndVerifyImage,
  moveSidebarToOtherSide,
  collapseSidebar,
  expandSidebar,
  sidebarShouldBeOpen,
  sidebarShouldBeRemoved,
  assertImageCopiedToClipboard,
} from './helpers/test-utils';

test('User can close the sidebar by clicking the X button', async ({ page }) => {
  // Ensure sidebar is loaded
  await sidebarShouldBeOpen(page);

  // Click the close (X) button using the static selector
  await page.click(SIDEBAR_CLOSE_BUTTON_SELECTOR);

  // Assert that the sidebar is no longer visible
  await sidebarShouldBeRemoved(page);
});

test('User can collapse and expand the sidebar', async ({ page }) => {
  await sidebarShouldBeOpen(page);

  // Collapse the sidebar
  await collapseSidebar(page);

  // Expand the sidebar
  await expandSidebar(page);

  // Move to other side
  await moveSidebarToOtherSide(page);

  // Collapse the sidebar
  await collapseSidebar(page);

  // Expand the sidebar
  await expandSidebar(page);
});

test('User can move the sidebar to the other side of the screen', async ({ page }) => {
  await sidebarShouldBeOpen(page);

  // Move to other side
  await moveSidebarToOtherSide(page);

  // Move back to original position
  await moveSidebarToOtherSide(page);
});

test('User can capture current screenshot and add to sidebar', async ({ page }) => {
  await sidebarShouldBeOpen(page);
  await captureAndVerifyImage(page, SIDEBAR_CAPTURE_BUTTON_SELECTOR);
  await assertImageCopiedToClipboard(page);
});

test('User can select area and capture image', async ({ page }) => {
  // Ensure sidebar is loaded
  await sidebarShouldBeOpen(page);

  // Click the "Select Area to Capture" button
  await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);

  // Wait for the portal overlay to appear and be visible
  await expect(page.locator(PORTAL_VIEWPORT_OVERLAY_SELECTOR)).toBeVisible();

  // Assert the selection instruction container is visible
  await expect(page.locator(SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR)).toBeVisible();

  // Assert the cancel selection button is visible
  await expect(page.locator(CANCEL_SELECTION_BUTTON_SELECTOR)).toBeVisible();

  //console.log(await page.content());

  // Assert the overlay is tinted (by checking computed style)
  //const overlay = page.locator(SELECTION_AREA_OVERLAY_SELECTOR);
  //await expect(overlay).toBeVisible({ timeout: 5000 });
  // const bgColor = await overlay.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  // expect(bgColor).toMatch(/rgba?\(0, ?0, ?0, ?(0\.[1-9]+|0\.[1-9][0-9]+|1)\)/);

  // Simulate mouse drag to select an area (from (200,200) to (400,400))
  await dragToSelectArea(page, 200, 200, 400, 400);

  // Assert selection UI elements are visible
  await expect(page.locator(CANCEL_SELECTION_BUTTON_SELECTOR)).toBeVisible();
  await expect(page.locator(SELECTION_AREA_SELECTOR)).toBeVisible();
  await expect(page.locator(SELECTION_AREA_SIZE_INDICATOR_SELECTOR)).toBeVisible();
  await expect(page.locator(OVERLAY_MASK_SECTION_SELECTOR)).toHaveCount(4);
  await expect(page.locator(SELECTION_HANDLE_SELECTOR)).toHaveCount(12);

  // Wait for and click the overlay capture button, and wait for thumbnail
  await captureAndVerifyImage(page, AREA_CAPTURE_BUTTON_SELECTOR);
  await assertImageCopiedToClipboard(page);
});

// TODO: create test to allow user to open sidebar, then allow user to move sidebar to other side of screen

// TODO: create test to allow user to select area, but then cancel it in different ways
// - expect test to allow user to select area to capture, but then tap the "Cancel" button to reset everything
// - expect test to allow user to select area to capture, but then use Escape key to reset everything

// TODO: create test that should allow user to adjust the size of the selection area

// TODO: create test that should allow user to start a selection over when not using drag handles and user is tapping on main screen

// NOT IMPLEMENTED (IGNORE): create test that should allow user to move sidebar either side while persisting selected area

// NOT IMPLEMENTED (IGNORE): create test that should allow user to change theme while persisting selected area

// NOT IMPLEMENTED (IGNORE): create test that should allow user to collapse and expand sidebar while persisting selected area

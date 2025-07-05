import { expect, test } from '../helpers/test-setup';
import {
  AREA_CAPTURE_BUTTON_SELECTOR,
  SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR,
  CANCEL_SELECTION_BUTTON_SELECTOR,
  PORTAL_VIEWPORT_OVERLAY_SELECTOR,
  SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR,
} from '../helpers/test-selectors';
import {
  sidebarShouldBeOpen,
  captureAndVerifyImage,
  assertImageCopiedToClipboard,
  assertAreaSelectionUIAfterDrag,
  assertAreaSelectionUIInitialized,
  assertAreaSelectionUITeardown,
  dragAndAssertSelectionSize,
} from '../helpers';

test.describe('Area Selection', () => {
  test('User can select area and capture image', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);
    await assertAreaSelectionUIInitialized(page);
    await assertAreaSelectionUIAfterDrag(page, 200, 200, 400, 400);
    await captureAndVerifyImage(page, AREA_CAPTURE_BUTTON_SELECTOR);
    await assertImageCopiedToClipboard(page);
  });

  test('User can cancel area selection via Cancel button', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);
    await assertAreaSelectionUIInitialized(page);
    await assertAreaSelectionUIAfterDrag(page, 200, 200, 400, 400);
    await page.click(CANCEL_SELECTION_BUTTON_SELECTOR);
    await assertAreaSelectionUITeardown(page);
    await sidebarShouldBeOpen(page);
  });

  test('User can cancel area selection via Escape key', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);
    await assertAreaSelectionUIInitialized(page);
    await assertAreaSelectionUIAfterDrag(page, 200, 200, 400, 400);
    await page.keyboard.press('Escape');
    await assertAreaSelectionUITeardown(page);
    await sidebarShouldBeOpen(page);
  });

  test('User can resize the selection area using drag handles', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);
    await assertAreaSelectionUIInitialized(page);
    await assertAreaSelectionUIAfterDrag(page, 200, 200, 400, 400);
    await dragAndAssertSelectionSize(page, 4, 50, 0, 'width', 'greater');
    await dragAndAssertSelectionSize(page, 3, -30, 0, 'width', 'less');
    await expect(page.locator(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR)).toBeVisible();
    await expect(page.locator(PORTAL_VIEWPORT_OVERLAY_SELECTOR)).toBeVisible();
    await expect(page.locator(SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR)).not.toBeVisible();
    await expect(page.locator(CANCEL_SELECTION_BUTTON_SELECTOR)).toBeVisible();
    await captureAndVerifyImage(page, AREA_CAPTURE_BUTTON_SELECTOR);
    await assertImageCopiedToClipboard(page);
    await sidebarShouldBeOpen(page);
  });

  test('User can start selection over by tapping on main screen', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await page.click(SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR);
    await assertAreaSelectionUIInitialized(page);
    await assertAreaSelectionUIAfterDrag(page, 200, 200, 400, 400);
    await page.mouse.click(100, 100);
    await assertAreaSelectionUIInitialized(page);
    await assertAreaSelectionUIAfterDrag(page, 300, 300, 500, 500);
    await captureAndVerifyImage(page, AREA_CAPTURE_BUTTON_SELECTOR);
    await assertImageCopiedToClipboard(page);
    await sidebarShouldBeOpen(page);
  });
});

// TODO: create test that will allow user to delete the captured image from the sidebar panel

// TODO: create test that will allow user to copy captured image from sidebar panel to clipboard

// NOT IMPLEMENTED (IGNORE): create test that will check that the captured images in the sidebar are layed out in a grid

// NOT IMPLEMENTED (IGNORE): create test that will check the hover affect of a captured image in the sidebar (actions)

// NOT IMPLEMENTED (IGNORE): create test that will allow user to open captured image from sidebar panel to annotation window

// NOT IMPLEMENTED (IGNORE): create test that should allow user to move sidebar either side while persisting selected area

// NOT IMPLEMENTED (IGNORE): create test that should allow user to change theme while persisting selected area

// NOT IMPLEMENTED (IGNORE): create test that should allow user to collapse and expand sidebar while persisting selected area

import { expect, type Page } from '@playwright/test';
import {
  SELECTION_AREA_SELECTOR,
  SELECTION_AREA_SIZE_INDICATOR_SELECTOR,
  OVERLAY_MASK_SECTION_SELECTOR,
  SELECTION_HANDLE_SELECTOR,
  CANCEL_SELECTION_BUTTON_SELECTOR,
  PORTAL_VIEWPORT_OVERLAY_SELECTOR,
  SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR,
} from './test-selectors';

// Type aliases for better type safety
type Coordinate = number;
type PixelDelta = number;
type DragSteps = number;
type HandleIndex = number;
type Dimension = 'width' | 'height';
type Comparison = 'greater' | 'less';

/**
 * Drags to select an area and asserts all expected selection UI elements are present.
 * @param page Playwright page object
 * @param startX Start X coordinate
 * @param startY Start Y coordinate
 * @param endX End X coordinate
 * @param endY End Y coordinate
 */
export async function assertAreaSelectionUIAfterDrag(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<void> {
  await dragToSelectArea(page, startX, startY, endX, endY);
  await expect(page.locator(SELECTION_AREA_SELECTOR)).toBeVisible();
  await expect(page.locator(SELECTION_AREA_SIZE_INDICATOR_SELECTOR)).toBeVisible();
  await expect(page.locator(OVERLAY_MASK_SECTION_SELECTOR)).toHaveCount(4);
  await expect(page.locator(SELECTION_HANDLE_SELECTOR)).toHaveCount(12);
  await expect(page.locator(CANCEL_SELECTION_BUTTON_SELECTOR)).toBeVisible();
}

/**
 * Asserts the correct UI is visible immediately after clicking the select area button, before any drag.
 * @param page Playwright page object
 */
export async function assertAreaSelectionUIInitialized(page: Page): Promise<void> {
  await expect(page.locator(PORTAL_VIEWPORT_OVERLAY_SELECTOR)).toBeVisible();
  await expect(page.locator(SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR)).toBeVisible();
  await expect(page.locator(CANCEL_SELECTION_BUTTON_SELECTOR)).toBeVisible();
}

/**
 * Asserts the UI is torn down after cancelling or completing area selection.
 * @param page Playwright page object
 */
export async function assertAreaSelectionUITeardown(page: Page): Promise<void> {
  await expect(page.locator(PORTAL_VIEWPORT_OVERLAY_SELECTOR)).not.toBeVisible();
  await expect(page.locator(SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR)).not.toBeVisible();
  await expect(page.locator(CANCEL_SELECTION_BUTTON_SELECTOR)).not.toBeVisible();
  await expect(page.locator(SELECTION_AREA_SELECTOR)).toHaveCount(0);
}

/**
 * Generic mouse drag helper.
 */
export async function dragMouse(
  page: Page,
  startX: Coordinate,
  startY: Coordinate,
  endX: Coordinate,
  endY: Coordinate,
  steps: DragSteps = 10
): Promise<void> {
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps });
  await page.mouse.up();
}

/**
 * Simulates a mouse drag to select an area on the page.
 */
export async function dragToSelectArea(
  page: Page,
  startX: Coordinate,
  startY: Coordinate,
  endX: Coordinate,
  endY: Coordinate,
  steps: DragSteps = 10
): Promise<void> {
  await dragMouse(page, startX, startY, endX, endY, steps);
}

/**
 * Drags a selection handle to resize the selection area.
 */
export async function dragSelectionHandle(
  page: Page,
  handleIndex: HandleIndex,
  deltaX: PixelDelta,
  deltaY: PixelDelta,
  steps: DragSteps = 10
): Promise<void> {
  // Find all selection handles
  const handles = await page.$$(SELECTION_HANDLE_SELECTOR);
  if (handles.length === 0) {
    throw new Error('No selection handles found');
  }
  if (handleIndex < 0 || handleIndex >= handles.length) {
    throw new Error(`Handle index ${handleIndex} out of range (found ${handles.length} handles)`);
  }
  const handle = handles[handleIndex];
  const box = await handle.boundingBox();
  if (!box) {
    throw new Error('Could not get bounding box for selection handle');
  }
  // Start drag from the center of the handle
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await dragMouse(page, startX, startY, startX + deltaX, startY + deltaY, steps);
}

/**
 * Helper to drag a selection handle and assert the change in size.
 * @param page Playwright page object
 * @param handleIndex Index of the handle to drag
 * @param deltaX Amount to move in X direction
 * @param deltaY Amount to move in Y direction
 * @param dimension 'width' or 'height'
 * @param comparison 'greater' or 'less'
 */
export async function dragAndAssertSelectionSize(
  page: Page,
  handleIndex: HandleIndex,
  deltaX: PixelDelta,
  deltaY: PixelDelta,
  dimension: Dimension,
  comparison: Comparison
): Promise<void> {
  const selectionArea = await page.$(SELECTION_AREA_SELECTOR);
  if (!selectionArea) {
    throw new Error('Selection area not found');
  }

  const initialBox = await selectionArea.boundingBox();
  if (!initialBox) {
    throw new Error('Could not get initial bounding box');
  }

  await dragSelectionHandle(page, handleIndex, deltaX, deltaY);

  const newBox = await selectionArea.boundingBox();
  if (!newBox) {
    throw new Error('Could not get new bounding box');
  }

  const initialValue = dimension === 'width' ? initialBox.width : initialBox.height;
  const newValue = dimension === 'width' ? newBox.width : newBox.height;
  const otherDimension = dimension === 'width' ? 'height' : 'width';
  const otherInitialValue = otherDimension === 'width' ? initialBox.width : initialBox.height;
  const otherNewValue = otherDimension === 'width' ? newBox.width : newBox.height;

  if (comparison === 'greater') {
    expect(newValue).toBeGreaterThan(initialValue);
  } else {
    expect(newValue).toBeLessThan(initialValue);
  }

  // Assert the other dimension remains unchanged
  expect(otherNewValue).toBe(otherInitialValue);
}

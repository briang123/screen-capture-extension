import { expect, type Page, type Locator } from '@playwright/test';
import {
  SIDEBAR_LEFT_PANEL_SELECTOR,
  SIDEBAR_RIGHT_PANEL_SELECTOR,
  SIDEBAR_MOVE_BUTTON_SELECTOR,
  SIDEBAR_EXPAND_COLLAPSE_BUTTON_SELECTOR,
  SIDEBAR_ROOT_SELECTOR,
} from './test-selectors';

/**
 * Moves the sidebar to the other side of the screen and returns the new panel locator.
 * @param page Playwright page object
 * @returns The Locator for the moved sidebar panel
 */
export async function moveSidebarToOtherSide(page: Page): Promise<Locator> {
  let isLeft = (await page.locator(SIDEBAR_LEFT_PANEL_SELECTOR).count()) > 0;
  await page.click(SIDEBAR_MOVE_BUTTON_SELECTOR);
  const movedPanel = isLeft
    ? page.locator(SIDEBAR_RIGHT_PANEL_SELECTOR)
    : page.locator(SIDEBAR_LEFT_PANEL_SELECTOR);
  await expect(movedPanel).toBeVisible();
  return movedPanel;
}

/**
 * Collapses the sidebar by clicking the expand/collapse button and verifying the collapsed state.
 * @param page Playwright page object
 */
export async function collapseSidebar(page: Page): Promise<void> {
  const sidebarPanel = await getCurrentSidebarPanel(page);
  await page.click(SIDEBAR_EXPAND_COLLAPSE_BUTTON_SELECTOR);
  await expect(sidebarPanel).toHaveClass(/collapsed/);
}

/**
 * Expands the sidebar by clicking the expand/collapse button and verifying the expanded state.
 * @param page Playwright page object
 */
export async function expandSidebar(page: Page): Promise<void> {
  const sidebarPanel = await getCurrentSidebarPanel(page);
  await page.click(SIDEBAR_EXPAND_COLLAPSE_BUTTON_SELECTOR);
  await expect(sidebarPanel).not.toHaveClass(/collapsed/);
}

/**
 * Returns the Locator for the currently visible sidebar panel (left or right).
 * @param page Playwright page object
 * @returns The Locator for the current sidebar panel
 */
export async function getCurrentSidebarPanel(page: Page): Promise<Locator> {
  let sidebarPanel = page.locator(SIDEBAR_LEFT_PANEL_SELECTOR);
  if ((await sidebarPanel.count()) === 0) {
    sidebarPanel = page.locator(SIDEBAR_RIGHT_PANEL_SELECTOR);
  }
  return sidebarPanel;
}

/**
 * Returns true if either the left or right sidebar panel is visible.
 * @param page Playwright page object
 * @returns True if the sidebar is open
 */
export async function isSidebarOpen(page: Page): Promise<boolean> {
  const leftVisible = await page
    .locator(SIDEBAR_LEFT_PANEL_SELECTOR)
    .isVisible()
    .catch(() => false);
  const rightVisible = await page
    .locator(SIDEBAR_RIGHT_PANEL_SELECTOR)
    .isVisible()
    .catch(() => false);
  return leftVisible || rightVisible;
}

/**
 * Asserts that the sidebar is open (visible on either side).
 * @param page Playwright page object
 */
export async function sidebarShouldBeOpen(page: Page): Promise<void> {
  expect(await isSidebarOpen(page)).toBe(true);
}

/**
 * Asserts that the sidebar root is not visible (sidebar is closed or removed).
 * @param page Playwright page object
 */
export async function sidebarShouldBeRemoved(page: Page): Promise<void> {
  await expect(page.locator(SIDEBAR_ROOT_SELECTOR)).not.toBeVisible();
}

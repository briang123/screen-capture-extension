import { test, SIDEBAR_CLOSE_BUTTON_SELECTOR } from '../helpers';
import {
  sidebarShouldBeOpen,
  sidebarShouldBeRemoved,
  moveSidebarToOtherSide,
  collapseSidebar,
  expandSidebar,
} from '../helpers';

test.describe('Sidebar Core Functionality', () => {
  test('User can close the sidebar by clicking the X button', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await page.click(SIDEBAR_CLOSE_BUTTON_SELECTOR);
    await sidebarShouldBeRemoved(page);
  });

  test('User can collapse and expand the sidebar', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await collapseSidebar(page);
    await expandSidebar(page);
    await moveSidebarToOtherSide(page);
    await collapseSidebar(page);
    await expandSidebar(page);
  });

  test('User can move the sidebar to the other side of the screen', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    await moveSidebarToOtherSide(page);
    await moveSidebarToOtherSide(page);
  });

  test('User can move the sidebar to the other side of the screen after extension loads', async ({
    page,
  }) => {
    await sidebarShouldBeOpen(page);
    await moveSidebarToOtherSide(page);
    await sidebarShouldBeOpen(page);
  });
});

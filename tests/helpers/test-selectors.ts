// tests/test-selectors.ts

// Static selectors
export const SIDEBAR_ROOT_SELECTOR = '#sc-sidebar-root';
export const SCREENSHOT_THUMBNAIL_SELECTOR = 'img[alt^="Captured screenshot thumbnail"]';
export const SIDEBAR_CAPTURE_BUTTON_SELECTOR = '[data-testid="sidebar-capture-button"]';
export const AREA_CAPTURE_BUTTON_SELECTOR = '[data-testid="area-capture-button"]';
export const SELECT_AREA_TO_CAPTURE_BUTTON_SELECTOR = 'button:has-text("Select Area to Capture")';
export const SIDEBAR_TITLE_SELECTOR = '[data-testid="sidebar-title"]';
export const SIDEBAR_THEME_TOGGLE_SELECTOR = '[data-testid="sidebar-theme-toggle"]';
export const SIDEBAR_MOVE_BUTTON_SELECTOR = '[data-testid="sidebar-move-button"]';
export const SIDEBAR_EXPAND_COLLAPSE_BUTTON_SELECTOR =
  '[data-testid="sidebar-expand-collapse-button"]';
export const SIDEBAR_CLOSE_BUTTON_SELECTOR = '[data-testid="sidebar-close-button"]';

// Selector factories / dynamic selectors
export const getSidebarPanelSelector = (panelName: string) => `[data-panel="${panelName}"]`;
export const getButtonByLabel = (label: string) => ({ name: new RegExp(label, 'i') });
export const getImageByPosition = (position: number) =>
  `img[alt^="Captured screenshot thumbnail"]:nth-of-type(${position})`;
export const getSelectedImage = () => '.sc-image.selected';
export const getSelectedImageOpenButton = () => '.sc-image.selected [data-testid="open-button"]';
export const getSelectedImageCopyButton = () => '.sc-image.selected [data-testid="copy-button"]';
export const getSelectedImageDeleteButton = () =>
  '.sc-image.selected [data-testid="delete-button"]';
export const getImageContainer = () => '.sc-image-container';
export const getButtonById = (id: string) => `button#${id}`;
export const getButtonByClass = (className: string) => `button.${className}`;

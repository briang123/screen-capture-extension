// tests/test-selectors.ts

// Static selectors
export const SIDEBAR_ROOT_SELECTOR = '#sc-sidebar-root';
export const SCREENSHOT_THUMBNAIL_SELECTOR = 'img[alt^="Captured screenshot thumbnail"]';

// Selector factories / dynamic selectors
export const getSidebarPanelSelector = (panelName) => `[data-panel="${panelName}"]`;
export const getButtonByLabel = (label) => ({ name: new RegExp(label, 'i') });
export const getImageByPosition = (position) =>
  `img[alt^="Captured screenshot thumbnail"]:nth-of-type(${position})`;
export const getSelectedImage = () => '.sc-image.selected';
export const getSelectedImageOpenButton = () => '.sc-image.selected [data-testid="open-button"]';
export const getSelectedImageCopyButton = () => '.sc-image.selected [data-testid="copy-button"]';
export const getSelectedImageDeleteButton = () =>
  '.sc-image.selected [data-testid="delete-button"]';
export const getImageContainer = () => '.sc-image-container';
export const getButtonById = (id) => `button#${id}`;
export const getButtonByClass = (className) => `button.${className}`;

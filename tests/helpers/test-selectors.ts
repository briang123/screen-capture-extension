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
export const SIDEBAR_LEFT_PANEL_SELECTOR = `${SIDEBAR_ROOT_SELECTOR} .sc-sidebarleft`;
export const SIDEBAR_RIGHT_PANEL_SELECTOR = `${SIDEBAR_ROOT_SELECTOR} .sc-sidebarright`;
// Selector for selection-handle class (should have 12 elements)
export const SELECTION_HANDLE_SELECTOR = '.selection-handle';
// Selector for overlay-mask-section class (should have 4 elements)
export const OVERLAY_MASK_SECTION_SELECTOR = '.overlay-mask-section';
// Selector for event-capturing-overlay (child of sc-sidebar-root) by data-testid
export const EVENT_CAPTURING_OVERLAY_SELECTOR = '[data-testid="event-capturing-overlay"]';
// Selector for sc-sidebar-root > selection-area-overlay by data-testid
export const SELECTION_AREA_OVERLAY_SELECTOR = '[data-testid="selection-area-overlay"]';
// Selector for portal-viewport-overlay (sibling of sc-sidebar-root) by data-testid
export const PORTAL_VIEWPORT_OVERLAY_SELECTOR = '[data-testid="portal-viewport-overlay"]';
// Selector for selection-area-size-indicator by data-testid
export const SELECTION_AREA_SIZE_INDICATOR_SELECTOR =
  '[data-testid="selection-area-size-indicator"]';
// Selector for select-area-instruction-container by data-testid
export const SELECT_AREA_INSTRUCTION_CONTAINER_SELECTOR =
  '[data-testid="select-area-instruction-container"]';
// Selector for cancel-selection-button by data-testid
export const CANCEL_SELECTION_BUTTON_SELECTOR = '[data-testid="cancel-selection-button"]';
// Selector for selection-area by data-testid
export const SELECTION_AREA_SELECTOR = '[data-testid="selection-area"]';

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

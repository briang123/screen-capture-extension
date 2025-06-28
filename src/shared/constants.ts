/**
 * Application-wide constants
 *
 * This file centralizes all hardcoded values used throughout the application,
 * making them easier to maintain, test, and modify.
 */

export const TIMEOUTS = {
  SUCCESS_MESSAGE: 3000,
  ERROR_MESSAGE: 5000,
  SIDEBAR_TRANSITION: 300,
  RESIZE_TIMEOUT: 50,
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  MANUAL_MAX_RETRIES: 2,
  BASE_DELAY: 1000,
  MANUAL_RETRY_DELAY: 500,
} as const;

export const ICON_SIZES = {
  TOOLBAR: 16,
  MANAGEMENT: 32,
  STORE_SEARCH: 48,
  STORE_DETAIL: 128,
  THUMBNAIL_WIDTH: 96,
  THUMBNAIL_HEIGHT: 48,
} as const;

export const CHROME_ACTIONS = {
  CAPTURE_SCREEN: 'captureScreen',
  CAPTURE_FULL_PAGE: 'captureFullPage',
  CAPTURE_TAB_VIEWPORT: 'captureTabViewport',
  CAPTURE_WINDOW: 'captureWindow',
  CAPTURE_AREA: 'captureArea',
  CAPTURE_ELEMENTS: 'captureElements',
} as const;

export const Z_INDEX = {
  CAPTURE_OVERLAY: 10000,
  INSTRUCTIONS_OVERLAY: 10001,
  SELECTION_OVERLAY: 10002,
} as const;

export const ANIMATION_DURATIONS = {
  SIDEBAR_SIDE_SWITCH: 500,
  VISIBILITY_TRANSITION: 300,
  BUTTON_HOVER: 200,
} as const;

export const ERROR_IDS = {
  NETWORK_ERROR: 'network-error',
  PERMISSION_ERROR: 'permission-error',
  STORAGE_ERROR: 'storage-error',
} as const;

export const OPERATION_NAMES = {
  SCREEN_CAPTURE: 'screen-capture',
  SCREEN_CAPTURE_RETRY: 'screen-capture-retry',
  GET_SETTINGS: 'getSettings',
  UPDATE_SETTINGS: 'updateSettings',
  RESET_SETTINGS: 'resetSettings',
} as const;

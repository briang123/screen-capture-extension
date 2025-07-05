/**
 * UI Mode Configuration for Playwright Tests
 *
 * This file provides configuration options for different UI modes
 * when testing the screen capture extension.
 */

export interface UIModeConfig {
  name: string;
  description: string;
  headless: boolean;
  showBrowser: boolean;
  collectVideo: boolean;
  collectScreenshots: boolean;
  extensionArgs: string[];
  viewport: { width: number; height: number };
}

export const UI_MODES: Record<string, UIModeConfig> = {
  // Popup Mode - Tests the extension popup interface
  popup: {
    name: 'popup',
    description: 'Test extension popup interface',
    headless: false,
    showBrowser: true,
    collectVideo: true,
    collectScreenshots: true,
    extensionArgs: [
      '--enable-extensions',
      '--disable-extensions-except=./dist',
      '--load-extension=./dist',
      '--disable-popup-blocking',
    ],
    viewport: { width: 400, height: 600 },
  },

  // Sidebar Mode - Tests the overlay sidebar for area selection
  sidebar: {
    name: 'sidebar',
    description: 'Test sidebar overlay for area selection',
    headless: false,
    showBrowser: true,
    collectVideo: true,
    collectScreenshots: true,
    extensionArgs: [
      '--enable-extensions',
      '--disable-extensions-except=./dist',
      '--load-extension=./dist',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ],
    viewport: { width: 1280, height: 800 },
  },

  // Window Mode - Tests the new window interface
  window: {
    name: 'window',
    description: 'Test new window interface',
    headless: false,
    showBrowser: true,
    collectVideo: true,
    collectScreenshots: true,
    extensionArgs: [
      '--enable-extensions',
      '--disable-extensions-except=./dist',
      '--load-extension=./dist',
      '--new-window',
    ],
    viewport: { width: 1024, height: 768 },
  },

  // Headless Mode - For CI/CD and automated testing
  headless: {
    name: 'headless',
    description: 'Headless mode for CI/CD',
    headless: true,
    showBrowser: false,
    collectVideo: false,
    collectScreenshots: true,
    extensionArgs: [
      '--enable-extensions',
      '--disable-extensions-except=./dist',
      '--load-extension=./dist',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
    viewport: { width: 1280, height: 800 },
  },

  // Debug Mode - Enhanced debugging with all features enabled
  debug: {
    name: 'debug',
    description: 'Debug mode with enhanced logging',
    headless: false,
    showBrowser: true,
    collectVideo: true,
    collectScreenshots: true,
    extensionArgs: [
      '--enable-extensions',
      '--disable-extensions-except=./dist',
      '--load-extension=./dist',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--enable-logging',
      '--v=1',
    ],
    viewport: { width: 1280, height: 800 },
  },
};

/**
 * Get UI mode configuration by name
 */
export function getUIModeConfig(modeName: string): UIModeConfig {
  const config = UI_MODES[modeName];
  if (!config) {
    throw new Error(
      `Unknown UI mode: ${modeName}. Available modes: ${Object.keys(UI_MODES).join(', ')}`
    );
  }
  return config;
}

/**
 * Get all available UI modes
 */
export function getAvailableUIModes(): string[] {
  return Object.keys(UI_MODES);
}

/**
 * Get default UI mode (sidebar for extension testing)
 */
export function getDefaultUIMode(): string {
  return 'sidebar';
}

/**
 * Check if UI mode is valid
 */
export function isValidUIMode(modeName: string): boolean {
  return modeName in UI_MODES;
}

/**
 * Test Setup Configuration
 *
 * This file configures the testing environment for the Chrome extension
 * with necessary mocks, global setup, and testing utilities.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Chrome extension APIs
const mockChrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    id: 'test-extension-id',
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  windows: {
    create: vi.fn(),
    update: vi.fn(),
    getAll: vi.fn(),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
};

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock navigator.clipboard
const mockClipboard = {
  write: vi.fn(),
  writeText: vi.fn(),
  read: vi.fn(),
  readText: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn() as typeof fetch;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

// Setup global mocks
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

Object.defineProperty(global.navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Export mocks for use in tests
export { mockChrome, mockLocalStorage, mockSessionStorage, mockClipboard };

// Helper function to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockChrome.storage.sync.get.mockClear();
  mockChrome.storage.sync.set.mockClear();
  mockChrome.storage.local.get.mockClear();
  mockChrome.storage.local.set.mockClear();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockSessionStorage.getItem.mockClear();
  mockSessionStorage.setItem.mockClear();
  mockClipboard.write.mockClear();
};

// Helper function to mock Chrome storage responses
export const mockChromeStorage = {
  sync: {
    get: (data: Record<string, unknown>) => {
      mockChrome.storage.sync.get.mockResolvedValue(data);
    },
    set: () => {
      mockChrome.storage.sync.set.mockResolvedValue(undefined);
    },
    error: (error: Error) => {
      mockChrome.storage.sync.get.mockRejectedValue(error);
      mockChrome.storage.sync.set.mockRejectedValue(error);
    },
  },
  local: {
    get: (data: Record<string, unknown>) => {
      mockChrome.storage.local.get.mockResolvedValue(data);
    },
    set: () => {
      mockChrome.storage.local.set.mockResolvedValue(undefined);
    },
    error: (error: Error) => {
      mockChrome.storage.local.get.mockRejectedValue(error);
      mockChrome.storage.local.set.mockRejectedValue(error);
    },
  },
};

// Helper function to mock localStorage responses
export const mockLocalStorageData = {
  getItem: (key: string, value: string | null) => {
    mockLocalStorage.getItem.mockImplementation((k: string) => (k === key ? value : null));
  },
  setItem: () => {
    mockLocalStorage.setItem.mockImplementation(() => {});
  },
  error: (error: Error) => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw error;
    });
    mockLocalStorage.setItem.mockImplementation(() => {
      throw error;
    });
  },
};

// Silence unhandledRejection warnings in Vitest (for async/fake timer tests)
process.on('unhandledRejection', () => {});

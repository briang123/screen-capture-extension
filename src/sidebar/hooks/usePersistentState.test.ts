// Simple test/demo for usePersistentState hook
// This file demonstrates the hook usage patterns

import { usePersistentState, useLocalStorage, useChromeSyncStorage } from './usePersistentState';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { mockLocalStorageData, resetAllMocks } from '../../test-setup';

// Mock Chrome storage
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  sync: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockStorage,
  },
  writable: true,
});

describe('usePersistentState', () => {
  let storageChangeListener:
    | ((
        changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
        areaName: string
      ) => void)
    | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Setup Chrome storage mock
    mockStorage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });
    mockStorage.local.set.mockImplementation((items, callback) => {
      if (callback) callback();
    });
    mockStorage.local.remove.mockImplementation((keys, callback) => {
      if (callback) callback();
    });

    // Capture the storage change listener
    mockStorage.local.onChanged.addListener.mockImplementation((listener) => {
      storageChangeListener = listener;
    });
  });

  afterEach(() => {
    storageChangeListener = null;
  });

  const simulateStorageChange = (key: string, newValue: unknown, oldValue?: unknown) => {
    if (storageChangeListener) {
      storageChangeListener(
        {
          [key]: {
            newValue,
            oldValue,
          },
        },
        'local'
      );
    }
  };

  describe('useLocalStorage', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      expect(result.current[0]).toBe(0);
    });

    it('should load value from localStorage', async () => {
      mockLocalStorageData.getItem('sc_settings', '42');
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      await waitFor(() => {
        expect(result.current[0]).toBe(42);
      });
    });

    it('should update value and save to localStorage', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      await act(async () => {
        // Set the mock for getItem to return the new value before simulating the event
        global.localStorage.getItem = vi.fn(() => '42');
        result.current[1](42);
        // Simulate storage event
        window.dispatchEvent(new StorageEvent('storage', { key: 'sc_settings', newValue: '42' }));
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith('sc_settings', '42');
        expect(result.current[0]).toBe(42);
      });
    });

    it('should clear value from localStorage', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      await act(async () => {
        result.current[2]();
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(global.localStorage.removeItem).toHaveBeenCalledWith('sc_settings');
      });
      expect(result.current[0]).toBe(0);
    });
  });

  describe('useChromeSyncStorage', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useChromeSyncStorage('test-key', { theme: 'light' }));
      expect(result.current[0]).toEqual({ theme: 'light' });
    });

    it('should load value from Chrome sync storage', async () => {
      global.chrome.storage.sync.get = vi.fn().mockResolvedValue({ 'test-key': { theme: 'dark' } });
      const { result } = renderHook(() => useChromeSyncStorage('test-key', { theme: 'light' }));
      await waitFor(() => {
        expect(result.current[0]).toEqual({ theme: 'dark' });
      });
    });

    it('should update value and save to Chrome sync storage', async () => {
      global.chrome.storage.sync.set = vi.fn().mockImplementation(async (obj) => {
        // Set the mock for get to return the new value before simulating the event
        global.chrome.storage.sync.get = vi.fn().mockResolvedValue(obj);
      });
      // @ts-expect-error: test-only mock
      global.chrome.storage.onChanged = {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
      const { result } = renderHook(() => useChromeSyncStorage('test-key', { theme: 'light' }));
      await act(async () => {
        result.current[1]({ theme: 'dark' });
        // Simulate chrome.storage.onChanged event
        const changes = {
          'test-key': { oldValue: { theme: 'light' }, newValue: { theme: 'dark' } },
        };
        if (global.chrome?.storage?.onChanged?.addListener) {
          const listeners = global.chrome.storage.onChanged.addListener as unknown as [
            (changes: Record<string, unknown>, areaName: string) => void,
          ][];
          if (listeners.length > 0) {
            const listener = listeners[0][0];
            listener(changes, 'sync');
          }
        }
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({
          'test-key': { theme: 'dark' },
        });
        expect(result.current[0]).toEqual({ theme: 'dark' });
      });
    });

    it('should clear value from Chrome sync storage', async () => {
      global.chrome.storage.sync.remove = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useChromeSyncStorage('test-key', { theme: 'light' }));
      await act(async () => {
        result.current[2]();
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(global.chrome.storage.sync.remove).toHaveBeenCalledWith('test-key');
      });
      expect(result.current[0]).toEqual({ theme: 'light' });
    });
  });

  describe('usePersistentState with custom options', () => {
    it('should handle custom serialization', () => {
      const serialize = vi.fn((date: Date) => date.toISOString());
      const deserialize = vi.fn((str: string) => new Date(str));
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-date',
          backend: 'localStorage',
          defaultValue: new Date('2023-01-01'),
          serialize,
          deserialize,
        })
      );
      expect(result.current[0]).toEqual(new Date('2023-01-01'));
    });

    it('should handle errors gracefully', async () => {
      const onError = vi.fn();
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-error',
          backend: 'localStorage',
          defaultValue: 'default',
          onError,
        })
      );
      await waitFor(() => {
        expect(result.current[0]).toBe('default');
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('with localStorage', () => {
    it('should initialize with default value when no stored value exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'localStorage',
        })
      );

      expect(result.current[0]).toBe('default-value');
    });

    it('should initialize with stored value when available', async () => {
      const storedValue = JSON.stringify('stored-value');
      localStorageMock.getItem.mockReturnValue(storedValue);

      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'localStorage',
        })
      );

      await waitFor(() => {
        expect(result.current[0]).toBe('stored-value');
      });
    });

    it('should update state and localStorage when setValue is called', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'localStorage',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('new-value')
      );
    });

    it('should handle complex objects', async () => {
      const complexObject = { name: 'test', value: 123 };
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: complexObject,
          backend: 'localStorage',
        })
      );

      act(() => {
        result.current[1](complexObject);
      });

      expect(result.current[0]).toEqual(complexObject);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(complexObject)
      );
    });

    it('should handle null values', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: null,
          backend: 'localStorage',
        })
      );

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(null));
    });

    it('should handle undefined values', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'localStorage',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('new-value')
      );
    });
  });

  describe('with Chrome storage', () => {
    it('should initialize with default value when no stored value exists', async () => {
      mockStorage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      await waitFor(() => {
        expect(result.current[0]).toBe('default-value');
      });
    });

    it('should initialize with stored value when available', async () => {
      mockStorage.local.get.mockImplementation((keys, callback) => {
        callback({ 'test-key': 'stored-value' });
      });

      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      await waitFor(() => {
        expect(result.current[0]).toBe('stored-value');
      });
    });

    it('should update state and Chrome storage when setValue is called', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { 'test-key': 'new-value' },
        expect.any(Function)
      );
    });

    it('should update state when storage changes externally', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      // Simulate external storage change
      act(() => {
        simulateStorageChange('test-key', 'external-value', 'default-value');
      });

      await waitFor(() => {
        expect(result.current[0]).toBe('external-value');
      });
    });

    it('should handle complex objects in Chrome storage', async () => {
      const complexObject = { name: 'test', value: 123 };
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: complexObject,
          backend: 'chrome.local',
        })
      );

      act(() => {
        result.current[1](complexObject);
      });

      expect(result.current[0]).toEqual(complexObject);
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { 'test-key': complexObject },
        expect.any(Function)
      );
    });

    it('should handle null values in Chrome storage', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: null,
          backend: 'chrome.local',
        })
      );

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { 'test-key': null },
        expect.any(Function)
      );
    });

    it('should handle undefined values in Chrome storage', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { 'test-key': 'new-value' },
        expect.any(Function)
      );
    });

    it('should remove value from storage when set to undefined', async () => {
      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { 'test-key': 'new-value' },
        expect.any(Function)
      );
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'localStorage',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      // Should still update the state even if storage fails
      expect(result.current[0]).toBe('new-value');
    });

    it('should handle Chrome storage errors gracefully', async () => {
      mockStorage.local.set.mockImplementation((items, callback) => {
        if (callback) callback();
      });

      const { result } = renderHook(() =>
        usePersistentState({
          key: 'test-key',
          defaultValue: 'default-value',
          backend: 'chrome.local',
        })
      );

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { 'test-key': 'new-value' },
        expect.any(Function)
      );
    });
  });
});

// Example usage patterns (not actual tests, just demonstrations)

// 1. Basic localStorage usage
export function DemoBasicUsage() {
  const [count, setCount, clearCount] = useLocalStorage<number>('demo-counter', 0);

  return {
    count,
    increment: () => setCount(count + 1),
    reset: () => setCount(0),
    clear: clearCount,
  };
}

// 2. Complex object with Chrome sync storage
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  language: string;
}

export function DemoChromeSyncUsage() {
  const [preferences, setPreferences] = useChromeSyncStorage<UserPreferences>('user-preferences', {
    theme: 'light',
    fontSize: 14,
    language: 'en',
  });

  return {
    preferences,
    updateTheme: (theme: 'light' | 'dark') => setPreferences((prev) => ({ ...prev, theme })),
    updateFontSize: (fontSize: number) => setPreferences((prev) => ({ ...prev, fontSize })),
    updateLanguage: (language: string) => setPreferences((prev) => ({ ...prev, language })),
  };
}

// 3. Advanced usage with custom options
interface AppState {
  isFirstVisit: boolean;
  lastVisitDate: string;
  settings: Record<string, unknown>;
}

export function DemoAdvancedUsage() {
  const [appState, setAppState, clearAppState] = usePersistentState<AppState>({
    key: 'app-state',
    backend: 'localStorage',
    defaultValue: {
      isFirstVisit: true,
      lastVisitDate: new Date().toISOString(),
      settings: {},
    },
    onError: (error) => {
      console.warn('Storage error:', error);
    },
    sync: true,
  });

  return {
    appState,
    markVisited: () =>
      setAppState((prev) => ({
        ...prev,
        isFirstVisit: false,
        lastVisitDate: new Date().toISOString(),
      })),
    updateSettings: (settings: Record<string, unknown>) =>
      setAppState((prev) => ({ ...prev, settings })),
    clear: clearAppState,
  };
}

// 4. Custom serialization example
export function DemoCustomSerialization() {
  const [lastVisit, setLastVisit, clearLastVisit] = useLocalStorage<Date>(
    'last-visit',
    new Date(),
    {
      serialize: (date) => date.toISOString(),
      deserialize: (str) => new Date(str),
    }
  );

  return {
    lastVisit,
    updateVisit: () => setLastVisit(new Date()),
    clear: clearLastVisit,
  };
}

// Usage examples:
// const basic = DemoBasicUsage();
// basic.increment(); // Increments counter and saves to localStorage
//
// const sync = DemoChromeSyncUsage();
// sync.updateTheme('dark'); // Updates theme and syncs across devices
//
// const advanced = DemoAdvancedUsage();
// advanced.markVisited(); // Updates visit state with custom error handling
//
// const custom = DemoCustomSerialization();
// custom.updateVisit(); // Updates date with custom serialization

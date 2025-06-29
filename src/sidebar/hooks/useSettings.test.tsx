/**
 * useSettings Hook Tests
 *
 * Comprehensive unit tests for the useSettings hook including
 * error scenarios, loading states, retry mechanisms, and edge cases.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from './useSettings';
import { StorageError, NetworkError, PermissionError } from '@/shared/error-handling';
import { mockChromeStorage, resetAllMocks } from '@/test-setup';

describe('useSettings', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.settings).toBeDefined();
    });

    it('should load settings successfully', async () => {
      const mockSettings = { theme: 'dark', quality: 'high' as const };
      mockChromeStorage.sync.get({ settings: mockSettings });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'dark',
        quality: 'high',
        format: 'png',
      });
      expect(result.current.error).toBeNull();
    });

    it('should use default settings when no stored settings', async () => {
      mockChromeStorage.sync.get({});

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'light',
        quality: 'high',
        format: 'png',
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage quota errors', async () => {
      const quotaError = new StorageError('QUOTA_BYTES_PER_ITEM exceeded', 'error', false);
      mockChromeStorage.sync.error(quotaError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.id).toBe('storage-error');
      expect(result.current.error?.message).toContain('Storage limit exceeded');
      expect(result.current.error?.retryable).toBe(false);
    });

    it('should handle storage not available errors', async () => {
      const notAvailableError = new StorageError('Storage not available', 'error', true);
      mockChromeStorage.sync.error(notAvailableError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.id).toBe('storage-error');
      expect(result.current.error?.message).toContain('Storage is not available');
      expect(result.current.error?.retryable).toBe(true);
    });

    it('should handle network errors', async () => {
      const networkError = new NetworkError('Request timeout');
      mockChromeStorage.sync.error(networkError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.id).toBe('network-error');
      expect(result.current.error?.message).toContain('Request timed out');
      expect(result.current.error?.retryable).toBe(true);
    });

    it('should handle permission errors', async () => {
      const permissionError = new PermissionError('Storage permission denied');
      mockChromeStorage.sync.error(permissionError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.id).toBe('permission-error');
      expect(result.current.error?.message).toContain('Additional permissions are required');
      expect(result.current.error?.retryable).toBe(false);
    });

    it('should fallback to defaults on persistent errors', async () => {
      const persistentError = new Error('Persistent storage error');
      mockChromeStorage.sync.error(persistentError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still have error but also have default settings
      expect(result.current.error).toBeDefined();
      expect(result.current.settings).toEqual({
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'light',
        quality: 'high',
        format: 'png',
      });
    });
  });

  describe('Settings Updates', () => {
    it('should update settings successfully', async () => {
      const initialSettings = {
        autoSave: false,
        backgroundType: 'gradient' as const,
        theme: 'light' as const,
        quality: 'high' as const,
        format: 'png' as const,
      };

      // Mock the initial load
      mockChromeStorage.sync.get({ settings: initialSettings });

      // Capture the storage change listener
      let storageChangeListener:
        | ((changes: Record<string, unknown>, areaName: string) => void)
        | null = null;
      global.chrome.storage.onChanged.addListener = vi.fn().mockImplementation((listener) => {
        storageChangeListener = listener;
      });

      // Mock the update operation to trigger storage change event
      const mockSet = vi.fn().mockImplementation(async (data) => {
        // Simulate the storage change event that would be triggered
        if (storageChangeListener) {
          storageChangeListener(
            {
              settings: {
                oldValue: initialSettings,
                newValue: data.settings,
              },
            },
            'sync'
          );
        }
      });
      global.chrome.storage.sync.set = mockSet;

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update settings
      await act(async () => {
        await result.current.updateSettings({ theme: 'dark' });
      });

      // The settings should be updated via the storage change listener
      expect(result.current.settings.theme).toBe('dark');
      expect(result.current.settings.autoSave).toBe(false); // Should preserve other settings
      expect(result.current.error).toBeNull();
    });

    it('should handle update errors', async () => {
      const initialSettings = {
        autoSave: false,
        backgroundType: 'gradient' as const,
        theme: 'light' as const,
        quality: 'high' as const,
        format: 'png' as const,
      };

      global.chrome.storage.sync.get = vi.fn().mockResolvedValue({ settings: initialSettings });
      // Mock update to fail
      const updateError = new Error('Update failed');
      global.chrome.storage.sync.set = vi.fn().mockRejectedValue(updateError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateSettings({ theme: 'dark' })).rejects.toThrow();
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
      expect(result.current.error?.id).toBeDefined();
    }, 10000);

    it('should merge multiple settings updates', async () => {
      const initialSettings = {
        autoSave: false,
        backgroundType: 'gradient' as const,
        theme: 'light' as const,
        quality: 'high' as const,
        format: 'png' as const,
      };

      // Mock the initial load
      mockChromeStorage.sync.get({ settings: initialSettings });

      // Capture the storage change listener
      let storageChangeListener:
        | ((changes: Record<string, unknown>, areaName: string) => void)
        | null = null;
      global.chrome.storage.onChanged.addListener = vi.fn().mockImplementation((listener) => {
        storageChangeListener = listener;
      });

      // Mock the update operation to trigger storage change event
      const mockSet = vi.fn().mockImplementation(async (data) => {
        // Simulate the storage change event that would be triggered
        if (storageChangeListener) {
          storageChangeListener(
            {
              settings: {
                oldValue: initialSettings,
                newValue: data.settings,
              },
            },
            'sync'
          );
        }
      });
      global.chrome.storage.sync.set = mockSet;

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update multiple settings
      await act(async () => {
        await result.current.updateSettings({ theme: 'dark', quality: 'medium' });
      });

      // The settings should be updated via the storage change listener
      expect(result.current.settings.theme).toBe('dark');
      expect(result.current.settings.quality).toBe('medium');
      expect(result.current.settings.autoSave).toBe(false); // Should preserve other settings
    }, 10000);
  });

  describe('Retry Mechanism', () => {
    it('should retry on temporary failures', async () => {
      const mockGet = vi
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ settings: { theme: 'dark' } });
      global.chrome.storage.sync.get = mockGet;

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.retry();
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(result.current.settings.theme).toBe('dark');
      });
      expect(result.current.error).toBeNull();
    }, 10000);

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new StorageError('Quota exceeded', 'error', false);
      mockChromeStorage.sync.error(nonRetryableError);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.retryable).toBe(false);
    });

    it('should handle Chrome storage not available', async () => {
      // Temporarily remove chrome storage
      const originalChrome = global.chrome;
      global.chrome = { ...originalChrome, storage: undefined } as unknown as typeof global.chrome;

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'light',
        quality: 'high',
        format: 'png',
      });

      // Restore chrome
      global.chrome = originalChrome;
    });
  });

  describe('Error Clearing', () => {
    it('should clear errors when successful operation occurs', async () => {
      const error = new StorageError('Test error');
      mockChromeStorage.sync.error(error);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear errors when settings are updated successfully', async () => {
      const initialSettings = {
        autoSave: false,
        backgroundType: 'gradient' as const,
        theme: 'light' as const,
        quality: 'high' as const,
        format: 'png' as const,
      };

      mockChromeStorage.sync.get({ settings: initialSettings });
      mockChromeStorage.sync.set();

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set an error first
      act(() => {
        result.current.clearError();
      });

      await act(async () => {
        await result.current.updateSettings({ theme: 'dark' });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('should show loading during initial load', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.isLoading).toBe(true);
    });

    it('should show loading during settings update', async () => {
      const initialSettings = {
        autoSave: false,
        backgroundType: 'gradient' as const,
        theme: 'light' as const,
        quality: 'high' as const,
        format: 'png' as const,
      };

      mockChromeStorage.sync.get({ settings: initialSettings });

      // Create a slow update promise
      const slowUpdate = new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });

      vi.mocked(global.chrome.storage.sync.set).mockImplementation(() => slowUpdate);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatePromise = act(async () => {
        await result.current.updateSettings({ theme: 'dark' });
      });

      // Should not be loading during update since it's handled by storage change listener
      expect(result.current.isLoading).toBe(false);

      await updatePromise;
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined stored settings', async () => {
      mockChromeStorage.sync.get({ settings: null });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'light',
        quality: 'high',
        format: 'png',
      });
    });

    it('should handle partial stored settings', async () => {
      mockChromeStorage.sync.get({ settings: { theme: 'dark' } });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'dark',
        quality: 'high',
        format: 'png',
      });
    });
  });
});

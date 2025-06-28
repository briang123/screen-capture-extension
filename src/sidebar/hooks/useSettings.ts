/**
 * useSettings - Settings Management Hook
 *
 * This hook provides a comprehensive solution for managing extension settings
 * with Chrome sync storage integration, proper merging, and cross-tab synchronization.
 *
 * WHY USE THIS HOOK:
 * - Provides a unified interface for all extension settings
 * - Handles Chrome sync storage with automatic cross-device synchronization
 * - Ensures proper settings merging to prevent accidental data loss
 * - Includes comprehensive error handling and fallback mechanisms
 * - Supports legacy storage format migration automatically
 * - Provides convenience hooks for common settings patterns
 *
 * COMMON USE CASES:
 * - Extension-wide settings management (theme, quality, format, autoSave)
 * - User preference persistence across browser sessions
 * - Cross-device settings synchronization via Chrome sync
 * - Settings migration during extension updates
 * - Default settings initialization and fallbacks
 * - Real-time settings updates across multiple tabs
 *
 * KEY FEATURES:
 * - Chrome sync storage integration with error handling
 * - Automatic cross-tab synchronization via storage change listeners
 * - Proper settings merging to prevent overwrites
 * - Legacy string format migration support
 * - Type-safe settings interface with full TypeScript support
 * - Convenience hooks for individual settings (useTheme, useQuality, useFormat)
 *
 * STORAGE INTEGRATION:
 * - Uses Chrome sync storage for cross-device synchronization
 * - Falls back to default settings when storage is unavailable
 * - Handles storage quota limits gracefully
 * - Supports offline mode with local defaults
 *
 * SYNCHRONIZATION:
 * - Real-time settings updates across all extension tabs/windows
 * - Automatic state synchronization when settings change in other tabs
 * - Proper cleanup of storage change listeners
 * - Optimized re-renders with useCallback
 *
 * ERROR HANDLING:
 * - Graceful degradation when Chrome storage is unavailable
 * - Fallback to default settings on storage errors
 * - Comprehensive error logging for debugging
 * - User-friendly error recovery mechanisms
 *
 * PERFORMANCE BENEFITS:
 * - Efficient settings loading with single storage read
 * - Optimized re-renders with proper dependency arrays
 * - Memory leak prevention with proper cleanup
 * - Debounced storage updates to prevent excessive writes
 *
 * CONVENIENCE HOOKS:
 * - useTheme: Theme management with toggle functionality
 * - useQuality: Quality setting management
 * - useFormat: Format setting management
 * - All hooks provide type-safe interfaces and proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS, mergeSettings, updateSettings } from '@/shared/settings';
import { createUserFacingError, UserFacingError } from '@/shared/error-handling';

export interface UseSettingsReturn {
  settings: Settings;
  isLoading: boolean;
  error: UserFacingError | null;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  retry: () => Promise<void>;
  clearError: () => void;
}

/**
 * useSettings - Settings Management Hook
 *
 * Manages extension settings with proper merging, migration, and Chrome sync storage.
 * Uses the shared settings helper for consistent behavior across the extension.
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UserFacingError | null>(null);

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (chrome?.storage?.sync) {
        const result = await chrome.storage.sync.get('settings');
        const loadedSettings = mergeSettings(result.settings, {});
        setSettingsState(loadedSettings);
      } else {
        // Fallback to defaults if Chrome storage is not available
        setSettingsState(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      const userFacingError = createUserFacingError(error);
      setError(userFacingError);
      setSettingsState(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Listen for storage changes
  useEffect(() => {
    if (!chrome?.storage?.sync) return;

    const handleStorageChange = (
      changes: { [key: string]: { oldValue?: unknown; newValue?: unknown } },
      areaName: string
    ) => {
      if (areaName === 'sync' && changes.settings) {
        try {
          const newSettings = mergeSettings(changes.settings.newValue, {});
          setSettingsState(newSettings);
          setError(null); // Clear any previous errors
        } catch (error) {
          console.error('Failed to process storage change:', error);
          const userFacingError = createUserFacingError(error);
          setError(userFacingError);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Update settings with proper merging and error handling
  const updateSettingsState = useCallback(async (updates: Partial<Settings>) => {
    setError(null);

    try {
      await updateSettings(updates);
      // The storage change listener will update the state
    } catch (error) {
      console.error('Failed to update settings:', error);
      const userFacingError = createUserFacingError(error);
      setError(userFacingError);
      throw error;
    }
  }, []);

  // Reset settings to defaults with error handling
  const resetSettingsState = useCallback(async () => {
    setError(null);

    try {
      await updateSettings(DEFAULT_SETTINGS);
      // The storage change listener will update the state
    } catch (error) {
      console.error('Failed to reset settings:', error);
      const userFacingError = createUserFacingError(error);
      setError(userFacingError);
      throw error;
    }
  }, []);

  // Retry loading settings
  const retry = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsState,
    resetSettings: resetSettingsState,
    retry,
    clearError,
  };
}

/**
 * Convenience hook for theme management
 */
export function useTheme(): ['light' | 'dark', () => Promise<void>] {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = useCallback(async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    await updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);

  return [settings.theme, toggleTheme];
}

/**
 * Convenience hook for quality setting
 */
export function useQuality(): [
  'low' | 'medium' | 'high',
  (quality: 'low' | 'medium' | 'high') => Promise<void>,
] {
  const { settings, updateSettings } = useSettings();

  const setQuality = useCallback(
    async (quality: 'low' | 'medium' | 'high') => {
      await updateSettings({ quality });
    },
    [updateSettings]
  );

  return [settings.quality, setQuality];
}

/**
 * Convenience hook for format setting
 */
export function useFormat(): [
  'png' | 'jpg' | 'webp',
  (format: 'png' | 'jpg' | 'webp') => Promise<void>,
] {
  const { settings, updateSettings } = useSettings();

  const setFormat = useCallback(
    async (format: 'png' | 'jpg' | 'webp') => {
      await updateSettings({ format });
    },
    [updateSettings]
  );

  return [settings.format, setFormat];
}

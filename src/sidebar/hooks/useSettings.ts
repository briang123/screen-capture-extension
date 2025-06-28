import { useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS, mergeSettings, updateSettings } from '../../shared/settings';

/**
 * useSettings - Settings Management Hook
 *
 * Manages extension settings with proper merging, migration, and Chrome sync storage.
 * Uses the shared settings helper for consistent behavior across the extension.
 */
export function useSettings(): [
  Settings,
  (updates: Partial<Settings>) => Promise<void>,
  () => Promise<void>,
] {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
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
        setSettingsState(DEFAULT_SETTINGS);
      }
    };

    loadSettings();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    if (!chrome?.storage?.sync) return;

    const handleStorageChange = (
      changes: { [key: string]: { oldValue?: unknown; newValue?: unknown } },
      areaName: string
    ) => {
      if (areaName === 'sync' && changes.settings) {
        const newSettings = mergeSettings(changes.settings.newValue, {});
        setSettingsState(newSettings);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Update settings with proper merging
  const updateSettingsState = useCallback(async (updates: Partial<Settings>) => {
    try {
      await updateSettings(updates);
      // The storage change listener will update the state
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      await updateSettings(DEFAULT_SETTINGS);
      // The storage change listener will update the state
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }, []);

  return [settings, updateSettingsState, resetSettings];
}

/**
 * Convenience hook for theme management
 */
export function useTheme(): ['light' | 'dark', () => Promise<void>] {
  const [settings, updateSettings] = useSettings();

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
  const [settings, updateSettings] = useSettings();

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
  const [settings, updateSettings] = useSettings();

  const setFormat = useCallback(
    async (format: 'png' | 'jpg' | 'webp') => {
      await updateSettings({ format });
    },
    [updateSettings]
  );

  return [settings.format, setFormat];
}

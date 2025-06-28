// Shared settings management utilities
export interface Settings {
  autoSave: boolean;
  backgroundType: 'gradient' | 'solid' | 'transparent';
  theme: 'light' | 'dark';
  quality: 'low' | 'medium' | 'high';
  format: 'png' | 'jpg' | 'webp';
}

export const DEFAULT_SETTINGS: Settings = {
  autoSave: false,
  backgroundType: 'gradient',
  theme: 'light',
  quality: 'high',
  format: 'png',
};

/**
 * Safely merges partial settings with existing settings
 * Handles migration from legacy string format to object format
 */
export function mergeSettings(existingSettings: unknown, updates: Partial<Settings>): Settings {
  // Handle legacy string format migration
  let currentSettings: Partial<Settings> = {};

  if (typeof existingSettings === 'string') {
    try {
      currentSettings = JSON.parse(existingSettings);
    } catch {
      console.warn('Failed to parse legacy settings string, using defaults');
      currentSettings = {};
    }
  } else if (existingSettings && typeof existingSettings === 'object') {
    currentSettings = existingSettings as Partial<Settings>;
  }

  // Merge with defaults first, then with updates
  const mergedSettings = {
    ...DEFAULT_SETTINGS,
    ...currentSettings,
    ...updates,
  };

  return mergedSettings;
}

/**
 * Updates settings in Chrome storage with proper merging
 */
export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  try {
    const result = await chrome.storage.sync.get('settings');
    const currentSettings = result.settings;

    const mergedSettings = mergeSettings(currentSettings, updates);

    await chrome.storage.sync.set({ settings: mergedSettings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

/**
 * Gets settings from Chrome storage with defaults and migration
 */
export async function getSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.sync.get('settings');
    return mergeSettings(result.settings, {});
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Resets settings to defaults
 */
export async function resetSettings(): Promise<void> {
  try {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('Failed to reset settings:', error);
    throw error;
  }
}

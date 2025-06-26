// Storage utility functions for Chrome Extension
// TODO: Add error handling and validation
// TODO: Add storage migration utilities

export interface StorageSettings {
  autoSave: boolean;
  backgroundType: 'gradient' | 'solid' | 'image' | 'none';
  theme: 'light' | 'dark' | 'auto';
  quality: 'low' | 'medium' | 'high';
  format: 'png' | 'jpg' | 'webp';
}

export interface StorageData {
  settings?: StorageSettings;
  captures?: Array<{
    id: string;
    timestamp: number;
    imageData: string;
    annotations?: unknown;
  }>;
}

// Get data from Chrome storage
export async function getStorageData<T = unknown>(
  keys: string | string[]
): Promise<Record<string, T>> {
  try {
    return await chrome.storage.sync.get(keys);
  } catch (error) {
    console.error('Failed to get storage data:', error);
    throw error;
  }
}

// Set data in Chrome storage
export async function setStorageData(data: Record<string, unknown>): Promise<void> {
  try {
    await chrome.storage.sync.set(data);
  } catch (error) {
    console.error('Failed to set storage data:', error);
    throw error;
  }
}

// Remove data from Chrome storage
export async function removeStorageData(keys: string | string[]): Promise<void> {
  try {
    await chrome.storage.sync.remove(keys);
  } catch (error) {
    console.error('Failed to remove storage data:', error);
    throw error;
  }
}

// Clear all storage data
export async function clearStorageData(): Promise<void> {
  try {
    await chrome.storage.sync.clear();
  } catch (error) {
    console.error('Failed to clear storage data:', error);
    throw error;
  }
}

// Get settings with default values
export async function getSettings(): Promise<StorageSettings> {
  try {
    const result = await getStorageData<StorageSettings>(['settings']);
    const defaultSettings: StorageSettings = {
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'light',
      quality: 'high',
      format: 'png',
    };

    return { ...defaultSettings, ...result.settings };
  } catch (error) {
    console.error('Failed to get settings:', error);
    // Return default settings if storage fails
    return {
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'light',
      quality: 'high',
      format: 'png',
    };
  }
}

// Save settings
export async function saveSettings(settings: Partial<StorageSettings>): Promise<void> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await setStorageData({ settings: updatedSettings });
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

// Save capture to storage
export async function saveCapture(imageData: string, annotations?: unknown): Promise<string> {
  try {
    const captures = await getStorageData<
      Array<{ id: string; timestamp: number; imageData: string; annotations?: unknown }>
    >(['captures']);
    const captureList = captures.captures || [];

    const newCapture = {
      id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      imageData,
      annotations,
    };

    captureList.push(newCapture);
    await setStorageData({ captures: captureList });

    return newCapture.id;
  } catch (error) {
    console.error('Failed to save capture:', error);
    throw error;
  }
}

// Get all captures
export async function getCaptures(): Promise<
  Array<{ id: string; timestamp: number; imageData: string; annotations?: unknown }>
> {
  try {
    const result = await getStorageData<{
      captures?: Array<{ id: string; timestamp: number; imageData: string; annotations?: unknown }>;
    }>(['captures']);
    return result.captures || [];
  } catch (error) {
    console.error('Failed to get captures:', error);
    return [];
  }
}

// Delete capture by ID
export async function deleteCapture(captureId: string): Promise<void> {
  try {
    const captures = await getCaptures();
    const filteredCaptures = captures.filter((capture) => capture.id !== captureId);
    await setStorageData({ captures: filteredCaptures });
  } catch (error) {
    console.error('Failed to delete capture:', error);
    throw error;
  }
}

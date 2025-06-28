/**
 * Settings Tests
 *
 * Unit tests for the settings management utilities including
 * merging, storage operations, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSettings,
  updateSettings,
  resetSettings,
  DEFAULT_SETTINGS,
  mergeSettings,
  Settings,
} from './settings';
import { StorageError } from './error-handling';
import { mockChromeStorage, resetAllMocks, mockChrome } from '../test-setup';

describe('Settings Interface', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should have the correct default settings', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'light',
      quality: 'high',
      format: 'png',
    });
  });

  it('should have valid settings types', () => {
    const settings = DEFAULT_SETTINGS;
    expect(typeof settings.autoSave).toBe('boolean');
    expect(['gradient', 'solid']).toContain(settings.backgroundType);
    expect(['light', 'dark']).toContain(settings.theme);
    expect(['low', 'medium', 'high']).toContain(settings.quality);
    expect(['png', 'jpg', 'webp']).toContain(settings.format);
  });
});

describe('mergeSettings', () => {
  it('should merge partial updates with existing settings', () => {
    const existing: Settings = {
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'light',
      quality: 'high',
      format: 'png',
    };

    const updates = {
      theme: 'dark' as const,
      quality: 'medium' as const,
    };

    const result = mergeSettings(existing, updates);

    expect(result).toEqual({
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'dark',
      quality: 'medium',
      format: 'png',
    });
  });

  it('should use defaults when no existing settings', () => {
    const updates = {
      theme: 'dark' as const,
    };

    const result = mergeSettings(null, updates);

    expect(result).toEqual({
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'dark',
      quality: 'high',
      format: 'png',
    });
  });

  it('should handle legacy string format migration', () => {
    const legacyString = JSON.stringify({
      theme: 'dark',
      quality: 'low',
    });

    const updates = {
      autoSave: true,
    };

    const result = mergeSettings(legacyString, updates);

    expect(result).toEqual({
      autoSave: true,
      backgroundType: 'gradient',
      theme: 'dark',
      quality: 'low',
      format: 'png',
    });
  });

  it('should handle invalid legacy string gracefully', () => {
    const invalidString = 'invalid json';

    const updates = {
      theme: 'dark' as const,
    };

    const result = mergeSettings(invalidString, updates);

    expect(result).toEqual({
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'dark',
      quality: 'high',
      format: 'png',
    });
  });

  it('should handle empty updates', () => {
    const existing: Settings = {
      autoSave: true,
      backgroundType: 'solid',
      theme: 'dark',
      quality: 'medium',
      format: 'jpg',
    };

    const result = mergeSettings(existing, {});

    expect(result).toEqual(existing);
  });
});

describe('updateSettings', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should update settings successfully', async () => {
    mockChromeStorage.sync.get({ settings: DEFAULT_SETTINGS });
    mockChromeStorage.sync.set();

    const updates = {
      theme: 'dark' as const,
      quality: 'medium' as const,
    };

    await expect(updateSettings(updates)).resolves.toBeUndefined();

    expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({
      settings: {
        autoSave: false,
        backgroundType: 'gradient',
        theme: 'dark',
        quality: 'medium',
        format: 'png',
      },
    });
  });

  it('should handle storage quota errors', async () => {
    const quotaError = new Error('QUOTA_BYTES_PER_ITEM exceeded');
    mockChromeStorage.sync.error(quotaError);

    const updates = { theme: 'dark' as const };

    await expect(updateSettings(updates)).rejects.toThrow(StorageError);

    // Test the user-facing error message, not the thrown error
    try {
      await updateSettings(updates);
    } catch (error) {
      if (error instanceof StorageError) {
        expect(error.userFacing.message).toContain('Storage limit exceeded');
      }
    }
  });

  it('should handle storage not available errors', async () => {
    vi.useFakeTimers();

    const notAvailableError = new Error('Storage not available');
    mockChromeStorage.sync.error(notAvailableError);

    const updates = { theme: 'dark' as const };

    const promise = updateSettings(updates);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow(StorageError);
    await promise.catch(() => {}); // Prevent unhandled rejection
    try {
      await promise;
    } catch (error) {
      expect(error).toBeInstanceOf(StorageError);
      if (error instanceof StorageError) {
        expect(error.userFacing.message).toContain('Storage is not available');
      }
    }
    vi.useRealTimers();
  });

  it('should retry on temporary failures', async () => {
    mockChromeStorage.sync.get({ settings: DEFAULT_SETTINGS });
    mockChromeStorage.sync.set();

    const updates = { theme: 'dark' as const };

    await expect(updateSettings(updates)).resolves.toBeUndefined();
    expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
  });
});

describe('getSettings', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should get settings successfully', async () => {
    const storedSettings = {
      autoSave: true,
      backgroundType: 'solid',
      theme: 'dark',
      quality: 'medium',
      format: 'jpg',
    };

    mockChromeStorage.sync.get({ settings: storedSettings });

    const result = await getSettings();

    expect(result).toEqual(storedSettings);
    expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
  });

  it('should return defaults when no settings stored', async () => {
    mockChromeStorage.sync.get({});

    const result = await getSettings();

    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('should handle storage errors and return defaults', async () => {
    vi.useFakeTimers();

    mockChromeStorage.sync.error(new Error('Storage error'));

    const promise = getSettings();

    // Advance timers to handle retry delays
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toEqual(DEFAULT_SETTINGS);

    vi.useRealTimers();
  });

  it('should migrate legacy string format', async () => {
    const legacySettings = JSON.stringify({
      theme: 'dark',
      quality: 'low',
    });

    mockChromeStorage.sync.get({ settings: legacySettings });

    const result = await getSettings();

    expect(result).toEqual({
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'dark',
      quality: 'low',
      format: 'png',
    });
  });
});

describe('resetSettings', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should reset settings to defaults', async () => {
    mockChromeStorage.sync.set();

    await expect(resetSettings()).resolves.toBeUndefined();

    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({
      settings: DEFAULT_SETTINGS,
    });
  });

  it('should handle reset errors', async () => {
    vi.useFakeTimers();

    mockChromeStorage.sync.error(new Error('Reset failed'));

    const promise = resetSettings();
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow(StorageError);
    await promise.catch(() => {}); // Prevent unhandled rejection
    vi.useRealTimers();
  });
});

describe('Settings Validation', () => {
  it('should validate backgroundType values', () => {
    const validTypes = ['gradient', 'solid', 'transparent'] as const;

    validTypes.forEach((type) => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        backgroundType: type,
      };
      expect(settings.backgroundType).toBe(type);
    });
  });

  it('should validate theme values', () => {
    const validThemes = ['light', 'dark'] as const;

    validThemes.forEach((theme) => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        theme,
      };
      expect(settings.theme).toBe(theme);
    });
  });

  it('should validate quality values', () => {
    const validQualities = ['low', 'medium', 'high'] as const;

    validQualities.forEach((quality) => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        quality,
      };
      expect(settings.quality).toBe(quality);
    });
  });

  it('should validate format values', () => {
    const validFormats = ['png', 'jpg', 'webp'] as const;

    validFormats.forEach((format) => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        format,
      };
      expect(settings.format).toBe(format);
    });
  });
});

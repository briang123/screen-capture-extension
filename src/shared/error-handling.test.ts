/**
 * Error Handling Tests
 *
 * Comprehensive unit tests for error handling utilities including
 * error classes, retry mechanisms, and user-facing error creation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StorageError,
  NetworkError,
  PermissionError,
  retryOperation,
  createUserFacingError,
  isChromeStorageAvailable,
  isChromeExtensionAvailable,
  ErrorSeverity,
  UserFacingError,
  ErrorContext,
} from './error-handling';

describe('Error Classes', () => {
  describe('StorageError', () => {
    it('should create a StorageError with default severity and retryable', () => {
      const error = new StorageError('Test storage error');

      expect(error).toBeInstanceOf(StorageError);
      expect(error.message).toBe('Test storage error');
      expect(error.severity).toBe('error');
      expect(error.retryable).toBe(true);
      expect(error.userFacing).toBeDefined();
    });

    it('should create a StorageError with custom severity and retryable', () => {
      const error = new StorageError('Test storage error', 'warning', false);

      expect(error.severity).toBe('warning');
      expect(error.retryable).toBe(false);
    });

    it('should create user-facing message for quota exceeded', () => {
      const error = new StorageError('QUOTA_BYTES_PER_ITEM exceeded');

      expect(error.userFacing.message).toContain('Storage limit exceeded');
      expect(error.userFacing.suggestions).toContain('Clear browser data and cookies');
    });

    it('should create user-facing message for storage not available', () => {
      const error = new StorageError('Storage not available');

      expect(error.userFacing.message).toContain('Storage is not available');
      expect(error.userFacing.suggestions).toContain('Check browser permissions');
    });

    it('should create generic user-facing message for unknown errors', () => {
      const error = new StorageError('Unknown storage error');

      expect(error.userFacing.message).toContain('Unable to save settings');
      expect(error.userFacing.suggestions).toContain('Try again');
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with default severity and retryable', () => {
      const error = new NetworkError('Test network error');

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Test network error');
      expect(error.severity).toBe('error');
      expect(error.retryable).toBe(true);
      expect(error.userFacing).toBeDefined();
    });

    it('should create user-facing message for timeout', () => {
      const error = new NetworkError('Request timeout');

      expect(error.userFacing.message).toContain('Request timed out');
      expect(error.userFacing.suggestions).toContain('Check your internet connection');
    });

    it('should create user-facing message for offline', () => {
      const error = new NetworkError('Network offline');

      expect(error.userFacing.message).toContain('You appear to be offline');
      expect(error.userFacing.suggestions).toContain('Check your internet connection');
    });

    it('should create user-facing message for CORS error', () => {
      const error = new NetworkError('CORS policy violation');

      expect(error.userFacing.message).toContain('Cross-origin request blocked');
      expect(error.userFacing.suggestions).toContain('Try again');
    });
  });

  describe('PermissionError', () => {
    it('should create a PermissionError with default severity and not retryable', () => {
      const error = new PermissionError('Test permission error');

      expect(error).toBeInstanceOf(PermissionError);
      expect(error.message).toBe('Test permission error');
      expect(error.severity).toBe('warning');
      expect(error.retryable).toBe(false);
      expect(error.userFacing).toBeDefined();
    });

    it('should create user-facing message for storage permission', () => {
      const error = new PermissionError('Storage permission denied');

      expect(error.userFacing.message).toContain('Additional permissions are required');
      expect(error.userFacing.suggestions).toContain('Go to extension settings');
    });

    it('should create user-facing message for tabs permission', () => {
      const error = new PermissionError('Tabs permission denied');

      expect(error.userFacing.message).toContain('Additional permissions are required');
      expect(error.userFacing.suggestions).toContain('Grant required permissions');
    });

    it('should create user-facing message for scripting permission', () => {
      const error = new PermissionError('Scripting permission denied');

      expect(error.userFacing.message).toContain('Additional permissions are required');
      expect(error.userFacing.suggestions).toContain('Disable and re-enable the extension');
    });
  });
});

describe('retryOperation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await retryOperation(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on second attempt', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce('success');

    const resultPromise = retryOperation(operation);

    // Fast-forward through the retry delay
    await vi.runAllTimersAsync();

    const result = await resultPromise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    const error = new Error('Persistent failure');
    const operation = vi.fn().mockRejectedValue(error);

    const resultPromise = retryOperation(operation, 2);

    // Fast-forward through retry delays
    await vi.runAllTimersAsync();

    await expect(resultPromise).rejects.toThrow('Persistent failure');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should not retry non-retryable errors', async () => {
    const error = new StorageError('Quota exceeded', 'error', false);
    const operation = vi.fn().mockRejectedValue(error);

    await expect(retryOperation(operation)).rejects.toThrow('Quota exceeded');
    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });

  it('should not retry permission errors', async () => {
    const error = new PermissionError('Permission denied');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(retryOperation(operation)).rejects.toThrow('Permission denied');
    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });

  it('should use exponential backoff', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce('success');

    const resultPromise = retryOperation(operation, 3, 1000);

    // First retry should be after 1 second
    await vi.advanceTimersByTimeAsync(999);
    expect(operation).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(operation).toHaveBeenCalledTimes(2);

    // Second retry should be after 2 seconds
    await vi.advanceTimersByTimeAsync(1999);
    expect(operation).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    expect(operation).toHaveBeenCalledTimes(3);

    const result = await resultPromise;
    expect(result).toBe('success');
  });

  it('should include context in error logging', async () => {
    const error = new Error('Test error');
    const operation = vi.fn().mockRejectedValue(error);
    const context: ErrorContext = {
      operation: 'test',
      component: 'test-component',
      timestamp: Date.now(),
    };

    const resultPromise = retryOperation(operation, 1, 1000, context);

    await vi.runAllTimersAsync();

    await expect(resultPromise).rejects.toThrow('Test error');

    // Verify that console.warn was called with context
    expect(console.warn).toHaveBeenCalledWith(
      'Retry 1/1 after 1000ms:',
      expect.objectContaining({
        error: 'Test error',
        context: expect.objectContaining({
          operation: 'test',
          component: 'test-component',
          retryCount: 1,
        }),
      })
    );
  });
});

describe('createUserFacingError', () => {
  it('should return user-facing error for StorageError', () => {
    const error = new StorageError('Test storage error');
    const userError = createUserFacingError(error);

    expect(userError).toBe(error.userFacing);
    expect(userError.id).toBe('storage-error');
  });

  it('should return user-facing error for NetworkError', () => {
    const error = new NetworkError('Test network error');
    const userError = createUserFacingError(error);

    expect(userError).toBe(error.userFacing);
    expect(userError.id).toBe('network-error');
  });

  it('should return user-facing error for PermissionError', () => {
    const error = new PermissionError('Test permission error');
    const userError = createUserFacingError(error);

    expect(userError).toBe(error.userFacing);
    expect(userError.id).toBe('permission-error');
  });

  it('should create generic error for unknown errors', () => {
    const error = new Error('Unknown error');
    const userError = createUserFacingError(error);

    expect(userError.id).toBe('unknown-error');
    expect(userError.title).toBe('Unexpected Error');
    expect(userError.message).toContain('unexpected error occurred');
    expect(userError.retryable).toBe(true);
  });

  it('should handle non-Error objects', () => {
    const userError = createUserFacingError('String error');

    expect(userError.id).toBe('unknown-error');
    expect(userError.title).toBe('Unexpected Error');
  });
});

describe('Availability Checks', () => {
  const originalChrome = global.chrome;

  afterEach(() => {
    global.chrome = originalChrome;
  });

  describe('isChromeStorageAvailable', () => {
    it('should return true when Chrome storage is available', () => {
      global.chrome = {
        storage: {
          sync: {},
          local: {},
        },
      } as unknown as typeof chrome;

      expect(isChromeStorageAvailable()).toBe(true);
    });

    it('should return false when Chrome is not available', () => {
      global.chrome = undefined as unknown as typeof chrome;

      expect(isChromeStorageAvailable()).toBe(false);
    });

    it('should return false when Chrome storage is not available', () => {
      global.chrome = {
        runtime: {},
      } as unknown as typeof chrome;

      expect(isChromeStorageAvailable()).toBe(false);
    });

    it('should return false when Chrome sync storage is not available', () => {
      global.chrome = {
        storage: {
          local: {},
        },
      } as unknown as typeof chrome;

      expect(isChromeStorageAvailable()).toBe(false);
    });
  });

  describe('isChromeExtensionAvailable', () => {
    it('should return true when Chrome extension is available', () => {
      global.chrome = {
        runtime: {
          id: 'test-extension',
        },
      } as unknown as typeof chrome;

      expect(isChromeExtensionAvailable()).toBe(true);
    });

    it('should return false when Chrome is not available', () => {
      global.chrome = undefined as unknown as typeof chrome;

      expect(isChromeExtensionAvailable()).toBe(false);
    });

    it('should return false when Chrome runtime is not available', () => {
      global.chrome = {
        storage: {},
      } as unknown as typeof chrome;

      expect(isChromeExtensionAvailable()).toBe(false);
    });

    it('should return false when Chrome runtime id is not available', () => {
      global.chrome = {
        runtime: {},
      } as unknown as typeof chrome;

      expect(isChromeExtensionAvailable()).toBe(false);
    });
  });
});

describe('Error Context', () => {
  it('should create error context with required fields', () => {
    const context: ErrorContext = {
      operation: 'test-operation',
      component: 'test-component',
      userId: 'test-user',
      timestamp: Date.now(),
      retryCount: 1,
      customField: 'custom-value',
    };

    expect(context.operation).toBe('test-operation');
    expect(context.component).toBe('test-component');
    expect(context.userId).toBe('test-user');
    expect(context.timestamp).toBeGreaterThan(0);
    expect(context.retryCount).toBe(1);
    expect(context.customField).toBe('custom-value');
  });
});

describe('UserFacingError Interface', () => {
  it('should create user-facing error with all required fields', () => {
    const userError: UserFacingError = {
      id: 'test-error',
      title: 'Test Error',
      message: 'This is a test error message',
      severity: 'error',
      actionable: true,
      retryable: true,
      suggestions: ['Try again', 'Contact support'],
    };

    expect(userError.id).toBe('test-error');
    expect(userError.title).toBe('Test Error');
    expect(userError.message).toBe('This is a test error message');
    expect(userError.severity).toBe('error');
    expect(userError.actionable).toBe(true);
    expect(userError.retryable).toBe(true);
    expect(userError.suggestions).toHaveLength(2);
  });

  it('should support all severity levels', () => {
    const severities: ErrorSeverity[] = ['info', 'warning', 'error', 'critical'];

    severities.forEach((severity) => {
      const userError: UserFacingError = {
        id: 'test-error',
        title: 'Test Error',
        message: 'Test message',
        severity,
        actionable: true,
        retryable: true,
      };

      expect(userError.severity).toBe(severity);
    });
  });
});

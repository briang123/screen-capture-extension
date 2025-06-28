/**
 * Error Handling Utilities
 *
 * This module provides centralized error handling for the Chrome extension
 * with user-facing messages, retry mechanisms, and comprehensive logging.
 *
 * WHY USE THIS MODULE:
 * - Centralizes error handling logic across the extension
 * - Provides user-friendly error messages for common failures
 * - Implements retry mechanisms for transient failures
 * - Includes comprehensive error logging for debugging
 * - Supports different error types and severity levels
 * - Ensures consistent error handling behavior
 *
 * COMMON USE CASES:
 * - Storage operation failures (quota exceeded, network issues)
 * - Chrome API failures (permissions, unavailable APIs)
 * - Network request failures (timeouts, connectivity issues)
 * - User-facing error notifications and feedback
 * - Automatic retry for transient failures
 * - Error recovery and fallback mechanisms
 *
 * KEY FEATURES:
 * - User-friendly error messages with actionable guidance
 * - Configurable retry mechanisms with exponential backoff
 * - Error severity classification (info, warning, error, critical)
 * - Comprehensive error logging with context
 * - Fallback mechanisms for critical failures
 * - Error reporting for analytics and debugging
 *
 * ERROR TYPES:
 * - StorageError: Chrome storage operation failures
 * - NetworkError: Network connectivity and API failures
 * - PermissionError: Chrome extension permission issues
 * - ValidationError: Data validation and type errors
 * - UnknownError: Unclassified errors with fallback handling
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  timestamp: number;
  retryCount?: number;
  [key: string]: unknown;
}

export interface UserFacingError {
  id: string;
  title: string;
  message: string;
  severity: ErrorSeverity;
  actionable: boolean;
  retryable: boolean;
  suggestions?: string[];
}

export class StorageError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly userFacing: UserFacingError;

  constructor(
    message: string,
    severity: ErrorSeverity = 'error',
    retryable: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'StorageError';
    this.severity = severity;
    this.retryable = retryable;

    this.userFacing = {
      id: 'storage-error',
      title: 'Storage Error',
      message: this.getUserFacingMessage(message),
      severity,
      actionable: true,
      retryable,
      suggestions: this.getSuggestions(message),
    };

    this.logError(context);
  }

  private getUserFacingMessage(errorMessage: string): string {
    if (errorMessage.includes('QUOTA_BYTES_PER_ITEM')) {
      return 'Storage limit exceeded. Please clear some data or use lower quality settings.';
    }
    if (errorMessage.includes('QUOTA_BYTES')) {
      return 'Storage quota exceeded. Please clear browser data or reduce settings.';
    }
    if (errorMessage.includes('not available')) {
      return 'Storage is not available. Please check your browser settings.';
    }
    return 'Unable to save settings. Please try again or refresh the page.';
  }

  private getSuggestions(errorMessage: string): string[] {
    if (errorMessage.includes('QUOTA')) {
      return [
        'Clear browser data and cookies',
        'Use lower quality settings',
        'Restart your browser',
      ];
    }
    if (errorMessage.includes('not available')) {
      return [
        'Check browser permissions',
        'Disable and re-enable the extension',
        'Update your browser',
      ];
    }
    return ['Try again', 'Refresh the page', 'Contact support if the problem persists'];
  }

  private logError(context?: ErrorContext): void {
    console.error(`[${this.name}] ${this.message}`, {
      severity: this.severity,
      retryable: this.retryable,
      context,
      stack: this.stack,
    });
  }
}

export class NetworkError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly userFacing: UserFacingError;

  constructor(
    message: string,
    severity: ErrorSeverity = 'error',
    retryable: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'NetworkError';
    this.severity = severity;
    this.retryable = retryable;

    this.userFacing = {
      id: 'network-error',
      title: 'Network Error',
      message: this.getUserFacingMessage(message),
      severity,
      actionable: true,
      retryable,
      suggestions: this.getSuggestions(message),
    };

    this.logError(context);
  }

  private getUserFacingMessage(errorMessage: string): string {
    if (errorMessage.includes('timeout')) {
      return 'Request timed out. Please check your internet connection.';
    }
    if (errorMessage.includes('offline')) {
      return 'You appear to be offline. Please check your internet connection.';
    }
    if (errorMessage.includes('CORS')) {
      return 'Cross-origin request blocked. Please check your browser settings.';
    }
    return 'Network error occurred. Please check your connection and try again.';
  }

  private getSuggestions(errorMessage: string): string[] {
    if (errorMessage.includes('timeout') || errorMessage.includes('offline')) {
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Disable VPN if you are using one',
      ];
    }
    return ['Try again', 'Check your connection', 'Contact support if the problem persists'];
  }

  private logError(context?: ErrorContext): void {
    console.error(`[${this.name}] ${this.message}`, {
      severity: this.severity,
      retryable: this.retryable,
      context,
      stack: this.stack,
    });
  }
}

export class PermissionError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly userFacing: UserFacingError;

  constructor(
    message: string,
    severity: ErrorSeverity = 'warning',
    retryable: boolean = false,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'PermissionError';
    this.severity = severity;
    this.retryable = retryable;

    this.userFacing = {
      id: 'permission-error',
      title: 'Permission Required',
      message: this.getUserFacingMessage(message),
      severity,
      actionable: true,
      retryable,
      suggestions: this.getSuggestions(),
    };

    this.logError(context);
  }

  private getUserFacingMessage(errorMessage: string): string {
    if (errorMessage.includes('storage')) {
      return 'Storage permission is required. Please grant permission in extension settings.';
    }
    if (errorMessage.includes('tabs')) {
      return 'Tab access permission is required. Please grant permission in extension settings.';
    }
    if (errorMessage.includes('scripting')) {
      return 'Script injection permission is required. Please grant permission in extension settings.';
    }
    return 'Additional permissions are required. Please check extension settings.';
  }

  private getSuggestions(): string[] {
    return [
      'Go to extension settings',
      'Grant required permissions',
      'Disable and re-enable the extension',
      'Contact support if the problem persists',
    ];
  }

  private logError(context?: ErrorContext): void {
    console.error(`[${this.name}] ${this.message}`, {
      severity: this.severity,
      retryable: this.retryable,
      context,
      stack: this.stack,
    });
  }
}

/**
 * Create a user-friendly error from any error
 */
export function createUserFacingError(error: unknown): UserFacingError {
  if (
    error instanceof StorageError ||
    error instanceof NetworkError ||
    error instanceof PermissionError
  ) {
    return error.userFacing;
  }

  // Handle unknown errors
  return {
    id: 'unknown-error',
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again or contact support.',
    severity: 'error',
    actionable: true,
    retryable: true,
    suggestions: ['Try again', 'Refresh the page', 'Contact support'],
  };
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: ErrorContext
): Promise<T> {
  let lastError: Error | null = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      retryCount++;

      if (retryCount > maxRetries) {
        break;
      }

      // Check if error is retryable
      if (error instanceof StorageError && !error.retryable) {
        throw error;
      }
      if (error instanceof NetworkError && !error.retryable) {
        throw error;
      }
      if (error instanceof PermissionError) {
        throw error; // Permission errors are not retryable
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, retryCount - 1);

      console.warn(`Retry ${retryCount}/${maxRetries} after ${delay}ms:`, {
        error: lastError.message,
        context: { ...context, retryCount },
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  if (lastError) {
    console.error(`Operation failed after ${maxRetries} retries:`, {
      error: lastError.message,
      context: { ...context, retryCount },
    });
    throw lastError;
  }

  throw new Error('Operation failed with unknown error');
}

/**
 * Check if Chrome storage is available
 */
export function isChromeStorageAvailable(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    chrome.storage !== undefined &&
    chrome.storage.sync !== undefined
  );
}

/**
 * Check if Chrome extension APIs are available
 */
export function isChromeExtensionAvailable(): boolean {
  return (
    typeof chrome !== 'undefined' && chrome.runtime !== undefined && chrome.runtime.id !== undefined
  );
}

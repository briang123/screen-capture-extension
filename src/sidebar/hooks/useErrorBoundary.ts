/**
 * useErrorBoundary - Error Handling Hook for Sidebar Components
 *
 * This hook provides error boundary functionality for functional components
 * and hooks, allowing for error handling at the hook level.
 *
 * WHY USE THIS HOOK:
 * - Provides error handling for functional components and hooks
 * - Allows for graceful error recovery in hooks
 * - Integrates with the existing error handling system
 * - Provides error state management for components
 * - Supports error reporting and logging
 * - Implements graceful fallbacks for failed operations
 * - Provides degraded functionality when features are unavailable
 *
 * COMMON USE CASES:
 * - Hook errors (useState, useEffect, custom hooks)
 * - Async operation errors in hooks
 * - API call errors in hooks
 * - State management errors
 * - Context errors in functional components
 * - Network failures and offline scenarios
 * - API unavailability and degraded functionality
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { createUserFacingError, UserFacingError } from '@/shared/error-handling';
import { ERROR_IDS, TIMEOUTS, RETRY_CONFIG, FALLBACK_CONFIG } from '@/shared/constants';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  userFacingError: UserFacingError | null;
  fallbackAttempts: number;
  isInDegradedMode: boolean;
  lastErrorTime: number | null;
}

interface UseErrorBoundaryOptions {
  onError?: (error: Error) => void;
  autoReset?: boolean;
  resetDelay?: number;
  enableGracefulDegradation?: boolean;
  maxFallbackAttempts?: number;
  autoRecoveryEnabled?: boolean;
  degradedModeTimeout?: number;
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}) {
  const {
    onError,
    autoReset = false,
    resetDelay = TIMEOUTS.ERROR_MESSAGE,
    enableGracefulDegradation = FALLBACK_CONFIG.DEGRADED_MODE_ENABLED,
    maxFallbackAttempts = FALLBACK_CONFIG.MAX_FALLBACK_ATTEMPTS,
    autoRecoveryEnabled = FALLBACK_CONFIG.AUTO_RECOVERY_ENABLED,
    degradedModeTimeout = FALLBACK_CONFIG.GRACEFUL_DEGRADATION_TIMEOUT,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    userFacingError: null,
    fallbackAttempts: 0,
    isInDegradedMode: false,
    lastErrorTime: null,
  });

  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const degradedModeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetError = useCallback(() => {
    // Clear recovery timeout
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }

    setErrorState((prev) => ({
      ...prev,
      hasError: false,
      error: null,
      userFacingError: null,
    }));
  }, []);

  const setError = useCallback(
    (error: Error) => {
      console.error('useErrorBoundary caught an error:', error);

      const userFacingError = createUserFacingError(error);

      setErrorState((prevState) => {
        const newFallbackAttempts = prevState.fallbackAttempts + 1;

        // Log additional context for debugging
        logErrorContext(error, newFallbackAttempts, prevState.isInDegradedMode);

        // Attempt automatic recovery if enabled
        if (autoRecoveryEnabled && newFallbackAttempts < maxFallbackAttempts) {
          // Clear any existing recovery timeout
          if (recoveryTimeoutRef.current) {
            clearTimeout(recoveryTimeoutRef.current);
          }

          // Attempt recovery with exponential backoff
          const recoveryDelay = Math.min(
            TIMEOUTS.FALLBACK_RECOVERY * Math.pow(2, newFallbackAttempts),
            TIMEOUTS.GRACEFUL_DEGRADATION
          );

          recoveryTimeoutRef.current = setTimeout(() => {
            console.log(
              `Attempting auto-recovery (attempt ${newFallbackAttempts + 1}/${maxFallbackAttempts})`
            );
            resetError();
          }, recoveryDelay);
        }

        // Check if we should enter degraded mode
        if (enableGracefulDegradation && newFallbackAttempts >= maxFallbackAttempts) {
          // Enter degraded mode after max attempts
          // Clear any existing degraded mode timeout
          if (degradedModeTimeoutRef.current) {
            clearTimeout(degradedModeTimeoutRef.current);
          }

          // Exit degraded mode after timeout
          degradedModeTimeoutRef.current = setTimeout(() => {
            setErrorState((prev) => ({ ...prev, isInDegradedMode: false }));
          }, degradedModeTimeout);
        }

        return {
          hasError: true,
          error,
          userFacingError,
          fallbackAttempts: newFallbackAttempts,
          isInDegradedMode: enableGracefulDegradation && newFallbackAttempts >= maxFallbackAttempts,
          lastErrorTime: Date.now(),
        };
      });

      // Call the onError callback if provided
      onError?.(error);
    },
    [
      onError,
      autoRecoveryEnabled,
      maxFallbackAttempts,
      enableGracefulDegradation,
      degradedModeTimeout,
      resetError,
    ]
  );

  const handleRetry = useCallback(async () => {
    resetError();
  }, [resetError]);

  const handleDismiss = useCallback(() => {
    setErrorState((prev) => ({ ...prev, hasError: false }));
  }, []);

  const handleDegradedMode = useCallback(() => {
    // Force exit degraded mode
    setErrorState((prev) => ({ ...prev, isInDegradedMode: false }));
    if (degradedModeTimeoutRef.current) {
      clearTimeout(degradedModeTimeoutRef.current);
      degradedModeTimeoutRef.current = null;
    }
  }, []);

  // Auto-reset functionality
  useEffect(() => {
    if (autoReset && errorState.hasError) {
      const timer = setTimeout(() => {
        resetError();
      }, resetDelay);

      return () => clearTimeout(timer);
    }
  }, [autoReset, resetDelay, errorState.hasError, resetError]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      if (degradedModeTimeoutRef.current) {
        clearTimeout(degradedModeTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...errorState,
    setError,
    resetError,
    handleRetry,
    handleDismiss,
    handleDegradedMode,
  };
}

function logErrorContext(error: Error, fallbackAttempts: number, isInDegradedMode: boolean): void {
  const errorContext = {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    hookName: 'useErrorBoundary',
    errorId: getErrorId(error),
    maxRetries: RETRY_CONFIG.MAX_RETRIES,
    fallbackAttempts,
    isInDegradedMode,
  };

  console.error('Error context:', errorContext);
}

function getErrorId(error: Error): string {
  // Map error types to specific error IDs
  if (error.name.includes('Network') || error.message.includes('fetch')) {
    return ERROR_IDS.NETWORK_ERROR;
  }
  if (error.name.includes('Permission') || error.message.includes('permission')) {
    return ERROR_IDS.PERMISSION_ERROR;
  }
  if (error.name.includes('Storage') || error.message.includes('storage')) {
    return ERROR_IDS.STORAGE_ERROR;
  }
  if (error.name.includes('Capture') || error.message.includes('capture')) {
    return ERROR_IDS.CAPTURE_ERROR;
  }
  return ERROR_IDS.COMPONENT_ERROR;
}

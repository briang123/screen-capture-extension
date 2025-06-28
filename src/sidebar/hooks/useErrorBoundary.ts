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
 *
 * COMMON USE CASES:
 * - Hook errors (useState, useEffect, custom hooks)
 * - Async operation errors in hooks
 * - API call errors in hooks
 * - State management errors
 * - Context errors in functional components
 */

import { useState, useCallback, useEffect } from 'react';
import { createUserFacingError, UserFacingError } from '@/shared/error-handling';
import { ERROR_IDS, TIMEOUTS, RETRY_CONFIG } from '@/shared/constants';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  userFacingError: UserFacingError | null;
}

interface UseErrorBoundaryOptions {
  onError?: (error: Error) => void;
  autoReset?: boolean;
  resetDelay?: number;
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}) {
  const { onError, autoReset = false, resetDelay = TIMEOUTS.ERROR_MESSAGE } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    userFacingError: null,
  });

  const setError = useCallback(
    (error: Error) => {
      console.error('useErrorBoundary caught an error:', error);

      const userFacingError = createUserFacingError(error);

      setErrorState({
        hasError: true,
        error,
        userFacingError,
      });

      // Call the onError callback if provided
      onError?.(error);

      // Log additional context for debugging
      logErrorContext(error);
    },
    [onError]
  );

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      userFacingError: null,
    });
  }, []);

  const handleRetry = useCallback(async () => {
    resetError();
  }, [resetError]);

  const handleDismiss = useCallback(() => {
    setErrorState((prev) => ({ ...prev, hasError: false }));
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

  return {
    ...errorState,
    setError,
    resetError,
    handleRetry,
    handleDismiss,
  };
}

function logErrorContext(error: Error): void {
  const errorContext = {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    hookName: 'useErrorBoundary',
    errorId: ERROR_IDS.STORAGE_ERROR, // Default error ID for hook errors
    maxRetries: RETRY_CONFIG.MAX_RETRIES,
  };

  console.error('Error context:', errorContext);
}

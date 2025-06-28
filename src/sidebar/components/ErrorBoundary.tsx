/**
 * ErrorBoundary - React Error Boundary for Sidebar
 *
 * This component catches JavaScript errors anywhere in the sidebar component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component.
 *
 * WHY USE THIS COMPONENT:
 * - Prevents the entire sidebar from crashing due to component errors
 * - Provides user-friendly error messages with recovery options
 * - Logs errors for debugging and monitoring
 * - Allows graceful degradation when errors occur
 * - Supports different error types and recovery strategies
 * - Implements graceful fallbacks for failed operations
 * - Provides degraded functionality when features are unavailable
 *
 * COMMON USE CASES:
 * - Component rendering errors
 * - Hook errors (useState, useEffect, etc.)
 * - Context provider errors
 * - Third-party library errors
 * - Memory leaks and performance issues
 * - Network failures and offline scenarios
 * - API unavailability and degraded functionality
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createUserFacingError, UserFacingError } from '@/shared/error-handling';
import { ERROR_IDS, TIMEOUTS, FALLBACK_CONFIG, Z_INDEX } from '@/shared/constants';
import ErrorNotification from '@/shared/components/ErrorNotification';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  userFacingError: UserFacingError | null;
  fallbackAttempts: number;
  isInDegradedMode: boolean;
  lastErrorTime: number | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  className?: string;
  enableGracefulDegradation?: boolean;
  maxFallbackAttempts?: number;
  autoRecoveryEnabled?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private recoveryTimeout: ReturnType<typeof setTimeout> | null = null;
  private degradedModeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      userFacingError: null,
      fallbackAttempts: 0,
      isInDegradedMode: false,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      userFacingError: createUserFacingError(error),
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error for debugging
    console.error('Sidebar ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState((prevState) => ({
      errorInfo,
      fallbackAttempts: prevState.fallbackAttempts + 1,
    }));

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log additional context for debugging
    this.logErrorContext(error, errorInfo);

    // Attempt automatic recovery if enabled
    this.attemptAutoRecovery();

    // Check if we should enter degraded mode
    this.checkDegradedMode();
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when props change (if enabled)
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      JSON.stringify(prevProps) !== JSON.stringify(this.props)
    ) {
      this.resetError();
    }
  }

  componentWillUnmount(): void {
    // Clean up timeouts
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
    if (this.degradedModeTimeout) {
      clearTimeout(this.degradedModeTimeout);
    }
  }

  private logErrorContext(error: Error, errorInfo: ErrorInfo): void {
    const errorContext = {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      errorId: this.getErrorId(error),
      fallbackAttempts: this.state.fallbackAttempts,
      isInDegradedMode: this.state.isInDegradedMode,
    };

    console.error('Error context:', errorContext);

    // In a production environment, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorContext });
  }

  private getErrorId(error: Error): string {
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

  private attemptAutoRecovery(): void {
    const { autoRecoveryEnabled = FALLBACK_CONFIG.AUTO_RECOVERY_ENABLED } = this.props;
    const { fallbackAttempts } = this.state;
    const maxAttempts = this.props.maxFallbackAttempts || FALLBACK_CONFIG.MAX_FALLBACK_ATTEMPTS;

    if (!autoRecoveryEnabled || fallbackAttempts >= maxAttempts) {
      return;
    }

    // Clear any existing recovery timeout
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }

    // Attempt recovery with exponential backoff
    const recoveryDelay = Math.min(
      TIMEOUTS.FALLBACK_RECOVERY * Math.pow(2, fallbackAttempts),
      TIMEOUTS.GRACEFUL_DEGRADATION
    );

    this.recoveryTimeout = setTimeout(() => {
      console.log(`Attempting auto-recovery (attempt ${fallbackAttempts + 1}/${maxAttempts})`);
      this.resetError();
    }, recoveryDelay);
  }

  private checkDegradedMode(): void {
    const { enableGracefulDegradation = FALLBACK_CONFIG.DEGRADED_MODE_ENABLED } = this.props;
    const { fallbackAttempts } = this.state;
    const maxAttempts = this.props.maxFallbackAttempts || FALLBACK_CONFIG.MAX_FALLBACK_ATTEMPTS;

    if (!enableGracefulDegradation || fallbackAttempts < maxAttempts) {
      return;
    }

    // Enter degraded mode after max attempts
    this.setState({ isInDegradedMode: true });

    // Clear any existing degraded mode timeout
    if (this.degradedModeTimeout) {
      clearTimeout(this.degradedModeTimeout);
    }

    // Exit degraded mode after timeout
    this.degradedModeTimeout = setTimeout(() => {
      this.setState({ isInDegradedMode: false });
    }, FALLBACK_CONFIG.GRACEFUL_DEGRADATION_TIMEOUT);
  }

  private resetError = (): void => {
    // Clear recovery timeout
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
      this.recoveryTimeout = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      userFacingError: null,
    });
  };

  private handleRetry = async (): Promise<void> => {
    // Attempt to recover by resetting the error state
    this.resetError();
  };

  private handleDismiss = (): void => {
    // Hide the error but keep the error state for debugging
    this.setState({ hasError: false });
  };

  private handleDegradedMode = (): void => {
    // Force exit degraded mode
    this.setState({ isInDegradedMode: false });
    if (this.degradedModeTimeout) {
      clearTimeout(this.degradedModeTimeout);
      this.degradedModeTimeout = null;
    }
  };

  private renderDegradedMode(): ReactNode {
    return (
      <div className="degraded-mode-fallback" style={{ zIndex: Z_INDEX.FALLBACK_UI }}>
        <div className="degraded-mode-container p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Degraded Mode Active</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Some features may be limited due to repeated errors. Basic functionality remains
                available.
              </p>
              <button
                onClick={this.handleDegradedMode}
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Exit Degraded Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with graceful fallbacks
      return (
        <div className={`sidebar-error-boundary ${this.props.className || ''}`}>
          <div className="error-boundary-container">
            <ErrorNotification
              error={this.state.userFacingError!}
              onRetry={this.handleRetry}
              onDismiss={this.handleDismiss}
              className="error-boundary-notification"
              autoDismiss={false}
              dismissDelay={TIMEOUTS.ERROR_MESSAGE}
            />

            {/* Degraded mode indicator */}
            {this.state.isInDegradedMode && this.renderDegradedMode()}

            {/* Development-only detailed error info */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <summary className="cursor-pointer font-medium text-sm">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 text-xs font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div className="mb-2">
                    <strong>Fallback Attempts:</strong> {this.state.fallbackAttempts}
                  </div>
                  <div className="mb-2">
                    <strong>Degraded Mode:</strong>{' '}
                    {this.state.isInDegradedMode ? 'Active' : 'Inactive'}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

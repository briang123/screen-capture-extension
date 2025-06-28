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
 *
 * COMMON USE CASES:
 * - Component rendering errors
 * - Hook errors (useState, useEffect, etc.)
 * - Context provider errors
 * - Third-party library errors
 * - Memory leaks and performance issues
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createUserFacingError, UserFacingError } from '@/shared/error-handling';
import { ERROR_IDS, TIMEOUTS } from '@/shared/constants';
import ErrorNotification from '@/shared/components/ErrorNotification';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  userFacingError: UserFacingError | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  className?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      userFacingError: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      userFacingError: createUserFacingError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error for debugging
    console.error('Sidebar ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log additional context for debugging
    this.logErrorContext(error, errorInfo);
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
      errorId: ERROR_IDS.STORAGE_ERROR, // Default error ID for component errors
    };

    console.error('Error context:', errorContext);

    // In a production environment, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorContext });
  }

  private resetError = (): void => {
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

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
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

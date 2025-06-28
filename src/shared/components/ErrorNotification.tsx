/**
 * ErrorNotification - User-Facing Error Component
 *
 * This component displays user-friendly error messages with actionable
 * suggestions and retry functionality for better user experience.
 *
 * WHY USE THIS COMPONENT:
 * - Provides consistent error UI across all components
 * - Displays user-friendly error messages with actionable guidance
 * - Includes retry functionality for recoverable errors
 * - Shows helpful suggestions for error resolution
 * - Supports different error severity levels
 * - Includes accessibility features for screen readers
 *
 * COMMON USE CASES:
 * - Storage operation failures
 * - Network request errors
 * - Permission-related issues
 * - Settings update failures
 * - Component initialization errors
 * - User action feedback
 */

import React, { useState } from 'react';
import { UserFacingError } from '@/shared/error-handling';

export interface ErrorNotificationProps {
  error: UserFacingError;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  className?: string;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

const severityClasses = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  error:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  critical:
    'bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200',
};

const severityIcons = {
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  critical: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  autoDismiss = false,
  dismissDelay = 5000,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Allow animation to complete
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay, onDismiss]);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300); // Allow animation to complete
  };

  if (!isVisible) {
    return null;
  }

  const severityClass = severityClasses[error.severity];
  const icon = severityIcons[error.severity];

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-300 ease-in-out ${severityClass} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{error.title}</h3>
          <p className="mt-1 text-sm">{error.message}</p>

          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Suggestions:</p>
              <ul className="text-xs space-y-1">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-current rounded-full mr-2" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 flex space-x-2">
            {error.retryable && onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            )}

            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;

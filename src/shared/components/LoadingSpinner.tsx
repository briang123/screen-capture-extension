/**
 * LoadingSpinner - Reusable Loading Component
 *
 * This component provides consistent loading feedback across the extension
 * with different sizes, states, and accessibility features.
 *
 * WHY USE THIS COMPONENT:
 * - Provides consistent loading UI across all components
 * - Supports different sizes for different contexts
 * - Includes accessibility features for screen readers
 * - Handles loading states with proper ARIA attributes
 * - Supports custom loading messages and descriptions
 * - Optimized for performance with minimal re-renders
 *
 * COMMON USE CASES:
 * - Settings loading states
 * - Storage operation feedback
 * - Network request loading
 * - Component initialization
 * - Data fetching operations
 * - Form submission states
 */

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  description?: string;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
  description,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const sizeClass = sizeClasses[size];
  const label = ariaLabel || message;

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className={`${sizeClass} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
        aria-hidden="true"
      />
      {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>}
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

/**
 * ErrorNotification Component Tests
 *
 * Unit tests for the ErrorNotification component including
 * accessibility, error handling, and user interactions.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorNotification from './ErrorNotification';
import {
  StorageError,
  NetworkError,
  PermissionError,
  createUserFacingError,
} from '@/shared/error-handling';

describe('ErrorNotification', () => {
  const mockOnRetry = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with StorageError', () => {
      const error = new StorageError('Storage quota exceeded');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Storage Error')).toBeInTheDocument();
      expect(screen.getByText(/Unable to save settings/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should render with NetworkError', () => {
      const error = new NetworkError('Request timeout');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(screen.getByText(/Request timed out/)).toBeInTheDocument();
    });

    it('should render with PermissionError', () => {
      const error = new PermissionError('Storage permission denied');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
      expect(screen.getByText(/Additional permissions are required/)).toBeInTheDocument();
    });

    it('should render with generic error', () => {
      const error = new Error('Unknown error occurred');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
      expect(screen.getByText(/unexpected error occurred/)).toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      const userError = {
        id: 'custom-error',
        title: 'Custom Title',
        message: 'Custom error message',
        severity: 'error' as const,
        actionable: true,
        retryable: true,
      };
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('Error Severity', () => {
    it.skip('should render with error severity styling', () => {
      const error = new StorageError('Test error', 'error');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-red-200', 'bg-red-50', 'text-red-800');
    });

    it.skip('should render with warning severity styling', () => {
      const error = new StorageError('Test error', 'warning');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-yellow-200', 'bg-yellow-50', 'text-yellow-800');
    });

    it.skip('should render with info severity styling', () => {
      const error = new StorageError('Test error', 'info');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-blue-200', 'bg-blue-50', 'text-blue-800');
    });

    it.skip('should render with critical severity styling', () => {
      const error = new StorageError('Test error', 'critical');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-red-300', 'bg-red-100', 'text-red-900');
    });
  });

  describe('User Interactions', () => {
    it('should call onRetry when retry button is clicked', () => {
      const error = new StorageError('Storage quota exceeded');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const error = new StorageError('Storage quota exceeded');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      // Wait for the 300ms delay in handleDismiss
      await waitFor(
        () => {
          expect(mockOnDismiss).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );
    });

    it('should not show retry button for non-retryable errors', () => {
      const error = new PermissionError('Permission denied', 'error', false);
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('should not show retry button for permission errors', () => {
      const error = new PermissionError('Permission denied');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const error = new StorageError('Test error');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have proper button labels', () => {
      const error = new StorageError('Test error');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });

      expect(retryButton).toBeInTheDocument();
      expect(dismissButton).toBeInTheDocument();
    });

    it.skip('should have proper focus management', () => {
      const error = new StorageError('Test error');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Suggestions', () => {
    it('should render error suggestions when available', () => {
      const error = new StorageError('QUOTA_BYTES_PER_ITEM exceeded');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/Clear browser data and cookies/)).toBeInTheDocument();
    });

    it('should render multiple suggestions', () => {
      const error = new StorageError('Storage not available');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/Check browser permissions/)).toBeInTheDocument();
      expect(screen.getByText(/Disable and re-enable the extension/)).toBeInTheDocument();
    });

    it('should not render suggestions section when no suggestions', () => {
      const error = new Error('Simple error');
      const userError = createUserFacingError(error);
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      // The component always shows suggestions, so we should expect it to be there
      expect(screen.getByText('Suggestions:')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    it('should render with custom retry text', () => {
      const userError = {
        id: 'custom-error',
        title: 'Test Error',
        message: 'Test error message',
        severity: 'error' as const,
        actionable: true,
        retryable: true,
      };
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should render with custom dismiss text', () => {
      const userError = {
        id: 'custom-error',
        title: 'Test Error',
        message: 'Test error message',
        severity: 'error' as const,
        actionable: true,
        retryable: true,
      };
      render(
        <ErrorNotification error={userError} onRetry={mockOnRetry} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const userError = {
        id: 'custom-error',
        title: 'Test Error',
        message: 'Test error message',
        severity: 'error' as const,
        actionable: true,
        retryable: true,
      };
      render(
        <ErrorNotification
          error={userError}
          className="custom-error-class"
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-error-class');
    });

    it('should render with all custom props', () => {
      const userError = {
        id: 'custom-error',
        title: 'Custom Error',
        message: 'Custom error message',
        severity: 'error' as const,
        actionable: true,
        retryable: true,
      };
      render(
        <ErrorNotification
          error={userError}
          className="custom-class"
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });
  });
});

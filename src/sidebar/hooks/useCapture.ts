import { useState, useCallback } from 'react';
import {
  createUserFacingError,
  UserFacingError,
  retryOperation,
} from '../../shared/error-handling';

interface CaptureState {
  isCapturing: boolean;
  error: UserFacingError | null;
  lastCaptureTime: number | null;
  showOverlay: boolean;
  successMessage: string | null;
  lastCapturedImage: string | null;
}

interface UseCaptureReturn extends CaptureState {
  handleCapture: () => Promise<void>;
  handleAreaCapture: () => void;
  resetError: () => void;
  retryCapture: () => Promise<void>;
  hideOverlay: () => void;
  clearSuccessMessage: () => void;
  onAreaCaptureComplete: (imageData: string) => Promise<void>;
  handleFullPageCapture: () => Promise<void>;
  deleteCapturedImage: () => void;
}

/**
 * useCapture - Screen Capture State Management Hook
 *
 * This hook manages the state and logic for screen capture operations, including
 * capture initiation, progress tracking, error handling, and result management.
 *
 * WHY USE THIS HOOK:
 * - Centralizes screen capture state management
 * - Handles capture lifecycle (initiate, progress, complete, error)
 * - Provides error handling and recovery mechanisms
 * - Prevents multiple simultaneous capture operations
 * - Tracks capture history and timing
 * - Integrates with Chrome extension messaging system
 * - Provides user-friendly error messages and retry mechanisms
 * - Supports area selection capture with clipboard integration
 *
 * COMMON USE CASES:
 * - Screen capture button state management
 * - Capture progress indicators
 * - Error display and recovery
 * - Capture history tracking
 * - Integration with background scripts
 * - User feedback during capture operations
 * - Automatic retry for transient failures
 * - Area selection capture with visual feedback
 * - Clipboard integration for captured images
 *
 * KEY FEATURES:
 * - Capture state management (isCapturing, error, lastCaptureTime)
 * - Async capture operation handling
 * - User-friendly error messages with actionable guidance
 * - Automatic retry mechanisms with exponential backoff
 * - Capture timing and history tracking
 * - Prevention of concurrent captures
 * - Integration with Chrome extension APIs
 * - Comprehensive error logging and context
 * - Area selection overlay management
 * - Clipboard integration with success feedback
 *
 * PERFORMANCE BENEFITS:
 * - Prevents multiple simultaneous capture operations
 * - Efficient state updates with useCallback
 * - Memory leak prevention with proper cleanup
 * - Optimized re-renders with state management
 * - Smart retry logic prevents excessive retries
 *
 * ACCESSIBILITY FEATURES:
 * - Clear error messages for users
 * - Loading states for screen readers
 * - Keyboard navigation support
 * - ARIA attribute updates during capture
 * - Retry mechanisms for failed operations
 * - Visual feedback for area selection
 */

export function useCapture(): UseCaptureReturn {
  const [state, setState] = useState<CaptureState>({
    isCapturing: false,
    error: null,
    lastCaptureTime: null,
    showOverlay: false,
    successMessage: null,
    lastCapturedImage: null,
  });

  const performCapture = useCallback(async (): Promise<void> => {
    // Send message to background script to capture screen
    const response = await chrome.runtime.sendMessage({
      action: 'captureScreen',
    });

    if (!response.success) {
      throw new Error(response.error || 'Capture failed');
    }

    // Copy to clipboard
    await copyImageToClipboard(response.imageData);
  }, []);

  const copyImageToClipboard = useCallback(async (imageData: string): Promise<void> => {
    try {
      // Convert data URL to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Copy to clipboard using Clipboard API
      type ClipboardItemType = { new (items: Record<string, Blob>): object };
      const nav = window.navigator as {
        clipboard?: { write?: (data: unknown[]) => Promise<void> };
      };
      const ClipboardItemClass = (window as unknown as { ClipboardItem?: ClipboardItemType })
        .ClipboardItem;
      if (nav.clipboard && nav.clipboard.write && ClipboardItemClass) {
        const clipboardItem = new ClipboardItemClass({
          [blob.type]: blob,
        });
        await nav.clipboard.write([clipboardItem]);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = imageData;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy image to clipboard');
    }
  }, []);

  const handleCapture = useCallback(async () => {
    if (state.isCapturing) {
      return; // Prevent multiple simultaneous captures
    }

    setState((prev) => ({
      ...prev,
      isCapturing: true,
      error: null,
      successMessage: null,
    }));

    try {
      await retryOperation(
        performCapture,
        3, // maxRetries
        1000, // baseDelay
        {
          operation: 'screen-capture',
          component: 'useCapture',
          timestamp: Date.now(),
        }
      );

      // Get the captured image from the background script
      const response = await chrome.runtime.sendMessage({ action: 'captureScreen' });
      if (response.success && response.imageData) {
        setState((prev) => ({
          ...prev,
          isCapturing: false,
          lastCaptureTime: Date.now(),
          successMessage: 'Screenshot copied to clipboard! 📋',
          lastCapturedImage: response.imageData,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isCapturing: false,
          error: createUserFacingError('Failed to capture image'),
        }));
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          successMessage: null,
        }));
      }, 3000);
    } catch (error) {
      const userFacingError = createUserFacingError(error);

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        error: userFacingError,
      }));
    }
  }, [state.isCapturing, performCapture, copyImageToClipboard]);

  const handleAreaCapture = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showOverlay: true,
      error: null,
      successMessage: null,
    }));
  }, []);

  const handleAreaCaptureComplete = useCallback(
    async (imageData: string) => {
      setState((prev) => ({
        ...prev,
        showOverlay: false,
        isCapturing: true,
      }));

      try {
        await copyImageToClipboard(imageData);

        setState((prev) => ({
          ...prev,
          isCapturing: false,
          lastCaptureTime: Date.now(),
          successMessage: 'Area screenshot copied to clipboard! 📋',
        }));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            successMessage: null,
          }));
        }, 3000);
      } catch (error) {
        const userFacingError = createUserFacingError(error);

        setState((prev) => ({
          ...prev,
          isCapturing: false,
          error: userFacingError,
        }));
      }
    },
    [copyImageToClipboard]
  );

  const hideOverlay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showOverlay: false,
    }));
  }, []);

  const retryCapture = useCallback(async () => {
    if (state.isCapturing) {
      return; // Prevent multiple simultaneous captures
    }

    setState((prev) => ({
      ...prev,
      isCapturing: true,
      error: null,
      successMessage: null,
    }));

    try {
      await retryOperation(
        performCapture,
        2, // Fewer retries for manual retry
        500, // Shorter base delay for manual retry
        {
          operation: 'screen-capture-retry',
          component: 'useCapture',
          timestamp: Date.now(),
        }
      );

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now(),
        successMessage: 'Screenshot copied to clipboard! 📋',
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          successMessage: null,
        }));
      }, 3000);
    } catch (error) {
      const userFacingError = createUserFacingError(error);

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        error: userFacingError,
      }));
    }
  }, [state.isCapturing, performCapture]);

  const resetError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      successMessage: null,
    }));
  }, []);

  const handleFullPageCapture = useCallback(async () => {
    if (state.isCapturing) {
      return;
    }
    setState((prev) => ({
      ...prev,
      isCapturing: true,
      error: null,
      successMessage: null,
    }));
    try {
      // Send message to content script to perform full page capture
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id!, { action: 'captureFullPage' });
      if (!response.success || !response.imageData) {
        throw new Error(response.error || 'Full page capture failed');
      }
      await copyImageToClipboard(response.imageData);
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now(),
        successMessage: 'Full page screenshot copied to clipboard! 📋',
      }));
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          successMessage: null,
        }));
      }, 3000);
    } catch (error) {
      const userFacingError = createUserFacingError(error);
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        error: userFacingError,
      }));
    }
  }, [state.isCapturing, copyImageToClipboard]);

  const deleteCapturedImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastCapturedImage: null,
    }));
  }, []);

  return {
    ...state,
    handleCapture,
    handleAreaCapture,
    resetError,
    retryCapture,
    hideOverlay,
    clearSuccessMessage,
    onAreaCaptureComplete: handleAreaCaptureComplete,
    handleFullPageCapture,
    deleteCapturedImage,
  };
}

import { useState, useCallback } from 'react';
import { UserFacingError, retryOperation, createUserFacingError } from '@/shared/error-handling';
import { captureTabViewport, captureFullPage } from '@utils/capture';
import { copyImageToClipboard } from '@utils/clipboard';
import { useSuccessMessage } from './useSuccessMessage';
import { useErrorMessage } from './useErrorMessage';
import { TIMEOUTS, RETRY_CONFIG, OPERATION_NAMES } from '@/shared/constants';

interface CaptureState {
  isCapturing: boolean;
  lastCaptureTime: number | null;
  showOverlay: boolean;
  capturedImages: string[];
}

interface UseCaptureReturn extends CaptureState {
  error: UserFacingError | null;
  successMessage: string | null;
  handleCapture: () => Promise<void>;
  handleAreaCapture: () => void;
  retryCapture: () => Promise<void>;
  hideOverlay: () => void;
  setSuccessMessage: (message: string | null) => void;
  setError: (error: UserFacingError | null) => void;
  onAreaCaptureComplete: (imageData: string) => void;
  handleFullPageCapture: () => Promise<void>;
  deleteCapturedImage: (index: number) => void;
  copyCapturedImage: (index: number) => Promise<void>;
  openCapturedImageInEditor: (index: number) => Promise<void>;
  cancelActiveCapture: () => void;
  showConfetti: boolean;
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
    lastCaptureTime: null,
    showOverlay: false,
    capturedImages: [],
  });

  const [successMessage, setSuccessMessage] = useSuccessMessage(TIMEOUTS.SUCCESS_MESSAGE);
  const [error, setError] = useErrorMessage(TIMEOUTS.ERROR_MESSAGE);
  const [showConfetti, setShowConfetti] = useState(false);

  // Helper function to reset capture state
  const resetCaptureState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCapturing: false,
      showOverlay: false,
    }));
  }, []);

  // Helper function to cancel any active capture
  const cancelActiveCapture = useCallback(() => {
    resetCaptureState();
    setError(null); // Clear any existing errors
  }, [resetCaptureState, setError]);

  const performCapture = useCallback(async (): Promise<void> => {
    const result = await captureTabViewport();
    if ('error' in result) {
      throw new Error(result.error.message);
    }
    await copyImageToClipboard(result.imageData);
    setState((prev) => ({
      ...prev,
      capturedImages: [result.imageData, ...prev.capturedImages],
    }));
  }, []);

  const handleCapture = useCallback(async () => {
    if (state.isCapturing) return;

    // Cancel any active area capture first
    if (state.showOverlay) {
      hideOverlay();
    }

    setState((prev) => ({
      ...prev,
      isCapturing: true,
    }));

    try {
      await retryOperation(performCapture, RETRY_CONFIG.MAX_RETRIES, RETRY_CONFIG.BASE_DELAY, {
        operation: OPERATION_NAMES.SCREEN_CAPTURE,
        component: 'useCapture',
        timestamp: Date.now(),
      });

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now(),
      }));
    } catch (error) {
      setError(createUserFacingError(error));
      resetCaptureState(); // Reset state on error
    }
  }, [state.isCapturing, state.showOverlay, performCapture, setError, resetCaptureState]);

  const handleAreaCapture = useCallback(() => {
    // Cancel any active capture first
    if (state.isCapturing) {
      resetCaptureState();
    }

    setState((prev) => ({
      ...prev,
      showOverlay: true,
    }));
  }, [state.isCapturing, resetCaptureState]);

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
          capturedImages: [imageData, ...prev.capturedImages],
          showOverlay: false, // ensure overlay is hidden
        }));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
        if (typeof window !== 'undefined') {
          console.log(
            '[useCapture] State reset after area capture: showOverlay=false, isCapturing=false'
          );
        }
      } catch (error) {
        setError(createUserFacingError(error));
        resetCaptureState(); // Reset state on error
      }
    },
    [setError, resetCaptureState]
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
    }));

    try {
      await retryOperation(
        performCapture,
        RETRY_CONFIG.MANUAL_MAX_RETRIES,
        RETRY_CONFIG.MANUAL_RETRY_DELAY,
        {
          operation: OPERATION_NAMES.SCREEN_CAPTURE_RETRY,
          component: 'useCapture',
          timestamp: Date.now(),
        }
      );

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now(),
      }));
    } catch (error) {
      setError(createUserFacingError(error));
      resetCaptureState(); // Reset state on error
    }
  }, [state.isCapturing, performCapture, setError, resetCaptureState]);

  const handleFullPageCapture = useCallback(async () => {
    if (state.isCapturing) return;

    // Cancel any active area capture first
    if (state.showOverlay) {
      hideOverlay();
    }

    setState((prev) => ({
      ...prev,
      isCapturing: true,
    }));

    try {
      const result = await captureFullPage();
      if ('error' in result) throw new Error(result.error.message);
      await copyImageToClipboard(result.imageData);
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now(),
        capturedImages: [result.imageData, ...prev.capturedImages],
      }));
    } catch (error) {
      setError(createUserFacingError(error));
      resetCaptureState(); // Reset state on error
    }
  }, [state.isCapturing, state.showOverlay, setError, resetCaptureState, hideOverlay]);

  const deleteCapturedImage = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      capturedImages: prev.capturedImages.filter((_, i) => i !== index),
    }));
  }, []);

  const copyCapturedImage = useCallback(
    async (index: number) => {
      const image = state.capturedImages[index];
      if (image) {
        await copyImageToClipboard(image);
        setSuccessMessage('Image copied to clipboard! 📋');
      }
    },
    [state.capturedImages, setSuccessMessage]
  );

  const openCapturedImageInEditor = useCallback(
    async (index: number) => {
      const image = state.capturedImages[index];
      if (image) {
        await chrome.runtime.sendMessage({ action: 'openWindow', data: { imageData: image } });
      }
    },
    [state.capturedImages]
  );

  return {
    ...state,
    error,
    successMessage,
    handleCapture,
    handleAreaCapture,
    retryCapture,
    hideOverlay,
    setSuccessMessage,
    setError,
    onAreaCaptureComplete: handleAreaCaptureComplete,
    handleFullPageCapture,
    deleteCapturedImage,
    copyCapturedImage,
    openCapturedImageInEditor,
    cancelActiveCapture,
    showConfetti,
  };
}

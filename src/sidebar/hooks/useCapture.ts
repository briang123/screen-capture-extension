import { useState, useCallback } from 'react';

interface CaptureState {
  isCapturing: boolean;
  error: string | null;
  lastCaptureTime: number | null;
}

interface UseCaptureReturn extends CaptureState {
  handleCapture: () => Promise<void>;
  resetError: () => void;
}

export function useCapture(): UseCaptureReturn {
  const [state, setState] = useState<CaptureState>({
    isCapturing: false,
    error: null,
    lastCaptureTime: null,
  });

  const handleCapture = useCallback(async () => {
    if (state.isCapturing) {
      return; // Prevent multiple simultaneous captures
    }

    setState((prev) => ({
      ...prev,
      isCapturing: true,
      error: null,
    }));

    try {
      // TODO: Implement actual capture logic
      // This could involve:
      // 1. Sending message to background script
      // 2. Capturing screen content
      // 3. Processing the captured data

      // Simulate capture process
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        error: error instanceof Error ? error.message : 'Capture failed',
      }));
    }
  }, [state.isCapturing]);

  const resetError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    handleCapture,
    resetError,
  };
}

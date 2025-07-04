import React, { createContext, useContext, useCallback } from 'react';
import { UserFacingError } from '@/shared/error-handling';
import ErrorBoundary from '@/sidebar/components/ErrorBoundary';
import { useCapture } from '@/sidebar/hooks/useCapture';

interface CaptureContextType {
  // State
  isCapturing: boolean;
  error: UserFacingError | null;
  successMessage: string | null;
  capturedImages: string[];
  showOverlay: boolean;
  setShowOverlay: (visible: boolean) => void;
  showConfetti: boolean;

  // Actions
  onCapture: () => Promise<void>;
  onAreaCapture: () => void;
  onAreaCaptureComplete: (imageData: string) => void;
  onFullPageCapture: () => void;
  hideOverlay: () => void;
  onResetError: () => void;
  onClearSuccessMessage: () => void;
  copyCapturedImage: (index: number) => void;
  openCapturedImageInEditor: (index: number) => void;
  deleteCapturedImage: (index: number) => void;
  cancelActiveCapture: () => void;
}

const CaptureContext = createContext<CaptureContextType | undefined>(undefined);

export const useCaptureContext = () => {
  const context = useContext(CaptureContext);
  if (context === undefined) {
    throw new Error('useCaptureContext must be used within a CaptureProvider');
  }
  return context;
};

interface CaptureProviderProps {
  children: React.ReactNode;
}

export const CaptureProvider: React.FC<CaptureProviderProps> = ({ children }) => {
  const {
    isCapturing,
    error,
    handleCapture,
    handleAreaCapture,
    onAreaCaptureComplete,
    handleFullPageCapture,
    setError,
    hideOverlay,
    successMessage,
    capturedImages,
    setSuccessMessage,
    copyCapturedImage,
    openCapturedImageInEditor,
    deleteCapturedImage,
    cancelActiveCapture,
    showConfetti,
  } = useCapture();

  const onCapture = useCallback(async () => {
    await handleCapture();
  }, [handleCapture]);

  const onAreaCapture = useCallback(() => {
    handleAreaCapture();
  }, [handleAreaCapture]);

  const onFullPageCapture = useCallback(async () => {
    try {
      await handleFullPageCapture();
    } catch (error) {
      console.error('Full page capture failed:', error);
    }
  }, [handleFullPageCapture]);

  const onResetError = useCallback(() => {
    setError(null);
  }, [setError]);

  const onClearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, [setSuccessMessage]);

  const value: CaptureContextType = {
    // State
    isCapturing,
    error,
    successMessage,
    capturedImages,
    showOverlay: false, // This will be managed by OverlayProvider
    setShowOverlay: () => {}, // Placeholder, not used
    showConfetti,
    // Actions
    onCapture,
    onAreaCapture,
    onAreaCaptureComplete,
    onFullPageCapture,
    hideOverlay,
    onResetError,
    onClearSuccessMessage,
    copyCapturedImage,
    openCapturedImageInEditor,
    deleteCapturedImage,
    cancelActiveCapture,
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('CaptureContext error:', error, errorInfo);
      }}
    >
      <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>
    </ErrorBoundary>
  );
};

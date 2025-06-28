import React, { createContext, useContext, useCallback } from 'react';
import { UserFacingError } from '@/shared/error-handling';
import { useCapture } from '@/sidebar/hooks/useCapture';

interface CaptureContextType {
  // State
  isCapturing: boolean;
  error: UserFacingError | null;
  successMessage: string | null;
  capturedImages: string[];
  showOverlay: boolean;

  // Actions
  onCapture: () => Promise<void>;
  onAreaCapture: () => void;
  onAreaCaptureComplete: (imageData: string) => Promise<void>;
  onFullPageCapture: () => void;
  hideOverlay: () => void;
  onResetError: () => void;
  onClearSuccessMessage: () => void;
  copyCapturedImage: (index: number) => void;
  openCapturedImageInEditor: (index: number) => void;
  deleteCapturedImage: (index: number) => void;
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
    resetError,
    hideOverlay,
    showOverlay,
    successMessage,
    capturedImages,
    clearSuccessMessage,
    copyCapturedImage,
    openCapturedImageInEditor,
    deleteCapturedImage,
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
    resetError();
  }, [resetError]);

  const onClearSuccessMessage = useCallback(() => {
    clearSuccessMessage();
  }, [clearSuccessMessage]);

  const value: CaptureContextType = {
    // State
    isCapturing,
    error,
    successMessage,
    capturedImages,
    showOverlay,

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
  };

  return <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>;
};

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CaptureButton } from '@/sidebar/components/Button';
import { useOverlay } from '@/sidebar/components/OverlayProvider';
import { useCaptureContext } from '@/sidebar/contexts/CaptureContext';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { ICON_SIZES } from '@/shared/constants';
import Confetti from 'react-confetti';

interface SidebarPanelBodyProps {
  isSwitchingSide: boolean;
}

const SidebarPanelBody: React.FC<SidebarPanelBodyProps> = ({ isSwitchingSide }) => {
  const {
    isCapturing,
    onCapture,
    hideOverlay,
    showOverlay,
    error,
    onResetError,
    successMessage,
    onClearSuccessMessage,
    onFullPageCapture,
    capturedImages,
    copyCapturedImage,
    openCapturedImageInEditor,
    deleteCapturedImage,
    cancelActiveCapture,
    showConfetti,
  } = useCaptureContext();

  const { show: showOverlayFunc } = useOverlay();

  useEffect(() => {
    if (capturedImages.length > 0) {
      console.log('SidebarPanelBody capturedImages:', capturedImages);
    }
  }, [capturedImages]);

  // Wrapper functions that cancel area overlay first if active
  const handleCaptureWithOverlayCancel = useCallback(async () => {
    if (showOverlay) {
      hideOverlay();
      // Small delay to ensure overlay is hidden before starting capture
      setTimeout(() => onCapture(), 50);
    } else {
      await onCapture();
    }
  }, [showOverlay, hideOverlay, onCapture]);

  const handleFullPageCaptureWithOverlayCancel = useCallback(async () => {
    if (showOverlay) {
      hideOverlay();
      // Small delay to ensure overlay is hidden before starting capture
      setTimeout(() => onFullPageCapture(), 50);
    } else {
      await onFullPageCapture();
    }
  }, [showOverlay, hideOverlay, onFullPageCapture]);

  // Custom escape key handler that prioritizes area capture cancellation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // If area capture overlay is visible, cancel it first
        if (showOverlay) {
          event.preventDefault();
          event.stopPropagation();
          hideOverlay();
          return;
        }

        // If currently capturing, cancel the capture
        if (isCapturing) {
          event.preventDefault();
          event.stopPropagation();
          cancelActiveCapture();
          return;
        }

        // Only allow sidebar to close if no capture operations are active
        // This will be handled by the parent component if needed
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [showOverlay, isCapturing, hideOverlay, cancelActiveCapture]);

  // Use the overlay provider to show area capture
  const handleAreaCapture = useCallback(() => {
    showOverlayFunc();
  }, [showOverlayFunc]);

  return (
    <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
      {/* Confetti animation when image is added */}
      {showConfetti && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <Confetti
            numberOfPieces={120}
            recycle={false}
            width={window.innerWidth / 3}
            height={180}
          />
        </div>
      )}

      {/* Thumbnails at the top */}
      {Array.isArray(capturedImages) && capturedImages.length > 0 && (
        <div className="flex flex-row flex-wrap gap-3 mb-4" style={{ background: '#eee' }}>
          {capturedImages.map((img, idx) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <div
                className="w-24 h-12 p-1 rounded-xl border-2 border-gray-300 bg-white shadow overflow-hidden flex items-center justify-center"
                style={{
                  minWidth: ICON_SIZES.THUMBNAIL_WIDTH,
                  minHeight: ICON_SIZES.THUMBNAIL_HEIGHT,
                  maxWidth: ICON_SIZES.THUMBNAIL_WIDTH,
                  maxHeight: ICON_SIZES.THUMBNAIL_HEIGHT,
                }}
              >
                <motion.img
                  src={img}
                  alt={`Captured screenshot thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg block"
                  style={{
                    width: ICON_SIZES.THUMBNAIL_WIDTH,
                    height: ICON_SIZES.THUMBNAIL_HEIGHT,
                    objectFit: 'cover',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => openCapturedImageInEditor(idx)}
                  className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Open
                </button>
                <button
                  onClick={() => copyCapturedImage(idx)}
                  className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                >
                  Copy
                </button>
                <button
                  onClick={() => deleteCapturedImage(idx)}
                  className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading Spinner */}
      {isCapturing && <LoadingSpinner size="md" message="Capturing..." />}

      {/* Main sidebar content below thumbnails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Capture Buttons */}
        <div className="space-y-3">
          <CaptureButton isCapturing={isCapturing} onCapture={handleCaptureWithOverlayCancel} />
          {!isSwitchingSide && (
            <>
              <button
                onClick={handleAreaCapture}
                disabled={isCapturing}
                className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-soft hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-busy={isCapturing}
              >
                <span className="mr-2">🎯</span>
                Select Area to Capture
              </button>
              <button
                onClick={handleFullPageCaptureWithOverlayCancel}
                disabled={isCapturing}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-soft hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-busy={isCapturing}
              >
                <span className="mr-2">🖼️</span>
                Capture Full Page
              </button>
            </>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">{successMessage}</p>
              <button
                onClick={onClearSuccessMessage}
                className="text-green-500 hover:text-green-700 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">{error.title}</p>
                <p className="text-sm text-red-600 mt-1">{error.message}</p>
                {error.suggestions && error.suggestions.length > 0 && (
                  <ul className="text-xs text-red-500 mt-2 list-disc list-inside">
                    {error.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={onResetError}
                className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SidebarPanelBody;

import React from 'react';
import { motion } from 'framer-motion';
import { CaptureButton } from './Button';
import { CaptureOverlay } from './CaptureOverlay';
import { UserFacingError } from '../../shared/error-handling';

interface SidebarPanelBodyProps {
  isSwitchingSide: boolean;
  isCapturing: boolean;
  onCapture: () => void;
  onAreaCapture: () => void;
  onAreaCaptureComplete: (imageData: string) => void;
  hideOverlay: () => void;
  showOverlay: boolean;
  error: UserFacingError | null;
  onResetError: () => void;
  successMessage: string | null;
  onClearSuccessMessage: () => void;
}

const SidebarPanelBody: React.FC<SidebarPanelBodyProps> = ({
  isSwitchingSide,
  isCapturing,
  onCapture,
  onAreaCapture,
  onAreaCaptureComplete,
  hideOverlay,
  showOverlay,
  error,
  onResetError,
  successMessage,
  onClearSuccessMessage,
}) => (
  <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
    {!isSwitchingSide ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Capture Buttons */}
        <div className="space-y-3">
          <CaptureButton isCapturing={isCapturing} onCapture={onCapture} />

          <button
            onClick={onAreaCapture}
            disabled={isCapturing}
            className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-soft hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-busy={isCapturing}
          >
            <span className="mr-2">🎯</span>
            Select Area to Capture
          </button>
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
    ) : (
      <div>
        <CaptureButton isCapturing={isCapturing} onCapture={onCapture} />
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error.message}</p>
              <button
                onClick={onResetError}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Capture Overlay */}
    <CaptureOverlay
      isVisible={showOverlay}
      onCapture={onAreaCaptureComplete}
      onCancel={hideOverlay}
    />
  </div>
);

export default SidebarPanelBody;

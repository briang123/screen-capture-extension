import React from 'react';
import { motion } from 'framer-motion';
import { CaptureButton } from './Button';

interface SidebarPanelBodyProps {
  isSwitchingSide: boolean;
  isCapturing: boolean;
  onCapture: () => void;
  error: string | null;
  onResetError: () => void;
}

const SidebarPanelBody: React.FC<SidebarPanelBodyProps> = ({
  isSwitchingSide,
  isCapturing,
  onCapture,
  error,
  onResetError,
}) => (
  <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
    {!isSwitchingSide ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CaptureButton isCapturing={isCapturing} onCapture={onCapture} />
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={onResetError}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
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
              <p className="text-sm text-red-700">{error}</p>
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
  </div>
);

export default SidebarPanelBody;

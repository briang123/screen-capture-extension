import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAreaCapture } from '@/sidebar/hooks/useAreaCapture';
import FullViewportOverlay from './FullViewportOverlay';

interface OverlayContextType {
  showOverlay: boolean;
  show: () => void;
  hide: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const useOverlay = () => {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within an OverlayProvider');
  return ctx;
};

interface OverlayProviderProps {
  children: React.ReactNode;
  onAreaCaptureComplete?: (imageData: string) => void;
}

export const OverlayProvider: React.FC<OverlayProviderProps> = ({
  children,
  onAreaCaptureComplete,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);

  const show = useCallback(() => setShowOverlay(true), []);
  const hide = useCallback(() => setShowOverlay(false), []);

  const handleCapture = useCallback(
    (imageData: string) => {
      if (onAreaCaptureComplete) {
        onAreaCaptureComplete(imageData);
      }
      hide();
    },
    [onAreaCaptureComplete, hide]
  );

  // Use the area capture hook
  const { selection, showWarning } = useAreaCapture({
    onCapture: handleCapture,
    onCancel: hide,
    isVisible: showOverlay,
  });

  return (
    <OverlayContext.Provider value={{ showOverlay, show, hide }}>
      {children}
      {showOverlay && (
        <FullViewportOverlay visible={showOverlay}>
          {/* Instructions */}
          <div
            style={{
              position: 'fixed',
              top: 16,
              left: 0,
              width: '100vw',
              zIndex: 10000,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <span className="inline-block bg-white/95 px-4 py-2 rounded-lg shadow border border-gray-200 text-gray-800 font-medium text-base">
              Click and drag to select capture area
              <br />
              <span className="text-xs text-gray-500">Press ESC to cancel</span>
            </span>
          </div>

          {/* Cancel button */}
          <button
            onClick={hide}
            style={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 10000,
              pointerEvents: 'auto',
            }}
            className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow border border-gray-200"
          >
            Cancel
          </button>

          {/* Selection rectangle */}
          {selection && (
            <motion.div
              className="absolute border-2 border-blue-500 bg-transparent pointer-events-none"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
                position: 'absolute',
                boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.3)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              {/* Corner indicators */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full shadow-sm" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow-sm" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full shadow-sm" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow-sm" />

              {/* Size indicator */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {Math.round(selection.width)} × {Math.round(selection.height)}
              </div>

              {/* Crosshair guides */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/50 transform -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 w-px h-full bg-blue-500/50 transform -translate-x-1/2" />
            </motion.div>
          )}

          {/* Warning if selection is outside viewport */}
          {showWarning && (
            <div
              style={{
                position: 'fixed',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                pointerEvents: 'none',
              }}
            >
              <span className="inline-block bg-red-500/95 text-white px-4 py-2 rounded-lg shadow border border-red-200 text-sm font-medium">
                ⚠️ Selection is outside viewport
              </span>
            </div>
          )}
        </FullViewportOverlay>
      )}
    </OverlayContext.Provider>
  );
};

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CaptureOverlayProps {
  isVisible: boolean;
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CaptureOverlay: React.FC<CaptureOverlayProps> = ({
  isVisible,
  onCapture,
  onCancel,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!overlayRef.current) return;

    // Use page coordinates for full-page selection
    const x = e.pageX;
    const y = e.pageY;

    setStartPos({ x, y });
    setIsSelecting(true);
    setSelection({ x, y, width: 0, height: 0 });
  }, []);

  // Handle mouse move to update selection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !startPos) return;

      const currentX = e.pageX;
      const currentY = e.pageY;

      const x = Math.min(startPos.x, currentX);
      const y = Math.min(startPos.y, currentY);
      const width = Math.abs(currentX - startPos.x);
      const height = Math.abs(currentY - startPos.y);

      setSelection({ x, y, width, height });
    },
    [isSelecting, startPos]
  );

  // Handle mouse up to complete selection
  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selection) return;

    setIsSelecting(false);
    setStartPos(null);

    // Only capture if selection has minimum size
    if (selection.width > 10 && selection.height > 10) {
      captureSelectedArea();
    } else {
      setSelection(null);
    }
  }, [isSelecting, selection]);

  // Capture the selected area
  const captureSelectedArea = useCallback(async () => {
    if (!selection) return;

    try {
      // Send message to background script to capture the selected area
      const response = await chrome.runtime.sendMessage({
        action: 'captureArea',
        data: {
          x: selection.x,
          y: selection.y,
          width: selection.width,
          height: selection.height,
        },
      });

      if (response.success && response.imageData) {
        onCapture(response.imageData);
      } else {
        throw new Error(response.error || 'Capture failed');
      }
    } catch (error) {
      console.error('Area capture failed:', error);
      // Fallback to full screen capture
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'captureScreen',
        });
        if (response.success && response.imageData) {
          onCapture(response.imageData);
        }
      } catch (fallbackError) {
        console.error('Fallback capture also failed:', fallbackError);
      }
    }
  }, [selection, onCapture]);

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onCancel]);

  // Prevent scrolling and add overlay to body when visible
  useEffect(() => {
    if (isVisible) {
      // Prevent scrolling
      document.body.style.overflow = 'hidden';

      // Add overlay to body for full-page coverage
      const body = document.body;
      if (overlayRef.current && !body.contains(overlayRef.current)) {
        body.appendChild(overlayRef.current);
      }

      return () => {
        document.body.style.overflow = '';
        // Remove overlay from body when component unmounts
        if (overlayRef.current && body.contains(overlayRef.current)) {
          body.removeChild(overlayRef.current);
        }
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-black/10 backdrop-blur-[0.5px]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'auto',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Instructions */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200">
          <p className="text-sm text-gray-700 font-medium">
            {isSelecting ? 'Drag to select area' : 'Click and drag to select capture area'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Press ESC to cancel</p>
        </div>

        {/* Selection rectangle */}
        {selection && (
          <motion.div
            className="absolute border-2 border-blue-500 bg-blue-500/5 pointer-events-none"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
              position: 'absolute',
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
            <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/30 transform -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 w-px h-full bg-blue-500/30 transform -translate-x-1/2" />
          </motion.div>
        )}

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow-lg border border-gray-200"
        >
          Cancel
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

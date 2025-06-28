import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX, CHROME_ACTIONS } from '@/shared/constants';

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

function getPageDimensions() {
  return {
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
  };
}

function isSelectionInViewport(sel: SelectionRect) {
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Check if any part of the selection is in the viewport
  return (
    sel.x + sel.width > scrollX &&
    sel.x < scrollX + vw &&
    sel.y + sel.height > scrollY &&
    sel.y < scrollY + vh
  );
}

export const CaptureOverlay: React.FC<CaptureOverlayProps> = ({
  isVisible,
  onCapture,
  onCancel,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pageDims, setPageDims] = useState(getPageDimensions());

  // Update page dimensions on resize/scroll
  useEffect(() => {
    function updateDims() {
      setPageDims(getPageDimensions());
    }
    window.addEventListener('resize', updateDims);
    window.addEventListener('scroll', updateDims);
    return () => {
      window.removeEventListener('resize', updateDims);
      window.removeEventListener('scroll', updateDims);
    };
  }, []);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const x = e.pageX;
    const y = e.pageY;
    setStartPos({ x, y });
    setIsSelecting(true);
    setSelection({ x, y, width: 0, height: 0 });
    setShowWarning(false);
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
      const sel = { x, y, width, height };
      setSelection(sel);
      setShowWarning(!isSelectionInViewport(sel));
    },
    [isSelecting, startPos]
  );

  // Capture the selected area
  const captureSelectedArea = useCallback(async () => {
    if (!selection) return;
    try {
      const response = await chrome.runtime.sendMessage({
        action: CHROME_ACTIONS.CAPTURE_AREA,
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
      setShowWarning(true);
    }
  }, [selection, onCapture]);

  // Handle mouse up to complete selection
  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selection) return;
    setIsSelecting(false);
    setStartPos(null);
    if (selection.width > 10 && selection.height > 10) {
      if (!isSelectionInViewport(selection)) {
        setShowWarning(true);
        return;
      }
      captureSelectedArea();
    } else {
      setSelection(null);
    }
  }, [isSelecting, selection, captureSelectedArea]);

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
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="sc-capture-overlay fixed left-0 top-0 z-[9999] bg-black/10 backdrop-blur-[0.5px]"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: pageDims.width,
          height: pageDims.height,
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
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: 0,
            width: '100vw',
            zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
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
          onClick={onCancel}
          style={{ position: 'fixed', top: 16, left: 16, zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY }}
          className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow border border-gray-200"
        >
          Cancel
        </button>
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
        {/* Warning if selection is outside viewport */}
        {showWarning && (
          <div
            style={{
              position: 'fixed',
              bottom: 32,
              left: 0,
              width: '100vw',
              zIndex: Z_INDEX.SELECTION_OVERLAY,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <span className="inline-block bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow">
              Only the visible part of your selection will be captured (Chrome limitation)
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

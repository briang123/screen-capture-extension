import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAreaCapture } from '../hooks/useAreaCapture';
import FullViewportOverlay from './FullViewportOverlay';
import { useDebug } from '../hooks/useDebug';
import { Z_INDEX } from '@/shared/constants';
import OverlayMask from '@/sidebar/components/OverlayMask';
import SelectionRectangle from '@/sidebar/components/SelectionRectangle';
import CancelButton from '@/sidebar/components/CancelButton';
import { useSelectionState } from '@/sidebar/hooks/useSelectionState';
import { isSelectionComplete } from '@/shared/utils/selection';
import { useCaptureButtonPortal } from '@/sidebar/hooks/useCaptureButtonPortal';
import { pageToViewportCoords } from '@/shared/utils/position';
import { useHandleResize } from '@/sidebar/hooks/useHandleResize';

// Add this at the top of the file, after imports
if (typeof document !== 'undefined' && !document.getElementById('sc-hide-for-capture-style')) {
  const style = document.createElement('style');
  style.id = 'sc-hide-for-capture-style';
  style.innerHTML = `.sc-hide-for-capture { display: none !important; }`;
  document.head.appendChild(style);
}

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
  const {
    showOverlay,
    setShowOverlay,
    selectionComplete,
    setSelectionComplete,
    pendingImageDataRef,
    show,
    hide,
  } = useSelectionState(onAreaCaptureComplete);

  // Use the area capture hook
  const { selection, showWarning, isSelecting, setSelection, captureNow } = useAreaCapture({
    onCapture: async (imageData: string) => {
      // Hide overlay before capture
      // setShowOverlay(false); // no longer needed here
      pendingImageDataRef.current = imageData;
    },
    onCancel: hide,
    isVisible: showOverlay,
  });

  // Call onAreaCaptureComplete only after overlay is unmounted
  useEffect(() => {
    if (!showOverlay && pendingImageDataRef.current) {
      if (onAreaCaptureComplete) onAreaCaptureComplete(pendingImageDataRef.current);
      pendingImageDataRef.current = null;
      // Explicitly reset all overlay state and log
      setSelectionComplete(false);
      setShowOverlay(false);
      if (typeof window !== 'undefined') {
        console.log(
          '[OverlayProvider] State reset after capture: showOverlay=false, selectionComplete=false'
        );
      }
    }
  }, [
    showOverlay,
    onAreaCaptureComplete,
    pendingImageDataRef,
    setShowOverlay,
    setSelectionComplete,
  ]);

  // Track selection complete state
  React.useEffect(() => {
    setSelectionComplete(isSelectionComplete(selection, isSelecting));
  }, [isSelecting, selection, setSelectionComplete]);

  // Debug: log overlay and selection state
  useDebug('OverlayProvider', {
    showOverlay,
    selection,
    selectionComplete,
    isSelecting,
    selectionX: selection?.x,
    selectionY: selection?.y,
    selectionWidth: selection?.width,
    selectionHeight: selection?.height,
    selectionType: typeof selection,
    selectionString: JSON.stringify(selection),
    windowInnerWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
    windowInnerHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
    documentBodyExists: typeof document !== 'undefined' && !!document.body,
  });

  // Add handler for resizing
  const { handleHandleMouseDown } = useHandleResize(selection, setSelection);

  const hasValidSelection = selection && selection.width > 0 && selection.height > 0;

  const overlayRef = useRef<HTMLDivElement>(null);
  const [hideForCapture, setHideForCapture] = useState(false);

  const captureButtonPortal = useCaptureButtonPortal({
    selection,
    selectionComplete,
    onCapture: async () => {
      // Visually hide overlay and cursor, wait for paint, then capture
      setHideForCapture(true);
      const prevCursor = document.body.style.cursor;
      document.body.style.cursor = 'none';
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await captureNow();
      setHideForCapture(false);
      document.body.style.cursor = prevCursor;
      // Now unmount the overlay as before
      setTimeout(() => setShowOverlay(false), 0);
    },
    show: !!(hasValidSelection && selectionComplete),
  });

  return (
    <OverlayContext.Provider value={{ showOverlay, show, hide }}>
      {children}
      {showOverlay && (
        <div
          data-testid="event-capturing-overlay"
          ref={overlayRef}
          className={hideForCapture ? 'sc-hide-for-capture' : ''}
        >
          <FullViewportOverlay visible={showOverlay} hideForCapture={hideForCapture}>
            {/* Overlay mask with cutout (z-index: 10001) */}
            {hasValidSelection && <OverlayMask selection={selection} />}

            {/* Only show before dragging */}
            {!isSelecting && !hasValidSelection && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY + 1,
                  background: 'rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'none',
                }}
                data-testid="select-area-instruction-container"
              >
                <span data-testid="instruction">
                  Click and drag to select capture area
                  <br />
                  <span className="text-xs text-gray-500">Press ESC to cancel</span>
                </span>
              </div>
            )}

            {/* Cancel button (always visible) */}
            <CancelButton onClick={hide} />

            {/* Selection rectangle with handles and shadow (z-index: 10100) */}
            {hasValidSelection && (
              <SelectionRectangle
                x={pageToViewportCoords(selection.x, selection.y).x}
                y={pageToViewportCoords(selection.x, selection.y).y}
                width={selection.width}
                height={selection.height}
                showHandles={true}
                showSizeIndicator={true}
                onHandleMouseDown={handleHandleMouseDown}
              />
            )}

            {/* Warning if selection is outside viewport */}
            {showWarning && (
              <div
                style={{
                  position: 'fixed',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: Z_INDEX.WARNING,
                  pointerEvents: 'none',
                }}
                data-testid="selection-warning-message"
              >
                <span className="inline-block bg-red-500/95 text-white px-4 py-2 rounded-lg shadow border border-red-200 text-sm font-medium">
                  ⚠️ Selection is outside viewport
                </span>
              </div>
            )}
          </FullViewportOverlay>
        </div>
      )}
      {captureButtonPortal}
    </OverlayContext.Provider>
  );
};

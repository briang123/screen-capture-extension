import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAreaCapture } from '../hooks/useAreaCapture';
import type { SelectionRect } from '../hooks/useAreaCapture';
import FullViewportOverlay from './FullViewportOverlay';
import { useDebug } from '../hooks/useDebug';
import { Z_INDEX } from '@/shared/constants';
import OverlayMask from '@/sidebar/components/OverlayMask';
import SelectionRectangle from '@/sidebar/components/SelectionRectangle';
import CaptureButton from '@/sidebar/components/CaptureButton';
import Portal from '@/shared/components/Portal';
import { pageToViewportCoords } from '@/shared/utils/position';
import CancelButton from '@/sidebar/components/CancelButton';

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
  const [selectionComplete, setSelectionComplete] = useState(false);
  const pendingImageDataRef = useRef<string | null>(null);

  const show = useCallback(() => {
    setShowOverlay(true);
    setSelectionComplete(false);
  }, []);
  const hide = useCallback(() => setShowOverlay(false), []);

  // Use the area capture hook
  const { selection, showWarning, isSelecting, completeSelection, setSelection, captureNow } =
    useAreaCapture({
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
  }, [showOverlay, onAreaCaptureComplete]);

  // Track selection complete state
  React.useEffect(() => {
    if (!isSelecting && selection && selection.width > 0 && selection.height > 0) {
      setSelectionComplete(true);
    } else if (isSelecting) {
      setSelectionComplete(false);
    } else if (!isSelecting && selection && (selection.width === 0 || selection.height === 0)) {
      // If selection is 0x0, don't mark as complete
      setSelectionComplete(false);
    }
  }, [isSelecting, selection]);

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
  const handleHandleMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    handleKey: string
  ) => {
    e.stopPropagation();
    // Store initial mouse and selection state
    const startX = e.clientX;
    const startY = e.clientY;
    const startSelection = { ...selection } as SelectionRect;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      let newSelection: SelectionRect = { ...startSelection };
      // Update selection based on handle
      switch (handleKey) {
        case 'nw':
          newSelection.x = (newSelection.x ?? 0) + dx;
          newSelection.y = (newSelection.y ?? 0) + dy;
          newSelection.width = (newSelection.width ?? 0) - dx;
          newSelection.height = (newSelection.height ?? 0) - dy;
          break;
        case 'n':
          newSelection.y = (newSelection.y ?? 0) + dy;
          newSelection.height = (newSelection.height ?? 0) - dy;
          break;
        case 'ne':
          newSelection.y = (newSelection.y ?? 0) + dy;
          newSelection.width = (newSelection.width ?? 0) + dx;
          newSelection.height = (newSelection.height ?? 0) - dy;
          break;
        case 'w':
          newSelection.x = (newSelection.x ?? 0) + dx;
          newSelection.width = (newSelection.width ?? 0) - dx;
          break;
        case 'e':
          newSelection.width = (newSelection.width ?? 0) + dx;
          break;
        case 'sw':
          newSelection.x = (newSelection.x ?? 0) + dx;
          newSelection.width = (newSelection.width ?? 0) - dx;
          newSelection.height = (newSelection.height ?? 0) + dy;
          break;
        case 's':
          newSelection.height = (newSelection.height ?? 0) + dy;
          break;
        case 'se':
          newSelection.width = (newSelection.width ?? 0) + dx;
          newSelection.height = (newSelection.height ?? 0) + dy;
          break;
        default:
          break;
      }
      // Enforce minimum size
      newSelection.width = Math.max(10, newSelection.width ?? 0);
      newSelection.height = Math.max(10, newSelection.height ?? 0);
      setSelection(newSelection);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const hasValidSelection = selection && selection.width > 0 && selection.height > 0;

  let captureButtonPortal = null;
  if (hasValidSelection && selectionComplete) {
    // Center the button horizontally below the selected area
    const { x: viewportX, y: viewportY } = pageToViewportCoords(selection.x, selection.y);
    captureButtonPortal = (
      <Portal>
        <CaptureButton
          style={{
            position: 'fixed',
            top: viewportY + selection.height + 24,
            left: `calc(${viewportX + selection.width / 2}px)`,
            transform: 'translateX(-50%)',
            width: 120,
            zIndex: Z_INDEX.CAPTURE_BUTTON, // extremely high z-index
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
            fontSize: 16,
            color: '#1e293b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
          onClick={async () => {
            await captureNow();
            setTimeout(() => {
              setShowOverlay(false);
            }, 0);
          }}
        >
          Capture Image
        </CaptureButton>
      </Portal>
    );
  }

  return (
    <OverlayContext.Provider value={{ showOverlay, show, hide }}>
      {children}
      {showOverlay && (
        <FullViewportOverlay visible={showOverlay}>
          {/* Overlay mask with cutout (z-index: 10001) */}
          {hasValidSelection && <OverlayMask selection={selection} />}

          {/* Instructions (only show while dragging or before selection) */}
          {!selectionComplete && (
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
          )}

          {/* Cancel button (always visible) */}
          <CancelButton onClick={hide} />

          {/* Selection rectangle with handles and shadow (z-index: 10100) */}
          {hasValidSelection &&
            isSelecting &&
            (() => {
              const { x: viewportX, y: viewportY } = pageToViewportCoords(selection.x, selection.y);
              return (
                <SelectionRectangle
                  x={viewportX}
                  y={viewportY}
                  width={selection.width}
                  height={selection.height}
                  showHandles={isSelecting}
                  showSizeIndicator={isSelecting}
                  onHandleMouseDown={handleHandleMouseDown}
                />
              );
            })()}

          {/* Start Capture button (only after selection is complete) */}
          {hasValidSelection &&
            selectionComplete &&
            (() => {
              const { x: viewportX, y: viewportY } = pageToViewportCoords(selection.x, selection.y);
              return (
                <button
                  onClick={completeSelection}
                  style={{
                    position: 'fixed',
                    top: viewportY + selection.height + 24,
                    left: `calc(${viewportX + selection.width / 2}px)`,
                    transform: 'translateX(-50%)',
                    zIndex: Z_INDEX.START_CAPTURE,
                    pointerEvents: 'auto',
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-base hover:bg-blue-700 transition-colors border-2 border-white"
                >
                  Start Capture
                </button>
              );
            })()}

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
            >
              <span className="inline-block bg-red-500/95 text-white px-4 py-2 rounded-lg shadow border border-red-200 text-sm font-medium">
                ⚠️ Selection is outside viewport
              </span>
            </div>
          )}

          {/* Selection rectangle always visible after selection, with handles if complete or resizing */}
          {hasValidSelection &&
            (() => {
              const { x: viewportX, y: viewportY } = pageToViewportCoords(selection.x, selection.y);
              const showHandles = selectionComplete || isSelecting;
              return (
                <>
                  {/* Size indicator (after selection complete) */}
                  <div
                    style={{
                      position: 'fixed',
                      left: viewportX - 2,
                      top: viewportY - 32,
                      background: 'rgba(0,0,0,0.85)',
                      color: '#fff',
                      fontSize: 13,
                      padding: '2px 8px',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      pointerEvents: 'none',
                      zIndex: Z_INDEX.SIZE_INDICATOR,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.round(selection.width)} × {Math.round(selection.height)}
                  </div>
                  <div
                    className="absolute pointer-events-auto"
                    style={{
                      left: viewportX,
                      top: viewportY,
                      width: selection.width,
                      height: selection.height,
                      position: 'fixed',
                      border: '2px dotted #fff',
                      zIndex: Z_INDEX.SELECTION_OVERLAY,
                      background: 'transparent',
                    }}
                  >
                    {showHandles && (
                      <SelectionRectangle
                        x={viewportX}
                        y={viewportY}
                        width={selection.width}
                        height={selection.height}
                        showHandles={showHandles}
                        showSizeIndicator={showHandles}
                        onHandleMouseDown={handleHandleMouseDown}
                      />
                    )}
                  </div>
                </>
              );
            })()}
        </FullViewportOverlay>
      )}
      {captureButtonPortal}
    </OverlayContext.Provider>
  );
};

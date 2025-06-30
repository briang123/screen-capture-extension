import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAreaCapture } from '../hooks/useAreaCapture';
import type { SelectionRect } from '../hooks/useAreaCapture';
import FullViewportOverlay from './FullViewportOverlay';
import { useDebug } from '../hooks/useDebug';
import ReactDOM from 'react-dom';
import { Z_INDEX } from '../../shared/constants';
import { ANIMATION_DURATIONS } from '../../shared/constants';

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

  // Four-div overlay mask for a true clear cutout (no blur, just gray overlay)
  const renderOverlayMask = () => {
    if (!selection) return null;
    const { x, y, width, height } = selection;
    // Convert page coordinates to viewport coordinates for fixed positioning
    const viewportX = x - (typeof window !== 'undefined' ? window.scrollX : 0);
    const viewportY = y - (typeof window !== 'undefined' ? window.scrollY : 0);
    const right = viewportX + width;
    const bottom = viewportY + height;
    return (
      <>
        {/* Top */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: viewportY,
            background: 'rgba(40,40,40,0.35)',
            zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
            pointerEvents: 'none',
          }}
        />
        {/* Bottom */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: bottom,
            width: '100vw',
            height: `calc(100vh - ${bottom}px)`,
            background: 'rgba(40,40,40,0.35)',
            zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
            pointerEvents: 'none',
          }}
        />
        {/* Left */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: viewportY,
            width: viewportX,
            height: height,
            background: 'rgba(40,40,40,0.35)',
            zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
            pointerEvents: 'none',
          }}
        />
        {/* Right */}
        <div
          style={{
            position: 'fixed',
            left: right,
            top: viewportY,
            width: `calc(100vw - ${right}px)`,
            height: height,
            background: 'rgba(40,40,40,0.35)',
            zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
            pointerEvents: 'none',
          }}
        />
      </>
    );
  };

  // Refine renderHandles to use L-shaped white lines at corners and straight white lines at sides
  const renderHandles = (
    width: number,
    height: number,
    onHandleMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, handleKey: string) => void
  ) => {
    const length = 20;
    const thickness = 4;
    const offset = length / 2;
    const color = '#fff';
    const positions = [
      { x: 0, y: 0, cursor: 'nwse-resize', key: 'nw', orientation: 'corner', corner: 'tl' },
      { x: width / 2, y: 0, cursor: 'ns-resize', key: 'n', orientation: 'horizontal' },
      { x: width, y: 0, cursor: 'nesw-resize', key: 'ne', orientation: 'corner', corner: 'tr' },
      { x: 0, y: height / 2, cursor: 'ew-resize', key: 'w', orientation: 'vertical' },
      { x: width, y: height / 2, cursor: 'ew-resize', key: 'e', orientation: 'vertical' },
      { x: 0, y: height, cursor: 'nesw-resize', key: 'sw', orientation: 'corner', corner: 'bl' },
      { x: width / 2, y: height, cursor: 'ns-resize', key: 's', orientation: 'horizontal' },
      {
        x: width,
        y: height,
        cursor: 'nwse-resize',
        key: 'se',
        orientation: 'corner',
        corner: 'br',
      },
    ];
    return (
      <>
        {positions.map((handle) => {
          if (handle.orientation === 'corner') {
            // L-shaped handles at corners
            let horzStyle = {};
            let vertStyle = {};
            if (handle.corner === 'tl') {
              horzStyle = {
                left: handle.x,
                top: handle.y - thickness / 2,
                width: length,
                height: thickness,
              };
              vertStyle = {
                left: handle.x - thickness / 2,
                top: handle.y,
                width: thickness,
                height: length,
              };
            } else if (handle.corner === 'tr') {
              horzStyle = {
                left: handle.x - length,
                top: handle.y - thickness / 2,
                width: length,
                height: thickness,
              };
              vertStyle = {
                left: handle.x - thickness / 2,
                top: handle.y,
                width: thickness,
                height: length,
              };
            } else if (handle.corner === 'bl') {
              horzStyle = {
                left: handle.x,
                top: handle.y - thickness / 2,
                width: length,
                height: thickness,
              };
              vertStyle = {
                left: handle.x - thickness / 2,
                top: handle.y - length,
                width: thickness,
                height: length,
              };
            } else if (handle.corner === 'br') {
              horzStyle = {
                left: handle.x - length,
                top: handle.y - thickness / 2,
                width: length,
                height: thickness,
              };
              vertStyle = {
                left: handle.x - thickness / 2,
                top: handle.y - length,
                width: thickness,
                height: length,
              };
            }
            return (
              <React.Fragment key={handle.key}>
                <div
                  style={{
                    position: 'absolute',
                    background: color,
                    borderRadius: thickness,
                    cursor: handle.cursor,
                    zIndex: Z_INDEX.SELECTION_HANDLE,
                    ...horzStyle,
                  }}
                  onMouseDown={(e) => onHandleMouseDown(e, handle.key)}
                />
                <div
                  style={{
                    position: 'absolute',
                    background: color,
                    borderRadius: thickness,
                    cursor: handle.cursor,
                    zIndex: Z_INDEX.SELECTION_HANDLE,
                    ...vertStyle,
                  }}
                  onMouseDown={(e) => onHandleMouseDown(e, handle.key)}
                />
              </React.Fragment>
            );
          } else if (handle.orientation === 'horizontal') {
            return (
              <div
                key={handle.key}
                style={{
                  position: 'absolute',
                  left: handle.x - offset,
                  top: handle.y - thickness / 2,
                  width: length,
                  height: thickness,
                  background: color,
                  borderRadius: thickness,
                  cursor: handle.cursor,
                  zIndex: Z_INDEX.SELECTION_HANDLE,
                }}
                onMouseDown={(e) => onHandleMouseDown(e, handle.key)}
              />
            );
          } else if (handle.orientation === 'vertical') {
            return (
              <div
                key={handle.key}
                style={{
                  position: 'absolute',
                  left: handle.x - thickness / 2,
                  top: handle.y - offset,
                  width: thickness,
                  height: length,
                  background: color,
                  borderRadius: thickness,
                  cursor: handle.cursor,
                  zIndex: Z_INDEX.SELECTION_HANDLE,
                }}
                onMouseDown={(e) => onHandleMouseDown(e, handle.key)}
              />
            );
          }
          return null;
        })}
      </>
    );
  };

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

  let captureButtonPortal = null;
  if (selection && selectionComplete && selection.width > 0 && selection.height > 0) {
    // Center the button horizontally below the selected area
    const viewportX = selection.x - (typeof window !== 'undefined' ? window.scrollX : 0);
    const viewportY = selection.y - (typeof window !== 'undefined' ? window.scrollY : 0);
    captureButtonPortal = ReactDOM.createPortal(
      <button
        id="portal-capture-btn"
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
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        onClick={async () => {
          await captureNow();
          setTimeout(() => {
            setShowOverlay(false);
          }, 0);
        }}
      >
        Capture Image
      </button>,
      document.body
    );
  }

  return (
    <OverlayContext.Provider value={{ showOverlay, show, hide }}>
      {children}
      {showOverlay && (
        <FullViewportOverlay visible={showOverlay}>
          {/* Overlay mask with cutout (z-index: 10001) */}
          {selection && selection.width > 0 && selection.height > 0 && renderOverlayMask()}

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
          <button
            onClick={hide}
            style={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
              pointerEvents: 'auto',
            }}
            className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow border border-gray-200"
          >
            Cancel
          </button>

          {/* Selection rectangle with handles and shadow (z-index: 10100) */}
          {selection &&
            isSelecting &&
            selection.width > 0 &&
            selection.height > 0 &&
            (() => {
              // Convert page coordinates to viewport coordinates for fixed positioning
              const viewportX = selection.x - (typeof window !== 'undefined' ? window.scrollX : 0);
              const viewportY = selection.y - (typeof window !== 'undefined' ? window.scrollY : 0);

              return (
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    left: viewportX,
                    top: viewportY,
                    width: selection.width,
                    height: selection.height,
                    position: 'fixed',
                    border: '2px dashed #00ff00',
                    borderRadius: 8,
                    boxShadow: '0 0 0 2px #ff00ff, 0 4px 24px 0 rgba(0,0,0,0.18)',
                    zIndex: Z_INDEX.SELECTION_OVERLAY,
                    background: 'transparent',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: ANIMATION_DURATIONS.OVERLAY_FADE / 1000 }}
                >
                  {/* Size indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -2,
                      top: -32,
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
                  {/* Corner handles */}
                  <div
                    className="absolute -top-2 -left-2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow"
                    style={{ zIndex: Z_INDEX.CORNER_HANDLE }}
                  />
                  <div
                    className="absolute -top-2 -right-2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow"
                    style={{ zIndex: Z_INDEX.CORNER_HANDLE }}
                  />
                  <div
                    className="absolute -bottom-2 -left-2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow"
                    style={{ zIndex: Z_INDEX.CORNER_HANDLE }}
                  />
                  <div
                    className="absolute -bottom-2 -right-2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow"
                    style={{ zIndex: Z_INDEX.CORNER_HANDLE }}
                  />
                </motion.div>
              );
            })()}

          {/* Start Capture button (only after selection is complete) */}
          {selection &&
            selectionComplete &&
            selection.width > 0 &&
            selection.height > 0 &&
            (() => {
              // Convert page coordinates to viewport coordinates for fixed positioning
              const viewportX = selection.x - (typeof window !== 'undefined' ? window.scrollX : 0);
              const viewportY = selection.y - (typeof window !== 'undefined' ? window.scrollY : 0);

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
          {selection &&
            selection.width > 0 &&
            selection.height > 0 &&
            (() => {
              const viewportX = selection.x - (typeof window !== 'undefined' ? window.scrollX : 0);
              const viewportY = selection.y - (typeof window !== 'undefined' ? window.scrollY : 0);
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
                    {showHandles &&
                      renderHandles(selection.width, selection.height, handleHandleMouseDown)}
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

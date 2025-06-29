import { useState, useCallback, useEffect, useRef } from 'react';
import { CHROME_ACTIONS } from '@/shared/constants';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseAreaCaptureOptions {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

interface UseAreaCaptureReturn {
  isSelecting: boolean;
  selection: SelectionRect | null;
  showWarning: boolean;
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  completeSelection: () => void;
  cancelSelection: () => void;
  setSelection: (sel: SelectionRect | null) => void;
  captureNow: () => Promise<void>;
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

export function useAreaCapture({
  onCapture,
  onCancel,
  isVisible,
}: UseAreaCaptureOptions): UseAreaCaptureReturn {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const isSelectingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
// Persist the last valid selection
  const lastValidSelectionRef = useRef<SelectionRect | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    isSelectingRef.current = isSelecting;
  }, [isSelecting]);

  useEffect(() => {
    startPosRef.current = startPos;
  }, [startPos]);

  // Capture the selected area
  const captureSelectedArea = useCallback(
    async (sel: SelectionRect) => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: CHROME_ACTIONS.CAPTURE_AREA,
          data: {
            x: sel.x,
            y: sel.y,
            width: sel.width,
            height: sel.height,
          },
        });
        console.log('[useAreaCapture] captureSelectedArea response:', response);
        if (response.success && response.imageData) {
          onCapture(response.imageData);
          // Reset selection state after capture
          setSelection(null);
          setIsSelecting(false);
          setStartPos(null);
          setShowWarning(false);
        } else {
          throw new Error(response.error || 'Capture failed');
        }
      } catch (error) {
        console.error('Area capture failed:', error);
        setShowWarning(true);
      }
    },
    [onCapture]
  );

  // Start selection
  const startSelection = useCallback((x: number, y: number) => {
    console.log('[useAreaCapture] startSelection called with:', { x, y });
    setStartPos({ x, y });
    setIsSelecting(true);
    setSelection({ x, y, width: 0, height: 0 });
    setShowWarning(false);
  }, []);

  // Update selection
  const updateSelection = useCallback((currentX: number, currentY: number) => {
    if (!isSelectingRef.current || !startPosRef.current) {
      console.log('[useAreaCapture] updateSelection skipped - not selecting or no start pos');
      return;
    }

    const x = Math.min(startPosRef.current.x, currentX);
    const y = Math.min(startPosRef.current.y, currentY);
    const width = Math.abs(currentX - startPosRef.current.x);
    const height = Math.abs(currentY - startPosRef.current.y);
    const sel = { x, y, width, height };
    console.log('[useAreaCapture] updateSelection:', {
      currentX,
      currentY,
      startPos: startPosRef.current,
      selection: sel,
    });
    setSelection(sel);
    setShowWarning(!isSelectionInViewport(sel));
    // Store as last valid selection if valid
    if (width > 0 && height > 0) {
      lastValidSelectionRef.current = sel;
    }
  }, []);

  // Complete selection
  const completeSelection = useCallback(() => {
    if (!isSelectingRef.current || !selection) {
      console.log('[useAreaCapture] completeSelection skipped - not selecting or no selection');
      return;
    }

    console.log('[useAreaCapture] completeSelection called with selection:', selection);
    setIsSelecting(false);
    setStartPos(null);

    // Only mark as complete, do not trigger capture
    // The capture will be triggered by captureNow (button click)
  }, [selection]);

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setStartPos(null);
    setSelection(null);
    setShowWarning(false);
    onCancel();
  }, [onCancel]);

  // Global mouse event handlers
  useEffect(() => {
    if (!isVisible) {
      console.log('[useAreaCapture] Overlay not visible, skipping event listener setup');
      return;
    }

    console.log('[useAreaCapture] Setting up global mouse event listeners');

    const handleGlobalMouseDown = (e: MouseEvent) => {
      console.log('[useAreaCapture] Global mousedown event:', {
        pageX: e.pageX,
        pageY: e.pageY,
        isSelecting: isSelectingRef.current,
      });
      if (isSelectingRef.current) return; // Already selecting

      // Prevent default to avoid text selection
      e.preventDefault();
      e.stopPropagation();

      startSelection(e.pageX, e.pageY);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;

      console.log('[useAreaCapture] Global mousemove event:', { pageX: e.pageX, pageY: e.pageY });
      // Prevent default to avoid text selection
      e.preventDefault();
      e.stopPropagation();

      updateSelection(e.pageX, e.pageY);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      console.log('[useAreaCapture] Global mouseup event:', {
        pageX: e.pageX,
        pageY: e.pageY,
        isSelecting: isSelectingRef.current,
      });
      if (!isSelectingRef.current) return;

      // Prevent default to avoid text selection
      e.preventDefault();
      e.stopPropagation();

      completeSelection();
    };

    // Add global event listeners
    document.addEventListener('mousedown', handleGlobalMouseDown, true);
    document.addEventListener('mousemove', handleGlobalMouseMove, true);
    document.addEventListener('mouseup', handleGlobalMouseUp, true);

    // Prevent text selection during capture
    document.body.style.userSelect = 'none';

    return () => {
      console.log('[useAreaCapture] Cleaning up global mouse event listeners');
      document.removeEventListener('mousedown', handleGlobalMouseDown, true);
      document.removeEventListener('mousemove', handleGlobalMouseMove, true);
      document.removeEventListener('mouseup', handleGlobalMouseUp, true);

      // Restore text selection
      document.body.style.userSelect = '';
    };
  }, [isVisible, startSelection, updateSelection, completeSelection]);

  // Handle escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isVisible, cancelSelection]);

  // Prevent scrolling when visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isVisible]);

  // Reset selection state on new area capture
  useEffect(() => {
    if (isVisible) {
      setSelection(null);
      setStartPos(null);
      setIsSelecting(false);
      setShowWarning(false);
    }
  }, [isVisible]);

  // Add this to the return value of useAreaCapture
  const captureNow = useCallback(async () => {
    console.log('[useAreaCapture] captureNow called');
    // Hide overlay (handled by parent)
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))
    );
    if (selection && selection.width > 10 && selection.height > 10) {
      await captureSelectedArea(selection);
    }
  }, [selection, captureSelectedArea]);

  return {
    isSelecting,
    selection,
    showWarning,
    startSelection,
    updateSelection,
    completeSelection,
    cancelSelection,
    setSelection,
    captureNow,
  };
}

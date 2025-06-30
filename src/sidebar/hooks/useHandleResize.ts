import { useRef, useCallback, useState } from 'react';
import type { SelectionRect } from '../hooks/useAreaCapture';
import { useEventListener } from './useEventListener';

const MIN_SIZE = 10;

/**
 * Pure utility to calculate new selection rect based on handle, delta, and min size.
 */
function resizeSelectionByHandle(
  selection: SelectionRect,
  handleKey: string,
  dx: number,
  dy: number,
  minSize: number
): SelectionRect {
  let newSelection: SelectionRect = { ...selection };
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
  newSelection.width = Math.max(minSize, newSelection.width ?? 0);
  newSelection.height = Math.max(minSize, newSelection.height ?? 0);
  return newSelection;
}

/**
 * Hook to provide handle resize logic for selection rectangles.
 * Returns a handleHandleMouseDown function to be used on handle mouse down events.
 * @param selection The current selection rectangle
 * @param setSelection Function to update the selection rectangle
 * @param minSize Optional minimum size for width/height (default: 10)
 */
export function useHandleResize(
  selection: SelectionRect | null,
  setSelection: (rect: SelectionRect) => void,
  minSize: number = MIN_SIZE
) {
  const startSelectionRef = useRef<SelectionRect | null>(null);
  const handleKeyRef = useRef<string | null>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const [isResizing, setIsResizing] = useState(false);

  // Mouse move handler
  const onMouseMove = useCallback(
    (moveEvent: MouseEvent) => {
      if (!startSelectionRef.current || !handleKeyRef.current) return;
      const dx = moveEvent.clientX - startXRef.current;
      const dy = moveEvent.clientY - startYRef.current;
      const newSelection = resizeSelectionByHandle(
        startSelectionRef.current,
        handleKeyRef.current,
        dx,
        dy,
        minSize
      );
      setSelection(newSelection);
    },
    [setSelection, minSize]
  );

  // Mouse up handler
  const onMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Attach listeners only when resizing
  useEventListener('mousemove', onMouseMove, window, isResizing);
  useEventListener('mouseup', onMouseUp, window, isResizing);

  // Main handler
  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, handleKey: string) => {
      e.stopPropagation();
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startSelectionRef.current = selection ? { ...selection } : null;
      handleKeyRef.current = handleKey;
      setIsResizing(true);
    },
    [selection]
  );

  return { handleHandleMouseDown };
}

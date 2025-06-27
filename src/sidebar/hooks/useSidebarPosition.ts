import { useState, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export function useSidebarPosition(
  side: 'left' | 'right',
  sidebarWidth: number,
  getInitialY: () => number
): [Position, React.Dispatch<React.SetStateAction<Position>>, () => void] {
  // Helper to get the right edge
  const getRightEdge = useCallback(
    () => Math.max(0, document.documentElement.clientWidth - sidebarWidth),
    [sidebarWidth]
  );

  // Initial position based on side
  const getInitialPosition = useCallback(
    () => ({
      x: side === 'right' ? getRightEdge() : 0,
      y: getInitialY(),
    }),
    [side, getRightEdge, getInitialY]
  );

  const [position, setPosition] = useState<Position>(getInitialPosition);

  // Helper to snap to nearest edge
  const snapToEdge = useCallback(() => {
    setPosition((pos) => ({
      ...pos,
      x: side === 'right' ? getRightEdge() : 0,
    }));
  }, [side, getRightEdge]);

  return [position, setPosition, snapToEdge];
}

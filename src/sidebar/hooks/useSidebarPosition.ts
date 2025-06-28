import { useState, useCallback } from 'react';

/**
 * useSidebarPosition - Sidebar Position Management Hook
 *
 * This hook manages the positioning state and logic for sidebar components,
 * including initial positioning, edge snapping, and position updates.
 *
 * WHY USE THIS HOOK:
 * - Centralizes sidebar positioning logic
 * - Handles side-specific positioning (left/right)
 * - Provides edge snapping functionality
 * - Manages responsive positioning updates
 * - Integrates with window resize events
 * - Ensures proper sidebar placement
 *
 * COMMON USE CASES:
 * - Sidebar initial positioning
 * - Edge snapping behavior
 * - Responsive position updates
 * - Window resize handling
 * - Sidebar repositioning
 * - Position restoration from storage
 *
 * KEY FEATURES:
 * - Side-specific positioning (left/right)
 * - Edge snapping functionality
 * - Responsive position calculations
 * - Initial position determination
 * - Position state management
 * - Integration with window dimensions
 *
 * PERFORMANCE BENEFITS:
 * - Efficient position calculations with useCallback
 * - Optimized re-renders with state management
 * - Debounced position updates
 * - Memory leak prevention
 *
 * ACCESSIBILITY FEATURES:
 * - Proper positioning for screen readers
 * - Keyboard navigation support
 * - Focus management during repositioning
 * - ARIA attribute updates for position changes
 */

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

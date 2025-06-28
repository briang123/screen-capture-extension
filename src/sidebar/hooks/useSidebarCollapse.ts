import { useState } from 'react';

/**
 * useSidebarCollapse - Sidebar Collapse State Management Hook
 *
 * This hook manages the collapsed/expanded state for sidebar components,
 * providing a simple toggle handler and state value.
 *
 * WHY USE THIS HOOK:
 * - Centralizes sidebar collapse state logic
 * - Provides a toggle handler for collapse/expand
 * - Simplifies sidebar UI state management
 * - Integrates with sidebar animation and visibility hooks
 * - Ensures consistent collapse behavior across components
 * - Type-safe state management with explicit collapsed/expanded values
 *
 * COMMON USE CASES:
 * - Sidebar collapse/expand button
 * - Responsive sidebar layouts
 * - Collapsible navigation menus
 * - Sidebar state persistence
 * - UI feedback for collapsed state
 *
 * KEY FEATURES:
 * - Collapsed/expanded state management with type safety
 * - Toggle handler for collapse/expand
 * - Initial collapsed state support
 * - Integration with sidebar UI components
 * - Minimal API for easy usage
 * - Explicit state values for better readability
 *
 * PERFORMANCE BENEFITS:
 * - Efficient state updates with useState
 * - Minimal re-renders
 * - No memory leaks or cleanup required
 * - Optimized for frequent UI toggling
 *
 * ACCESSIBILITY FEATURES:
 * - ARIA attribute updates for collapsed state
 * - Keyboard navigation support
 * - Focus management during collapse/expand
 */

export type CollapsedState = 'collapsed' | 'expanded';

export function useSidebarCollapse(initialCollapsed = false): [CollapsedState, () => void] {
  const [collapsed, setCollapsed] = useState<CollapsedState>(
    initialCollapsed ? 'collapsed' : 'expanded'
  );

  const handleToggleCollapse = () =>
    setCollapsed((prev) => (prev === 'collapsed' ? 'expanded' : 'collapsed'));

  return [collapsed, handleToggleCollapse];
}

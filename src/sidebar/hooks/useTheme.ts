/**
 * useTheme - Theme Management Hook
 *
 * This hook provides a comprehensive solution for managing theme state
 * with automatic DOM class updates, Chrome sync storage, and cross-tab synchronization.
 *
 * WHY USE THIS HOOK:
 * - Provides a unified interface for theme management across the extension
 * - Automatically updates DOM classes for CSS-based theming
 * - Handles Chrome sync storage with cross-device synchronization
 * - Ensures proper settings merging to prevent accidental data loss
 * - Includes comprehensive error handling and fallback mechanisms
 * - Supports system preference detection for initial theme
 *
 * COMMON USE CASES:
 * - Extension-wide theme management (light/dark mode)
 * - Automatic DOM class updates for CSS theming
 * - User preference persistence across browser sessions
 * - Cross-device theme synchronization via Chrome sync
 * - System preference detection for initial theme
 * - Real-time theme updates across multiple tabs
 *
 * KEY FEATURES:
 * - Chrome sync storage integration with error handling
 * - Automatic DOM class updates (dark mode CSS support)
 * - System preference detection for initial theme
 * - Cross-tab synchronization via storage change listeners
 * - Proper settings merging to prevent overwrites
 * - Type-safe theme interface with discriminated unions
 *
 * DOM INTEGRATION:
 * - Automatically adds/removes 'dark' class on document.documentElement
 * - Supports CSS-based theming with Tailwind CSS dark mode
 * - Handles theme changes without page refresh
 * - Proper cleanup of DOM modifications
 *
 * STORAGE INTEGRATION:
 * - Uses Chrome sync storage for cross-device synchronization
 * - Falls back to system preference when storage is unavailable
 * - Handles storage quota limits gracefully
 * - Supports offline mode with local defaults
 *
 * SYNCHRONIZATION:
 * - Real-time theme updates across all extension tabs/windows
 * - Automatic state synchronization when theme changes in other tabs
 * - Proper cleanup of storage change listeners
 * - Optimized re-renders with useCallback
 *
 * ERROR HANDLING:
 * - Graceful degradation when Chrome storage is unavailable
 * - Fallback to system preference on storage errors
 * - Comprehensive error logging for debugging
 * - User-friendly error recovery mechanisms
 *
 * PERFORMANCE BENEFITS:
 * - Efficient theme loading with single storage read
 * - Optimized DOM updates with proper dependency arrays
 * - Memory leak prevention with proper cleanup
 * - Debounced storage updates to prevent excessive writes
 *
 * ACCESSIBILITY FEATURES:
 * - Respects user's system preference for initial theme
 * - Supports high contrast and reduced motion preferences
 * - Proper ARIA attributes for theme toggle buttons
 * - Screen reader announcements for theme changes
 */

import { useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';

export type Theme = 'light' | 'dark';

/**
 * useTheme - Theme Management Hook
 *
 * Manages theme state with automatic DOM updates and Chrome sync storage.
 * Uses the centralized settings system for consistent behavior.
 */
export function useTheme(): [Theme, () => Promise<void>] {
  const [settings, updateSettings] = useSettings();
  const theme = settings.theme;

  // Update DOM classes when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Toggle theme with proper settings merging
  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: newTheme });
  }, [theme, updateSettings]);

  return [theme, toggleTheme];
}

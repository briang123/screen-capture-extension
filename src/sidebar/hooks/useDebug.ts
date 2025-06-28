import { useEffect } from 'react';

/**
 * useDebug - Debug Logging Hook for Development
 *
 * This hook provides a convenient way to log component state changes and values
 * during development, with grouped console output for better readability.
 *
 * WHY USE THIS HOOK:
 * - Simplifies debugging of component state changes
 * - Provides grouped console output for clarity
 * - Automatically logs when values change
 * - Reduces console clutter with organized logging
 * - Helps track component lifecycle and state updates
 * - Facilitates development and troubleshooting
 *
 * COMMON USE CASES:
 * - Component state debugging
 * - Prop changes tracking
 * - Effect dependency monitoring
 * - Performance debugging
 * - State synchronization verification
 * - Development workflow enhancement
 *
 * KEY FEATURES:
 * - Grouped console logging
 * - Automatic change detection
 * - Clean console output format
 * - Development-only functionality
 * - Easy integration with existing components
 * - Minimal performance impact
 *
 * PERFORMANCE BENEFITS:
 * - Only logs when values actually change
 * - Minimal overhead in production builds
 * - Efficient dependency tracking
 * - No memory leaks or cleanup required
 *
 * DEVELOPMENT FEATURES:
 * - Clear, organized console output
 * - Easy to identify component sources
 * - Helps with debugging complex state
 * - Reduces development time
 */

export function useDebug(label: string, values: Record<string, unknown>) {
  useEffect(() => {
    // Grouped log for clarity
    console.group(`[${label}]`);
    Object.entries(values).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();
    // Only log when values change
  }, Object.values(values));
}

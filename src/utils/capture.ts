/**
 * capture.ts - Generic and Specific Screen Capture Utilities
 *
 * This module provides generic and specific functions for capturing screenshots via Chrome extension messaging.
 *
 * WHY USE THESE UTILITIES:
 * - Centralizes all capture logic for window, tab, full page, area, and elements
 * - Reduces boilerplate and ensures consistent error handling
 * - Makes it easy to add new capture types
 *
 * COMMON USE CASES:
 * - Capture the entire browser window, visible tab, full page, selected area, or DOM elements
 * - Use in a capture manager/context to coordinate state and UI
 *
 * KEY FEATURES:
 * - Generic message-based capture function
 * - Specific helpers for each capture type
 * - Consistent error handling and return types
 *
 * PERFORMANCE BENEFITS:
 * - Efficient, single-message operations
 * - Minimal memory usage
 * - No unnecessary re-renders
 *
 * ACCESSIBILITY FEATURES:
 * - Can be triggered by keyboard or UI
 * - User-facing error messages
 *
 * API:
 * - captureViaMessage(action: string, data?: any): Promise<{ imageData: string } | { error: UserFacingError }>
 * - captureWindow(): Promise<{ imageData: string } | { error: UserFacingError }>
 * - captureTabViewport(): Promise<{ imageData: string } | { error: UserFacingError }>
 * - captureFullPage(): Promise<{ imageData: string } | { error: UserFacingError }>
 * - captureArea(area: { x: number, y: number, width: number, height: number }): Promise<{ imageData: string } | { error: UserFacingError }>
 * - captureElements(selectors: string[]): Promise<{ imageData: string } | { error: UserFacingError }>
 */
import { createUserFacingError, UserFacingError } from '../shared/error-handling';

export async function captureViaMessage(
  action: string,
  data?: Record<string, unknown>
): Promise<{ imageData: string } | { error: UserFacingError }> {
  try {
    const response = await chrome.runtime.sendMessage({ action, ...(data ? { data } : {}) });
    if (response.success && response.imageData) {
      return { imageData: response.imageData };
    } else {
      return { error: createUserFacingError(response.error || `${action} failed`) };
    }
  } catch (error) {
    return { error: createUserFacingError(error) };
  }
}

export function captureWindow() {
  return captureViaMessage('captureWindow');
}

export function captureTabViewport() {
  return captureViaMessage('captureScreen');
}

export async function captureFullPage() {
  // If you need to send a message to a specific tab, add logic here.
  return captureViaMessage('captureFullPage');
}

export function captureArea(area: { x: number; y: number; width: number; height: number }) {
  return captureViaMessage('captureArea', area);
}

export function captureElements(selectors: string[]) {
  return captureViaMessage('captureElements', { selectors });
}

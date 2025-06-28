/**
 * useSidebarVisibility - Sidebar Visibility Management Hook
 *
 * This hook provides comprehensive visibility management for sidebar components,
 * including open/close state, escape key handling, outside click detection,
 * and focus management integration.
 *
 * WHY USE THIS HOOK:
 * - Centralizes sidebar visibility logic in one place
 * - Handles common UX patterns (escape to close, outside click to close)
 * - Integrates with focus management for accessibility
 * - Provides consistent behavior across different sidebar implementations
 * - Supports both controlled and uncontrolled visibility states
 *
 * COMMON USE CASES:
 * - Sidebar panels and navigation menus
 * - Slide-out panels and drawers
 * - Floating toolbars and palettes
 * - Any collapsible UI component
 *
 * KEY FEATURES:
 * - Escape key to close sidebar
 * - Outside click detection to close
 * - Focus restoration when closing
 * - Integration with useFocusTrap for accessibility
 * - Controlled and uncontrolled modes
 * - Callback support for visibility changes
 *
 * ACCESSIBILITY FEATURES:
 * - Proper focus management
 * - Keyboard navigation support
 * - Screen reader announcements
 * - ARIA attribute management
 */

import { useState, useEffect, useCallback, useRef, RefObject } from 'react';
import { useFocusTrap } from './useFocusTrap';
import { TIMEOUTS } from '@/shared/constants';

export interface UseSidebarVisibilityOptions {
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Whether the sidebar is controlled externally */
  controlled?: boolean;
  /** Whether to close on escape key press */
  closeOnEscape?: boolean;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether to restore focus when closing */
  restoreFocus?: boolean;
  /** Whether to enable focus trap when visible */
  enableFocusTrap?: boolean;
  /** Custom selector for outside click detection (default: body) */
  outsideClickSelector?: string;
  /** Callback when visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
  /** Callback when sidebar opens */
  onOpen?: () => void;
  /** Callback when sidebar closes */
  onClose?: () => void;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Callback when outside click is detected */
  onOutsideClick?: () => void;
}

export interface UseSidebarVisibilityReturn {
  /** Whether the sidebar is currently visible */
  visible: boolean;
  /** Function to open the sidebar */
  open: () => void;
  /** Function to close the sidebar */
  close: () => void;
  /** Function to toggle the sidebar visibility */
  toggle: () => void;
  /** Ref to attach to the sidebar container */
  containerRef: RefObject<HTMLElement>;
  /** Ref to attach to the trigger element (for outside click detection) */
  triggerRef: RefObject<HTMLElement>;
  /** Whether the sidebar is currently transitioning */
  isTransitioning: boolean;
  /** Function to force update visibility (for controlled mode) */
  setVisible: (visible: boolean) => void;
}

export function useSidebarVisibility(
  options: UseSidebarVisibilityOptions = {}
): UseSidebarVisibilityReturn {
  const {
    initialVisible = false,
    controlled = false,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    restoreFocus = true,
    enableFocusTrap = true,
    outsideClickSelector = 'body',
    onVisibilityChange,
    onOpen,
    onClose,
    onEscape,
    onOutsideClick,
  } = options;

  const [visible, setVisibleState] = useState(initialVisible);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap integration
  const { containerRef: focusTrapRef, deactivate: deactivateFocusTrap } = useFocusTrap({
    enabled: visible && enableFocusTrap,
    returnFocus: restoreFocus,
    focusFirstElement: true,
    allowEscape: closeOnEscape,
    onEscape: () => {
      onEscape?.();
      if (closeOnEscape) {
        close();
      }
    },
  });

  // Save focus when opening
  const saveFocus = useCallback(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Restore focus when closing
  const restoreFocusToPrevious = useCallback(() => {
    if (restoreFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [restoreFocus]);

  // Open the sidebar
  const open = useCallback(() => {
    if (controlled) return; // Don't change state in controlled mode

    saveFocus();
    setVisibleState(true);
    setIsTransitioning(true);

    // Call callbacks
    onVisibilityChange?.(true);
    onOpen?.();

    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), TIMEOUTS.SIDEBAR_TRANSITION);
  }, [controlled, saveFocus, onVisibilityChange, onOpen]);

  // Close the sidebar
  const close = useCallback(() => {
    if (controlled) return; // Don't change state in controlled mode

    setIsTransitioning(true);
    setVisibleState(false);

    // Call callbacks
    onVisibilityChange?.(false);
    onClose?.();

    // Restore focus and reset transition state
    setTimeout(() => {
      restoreFocusToPrevious();
      setIsTransitioning(false);
    }, TIMEOUTS.SIDEBAR_TRANSITION);
  }, [controlled, restoreFocusToPrevious, onVisibilityChange, onClose]);

  // Toggle the sidebar
  const toggle = useCallback(() => {
    if (visible) {
      close();
    } else {
      open();
    }
  }, [visible, open, close]);

  // Set visibility (for controlled mode)
  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (newVisible) {
        saveFocus();
        setVisibleState(true);
        setIsTransitioning(true);
        onVisibilityChange?.(true);
        onOpen?.();
        setTimeout(() => setIsTransitioning(false), TIMEOUTS.SIDEBAR_TRANSITION);
      } else {
        setIsTransitioning(true);
        setVisibleState(false);
        onVisibilityChange?.(false);
        onClose?.();
        setTimeout(() => {
          restoreFocusToPrevious();
          setIsTransitioning(false);
        }, TIMEOUTS.SIDEBAR_TRANSITION);
      }
    },
    [saveFocus, restoreFocusToPrevious, onVisibilityChange, onOpen, onClose]
  );

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !visible) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        if (closeOnEscape) {
          close();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, visible, onEscape, close]);

  // Handle outside click
  useEffect(() => {
    if (!closeOnOutsideClick || !visible) return;

    const handleOutsideClick = (event: Event) => {
      const target = event.target as HTMLElement;

      // Check if click is outside the sidebar and not on the trigger
      const isOutsideSidebar = containerRef.current && !containerRef.current.contains(target);
      const isOnTrigger = triggerRef.current && triggerRef.current.contains(target);

      if (isOutsideSidebar && !isOnTrigger) {
        onOutsideClick?.();
        if (closeOnOutsideClick) {
          close();
        }
      }
    };

    // Use the specified selector for event delegation
    const outsideElement = document.querySelector(outsideClickSelector);
    if (outsideElement) {
      outsideElement.addEventListener('click', handleOutsideClick, true);
      return () => outsideElement.removeEventListener('click', handleOutsideClick, true);
    } else {
      document.addEventListener('click', handleOutsideClick, true);
      return () => document.removeEventListener('click', handleOutsideClick, true);
    }
  }, [closeOnOutsideClick, visible, outsideClickSelector, onOutsideClick, close]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (visible) {
        restoreFocusToPrevious();
        deactivateFocusTrap();
      }
    };
  }, [visible, restoreFocusToPrevious, deactivateFocusTrap]);

  return {
    visible,
    open,
    close,
    toggle,
    containerRef: focusTrapRef,
    triggerRef,
    isTransitioning,
    setVisible,
  };
}

// Convenience hook for simple sidebar visibility
export function useSimpleSidebarVisibility(
  initialVisible = false,
  closeOnEscape = true,
  closeOnOutsideClick = true
): UseSidebarVisibilityReturn {
  return useSidebarVisibility({
    initialVisible,
    closeOnEscape,
    closeOnOutsideClick,
  });
}

// Hook for controlled sidebar visibility
export function useControlledSidebarVisibility(
  visible: boolean,
  onVisibilityChange: (visible: boolean) => void,
  options: Omit<UseSidebarVisibilityOptions, 'controlled' | 'initialVisible'> = {}
): UseSidebarVisibilityReturn {
  return useSidebarVisibility({
    ...options,
    controlled: true,
    initialVisible: visible,
    onVisibilityChange,
  });
}

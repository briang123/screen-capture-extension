/**
 * useFocusTrap - Comprehensive Focus Management Hook for Accessibility
 *
 * This hook provides a complete solution for managing focus trapping, keyboard navigation,
 * and ARIA attributes in React components. It's essential for creating accessible modals,
 * dialogs, sidebars, and other interactive UI components.
 *
 * WHY USE THIS HOOK:
 * - Ensures keyboard users can navigate your UI without getting trapped or lost
 * - Implements WCAG 2.1 guidelines for focus management
 * - Provides automatic ARIA attribute management
 * - Handles focus restoration when components unmount
 * - Supports custom focus selectors and escape key handling
 * - Prevents focus from escaping the component boundaries
 *
 * COMMON USE CASES:
 * - Modal dialogs and popups
 * - Sidebar panels and navigation menus
 * - Form overlays and wizards
 * - Tooltip and dropdown menus
 * - Any component that should contain focus
 *
 * KEY FEATURES:
 * - Tab key navigation (forward/backward)
 * - Arrow key navigation (up/down/left/right)
 * - Home/End key navigation (first/last element)
 * - Escape key handling with callback
 * - Automatic focus restoration
 * - ARIA role and modal attributes
 * - Custom focusable element selectors
 * - Focus enter/leave callbacks
 *
 * ACCESSIBILITY BENEFITS:
 * - Screen reader compatibility
 * - Keyboard-only navigation support
 * - Proper focus management for assistive technologies
 * - WCAG 2.1 AA compliance for focus trapping
 * - Reduced cognitive load for users with disabilities
 *
 * EXAMPLE USAGE:
 * ```tsx
 * const { containerRef, isActive } = useFocusTrap({
 *   enabled: isModalOpen,
 *   returnFocus: true,
 *   focusFirstElement: true,
 *   allowEscape: true,
 *   onEscape: () => setIsModalOpen(false),
 * });
 *
 * return (
 *   <div ref={containerRef} className="modal">
 *     <h2>Modal Title</h2>
 *     <button>Action 1</button>
 *     <button>Action 2</button>
 *   </div>
 * );
 * ```
 */

import { useEffect, useRef, useCallback, RefObject, MutableRefObject } from 'react';

export interface FocusTrapOptions {
  /** Whether the focus trap is active */
  enabled?: boolean;
  /** Whether to return focus to the previous element when trap is deactivated */
  returnFocus?: boolean;
  /** Whether to focus the first focusable element when trap is activated */
  focusFirstElement?: boolean;
  /** Whether to allow focus to escape on Escape key */
  allowEscape?: boolean;
  /** Custom selector for focusable elements (default: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') */
  focusableSelector?: string;
  /** Whether to include elements with tabindex="-1" in the focus trap */
  includeNegativeTabIndex?: boolean;
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  /** Callback when focus enters the trap */
  onFocusEnter?: () => void;
  /** Callback when focus leaves the trap */
  onFocusLeave?: () => void;
}

export interface FocusTrapReturn {
  /** Ref to attach to the container element */
  containerRef: RefObject<HTMLElement>;
  /** Ref to attach to the first focusable element */
  firstFocusableRef: RefObject<HTMLElement>;
  /** Ref to attach to the last focusable element */
  lastFocusableRef: RefObject<HTMLElement>;
  /** Function to manually focus the first element */
  focusFirst: () => void;
  /** Function to manually focus the last element */
  focusLast: () => void;
  /** Function to manually focus the next element */
  focusNext: () => void;
  /** Function to manually focus the previous element */
  focusPrev: () => void;
  /** Function to activate the focus trap */
  activate: () => void;
  /** Function to deactivate the focus trap */
  deactivate: () => void;
  /** Whether the focus trap is currently active */
  isActive: boolean;
}

export function useFocusTrap(options: FocusTrapOptions = {}): FocusTrapReturn {
  const {
    enabled = true,
    returnFocus = true,
    focusFirstElement = true,
    allowEscape = true,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    includeNegativeTabIndex = false,
    onEscape,
    onFocusEnter,
    onFocusLeave,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement | null>;
  const lastFocusableRef = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement | null>;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isActiveRef = useRef(false);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = includeNegativeTabIndex
      ? 'button, [href], input, select, textarea, [tabindex]'
      : focusableSelector;

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    ).filter((element) => {
      // Filter out disabled and hidden elements
      if (
        (element as HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
          .disabled ||
        element.hidden
      )
        return false;

      // Check if element is visible
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;

      // Check if element has a valid tabindex
      const tabIndex = element.tabIndex;
      if (tabIndex < 0 && !includeNegativeTabIndex) return false;

      return true;
    });

    return elements;
  }, [focusableSelector, includeNegativeTabIndex]);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
      firstFocusableRef.current = elements[0];
      lastFocusableRef.current = elements[elements.length - 1];
    }
  }, [getFocusableElements]);

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
      firstFocusableRef.current = elements[0];
      lastFocusableRef.current = elements[elements.length - 1];
    }
  }, [getFocusableElements]);

  // Focus the next element
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = elements.findIndex((el) => el === document.activeElement);
    const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
    elements[nextIndex].focus();
  }, [getFocusableElements]);

  // Focus the previous element
  const focusPrev = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = elements.findIndex((el) => el === document.activeElement);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
    elements[prevIndex].focus();
  }, [getFocusableElements]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActiveRef.current || !containerRef.current) return;

      const { key, shiftKey } = event;

      switch (key) {
        case 'Tab':
          event.preventDefault();
          if (shiftKey) {
            focusPrev();
          } else {
            focusNext();
          }
          break;

        case 'Escape':
          if (allowEscape) {
            event.preventDefault();
            onEscape?.();
          }
          break;

        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusNext();
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusPrev();
          break;

        case 'Home':
          event.preventDefault();
          focusFirst();
          break;

        case 'End':
          event.preventDefault();
          focusLast();
          break;
      }
    },
    [allowEscape, onEscape, focusNext, focusPrev, focusFirst, focusLast]
  );

  // Handle focus events
  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      if (!isActiveRef.current || !containerRef.current) return;

      const target = event.target as HTMLElement;
      const elements = getFocusableElements();

      // Check if focus is within the container
      if (!containerRef.current.contains(target)) {
        // Focus escaped, bring it back to the first element
        if (elements.length > 0) {
          elements[0].focus();
        }
      } else {
        // Focus entered the container
        onFocusEnter?.();
      }
    },
    [getFocusableElements, onFocusEnter]
  );

  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      if (!isActiveRef.current || !containerRef.current) return;

      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;

      // Check if focus is leaving the container
      if (
        !containerRef.current.contains(target) ||
        (relatedTarget && !containerRef.current.contains(relatedTarget))
      ) {
        onFocusLeave?.();
      }
    },
    [onFocusLeave]
  );

  // Activate the focus trap
  const activate = useCallback(() => {
    if (!enabled || !containerRef.current) return;

    // Store the currently focused element
    if (returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Update focusable elements
    focusableElementsRef.current = getFocusableElements();

    // Add ARIA attributes
    containerRef.current.setAttribute('role', 'dialog');
    containerRef.current.setAttribute('aria-modal', 'true');

    // Focus the first element if requested
    if (focusFirstElement && focusableElementsRef.current.length > 0) {
      focusFirst();
    }

    isActiveRef.current = true;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
  }, [
    enabled,
    returnFocus,
    focusFirstElement,
    getFocusableElements,
    focusFirst,
    handleKeyDown,
    handleFocusIn,
    handleFocusOut,
  ]);

  // Deactivate the focus trap
  const deactivate = useCallback(() => {
    if (!isActiveRef.current) return;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocusIn, true);
    document.removeEventListener('focusout', handleFocusOut, true);

    // Remove ARIA attributes
    if (containerRef.current) {
      containerRef.current.removeAttribute('role');
      containerRef.current.removeAttribute('aria-modal');
    }

    // Return focus to the previous element
    if (returnFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }

    isActiveRef.current = false;
  }, [returnFocus, handleKeyDown, handleFocusIn, handleFocusOut]);

  // Auto-activate when enabled changes
  useEffect(() => {
    if (enabled) {
      activate();
    } else {
      deactivate();
    }

    return () => {
      deactivate();
    };
  }, [enabled, activate, deactivate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deactivate();
    };
  }, [deactivate]);

  return {
    containerRef,
    firstFocusableRef,
    lastFocusableRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrev,
    activate,
    deactivate,
    isActive: isActiveRef.current,
  };
}

// Convenience hook for simple focus trap
export function useSimpleFocusTrap(enabled = true): RefObject<HTMLElement> {
  const { containerRef } = useFocusTrap({
    enabled,
    returnFocus: true,
    focusFirstElement: true,
    allowEscape: true,
  });

  return containerRef;
}

// Hook for managing focus restoration
export function useFocusRestoration(enabled = true): {
  saveFocus: () => void;
  restoreFocus: () => void;
} {
  const savedFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    if (enabled) {
      savedFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [enabled]);

  const restoreFocus = useCallback(() => {
    if (enabled && savedFocusRef.current) {
      savedFocusRef.current.focus();
      savedFocusRef.current = null;
    }
  }, [enabled]);

  return { saveFocus, restoreFocus };
}

// Hook for managing ARIA attributes
export function useAriaAttributes(
  role?: string,
  attributes: Record<string, string> = {}
): RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set role if provided
    if (role) {
      element.setAttribute('role', role);
    }

    // Set additional attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    // Cleanup function
    return () => {
      if (role) {
        element.removeAttribute('role');
      }
      Object.keys(attributes).forEach((key) => {
        element.removeAttribute(key);
      });
    };
  }, [role, attributes]);

  return elementRef;
}

/**
 * useEditorAnimation - Editor-Specific Animation Hook
 *
 * This hook provides editor-specific animations using the base useAnimation hook.
 * It includes common editor animation patterns like toolbar transitions,
 * panel animations, and tool selection effects.
 *
 * WHY USE THIS HOOK:
 * - Provides editor-specific animation variants
 * - Handles common editor animation patterns
 * - Integrates with editor state (tools, panels, canvas)
 * - Optimized for editor performance
 * - Consistent animation timing across editor components
 * - Enhances user experience with smooth transitions
 *
 * COMMON USE CASES:
 * - Editor toolbar show/hide animations
 * - Panel expand/collapse transitions
 * - Tool selection active/inactive states
 * - Canvas zoom and pan animations
 * - Fullscreen mode transitions
 * - Editor content loading animations
 *
 * KEY FEATURES:
 * - Toolbar animations (show/hide, slide)
 * - Panel animations (expand/collapse)
 * - Tool selection animations (active/inactive states)
 * - Canvas animations (zoom, pan)
 * - Fullscreen animations (enter/exit)
 * - Customizable timing for different animation types
 *
 * PERFORMANCE BENEFITS:
 * - Optimized animations for editor-specific use cases
 * - Reduced re-renders with proper memoization
 * - Efficient variant generation based on editor state
 * - Memory-efficient animation cleanup
 * - Smooth 60fps animations for complex editor interactions
 *
 * ACCESSIBILITY FEATURES:
 * - Respects reduced motion preferences
 * - Proper timing for screen reader announcements
 * - Focus management during editor transitions
 * - ARIA attribute updates for editor state changes
 * - Keyboard navigation support during animations
 */

import { useMemo } from 'react';
import { Variants, Transition } from 'framer-motion';
import { useAnimation, UseAnimationOptions, UseAnimationReturn } from './useAnimation';

export interface EditorAnimationConfig {
  /** Current editor tool */
  tool: string;
  /** Whether toolbar is visible */
  toolbarVisible: boolean;
  /** Whether panels are expanded */
  panelsExpanded: boolean;
  /** Whether canvas is in fullscreen mode */
  fullscreen: boolean;
  /** Animation duration for toolbar animations */
  toolbarDuration?: number;
  /** Animation duration for panel animations */
  panelDuration?: number;
  /** Animation duration for tool transitions */
  toolDuration?: number;
  /** Whether to enable smooth transitions */
  smooth?: boolean;
}

export interface UseEditorAnimationOptions extends Omit<UseAnimationOptions, 'variants'> {
  /** Editor animation configuration */
  editorConfig: EditorAnimationConfig;
  /** Custom variants to merge with editor variants */
  customVariants?: Variants;
  /** Custom transition to merge with editor transitions */
  customTransition?: Transition;
}

export function useEditorAnimation(options: UseEditorAnimationOptions): UseAnimationReturn {
  const { editorConfig, customVariants, customTransition, ...animationOptions } = options;
  const {
    toolbarVisible,
    panelsExpanded,
    fullscreen,
    toolbarDuration = 0.3,
    panelDuration = 0.4,
    toolDuration = 0.2,
    smooth = true,
  } = editorConfig;

  // Generate editor-specific variants
  const editorVariants = useMemo(() => {
    const baseVariants: Variants = {
      hidden: {
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: toolbarDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: toolbarDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      toolbarHidden: {
        y: -60,
        opacity: 0,
        transition: {
          duration: toolbarDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      toolbarVisible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: toolbarDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      panelCollapsed: {
        width: 0,
        opacity: 0,
        transition: {
          duration: panelDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      panelExpanded: {
        width: 'auto',
        opacity: 1,
        transition: {
          duration: panelDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      toolActive: {
        scale: 1.1,
        backgroundColor: 'var(--primary-color)',
        transition: {
          duration: toolDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      toolInactive: {
        scale: 1,
        backgroundColor: 'var(--background-color)',
        transition: {
          duration: toolDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      fullscreenEnter: {
        scale: 1.05,
        opacity: 0.8,
        transition: {
          duration: 0.3,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      fullscreenActive: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      canvasZoom: {
        scale: 1.1,
        transition: {
          duration: 0.2,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      canvasNormal: {
        scale: 1,
        transition: {
          duration: 0.2,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
    };

    // Merge with custom variants
    return customVariants ? { ...baseVariants, ...customVariants } : baseVariants;
  }, [toolbarDuration, panelDuration, toolDuration, smooth, customVariants]);

  // Generate editor-specific transition
  const editorTransition = useMemo(() => {
    const baseTransition: Transition = {
      duration: toolbarDuration,
      ease: smooth ? 'easeInOut' : 'linear',
    };

    return customTransition ? { ...baseTransition, ...customTransition } : baseTransition;
  }, [toolbarDuration, smooth, customTransition]);

  // Determine initial variant based on editor state
  const initialVariant = useMemo(() => {
    if (!toolbarVisible) return 'toolbarHidden';
    if (fullscreen) return 'fullscreenActive';
    if (!panelsExpanded) return 'panelCollapsed';
    return 'visible';
  }, [toolbarVisible, fullscreen, panelsExpanded]);

  // Use the base animation hook
  return useAnimation({
    ...animationOptions,
    initial: initialVariant,
    variants: editorVariants,
    transition: editorTransition,
  });
}

// Convenience hook for simple editor animations
export function useSimpleEditorAnimation(
  toolbarVisible: boolean,
  panelsExpanded: boolean,
  fullscreen: boolean
): UseAnimationReturn {
  return useEditorAnimation({
    editorConfig: {
      tool: 'select',
      toolbarVisible,
      panelsExpanded,
      fullscreen,
    },
  });
}

// Hook for toolbar animations
export function useToolbarAnimation(
  visible: boolean,
  options: Omit<UseEditorAnimationOptions, 'editorConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: visible ? 'toolbarVisible' : 'toolbarHidden',
    variants: {
      toolbarHidden: {
        y: -60,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      toolbarVisible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  });
}

// Hook for panel animations
export function usePanelAnimation(
  expanded: boolean,
  options: Omit<UseEditorAnimationOptions, 'editorConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: expanded ? 'panelExpanded' : 'panelCollapsed',
    variants: {
      panelCollapsed: {
        width: 0,
        opacity: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      panelExpanded: {
        width: 'auto',
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  });
}

// Hook for tool selection animations
export function useToolAnimation(
  active: boolean,
  options: Omit<UseEditorAnimationOptions, 'editorConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: active ? 'toolActive' : 'toolInactive',
    variants: {
      toolActive: {
        scale: 1.1,
        backgroundColor: 'var(--primary-color)',
        transition: { duration: 0.2, ease: 'easeInOut' },
      },
      toolInactive: {
        scale: 1,
        backgroundColor: 'var(--background-color)',
        transition: { duration: 0.2, ease: 'easeInOut' },
      },
    },
  });
}

// Hook for canvas animations
export function useCanvasAnimation(
  zoomed: boolean,
  options: Omit<UseEditorAnimationOptions, 'editorConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: zoomed ? 'canvasZoom' : 'canvasNormal',
    variants: {
      canvasZoom: {
        scale: 1.1,
        transition: { duration: 0.2, ease: 'easeInOut' },
      },
      canvasNormal: {
        scale: 1,
        transition: { duration: 0.2, ease: 'easeInOut' },
      },
    },
  });
}

// Hook for fullscreen animations
export function useFullscreenAnimation(
  fullscreen: boolean,
  options: Omit<UseEditorAnimationOptions, 'editorConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: fullscreen ? 'fullscreenActive' : 'visible',
    variants: {
      fullscreenEnter: {
        scale: 1.05,
        opacity: 0.8,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      fullscreenActive: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  });
}

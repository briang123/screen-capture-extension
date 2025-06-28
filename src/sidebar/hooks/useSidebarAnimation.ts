/**
 * useSidebarAnimation - Sidebar-Specific Animation Hook
 *
 * This hook provides sidebar-specific animations using the base useAnimation hook.
 * It includes common sidebar animation patterns like slide in/out, expand/collapse,
 * and theme transitions.
 *
 * WHY USE THIS HOOK:
 * - Provides sidebar-specific animation variants
 * - Handles common sidebar animation patterns
 * - Integrates with sidebar state (collapsed, side, theme)
 * - Optimized for sidebar performance
 * - Consistent animation timing across sidebar components
 */

import { useMemo } from 'react';
import { Variants, Transition } from 'framer-motion';
import { useAnimation, UseAnimationOptions, UseAnimationReturn } from './useAnimation';
import { SidebarSide } from './useSidebarSide';

export interface SidebarAnimationConfig {
  /** Sidebar side (left/right) */
  side: SidebarSide;
  /** Whether sidebar is collapsed */
  collapsed: boolean;
  /** Whether sidebar is visible */
  visible: boolean;
  /** Whether sidebar is switching sides */
  isSwitchingSide: boolean;
  /** Animation duration for slide animations */
  slideDuration?: number;
  /** Animation duration for collapse animations */
  collapseDuration?: number;
  /** Animation duration for side switching */
  switchDuration?: number;
  /** Whether to enable smooth transitions */
  smooth?: boolean;
}

export interface UseSidebarAnimationOptions extends Omit<UseAnimationOptions, 'variants'> {
  /** Sidebar animation configuration */
  sidebarConfig: SidebarAnimationConfig;
  /** Custom variants to merge with sidebar variants */
  customVariants?: Variants;
  /** Custom transition to merge with sidebar transitions */
  customTransition?: Transition;
}

export function useSidebarAnimation(options: UseSidebarAnimationOptions): UseAnimationReturn {
  const { sidebarConfig, customVariants, customTransition, ...animationOptions } = options;
  const {
    side,
    collapsed,
    visible,
    isSwitchingSide,
    slideDuration = 0.3,
    collapseDuration = 0.4,
    switchDuration = 0.5,
    smooth = true,
  } = sidebarConfig;

  // Generate sidebar-specific variants
  const sidebarVariants = useMemo(() => {
    const baseVariants: Variants = {
      hidden: {
        x: side === 'left' ? -400 : 400,
        opacity: 0,
        transition: {
          duration: slideDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          duration: slideDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      collapsed: {
        width: 48,
        transition: {
          duration: collapseDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      expanded: {
        width: 400,
        transition: {
          duration: collapseDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      switching: {
        x: side === 'left' ? -20 : 20,
        opacity: 0.8,
        transition: {
          duration: switchDuration,
          ease: smooth ? 'easeInOut' : 'linear',
        },
      },
      themeLight: {
        backgroundColor: '#ffffff',
        color: '#000000',
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
      themeDark: {
        backgroundColor: '#1f2937',
        color: '#ffffff',
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    };

    // Merge with custom variants
    return customVariants ? { ...baseVariants, ...customVariants } : baseVariants;
  }, [side, slideDuration, collapseDuration, switchDuration, smooth, customVariants]);

  // Generate sidebar-specific transition
  const sidebarTransition = useMemo(() => {
    const baseTransition: Transition = {
      duration: slideDuration,
      ease: smooth ? 'easeInOut' : 'linear',
    };

    return customTransition ? { ...baseTransition, ...customTransition } : baseTransition;
  }, [slideDuration, smooth, customTransition]);

  // Determine initial variant based on sidebar state
  const initialVariant = useMemo(() => {
    if (!visible) return 'hidden';
    if (isSwitchingSide) return 'switching';
    if (collapsed) return 'collapsed';
    return 'visible';
  }, [visible, isSwitchingSide, collapsed]);

  // Use the base animation hook
  return useAnimation({
    ...animationOptions,
    initial: initialVariant,
    variants: sidebarVariants,
    transition: sidebarTransition,
  });
}

// Convenience hook for simple sidebar animations
export function useSimpleSidebarAnimation(
  side: SidebarSide,
  collapsed: boolean,
  visible: boolean
): UseAnimationReturn {
  return useSidebarAnimation({
    sidebarConfig: {
      side,
      collapsed,
      visible,
      isSwitchingSide: false,
    },
  });
}

// Hook for sidebar theme animations
export function useSidebarThemeAnimation(
  theme: 'light' | 'dark',
  options: Omit<UseSidebarAnimationOptions, 'sidebarConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: `theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
    variants: {
      themeLight: {
        backgroundColor: '#ffffff',
        color: '#000000',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      themeDark: {
        backgroundColor: '#1f2937',
        color: '#ffffff',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  });
}

// Hook for sidebar collapse animations
export function useSidebarCollapseAnimation(
  collapsed: boolean,
  options: Omit<UseSidebarAnimationOptions, 'sidebarConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: collapsed ? 'collapsed' : 'expanded',
    variants: {
      collapsed: {
        width: 48,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      expanded: {
        width: 400,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  });
}

// Hook for sidebar side switching animations
export function useSidebarSideAnimation(
  side: SidebarSide,
  isSwitching: boolean,
  options: Omit<UseSidebarAnimationOptions, 'sidebarConfig'> = {}
): UseAnimationReturn {
  return useAnimation({
    ...options,
    initial: isSwitching ? 'switching' : 'visible',
    variants: {
      switching: {
        x: side === 'left' ? -20 : 20,
        opacity: 0.8,
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
      visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  });
}

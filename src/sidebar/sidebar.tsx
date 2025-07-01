import React, { useEffect, useMemo, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import './sidebar.css';
import SidebarContainer from './components/SidebarContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { useSettings } from './hooks/useSettings';
import { useSidebarSide } from './hooks/useSidebarSide';
import { useSidebarResize } from './hooks/useSidebarResize';
import { useSidebarCollapse } from './hooks/useSidebarCollapse';
import { useSidebarVisibility } from './hooks/useSidebarVisibility';
import { useSidebarAnimation } from './hooks/useSidebarAnimation';
import { useSidebarPosition } from './hooks/useSidebarPosition';
import { useDebug } from './hooks/useDebug';
import { CaptureProvider, useCaptureContext } from './contexts/CaptureContext';
import { ANIMATION_DURATIONS, FALLBACK_CONFIG, TIMEOUTS } from '@/shared/constants';
import { OverlayProvider, useOverlay } from './components/OverlayProvider';

const SIDEBAR_ROOT_ID = 'sc-sidebar-root';
let reactSidebarRoot: Root | null = null;

const Sidebar: React.FC = () => {
  const { visible, close, containerRef } = useSidebarVisibility({
    initialVisible: true,
    closeOnEscape: false, // Disable default escape handling
    closeOnOutsideClick: false, // Don't close on outside click for sidebar
    enableFocusTrap: true,
    onClose: useCallback(() => {
      // Optionally, send a message to background/content to update state
      console.log('Sidebar closed');
    }, []),
  });

  const { cancelActiveCapture } = useCaptureContext();
  const { hide: hideOverlay } = useOverlay();

  const [collapsed, handleToggleCollapseRaw] = useSidebarCollapse();
  const { settings, updateSettings } = useSettings();

  const sidebarWidth = 400;
  const getInitialY = useCallback(() => 0, []);

  const [side, handleMoveSideRaw, isSwitchingSide] = useSidebarSide(
    'right',
    ANIMATION_DURATIONS.SIDEBAR_SIDE_SWITCH
  );

  // Optimize getRightEdge with useCallback
  const getRightEdge = useCallback(
    () => Math.max(0, document.documentElement.clientWidth - sidebarWidth),
    [sidebarWidth]
  );

  // Use the sidebar position hook for better position management
  const [position, setPosition] = useSidebarPosition(side, sidebarWidth, getInitialY);

  const isResizing = useSidebarResize(side, getRightEdge, setPosition);

  // Use the sidebar animation hook
  const sidebarAnimation = useSidebarAnimation({
    sidebarConfig: {
      side,
      collapsed: collapsed === 'collapsed',
      visible,
      isSwitchingSide,
      slideDuration: ANIMATION_DURATIONS.VISIBILITY_TRANSITION / 1000, // Convert to seconds
      collapseDuration: 0.4,
      switchDuration: ANIMATION_DURATIONS.SIDEBAR_SIDE_SWITCH / 1000, // Convert to seconds
      smooth: true,
    },
    onAnimationStart: useCallback((variant: string) => {
      console.log('Sidebar animation started:', variant);
    }, []),
    onAnimationComplete: useCallback((variant: string) => {
      console.log('Sidebar animation completed:', variant);
    }, []),
  });

  // Memoize event handlers
  const handleThemeToggle = useCallback(async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    await updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);

  const handleMoveSide = useCallback(() => handleMoveSideRaw(), [handleMoveSideRaw]);
  const handleToggleCollapse = useCallback(
    () => handleToggleCollapseRaw(),
    [handleToggleCollapseRaw]
  );
  const handleClose = useCallback(() => {
    cancelActiveCapture();
    hideOverlay();
    close();
    unmountSidebar();
  }, [cancelActiveCapture, hideOverlay, close]);

  // Move useDebug outside conditional block to follow Rules of Hooks
  useDebug('Sidebar Render', { x: position.x, y: position.y, side, collapsed, visible });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Memoize sidebarStyle
  const sidebarStyle = useMemo(
    () => ({
      touchAction: 'none',
      boxShadow: 'var(--shadow-lg)',
      background: collapsed === 'collapsed' ? 'rgba(0, 255, 0, 0.1)' : '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid #f00',
      zIndex: 99999,
      position: 'fixed' as const,
      top: 0,
      height: '100vh',
      ...(side === 'left' ? { left: '0' } : { right: '0' }),
    }),
    [collapsed, side]
  );

  if (visible) {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Sidebar root error:', error, errorInfo);
        }}
        resetOnPropsChange={true}
        enableGracefulDegradation={FALLBACK_CONFIG.DEGRADED_MODE_ENABLED}
        maxFallbackAttempts={FALLBACK_CONFIG.MAX_FALLBACK_ATTEMPTS}
        autoRecoveryEnabled={FALLBACK_CONFIG.AUTO_RECOVERY_ENABLED}
      >
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('CaptureProvider error:', error, errorInfo);
          }}
          enableGracefulDegradation={FALLBACK_CONFIG.DEGRADED_MODE_ENABLED}
          maxFallbackAttempts={FALLBACK_CONFIG.MAX_FALLBACK_ATTEMPTS}
          autoRecoveryEnabled={FALLBACK_CONFIG.AUTO_RECOVERY_ENABLED}
        >
          <SidebarContainer
            side={side}
            collapsed={collapsed}
            isResizing={isResizing}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            sidebarStyle={sidebarStyle}
            animationVariants={sidebarAnimation.variants}
            animationTransition={sidebarAnimation.transition}
            theme={settings.theme}
            onThemeToggle={handleThemeToggle}
            onMoveSide={handleMoveSide}
            onToggleCollapse={handleToggleCollapse}
            onClose={handleClose}
            isSwitchingSide={isSwitchingSide}
          />
        </ErrorBoundary>
      </ErrorBoundary>
    );
  }
  return null;
};

export function mountSidebar() {
  console.log('[DEV] mountSidebar() called');
  let container = document.getElementById(SIDEBAR_ROOT_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = SIDEBAR_ROOT_ID;
    document.body.appendChild(container);
    console.log('[DEV] #sc-sidebar-root created and appended to document.body');
  } else {
    console.log('[DEV] #sc-sidebar-root already exists');
  }
  reactSidebarRoot = createRoot(container);
  console.log('[DEV] React root created, rendering sidebar...');
  reactSidebarRoot.render(
    <React.StrictMode>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Sidebar mount error:', error, errorInfo);
          // Attempt to recover by remounting with exponential backoff
          setTimeout(() => {
            unmountSidebar();
            setTimeout(() => mountSidebar(), TIMEOUTS.FALLBACK_RECOVERY);
          }, TIMEOUTS.GRACEFUL_DEGRADATION);
        }}
        enableGracefulDegradation={FALLBACK_CONFIG.DEGRADED_MODE_ENABLED}
        maxFallbackAttempts={FALLBACK_CONFIG.MAX_FALLBACK_ATTEMPTS}
        autoRecoveryEnabled={FALLBACK_CONFIG.AUTO_RECOVERY_ENABLED}
      >
        <CaptureProvider>
          <OverlayProviderWrapper />
        </CaptureProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('[DEV] Sidebar render call complete');
}

// Wrapper component to access capture context and pass it to OverlayProvider
const OverlayProviderWrapper: React.FC = () => {
  const { onAreaCaptureComplete } = useCaptureContext();

  return (
    <OverlayProvider onAreaCaptureComplete={onAreaCaptureComplete}>
      <Sidebar />
    </OverlayProvider>
  );
};

export function unmountSidebar() {
  const container = document.getElementById(SIDEBAR_ROOT_ID);
  if (reactSidebarRoot) {
    reactSidebarRoot.unmount();
    reactSidebarRoot = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

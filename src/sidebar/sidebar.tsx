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
import { CaptureProvider } from './contexts/CaptureContext';
import { ANIMATION_DURATIONS } from '@/shared/constants';

const SIDEBAR_ROOT_ID = 'sc-sidebar-root';
let reactSidebarRoot: Root | null = null;

const Sidebar: React.FC = () => {
  const { visible, close, containerRef } = useSidebarVisibility({
    initialVisible: true,
    closeOnEscape: true,
    closeOnOutsideClick: false, // Don't close on outside click for sidebar
    enableFocusTrap: true,
    onClose: useCallback(() => {
      // Optionally, send a message to background/content to update state
      console.log('Sidebar closed');
    }, []),
  });

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
  const handleClose = useCallback(() => close(), [close]);

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
      >
        <CaptureProvider>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('CaptureProvider error:', error, errorInfo);
            }}
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
        </CaptureProvider>
      </ErrorBoundary>
    );
  }
  return null;
};

export function mountSidebar() {
  let container = document.getElementById(SIDEBAR_ROOT_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = SIDEBAR_ROOT_ID;
    document.body.appendChild(container);
  }
  reactSidebarRoot = createRoot(container);
  reactSidebarRoot.render(
    <React.StrictMode>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Sidebar mount error:', error, errorInfo);
          // Attempt to recover by remounting
          setTimeout(() => {
            unmountSidebar();
            setTimeout(() => mountSidebar(), 1000);
          }, 2000);
        }}
      >
        <Sidebar />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

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

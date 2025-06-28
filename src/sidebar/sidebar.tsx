import React, { useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import './sidebar.css';
import SidebarContainer from './components/SidebarContainer';
import { useTheme } from './hooks/useTheme';
import { useSidebarSide } from './hooks/useSidebarSide';
import { useSidebarResize } from './hooks/useSidebarResize';
import { useSidebarCollapse } from './hooks/useSidebarCollapse';
import { useSidebarVisibility } from './hooks/useSidebarVisibility';
import { useSidebarAnimation } from './hooks/useSidebarAnimation';
import { useSidebarPosition } from './hooks/useSidebarPosition';
import { useCapture } from './hooks/useCapture';
import { useDebug } from './hooks/useDebug';

const SIDEBAR_ROOT_ID = 'sc-sidebar-root';
let reactSidebarRoot: Root | null = null;

const Sidebar: React.FC = () => {
  const { visible, close, containerRef } = useSidebarVisibility({
    initialVisible: true,
    closeOnEscape: true,
    closeOnOutsideClick: false, // Don't close on outside click for sidebar
    enableFocusTrap: true,
    onClose: () => {
      // Optionally, send a message to background/content to update state
      console.log('Sidebar closed');
    },
  });

  const [collapsed, handleToggleCollapse] = useSidebarCollapse();
  const [theme, handleThemeToggle] = useTheme();
  const { isCapturing, handleCapture, error, resetError } = useCapture();

  const sidebarWidth = 400;
  const getInitialY = () => {
    // const sidebarHeight = 100; // min height
    // const maxY = Math.max(0, window.innerHeight - sidebarHeight);
    return 0; // Always start at top
  };

  const [side, handleMoveSide, isSwitchingSide] = useSidebarSide('right', 500);

  // Use the sidebar position hook for better position management
  const [position, setPosition] = useSidebarPosition(side, sidebarWidth, getInitialY);

  const isResizing = useSidebarResize(
    side,
    () => Math.max(0, document.documentElement.clientWidth - sidebarWidth),
    setPosition
  );

  // Use the sidebar animation hook
  const sidebarAnimation = useSidebarAnimation({
    sidebarConfig: {
      side,
      collapsed: collapsed === 'collapsed',
      visible,
      isSwitchingSide,
      slideDuration: 0.3,
      collapseDuration: 0.4,
      switchDuration: 0.5,
      smooth: true,
    },
    onAnimationStart: (variant) => {
      console.log('Sidebar animation started:', variant);
    },
    onAnimationComplete: (variant) => {
      console.log('Sidebar animation completed:', variant);
    },
  });

  // Move useDebug outside conditional block to follow Rules of Hooks
  useDebug('Sidebar Render', { x: position.x, y: position.y, side, collapsed, visible });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (visible) {
    const sidebarStyle = {
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
    };

    return (
      <SidebarContainer
        side={side}
        collapsed={collapsed}
        isResizing={isResizing}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        sidebarStyle={sidebarStyle}
        animationVariants={sidebarAnimation.variants}
        animationTransition={sidebarAnimation.transition}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onMoveSide={handleMoveSide}
        onToggleCollapse={handleToggleCollapse}
        onClose={close}
        isSwitchingSide={isSwitchingSide}
        isCapturing={isCapturing}
        onCapture={handleCapture}
        error={error}
        onResetError={resetError}
      />
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
      <Sidebar />
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

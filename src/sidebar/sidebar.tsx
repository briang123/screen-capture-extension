import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './sidebar.css';
import { motion } from 'framer-motion';
import SidebarPanelHeader from './components/SidebarPanelHeader';
import SidebarPanelBody from './components/SidebarPanelBody';
import { useTheme } from './hooks/useTheme';
import { useSidebarSide } from './hooks/useSidebarSide';
import { useSidebarResize } from './hooks/useSidebarResize';
import { useSidebarCollapse } from './hooks/useSidebarCollapse';
import { useCapture } from './hooks/useCapture';
import ExpandCollapseButton from './components/ExpandCollapseButton';
import { useDebug } from './hooks/useDebug';
import { useSidebarVisibility } from './hooks/useSidebarVisibility';

const SIDEBAR_ROOT_ID = 'sc-sidebar-root';

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
  const getInitialY = () => {
    // const sidebarHeight = 100; // min height
    // const maxY = Math.max(0, window.innerHeight - sidebarHeight);
    return 0; // Always start at top
  };

  const sidebarWidth = 400;
  const collapsedWidth = 48;
  const getRightEdge = () => Math.max(0, document.documentElement.clientWidth - sidebarWidth);

  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: getRightEdge(),
    y: getInitialY(),
  }));
  const [side, handleMoveSide, isSwitchingSide] = useSidebarSide('right', 500);
  const isResizing = useSidebarResize(side, getRightEdge, setPosition);

  // Move useDebug outside conditional block to follow Rules of Hooks
  useDebug('Sidebar Render', { x: position.x, y: position.y, side, collapsed, visible });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (visible) {
    const sidebarStyle = {
      touchAction: 'none',
      width: collapsed ? collapsedWidth : 400,
      boxShadow: 'var(--shadow-lg)',
      background: collapsed ? 'rgba(0, 255, 0, 0.1)' : '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid #f00',
      zIndex: 99999,
      position: 'fixed' as const,
      top: 0,
      height: '100vh',
      ...(side === 'left' ? { left: '0' } : { right: '0' }),
    };
    if (isResizing) {
      return (
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          className={`sc-sidebar${side}${collapsed ? ' collapsed' : ''}`}
          style={sidebarStyle}
        >
          {collapsed ? (
            <div className="flex flex-col items-center justify-center h-full p-2">
              <ExpandCollapseButton
                side={side}
                collapsed={collapsed}
                onClick={handleToggleCollapse}
              />
            </div>
          ) : (
            <>
              <SidebarPanelHeader
                theme={theme}
                onThemeToggle={handleThemeToggle}
                onMoveSide={handleMoveSide}
                onToggleCollapse={handleToggleCollapse}
                onClose={close}
                side={side}
                collapsed={collapsed}
              />
              <SidebarPanelBody
                isSwitchingSide={isSwitchingSide}
                isCapturing={isCapturing}
                onCapture={handleCapture}
                error={error}
                onResetError={resetError}
              />
            </>
          )}
        </div>
      );
    }
    // Not resizing: use motion.div for animation
    return (
      <motion.div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={`sc-sidebar${side}${collapsed ? ' collapsed' : ''}`}
        initial={false}
        animate={{
          opacity: 1,
          width: collapsed ? collapsedWidth : 400,
        }}
        transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
        style={sidebarStyle}
      >
        {collapsed ? (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <ExpandCollapseButton
              side={side}
              collapsed={collapsed}
              onClick={handleToggleCollapse}
            />
          </div>
        ) : (
          <>
            <SidebarPanelHeader
              theme={theme}
              onThemeToggle={handleThemeToggle}
              onMoveSide={handleMoveSide}
              onToggleCollapse={handleToggleCollapse}
              onClose={close}
              side={side}
              collapsed={collapsed}
            />
            <SidebarPanelBody
              isSwitchingSide={isSwitchingSide}
              isCapturing={isCapturing}
              onCapture={handleCapture}
              error={error}
              onResetError={resetError}
            />
          </>
        )}
      </motion.div>
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
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Sidebar />
    </React.StrictMode>
  );
}

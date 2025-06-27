import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './sidebar.css';
import { motion } from 'framer-motion';
import SidebarPanelHeader from './components/SidebarPanelHeader';
import SidebarPanelBody from './components/SidebarPanelBody';
import { useTheme } from './hooks/useTheme';
import { useSidebarSide } from './hooks/useSidebarSide';
import { useSidebarResize } from './hooks/useSidebarResize';

const SIDEBAR_ROOT_ID = 'sc-sidebar-root';

const Sidebar: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, handleThemeToggle] = useTheme();
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [side, handleMoveSide, isSwitchingSide] = useSidebarSide('right', 500);
  const isResizing = useSidebarResize(side, getRightEdge, setPosition);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleClose = () => {
    setVisible(false);
    // Optionally, send a message to background/content to update state
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Helper for arrow direction
  const getCollapseArrow = () => (side === 'left' ? '←' : '→');
  const getExpandArrow = () => (side === 'left' ? '→' : '←');

  const handleCapture = async () => {
    setIsCapturing(true);
    // TODO: Implement capture logic (send message to background/content)
    setTimeout(() => setIsCapturing(false), 1200); // Simulate capture
  };

  if (visible) {
    console.log(
      '[Sidebar Render] x:',
      position.x,
      'y:',
      position.y,
      'side:',
      side,
      'collapsed:',
      collapsed
    );
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
        <div className={`sc-sidebar${side}${collapsed ? ' collapsed' : ''}`} style={sidebarStyle}>
          {collapsed ? (
            <div className="flex flex-col items-center justify-center h-full p-2">
              <button
                onClick={handleToggleCollapse}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Expand Sidebar"
              >
                {getExpandArrow()}
              </button>
            </div>
          ) : (
            <>
              <SidebarPanelHeader
                theme={theme}
                onThemeToggle={handleThemeToggle}
                onMoveSide={handleMoveSide}
                onToggleCollapse={handleToggleCollapse}
                onClose={handleClose}
                getCollapseArrow={getCollapseArrow}
              />
              <SidebarPanelBody
                isSwitchingSide={isSwitchingSide}
                isCapturing={isCapturing}
                onCapture={handleCapture}
              />
            </>
          )}
        </div>
      );
    }
    // Not resizing: use motion.div for animation
    return (
      <motion.div
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
            <button
              onClick={handleToggleCollapse}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Expand Sidebar"
            >
              {getExpandArrow()}
            </button>
          </div>
        ) : (
          <>
            <SidebarPanelHeader
              theme={theme}
              onThemeToggle={handleThemeToggle}
              onMoveSide={handleMoveSide}
              onToggleCollapse={handleToggleCollapse}
              onClose={handleClose}
              getCollapseArrow={getCollapseArrow}
            />
            <SidebarPanelBody
              isSwitchingSide={isSwitchingSide}
              isCapturing={isCapturing}
              onCapture={handleCapture}
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

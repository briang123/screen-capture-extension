import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './sidebar.css';
import { motion } from 'framer-motion';
import Button from './components/Button';
import Card from './components/Card';
import ThemeToggle from './components/ThemeToggle';

const SIDEBAR_ROOT_ID = 'sc-sidebar-root';

const Sidebar: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
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
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSwitchingSide, setIsSwitchingSide] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    function handleResize() {
      setIsResizing(true);
      if (side === 'right') {
        setPosition((pos) => ({ ...pos, x: getRightEdge() }));
      } else {
        setPosition((pos) => ({ ...pos, x: 0 }));
      }
      setTimeout(() => setIsResizing(false), 50); // short timeout to allow instant update
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [side]);

  const handleClose = () => {
    setVisible(false);
    // Optionally, send a message to background/content to update state
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMoveSide = () => {
    setIsSwitchingSide(true);
    const newSide = side === 'left' ? 'right' : 'left';
    setSide(newSide);
    setTimeout(() => setIsSwitchingSide(false), 500); // match sidebar transition duration
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
      background: 'rgba(0, 255, 0, 0.1)',
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
              <div className="sc-sidebar-header flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <span className="sc-sidebar-title text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Screen Capture
                </span>
                <div className="sc-sidebar-actions flex items-center gap-2">
                  <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMoveSide}
                    title="Move Sidebar to Other Side"
                  >
                    ⇄
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleToggleCollapse}
                    title="Collapse Sidebar"
                  >
                    {getCollapseArrow()}
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleClose} title="Close Sidebar">
                    ✖️
                  </Button>
                </div>
              </div>
              <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
                {!isSwitchingSide ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCapture}
                      disabled={isCapturing}
                      className="w-full flex items-center justify-center"
                      aria-busy={isCapturing}
                    >
                      {isCapturing ? (
                        <motion.span
                          className="loading-spinner mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          ⏳
                        </motion.span>
                      ) : (
                        <span className="mr-2">📸</span>
                      )}
                      {isCapturing ? 'Capturing...' : 'Capture Image'}
                    </Button>
                  </motion.div>
                ) : (
                  <div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCapture}
                      disabled={isCapturing}
                      className="w-full flex items-center justify-center"
                      aria-busy={isCapturing}
                    >
                      {isCapturing ? (
                        <motion.span
                          className="loading-spinner mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          ⏳
                        </motion.span>
                      ) : (
                        <span className="mr-2">📸</span>
                      )}
                      {isCapturing ? 'Capturing...' : 'Capture Image'}
                    </Button>
                  </div>
                )}
                <Card>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Quick Tips</span>
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                      <li>Click the arrow to collapse/expand.</li>
                      <li>Use the ⇄ button to switch sides.</li>
                      <li>Pin to keep sidebar open.</li>
                      <li>Toggle dark mode for comfort.</li>
                    </ul>
                  </div>
                </Card>
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                  <span>Screen Capture Extension &copy; 2024</span>
                  <span className="mx-2">|</span>
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Help &amp; About
                  </a>
                </div>
              </div>
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
            <div className="sc-sidebar-header flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <span className="sc-sidebar-title text-xl font-semibold text-gray-900 dark:text-gray-100">
                Screen Capture
              </span>
              <div className="sc-sidebar-actions flex items-center gap-2">
                <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMoveSide}
                  title="Move Sidebar to Other Side"
                >
                  ⇄
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleToggleCollapse}
                  title="Collapse Sidebar"
                >
                  {getCollapseArrow()}
                </Button>
                <Button variant="danger" size="sm" onClick={handleClose} title="Close Sidebar">
                  ✖️
                </Button>
              </div>
            </div>
            <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
              {!isSwitchingSide ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCapture}
                    disabled={isCapturing}
                    className="w-full flex items-center justify-center"
                    aria-busy={isCapturing}
                  >
                    {isCapturing ? (
                      <motion.span
                        className="loading-spinner mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        ⏳
                      </motion.span>
                    ) : (
                      <span className="mr-2">📸</span>
                    )}
                    {isCapturing ? 'Capturing...' : 'Capture Image'}
                  </Button>
                </motion.div>
              ) : (
                <div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCapture}
                    disabled={isCapturing}
                    className="w-full flex items-center justify-center"
                    aria-busy={isCapturing}
                  >
                    {isCapturing ? (
                      <motion.span
                        className="loading-spinner mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        ⏳
                      </motion.span>
                    ) : (
                      <span className="mr-2">📸</span>
                    )}
                    {isCapturing ? 'Capturing...' : 'Capture Image'}
                  </Button>
                </div>
              )}
              <Card>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Quick Tips</span>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                    <li>Click the arrow to collapse/expand.</li>
                    <li>Use the ⇄ button to switch sides.</li>
                    <li>Pin to keep sidebar open.</li>
                    <li>Toggle dark mode for comfort.</li>
                  </ul>
                </div>
              </Card>
              <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                <span>Screen Capture Extension &copy; 2024</span>
                <span className="mx-2">|</span>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Help &amp; About
                </a>
              </div>
            </div>
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

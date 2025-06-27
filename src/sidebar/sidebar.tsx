import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './sidebar.css';
import { motion } from 'framer-motion';
import Button from './components/Button';
import Card from './components/Card';
import ThemeToggle from './components/ThemeToggle';

const SIDEBAR_PIN_KEY = 'sc_sidebar_pinned';
const SIDEBAR_ROOT_ID = 'sc-sidebar-root';
const SIDEBAR_POSITION_KEY = 'sc_sidebar_position';

const Sidebar: React.FC = () => {
  const [pinned, setPinned] = useState(false);
  const [visible, setVisible] = useState(true);
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
  const getRightEdge = () => Math.max(0, document.documentElement.clientWidth - sidebarWidth);

  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: getRightEdge(),
    y: getInitialY(),
  }));
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // Load pin state from storage
    const stored = localStorage.getItem(SIDEBAR_PIN_KEY);
    setPinned(stored === 'true');
  }, []);

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

  const handlePin = () => {
    localStorage.setItem(SIDEBAR_PIN_KEY, (!pinned).toString());
    setPinned(!pinned);
  };

  const handleClose = () => {
    setVisible(false);
    if (!pinned) {
      localStorage.removeItem(SIDEBAR_PIN_KEY);
    }
    // Optionally, send a message to background/content to update state
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMoveSide = () => {
    const newSide = side === 'left' ? 'right' : 'left';
    const snapX = newSide === 'right' ? getRightEdge() : 0;
    setPosition((pos) => ({ ...pos, x: snapX }));
    setSide(newSide);
  };

  const handleDragEnd = (_: unknown, info: { point: { x: number; y: number } }) => {
    const sidebarWidth = 400;
    const screenWidth = document.documentElement.clientWidth;
    const maxX = Math.max(0, screenWidth - sidebarWidth);
    // Snap to nearest edge: left (0) or right (maxX)
    const snapX = info.point.x + sidebarWidth / 2 > screenWidth / 2 ? maxX : 0;
    const snapY = Math.max(0, Math.min(info.point.y, window.innerHeight - 100));
    setPosition({ x: snapX, y: snapY });
    setSide(snapX === 0 ? 'left' : 'right');
    localStorage.setItem(SIDEBAR_POSITION_KEY, JSON.stringify({ x: snapX, y: snapY }));
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    // TODO: Implement capture logic (send message to background/content)
    setTimeout(() => setIsCapturing(false), 1200); // Simulate capture
  };

  if (visible) {
    console.log('[Sidebar Render] x:', position.x, 'y:', position.y, 'side:', side);
    if (isResizing) {
      // No animation: use plain div with direct transform
      return (
        <div
          className={`sc-sidebar${pinned ? ' pinned' : ''} ${side}`}
          style={{
            transform: `translateX(${position.x}px) translateY(${position.y}px)`,
            touchAction: 'none',
            width: 400,
            boxShadow: 'var(--shadow-lg)',
            background: 'rgba(0, 255, 0, 0.1)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #f00',
            zIndex: 99999,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
          }}
        >
          <div className="sc-sidebar-header flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <span className="sc-sidebar-title text-xl font-semibold text-gray-900 dark:text-gray-100">
              Screen Capture
            </span>
            <div className="sc-sidebar-actions flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
              <Button
                variant={pinned ? 'secondary' : 'primary'}
                size="sm"
                onClick={handlePin}
                title={pinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
                aria-pressed={pinned}
              >
                {pinned ? '📌' : '📍'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMoveSide}
                title="Move Sidebar to Other Side"
              >
                ⇄
              </Button>
              <Button variant="danger" size="sm" onClick={handleClose} title="Close Sidebar">
                ✖️
              </Button>
            </div>
          </div>
          <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
            <motion.div
              layout
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
            <Card>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-200">Quick Tips</span>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                  <li>Drag the sidebar to move it.</li>
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
        </div>
      );
    }
    // Not resizing: use motion.div for animation
    return (
      <motion.div
        className={`sc-sidebar${pinned ? ' pinned' : ''} ${side}`}
        initial={false}
        animate={{ x: position.x, y: position.y, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        drag
        dragMomentum={false}
        dragElastic={0.2}
        dragConstraints={{
          left: 0,
          right: getRightEdge(),
          top: 0,
          bottom: window.innerHeight - 100,
        }}
        onDragEnd={handleDragEnd}
        style={{
          touchAction: 'none',
          width: 400,
          boxShadow: 'var(--shadow-lg)',
          background: 'rgba(0, 255, 0, 0.1)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #f00',
          zIndex: 99999,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
        }}
      >
        <div className="sc-sidebar-header flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="sc-sidebar-title text-xl font-semibold text-gray-900 dark:text-gray-100">
            Screen Capture
          </span>
          <div className="sc-sidebar-actions flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
            <Button
              variant={pinned ? 'secondary' : 'primary'}
              size="sm"
              onClick={handlePin}
              title={pinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
              aria-pressed={pinned}
            >
              {pinned ? '📌' : '📍'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMoveSide}
              title="Move Sidebar to Other Side"
            >
              ⇄
            </Button>
            <Button variant="danger" size="sm" onClick={handleClose} title="Close Sidebar">
              ✖️
            </Button>
          </div>
        </div>
        <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
          <motion.div
            layout
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
          <Card>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-200">Quick Tips</span>
              <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                <li>Drag the sidebar to move it.</li>
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

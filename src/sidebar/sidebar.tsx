import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '../window/Editor';
import './sidebar.css';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_PIN_KEY = 'sc_sidebar_pinned';
const SIDEBAR_ROOT_ID = 'sc-sidebar-root';

const Sidebar: React.FC = () => {
  const [pinned, setPinned] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Load pin state from storage
    const stored = localStorage.getItem(SIDEBAR_PIN_KEY);
    setPinned(stored === 'true');
  }, []);

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`sc-sidebar${pinned ? ' pinned' : ''}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="sc-sidebar-header">
            <span className="sc-sidebar-title">Screen Capture Editor</span>
            <div className="sc-sidebar-actions">
              <button onClick={handlePin} title={pinned ? 'Unpin Sidebar' : 'Pin Sidebar'}>
                {pinned ? '📌' : '📍'}
              </button>
              <button onClick={handleClose} title="Close Sidebar">
                ✖️
              </button>
            </div>
          </div>
          <div className="sc-sidebar-content">
            <Editor />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
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

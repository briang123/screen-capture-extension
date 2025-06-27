import React from 'react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

interface SidebarPanelHeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMoveSide: () => void;
  onToggleCollapse: () => void;
  onClose: () => void;
  getCollapseArrow: () => string;
}

const SidebarPanelHeader: React.FC<SidebarPanelHeaderProps> = ({
  theme,
  onThemeToggle,
  onMoveSide,
  onToggleCollapse,
  onClose,
  getCollapseArrow,
}) => (
  <div className="sc-sidebar-header flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <span className="sc-sidebar-title text-xl font-semibold text-gray-900 dark:text-gray-100">
      Screen Capture
    </span>
    <div className="sc-sidebar-actions flex items-center gap-2">
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      <Button variant="secondary" size="sm" onClick={onMoveSide} title="Move Sidebar to Other Side">
        ⇄
      </Button>
      <Button variant="secondary" size="sm" onClick={onToggleCollapse} title="Collapse Sidebar">
        {getCollapseArrow()}
      </Button>
      <Button variant="danger" size="sm" onClick={onClose} title="Close Sidebar">
        ✖️
      </Button>
    </div>
  </div>
);

export default SidebarPanelHeader;

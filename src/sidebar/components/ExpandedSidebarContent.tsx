import React from 'react';
import SidebarPanelHeader from './SidebarPanelHeader';
import SidebarPanelBody from './SidebarPanelBody';

interface ExpandedSidebarContentProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMoveSide: () => void;
  onToggleCollapse: () => void;
  onClose: () => void;
  side: 'left' | 'right';
  isSwitchingSide: boolean;
}

const ExpandedSidebarContent: React.FC<ExpandedSidebarContentProps> = ({
  theme,
  onThemeToggle,
  onMoveSide,
  onToggleCollapse,
  onClose,
  side,
  isSwitchingSide,
}) => {
  return (
    <>
      <SidebarPanelHeader
        theme={theme}
        onThemeToggle={onThemeToggle}
        onMoveSide={onMoveSide}
        onToggleCollapse={onToggleCollapse}
        onClose={onClose}
        side={side}
        collapsed={false}
      />
      <SidebarPanelBody isSwitchingSide={isSwitchingSide} />
    </>
  );
};

export default ExpandedSidebarContent;

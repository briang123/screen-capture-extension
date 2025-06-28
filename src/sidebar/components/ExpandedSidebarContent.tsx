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
  isCapturing: boolean;
  onCapture: () => Promise<void>;
  error: string | null;
  onResetError: () => void;
}

const ExpandedSidebarContent: React.FC<ExpandedSidebarContentProps> = ({
  theme,
  onThemeToggle,
  onMoveSide,
  onToggleCollapse,
  onClose,
  side,
  isSwitchingSide,
  isCapturing,
  onCapture,
  error,
  onResetError,
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
      <SidebarPanelBody
        isSwitchingSide={isSwitchingSide}
        isCapturing={isCapturing}
        onCapture={onCapture}
        error={error}
        onResetError={onResetError}
      />
    </>
  );
};

export default ExpandedSidebarContent;

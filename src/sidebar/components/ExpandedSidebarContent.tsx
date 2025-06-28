import React from 'react';
import SidebarPanelHeader from './SidebarPanelHeader';
import SidebarPanelBody from './SidebarPanelBody';
import { UserFacingError } from '../../shared/error-handling';

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
  onAreaCapture: () => void;
  onAreaCaptureComplete: (imageData: string) => Promise<void>;
  hideOverlay: () => void;
  showOverlay: boolean;
  error: UserFacingError | null;
  onResetError: () => void;
  successMessage: string | null;
  onClearSuccessMessage: () => void;
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
  onAreaCapture,
  onAreaCaptureComplete,
  hideOverlay,
  showOverlay,
  error,
  onResetError,
  successMessage,
  onClearSuccessMessage,
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
        onAreaCapture={onAreaCapture}
        onAreaCaptureComplete={onAreaCaptureComplete}
        hideOverlay={hideOverlay}
        showOverlay={showOverlay}
        error={error}
        onResetError={onResetError}
        successMessage={successMessage}
        onClearSuccessMessage={onClearSuccessMessage}
      />
    </>
  );
};

export default ExpandedSidebarContent;

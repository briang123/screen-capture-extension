import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import CollapsedSidebarContent from './CollapsedSidebarContent';
import ExpandedSidebarContent from './ExpandedSidebarContent';
import { useCaptureContext } from '../contexts/CaptureContext';

interface SidebarContainerProps {
  side: 'left' | 'right';
  collapsed: 'collapsed' | 'expanded';
  isResizing: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  sidebarStyle: React.CSSProperties;
  animationVariants?: Variants;
  animationTransition?: Transition;
  // Content props
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMoveSide: () => void;
  onToggleCollapse: () => void;
  onClose: () => void;
  isSwitchingSide: boolean;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  side,
  collapsed,
  isResizing,
  containerRef,
  sidebarStyle,
  animationVariants,
  animationTransition,
  theme,
  onThemeToggle,
  onMoveSide,
  onToggleCollapse,
  onClose,
  isSwitchingSide,
}) => {
  const {
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
    onFullPageCapture,
    capturedImages,
    copyCapturedImage,
    openCapturedImageInEditor,
    deleteCapturedImage,
  } = useCaptureContext();

  const className = `sc-sidebar${side}${collapsed === 'collapsed' ? ' collapsed' : ''}`;

  // Render collapsed or expanded content
  const renderContent = () => {
    if (collapsed === 'collapsed') {
      return <CollapsedSidebarContent side={side} onToggleCollapse={onToggleCollapse} />;
    }

    return (
      <ExpandedSidebarContent
        theme={theme}
        onThemeToggle={onThemeToggle}
        onMoveSide={onMoveSide}
        onToggleCollapse={onToggleCollapse}
        onClose={onClose}
        side={side}
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
        onFullPageCapture={onFullPageCapture}
        capturedImages={capturedImages}
        copyCapturedImage={copyCapturedImage}
        openCapturedImageInEditor={openCapturedImageInEditor}
        deleteCapturedImage={deleteCapturedImage}
      />
    );
  };

  // Use regular div for resizing state (no animations)
  if (isResizing) {
    return (
      <div ref={containerRef} className={className} style={sidebarStyle}>
        {renderContent()}
      </div>
    );
  }

  // Use motion.div for animated state
  return (
    <motion.div
      ref={containerRef}
      className={className}
      variants={animationVariants}
      initial="visible"
      animate={collapsed}
      transition={animationTransition}
      style={sidebarStyle}
    >
      {renderContent()}
    </motion.div>
  );
};

export default SidebarContainer;

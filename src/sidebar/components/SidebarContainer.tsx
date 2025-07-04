import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import CollapsedSidebarContent from '@/sidebar/components/CollapsedSidebarContent';
import ExpandedSidebarContent from '@/sidebar/components/ExpandedSidebarContent';
import ErrorBoundary from '@/sidebar/components/ErrorBoundary';

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
  const className = `sc-sidebar${side}${collapsed === 'collapsed' ? ' collapsed' : ''}`;

  // Render collapsed or expanded content with error boundaries
  const renderContent = () => {
    if (collapsed === 'collapsed') {
      return (
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('CollapsedSidebarContent error:', error, errorInfo);
          }}
        >
          <CollapsedSidebarContent side={side} onToggleCollapse={onToggleCollapse} />
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('ExpandedSidebarContent error:', error, errorInfo);
        }}
      >
        <ExpandedSidebarContent
          theme={theme}
          onThemeToggle={onThemeToggle}
          onMoveSide={onMoveSide}
          onToggleCollapse={onToggleCollapse}
          onClose={onClose}
          side={side}
          isSwitchingSide={isSwitchingSide}
        />
      </ErrorBoundary>
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

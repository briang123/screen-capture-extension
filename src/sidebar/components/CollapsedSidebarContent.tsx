import React from 'react';
import ExpandCollapseButton from './ExpandCollapseButton';

interface CollapsedSidebarContentProps {
  side: 'left' | 'right';
  onToggleCollapse: () => void;
}

const CollapsedSidebarContent: React.FC<CollapsedSidebarContentProps> = ({
  side,
  onToggleCollapse,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-2">
      <ExpandCollapseButton side={side} collapsed={true} onClick={onToggleCollapse} />
    </div>
  );
};

export default CollapsedSidebarContent;

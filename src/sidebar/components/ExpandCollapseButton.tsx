import React from 'react';

interface ExpandCollapseButtonProps {
  side: 'left' | 'right';
  collapsed: boolean;
  onClick: () => void;
}

const ExpandCollapseButton: React.FC<ExpandCollapseButtonProps> = ({
  side,
  collapsed,
  onClick,
}) => {
  // Arrow logic: when collapsed, show expand arrow; when expanded, show collapse arrow
  const arrow = collapsed ? (side === 'left' ? '→' : '←') : side === 'left' ? '←' : '→';
  const title = collapsed ? 'Expand Sidebar' : 'Collapse Sidebar';

  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      title={title}
      type="button"
    >
      {arrow}
    </button>
  );
};

export default ExpandCollapseButton;

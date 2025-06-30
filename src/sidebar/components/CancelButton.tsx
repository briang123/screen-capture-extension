import React from 'react';

interface CancelButtonProps {
  style?: React.CSSProperties;
  onClick: () => void;
  children?: React.ReactNode;
}

const CancelButton: React.FC<CancelButtonProps> = ({ style, onClick, children }) => (
  <button
    style={{
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 10010,
      pointerEvents: 'auto',
      ...style,
    }}
    className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow border border-gray-200"
    onClick={onClick}
  >
    {children || 'Cancel'}
  </button>
);

export default CancelButton;

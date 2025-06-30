import React from 'react';

interface CaptureButtonProps {
  style?: React.CSSProperties;
  onClick: () => void;
  children?: React.ReactNode;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ style, onClick, children }) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
  };
  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
  };
  return (
    <button
      id="portal-capture-btn"
      style={{
        position: 'fixed',
        width: 120,
        zIndex: 99999, // extremely high z-index
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 16px',
        fontWeight: 500,
        fontSize: 16,
        color: '#1e293b',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        textAlign: 'center',
        pointerEvents: 'auto',
        ...style,
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
};

export default CaptureButton;

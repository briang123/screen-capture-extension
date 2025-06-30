import React from 'react';
import ReactDOM from 'react-dom';

interface FullViewportOverlayProps {
  visible: boolean;
  children?: React.ReactNode;
  hideForCapture?: boolean;
}

const FullViewportOverlay: React.FC<FullViewportOverlayProps> = ({
  visible,
  children,
  hideForCapture,
}) => {
  if (!visible) return null;
  return ReactDOM.createPortal(
    <div
      className={hideForCapture ? 'sc-hide-for-capture' : ''}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'auto',
        background: 'transparent',
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default FullViewportOverlay;

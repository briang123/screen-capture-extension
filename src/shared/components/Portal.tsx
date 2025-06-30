import React from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

const Portal: React.FC<PortalProps> = ({ children, container }) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  return ReactDOM.createPortal(children, container || document.body);
};

export default Portal;

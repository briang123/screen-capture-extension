import React from 'react';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const baseClasses =
  'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

// CaptureButton component
interface CaptureButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isCapturing: boolean;
  onCapture: () => void;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({
  isCapturing,
  onCapture,
  className = '',
  ...props
}) => (
  <Button
    variant="primary"
    size="lg"
    onClick={onCapture}
    disabled={isCapturing}
    className={['w-full flex items-center justify-center', className].join(' ')}
    aria-busy={isCapturing}
    {...props}
  >
    {isCapturing ? (
      <motion.span
        className="loading-spinner mr-2"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        ⏳
      </motion.span>
    ) : (
      <span className="mr-2">📸</span>
    )}
    {isCapturing ? 'Capturing...' : 'Capture Image'}
  </Button>
);

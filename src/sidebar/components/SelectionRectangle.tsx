import React from 'react';
import { motion } from 'framer-motion';
import { Z_INDEX } from '@/shared/constants';
import { ANIMATION_DURATIONS } from '@/shared/constants';
import SelectionHandles from '@/sidebar/components/SelectionHandles';

interface SelectionRectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  showHandles: boolean;
  showSizeIndicator?: boolean;
  onHandleMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, handleKey: string) => void;
}

const SelectionRectangle: React.FC<SelectionRectangleProps> = ({
  x,
  y,
  width,
  height,
  showHandles,
  showSizeIndicator = false,
  onHandleMouseDown,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width,
        height,
        position: 'fixed',
        borderRadius: 8,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
        zIndex: Z_INDEX.SELECTION_OVERLAY,
        background: 'transparent',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_DURATIONS.OVERLAY_FADE / 1000 }}
    >
      {/* Size indicator */}
      {showSizeIndicator && (
        <div
          style={{
            position: 'absolute',
            left: -2,
            top: -32,
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            fontSize: 13,
            padding: '2px 8px',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            pointerEvents: 'none',
            zIndex: Z_INDEX.SIZE_INDICATOR,
            whiteSpace: 'nowrap',
          }}
        >
          {Math.round(width)} × {Math.round(height)}
        </div>
      )}
      {/* Handles */}
      {showHandles && (
        <SelectionHandles width={width} height={height} onHandleMouseDown={onHandleMouseDown} />
      )}
    </motion.div>
  );
};

export default SelectionRectangle;

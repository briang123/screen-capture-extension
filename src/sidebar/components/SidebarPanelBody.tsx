import React from 'react';
import { motion } from 'framer-motion';
import { CaptureButton } from './Button';

interface SidebarPanelBodyProps {
  isSwitchingSide: boolean;
  isCapturing: boolean;
  onCapture: () => void;
}

const SidebarPanelBody: React.FC<SidebarPanelBodyProps> = ({
  isSwitchingSide,
  isCapturing,
  onCapture,
}) => (
  <div className="sc-sidebar-content flex flex-col gap-6 px-6 py-6">
    {!isSwitchingSide ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CaptureButton isCapturing={isCapturing} onCapture={onCapture} />
      </motion.div>
    ) : (
      <div>
        <CaptureButton isCapturing={isCapturing} onCapture={onCapture} />
      </div>
    )}
  </div>
);

export default SidebarPanelBody;

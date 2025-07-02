import React from 'react';
import { getOverlaySectionStyles, SelectionRect } from '@/sidebar/utils/overlayMaskUtils';

interface OverlayMaskProps {
  selection: SelectionRect | null | undefined;
}

const OverlayMask: React.FC<OverlayMaskProps> = ({ selection }) => {
  if (!selection) return null;
  const sectionStyles = getOverlaySectionStyles(selection);
  return (
    <>
      {sectionStyles.map((style: React.CSSProperties, idx: number) => (
        <div className="overlay-mask-section" key={idx} style={style} />
      ))}
    </>
  );
};

export default OverlayMask;

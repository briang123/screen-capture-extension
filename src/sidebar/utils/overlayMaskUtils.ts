import { Z_INDEX } from '@/shared/constants';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getOverlaySectionStyles(selection: SelectionRect) {
  if (!selection) return [];
  const { x, y, width, height } = selection;
  const viewportX = x - (typeof window !== 'undefined' ? window.scrollX : 0);
  const viewportY = y - (typeof window !== 'undefined' ? window.scrollY : 0);
  const right = viewportX + width;
  const bottom = viewportY + height;
  const baseStyle = {
    position: 'fixed' as const,
    background: 'rgba(40,40,40,0.35)',
    zIndex: Z_INDEX.INSTRUCTIONS_OVERLAY,
    pointerEvents: 'none' as const,
  };
  return [
    { ...baseStyle, left: 0, top: 0, width: '100vw', height: viewportY },
    { ...baseStyle, left: 0, top: bottom, width: '100vw', height: `calc(100vh - ${bottom}px)` },
    { ...baseStyle, left: 0, top: viewportY, width: viewportX, height: height },
    {
      ...baseStyle,
      left: right,
      top: viewportY,
      width: `calc(100vw - ${right}px)`,
      height: height,
    },
  ];
}

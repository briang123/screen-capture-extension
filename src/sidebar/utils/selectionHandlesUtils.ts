export type HandleOrientation = 'corner' | 'horizontal' | 'vertical';
export interface HandlePosition {
  x: number;
  y: number;
  cursor: string;
  key: string;
  orientation: HandleOrientation;
  corner?: 'tl' | 'tr' | 'bl' | 'br';
}

export function getHandlePositions(width: number, height: number): HandlePosition[] {
  return [
    { x: 0, y: 0, cursor: 'nwse-resize', key: 'nw', orientation: 'corner', corner: 'tl' },
    { x: width / 2, y: 0, cursor: 'ns-resize', key: 'n', orientation: 'horizontal' },
    { x: width, y: 0, cursor: 'nesw-resize', key: 'ne', orientation: 'corner', corner: 'tr' },
    { x: 0, y: height / 2, cursor: 'ew-resize', key: 'w', orientation: 'vertical' },
    { x: width, y: height / 2, cursor: 'ew-resize', key: 'e', orientation: 'vertical' },
    { x: 0, y: height, cursor: 'nesw-resize', key: 'sw', orientation: 'corner', corner: 'bl' },
    { x: width / 2, y: height, cursor: 'ns-resize', key: 's', orientation: 'horizontal' },
    { x: width, y: height, cursor: 'nwse-resize', key: 'se', orientation: 'corner', corner: 'br' },
  ];
}

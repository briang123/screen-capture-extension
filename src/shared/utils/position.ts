export function pageToViewportCoords(x: number, y: number): { x: number; y: number } {
  const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;
  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  return {
    x: x - scrollX,
    y: y - scrollY,
  };
}

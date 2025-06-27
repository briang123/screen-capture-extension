import { useEffect, useState } from 'react';

export function useSidebarResize(
  side: 'left' | 'right',
  getRightEdge: () => number,
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
): boolean {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsResizing(true);
      if (side === 'right') {
        setPosition((pos) => ({ ...pos, x: getRightEdge() }));
      } else {
        setPosition((pos) => ({ ...pos, x: 0 }));
      }
      setTimeout(() => setIsResizing(false), 50); // short timeout to allow instant update
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [side, getRightEdge, setPosition]);

  return isResizing;
}

import { useEffect, useState } from 'react';
import { SidebarSide } from './useSidebarSide';
import { TIMEOUTS } from '@/shared/constants';

export function useSidebarResize(
  side: SidebarSide,
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
      setTimeout(() => setIsResizing(false), TIMEOUTS.RESIZE_TIMEOUT); // short timeout to allow instant update
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [side, getRightEdge, setPosition]);

  return isResizing;
}

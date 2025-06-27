import { useState } from 'react';

export type SidebarSide = 'left' | 'right';

export function useSidebarSide(
  initialSide: SidebarSide = 'right',
  transitionDurationMs: number = 500
): [SidebarSide, () => void, boolean] {
  const [side, setSide] = useState<SidebarSide>(initialSide);
  const [isSwitchingSide, setIsSwitchingSide] = useState(false);

  const handleMoveSide = () => {
    setIsSwitchingSide(true);
    const newSide = side === 'left' ? 'right' : 'left';
    setSide(newSide);
    setTimeout(() => setIsSwitchingSide(false), transitionDurationMs);
  };

  return [side, handleMoveSide, isSwitchingSide];
}

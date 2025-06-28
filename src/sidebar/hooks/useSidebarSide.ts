import { useState, useCallback } from 'react';
import { ANIMATION_DURATIONS } from '@/shared/constants';

export type SidebarSide = 'left' | 'right';

export function useSidebarSide(
  initialSide: 'left' | 'right' = 'right',
  transitionDurationMs: number = ANIMATION_DURATIONS.SIDEBAR_SIDE_SWITCH
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

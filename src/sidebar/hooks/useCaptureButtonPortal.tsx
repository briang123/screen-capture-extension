import { useMemo } from 'react';
import Portal from '@/shared/components/Portal';
import CaptureButton from '@/sidebar/components/CaptureButton';
import { pageToViewportCoords } from '@/shared/utils/position';
import { Z_INDEX } from '@/shared/constants';

interface UseCaptureButtonPortalProps {
  selection: { x: number; y: number; width: number; height: number } | null | undefined;
  selectionComplete: boolean;
  onCapture: () => Promise<void>;
  show: boolean;
}

export function useCaptureButtonPortal({
  selection,
  selectionComplete,
  onCapture,
  show,
}: UseCaptureButtonPortalProps) {
  return useMemo(() => {
    if (!show || !selection || !selectionComplete) return null;
    const { x: viewportX, y: viewportY } = pageToViewportCoords(selection.x, selection.y);

    return (
      <Portal>
        <CaptureButton
          style={{
            position: 'fixed',
            top: viewportY + selection.height + 24,
            left: `calc(${viewportX + selection.width / 2}px)`,
            transform: 'translateX(-50%)',
            width: 120,
            zIndex: Z_INDEX.CAPTURE_BUTTON,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
            fontSize: 16,
            color: '#1e293b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
          onClick={onCapture}
        >
          Capture Image
        </CaptureButton>
      </Portal>
    );
  }, [show, selection, selectionComplete, onCapture]);
}

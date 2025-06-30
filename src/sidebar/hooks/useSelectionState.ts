import { useState, useCallback, useRef, useEffect } from 'react';

export function useSelectionState(onAreaCaptureComplete?: (imageData: string) => void) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const pendingImageDataRef = useRef<string | null>(null);

  const show = useCallback(() => {
    setShowOverlay(true);
    setSelectionComplete(false);
  }, []);
  const hide = useCallback(() => setShowOverlay(false), []);

  useEffect(() => {
    if (!showOverlay && pendingImageDataRef.current) {
      if (onAreaCaptureComplete) onAreaCaptureComplete(pendingImageDataRef.current);
      pendingImageDataRef.current = null;
      setSelectionComplete(false);
      setShowOverlay(false);
    }
  }, [showOverlay, onAreaCaptureComplete, setSelectionComplete, setShowOverlay]);

  return {
    showOverlay,
    setShowOverlay,
    selectionComplete,
    setSelectionComplete,
    pendingImageDataRef,
    show,
    hide,
  };
}

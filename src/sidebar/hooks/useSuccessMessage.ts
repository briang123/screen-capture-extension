import { useState, useCallback, useRef, useEffect } from 'react';
import { TIMEOUTS } from '@/shared/constants';

/**
 * useSuccessMessage - Custom hook for managing a success message with auto-clear timeout.
 *
 * @param timeout Duration in ms before the message is cleared (default: TIMEOUTS.SUCCESS_MESSAGE)
 * @returns [successMessage, setSuccessMessage]
 */
export function useSuccessMessage(
  timeout: number = TIMEOUTS.SUCCESS_MESSAGE
): [string | null, (msg: string | null) => void] {
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSuccessMessage = useCallback(
    (msg: string | null) => {
      setSuccessMessageState(msg);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (msg !== null) {
        timeoutRef.current = setTimeout(() => {
          setSuccessMessageState(null);
        }, timeout);
      }
    },
    [timeout]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [successMessage, setSuccessMessage];
}

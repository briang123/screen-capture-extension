import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useSuccessMessage - Custom hook for managing a success message with auto-clear timeout.
 *
 * @param timeout Duration in ms before the message is cleared (default: 3000)
 * @returns [successMessage, setSuccessMessage]
 */
export function useSuccessMessage(
  timeout: number = 3000
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

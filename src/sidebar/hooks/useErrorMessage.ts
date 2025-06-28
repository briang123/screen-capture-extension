import { useState, useCallback, useRef, useEffect } from 'react';
import type { UserFacingError } from '@/shared/error-handling';
import { TIMEOUTS } from '@/shared/constants';

/**
 * useErrorMessage - Custom hook for managing an error message with auto-clear timeout.
 *
 * @param timeout Duration in ms before the error is cleared (default: TIMEOUTS.ERROR_MESSAGE)
 * @returns [error, setError]
 */
export function useErrorMessage(
  timeout: number = TIMEOUTS.ERROR_MESSAGE
): [UserFacingError | null, (err: UserFacingError | null) => void] {
  const [error, setErrorState] = useState<UserFacingError | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setError = useCallback(
    (err: UserFacingError | null) => {
      setErrorState(err);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (err !== null) {
        timeoutRef.current = setTimeout(() => setErrorState(null), timeout);
      }
    },
    [timeout]
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return [error, setError];
}

import { createUserFacingError, UserFacingError } from '../shared/error-handling';

/**
 * handleCaptureError - Helper to handle errors in capture hooks
 * Converts an error to a UserFacingError and updates state
 * @param error The error to handle
 * @param setState The setState function from useState
 */
export function handleCaptureError(
  error: unknown,
  setState: (updater: (prev: any) => any) => void
) {
  const userFacingError: UserFacingError = createUserFacingError(error);
  setState((prev: any) => ({ ...prev, isCapturing: false, error: userFacingError }));
}

import { useEffect, useRef } from 'react';

/**
 * useEventListener attaches an event listener to a target and cleans up automatically.
 * @param event - The event name (e.g., 'mousemove')
 * @param handler - The event handler function
 * @param target - The target to attach the event to (default: window)
 * @param enabled - If false, the listener is not attached
 * @param options - Optional event listener options
 */
export function useEventListener<K extends keyof globalThis.WindowEventMap>(
  event: K,
  handler: (ev: globalThis.WindowEventMap[K]) => void,
  target: globalThis.Window | globalThis.Document | HTMLElement = window,
  enabled: boolean = true,
  options?: boolean | globalThis.AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  // Update ref if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled || !target?.addEventListener) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as globalThis.WindowEventMap[K]);
    };
    target.addEventListener(event, eventListener, options);

    return () => {
      target.removeEventListener(event, eventListener, options);
    };
  }, [event, target, options, enabled]);
}

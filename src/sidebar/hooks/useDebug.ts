import { useEffect } from 'react';

export function useDebug(label: string, values: Record<string, any>) {
  useEffect(() => {
    // Grouped log for clarity
    console.group(`[${label}]`);
    Object.entries(values).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();
    // Only log when values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(values));
}

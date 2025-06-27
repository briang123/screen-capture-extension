// Simple test/demo for usePersistentState hook
// This file demonstrates the hook usage patterns

import { usePersistentState, useLocalStorage, useChromeSyncStorage } from './usePersistentState';

// Example usage patterns (not actual tests, just demonstrations)

// 1. Basic localStorage usage
export function DemoBasicUsage() {
  const [count, setCount, clearCount] = useLocalStorage<number>('demo-counter', 0);

  return {
    count,
    increment: () => setCount(count + 1),
    reset: () => setCount(0),
    clear: clearCount,
  };
}

// 2. Complex object with Chrome sync storage
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  language: string;
}

export function DemoChromeSyncUsage() {
  const [preferences, setPreferences] = useChromeSyncStorage<UserPreferences>('user-preferences', {
    theme: 'light',
    fontSize: 14,
    language: 'en',
  });

  return {
    preferences,
    updateTheme: (theme: 'light' | 'dark') => setPreferences((prev) => ({ ...prev, theme })),
    updateFontSize: (fontSize: number) => setPreferences((prev) => ({ ...prev, fontSize })),
    updateLanguage: (language: string) => setPreferences((prev) => ({ ...prev, language })),
  };
}

// 3. Advanced usage with custom options
interface AppState {
  isFirstVisit: boolean;
  lastVisitDate: string;
  settings: Record<string, unknown>;
}

export function DemoAdvancedUsage() {
  const [appState, setAppState, clearAppState] = usePersistentState<AppState>({
    key: 'app-state',
    backend: 'localStorage',
    defaultValue: {
      isFirstVisit: true,
      lastVisitDate: new Date().toISOString(),
      settings: {},
    },
    onError: (error) => {
      console.warn('Storage error:', error);
    },
    sync: true,
  });

  return {
    appState,
    markVisited: () =>
      setAppState((prev) => ({
        ...prev,
        isFirstVisit: false,
        lastVisitDate: new Date().toISOString(),
      })),
    updateSettings: (settings: Record<string, unknown>) =>
      setAppState((prev) => ({ ...prev, settings })),
    clear: clearAppState,
  };
}

// 4. Custom serialization example
export function DemoCustomSerialization() {
  const [lastVisit, setLastVisit, clearLastVisit] = useLocalStorage<Date>(
    'last-visit',
    new Date(),
    {
      serialize: (date) => date.toISOString(),
      deserialize: (str) => new Date(str),
    }
  );

  return {
    lastVisit,
    updateVisit: () => setLastVisit(new Date()),
    clear: clearLastVisit,
  };
}

// Usage examples:
// const basic = DemoBasicUsage();
// basic.increment(); // Increments counter and saves to localStorage
//
// const sync = DemoChromeSyncUsage();
// sync.updateTheme('dark'); // Updates theme and syncs across devices
//
// const advanced = DemoAdvancedUsage();
// advanced.markVisited(); // Updates visit state with custom error handling
//
// const custom = DemoCustomSerialization();
// custom.updateVisit(); // Updates date with custom serialization

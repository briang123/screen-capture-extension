import { useEffect, useCallback } from 'react';
import { useChromeSyncStorage } from './usePersistentState';

export type Theme = 'light' | 'dark';

export interface Settings {
  theme: Theme;
  // Add more settings here as needed
}

const DEFAULT_SETTINGS: Settings = {
  theme:
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
};

export function useSettings() {
  return useChromeSyncStorage<Settings>('settings', DEFAULT_SETTINGS);
}

export function useTheme(): [Theme, () => void] {
  const [settings, setSettings] = useSettings();
  const theme = settings.theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, [setSettings]);

  return [theme, toggleTheme];
}

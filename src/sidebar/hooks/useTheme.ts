import { useEffect } from 'react';
import { useChromeLocalStorage } from './usePersistentState';

export type Theme = 'light' | 'dark';

export function useTheme(): [Theme, () => void] {
  const getInitialTheme = (): Theme =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const [theme, setTheme] = useChromeLocalStorage<Theme>('sc_theme', getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return [theme, toggleTheme];
}

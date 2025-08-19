import { useEffect, useState } from 'react';
const THEME_KEY = 'ui.theme';
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, setTheme, toggle };
}

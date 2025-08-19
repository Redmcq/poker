import { useTheme } from '../../hooks/useTheme';
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="btn" onClick={toggle} title="Toggle theme">
      {theme === 'dark' ? '??' : '??'}
    </button>
  );
}

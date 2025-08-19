import { useEffect } from 'react';
/** Binds keyboard shortcuts. ex: useHotkeys({ "s": onSolve, "ctrl+k": openPalette }) */
export function useHotkeys(map = {}) {
  useEffect(() => {
    const handler = (e) => {
      const combo = [];
      if (e.ctrlKey || e.metaKey) combo.push('ctrl');
      if (e.shiftKey) combo.push('shift');
      const key = e.key.toLowerCase();
      combo.push(key);
      const joined = combo.join('+');
      const fn = map[joined] || map[key];
      if (fn) {
        // prevent default on common combos we claim
        if (joined === 'ctrl+k' || key === 'y' || key === 'n' || key === 's') e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [JSON.stringify(Object.keys(map))]);
}

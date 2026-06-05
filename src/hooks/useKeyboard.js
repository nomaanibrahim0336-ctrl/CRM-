import { useEffect } from 'react';

export function useKeyboard(key, callback, deps = []) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === key) {
        e.preventDefault();
        callback(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, deps);
}

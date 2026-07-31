// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export function useKeyboardShortcuts(handlers) {
  Object.entries(handlers).forEach(([key, handler]) => {
    useHotkeys(key, (e) => {
      e.preventDefault();
      handler(e);
    }, [handler]);
  });
}

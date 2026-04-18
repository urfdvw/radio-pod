import { useEffect, useCallback } from 'react';

export function useKeyboard({ onUp, onDown, onLeft, onRight, onEnter, onScrollUp, onScrollDown, onChar }) {
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onRight?.();
        break;
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case '=':
        e.preventDefault();
        onScrollDown?.();
        break;
      case '-':
        e.preventDefault();
        onScrollUp?.();
        break;
      case 'Backspace':
        e.preventDefault();
        onChar?.('BACKSPACE');
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          onChar?.(e.key);
        }
        break;
    }
  }, [onUp, onDown, onLeft, onRight, onEnter, onScrollUp, onScrollDown, onChar]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

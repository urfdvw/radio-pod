import { useEffect, useCallback } from 'react';

export function useKeyboard({ onUp, onDown, onLeft, onRight, onEnter, onScrollUp, onScrollDown }) {
  const handleKeyDown = useCallback((e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (isInput && e.key !== 'Enter' && e.key !== 'Escape') return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onUp?.();
        break;
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
    }
  }, [onUp, onDown, onLeft, onRight, onEnter, onScrollUp, onScrollDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

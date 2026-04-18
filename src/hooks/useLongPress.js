import { useCallback, useRef } from 'react';

export function useLongPress(onShortPress, onLongPress, threshold = 500) {
  const timerRef = useRef(null);
  const isLongRef = useRef(false);

  const onPressStart = useCallback(() => {
    isLongRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongRef.current = true;
      onLongPress?.();
    }, threshold);
  }, [onLongPress, threshold]);

  const onPressEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongRef.current) {
      onShortPress?.();
    }
  }, [onShortPress]);

  return { onPressStart, onPressEnd };
}

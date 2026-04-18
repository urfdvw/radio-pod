import { useState, useCallback, useRef } from 'react';

export function useTypeToFilter() {
  const [filterText, setFilterText] = useState('');
  const timeoutRef = useRef(null);

  const handleChar = useCallback((char) => {
    if (char === 'BACKSPACE') {
      setFilterText((prev) => prev.slice(0, -1));
    } else {
      setFilterText((prev) => prev + char);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFilterText(''), 3000);
  }, []);

  const clearFilter = useCallback(() => {
    setFilterText('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { filterText, handleChar, clearFilter };
}

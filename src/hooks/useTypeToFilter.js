import { useState, useCallback } from 'react';

export function useTypeToFilter() {
  const [filterText, setFilterText] = useState('');

  const clearFilter = useCallback(() => setFilterText(''), []);

  return { filterText, setFilterText, clearFilter };
}

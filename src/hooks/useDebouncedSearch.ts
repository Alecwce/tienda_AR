// src/hooks/useDebouncedSearch.ts - Hook para búsqueda con debounce

import { useDeferredValue, useEffect, useState } from 'react';

/**
 * Hook para búsqueda con debounce y useDeferredValue
 * Optimiza la experiencia de usuario al evitar re-renders excesivos
 * @param initialValue Valor inicial de búsqueda
 * @param delay Delay en ms (default: 300)
 */
export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  // useDeferredValue para transiciones suaves en React 18+
  const deferredValue = useDeferredValue(debouncedValue);
  const isPending = deferredValue !== debouncedValue;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, delay]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery: deferredValue,
    isPending,
  };
}

/**
 * Versión simplificada solo con debounce
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

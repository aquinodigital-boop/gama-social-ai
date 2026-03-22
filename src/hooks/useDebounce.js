import { useState, useEffect } from 'react';

/**
 * Hook de debounce para inputs de busca.
 * Evita processamento a cada keystroke no catálogo 22k+.
 * 
 * @param {*} value - Valor a ser debounced
 * @param {number} delay - Delay em ms (default: 300)
 * @returns {*} Valor debounced
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

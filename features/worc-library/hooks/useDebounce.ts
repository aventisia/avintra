import { useEffect, useState } from "react";

/**
 * Debounces a value — waits until the user stops typing before updating.
 * @param value The input value to debounce
 * @param delay Delay in milliseconds (default: 300ms)
 */
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

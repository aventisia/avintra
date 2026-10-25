import { useCallback, useEffect, useRef } from "react";

/**
 * Delays a callback until calls stop for `delay` ms; the latest callback and arguments win.
 */
export const useDebouncedCallback = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback(
    (...args: TArgs) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay],
  );
};

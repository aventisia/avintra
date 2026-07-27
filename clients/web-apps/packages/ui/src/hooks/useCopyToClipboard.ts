import { useCallback, useEffect, useRef, useState } from "react";

export type UseCopyToClipboardOptions = {
  /** Duration (in ms) to keep the copied success state active. @default 500 */
  successDuration?: number;
};

/**
 * Provides copy-to-clipboard state and a handler.
 *
 * Returns whether the value was recently copied and a function to copy text.
 * Automatically resets the copied state after the configured duration.
 */
export const useCopyToClipboard = (options: UseCopyToClipboardOptions = {}) => {
  const { successDuration = 500 } = options;
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (isCopied || !navigator.clipboard?.writeText) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, successDuration);

        return true;
      } catch {
        // Swallow clipboard errors to avoid breaking display-only views.
        return false;
      }
    },
    [isCopied, successDuration],
  );

  return { isCopied, copy };
};

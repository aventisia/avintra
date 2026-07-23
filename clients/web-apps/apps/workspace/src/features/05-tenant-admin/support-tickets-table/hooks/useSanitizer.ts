import { useCallback } from "react";

import { sanitizeHtml } from "../utils/htmlSanitizer";

/**
 * useSanitizer - React hook wrapper that returns the sanitizeHtml function
 */
export function useSanitizer() {
  return useCallback((raw: string) => sanitizeHtml(raw), []);
}

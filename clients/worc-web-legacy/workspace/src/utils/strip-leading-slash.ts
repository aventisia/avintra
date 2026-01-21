/**
 * Removes any leading slash(s) (/) if present.
 */
export const stripLeadingSlash = (value?: string): string =>
  value ? value.replace(/^\/+/, "") : "";

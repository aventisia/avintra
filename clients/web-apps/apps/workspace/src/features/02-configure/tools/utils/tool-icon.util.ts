/**
 * Validates an optional icon URL. Empty values are treated as valid because the
 * field is optional and the renderer falls back to the default placeholder icon.
 */
export const isValidIconUrl = (iconUrl?: string): boolean => {
  const value = iconUrl?.trim();
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

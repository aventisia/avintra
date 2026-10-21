const SUPPORTED_ICON_URL_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates an optional icon URL, accepting only http and https schemes.
 */
export const isValidIconUrl = (iconUrl?: string): boolean => {
  const value = iconUrl?.trim();
  if (!value) return true;

  try {
    return SUPPORTED_ICON_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
};

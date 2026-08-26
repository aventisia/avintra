/**
 * Extracts the first clickable URL from a notification message.
 *
 * Some notifications carry a deep-link only inside the message body (e.g. a
 * generated job/flow link) rather than in the dedicated `actionUrl` field.
 * This helper pulls that URL out so the notification item can navigate to it.
 *
 * Preference order:
 *   1. Absolute `http(s)://...` URL
 *   2. Root-relative path (e.g. `/flow/123`, `/job/456`)
 *
 * @param message The notification message text (may be undefined/empty).
 * @returns The first detected URL, or `undefined` when none is found.
 */
export const extractNotificationUrl = (message?: string): string | undefined => {
  if (!message) {
    return undefined;
  }

  // Absolute http(s) URLs.
  const absoluteUrl = message.match(/https?:\/\/[^\s"']+/i)?.[0];
  if (absoluteUrl) {
    return absoluteUrl;
  }

  // Root-relative path (starting with a single slash).
  const relativePath = message.match(/(?<![\w/])\/[^\s"']+/)?.[0];
  if (relativePath) {
    return relativePath;
  }

  return undefined;
};

const hasControlCharacter = (value: string): boolean =>
  Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });

/**
 * Returns `redirect` as a path on `origin` when it is a safe same-app redirect, and `null`
 * otherwise.
 *
 * @remarks
 * Absolute URLs, protocol-relative paths, backslash tricks and control characters are rejected
 * so a crafted `redirect` query parameter can never send the user to another site.
 */
const getSameOriginRedirectPath = (redirect: string | null, origin: string): string | null => {
  if (!redirect) return null;

  let path: string;
  try {
    path = decodeURIComponent(redirect);
  } catch {
    return null;
  }

  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  if (hasControlCharacter(path)) return null;

  try {
    const url = new URL(path, origin);
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
};

export { getSameOriginRedirectPath };

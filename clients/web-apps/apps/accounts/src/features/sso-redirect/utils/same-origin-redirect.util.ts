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
 * An absolute URL is accepted only when it points at `origin`; it is then reduced to its path.
 * Protocol-relative paths, backslash tricks and control characters are rejected so a crafted
 * `redirect` query parameter can never send the user to another site.
 */
const getSameOriginRedirectPath = (redirect: string | null, origin: string): string | null => {
  if (!redirect) return null;

  let path: string;
  try {
    path = decodeURIComponent(redirect);
  } catch {
    return null;
  }

  if (hasControlCharacter(path)) return null;

  if (!path.startsWith("/")) {
    try {
      const absolute = new URL(path);
      return absolute.origin === origin
        ? `${absolute.pathname}${absolute.search}${absolute.hash}`
        : null;
    } catch {
      return null;
    }
  }

  if (path.startsWith("//") || path.startsWith("/\\")) return null;

  try {
    const url = new URL(path, origin);
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
};

export { getSameOriginRedirectPath };

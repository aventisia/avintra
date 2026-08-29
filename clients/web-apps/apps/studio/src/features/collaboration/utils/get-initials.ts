/**
 * Derives a short initials string from a user's display name (or email as a
 * fallback). Mirrors the logic used by the presence avatars and remote cursors so
 * the lock badge shows the same initials as the holder's avatar.
 */
export const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
  }
  return email?.slice(0, 2).toUpperCase() ?? "?";
};

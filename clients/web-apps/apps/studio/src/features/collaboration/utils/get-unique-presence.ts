import { PresenceDto } from "../dtos/collaboration-dtos";

/**
 * Dedupes a presence list down to one entry per user. Presence is keyed by
 * connection id server-side, so the same user can appear more than once (e.g. two
 * tabs, or a lingering entry after navigating away and back). Users are keyed by
 * email, falling back to userId.
 */
export const getUniquePresenceUsers = (presence: PresenceDto[]) => {
  const seen = new Set<string>();
  return presence.filter((p) => {
    const key = p.email ?? p.userId;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

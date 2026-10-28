/**
 * Shared color helpers for collaboration presence UI (avatars + remote cursors).
 * A user's color must be identical across their presence avatar and their live
 * cursor so collaborators can visually link a cursor to its owner. The color is
 * derived deterministically from the user's id (or email) so it is stable across
 * sessions and tabs.
 */

// Distinct ring/border colors for collaboration participants. Hues are deliberately
// spread far apart across the color wheel so adjacent users are easy to tell apart:
// the palette cycles red → orange → yellow → green → teal → blue → magenta → pink.
// Exclusions:
//  - Green is intentionally excluded because the Execute button is green and would
//    cause confusion.
//  - Indigo/violet are excluded so a ring is never mistaken for the indigo primary
//    accent.
export const COLLABORATION_COLORS = [
  "border-rose-300", // red
  "border-orange-300", // orange
  "border-amber-300", // yellow-orange
  "border-yellow-300", // yellow
  "border-lime-300", // yellow-green
  "border-teal-300", // teal
  "border-blue-400", // blue (400 for a stronger, more distinct blue vs the pale fill)
  "border-fuchsia-300", // magenta
  "border-pink-300", // pink
  "border-cyan-300", // cyan
];

// Same palette as COLLABORATION_COLORS but for `fill-*` (used by the cursor arrow).
// Kept as literal class strings so Tailwind can generate them at build time (a
// runtime-built class like `fill-${x}` would be purged and never render).
const COLLABORATION_FILL_COLORS = [
  "fill-rose-300",
  "fill-orange-300",
  "fill-amber-300",
  "fill-yellow-300",
  "fill-lime-300",
  "fill-teal-300",
  "fill-blue-400",
  "fill-fuchsia-300",
  "fill-pink-300",
  "fill-cyan-300",
];

// Same palette as COLLABORATION_COLORS but for `text-*` (used by the lock badge
// icon + initials so they match the holder's avatar ring color). Kept as literal
// class strings so Tailwind can generate them at build time.
const COLLABORATION_TEXT_COLORS = [
  "text-rose-500",
  "text-orange-500",
  "text-amber-500",
  "text-yellow-500",
  "text-lime-500",
  "text-teal-500",
  "text-blue-500",
  "text-fuchsia-500",
  "text-pink-500",
  "text-cyan-500",
];

/**
 * Returns a stable color index into {@link COLLABORATION_COLORS} for a user,
 * based on their id (or email). Used only as a fallback; prefer
 * {@link collaborationColorMapForPresence} so colors never collide across users.
 */
export const collaborationColorIndexFor = (userId?: string, email?: string) => {
  const key = `${userId ?? ""}${email ?? ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % COLLABORATION_COLORS.length;
};

/** Returns the Tailwind border-color class for a user's collaboration color. */
export const collaborationColorFor = (userId?: string, email?: string) =>
  COLLABORATION_COLORS[collaborationColorIndexFor(userId, email)];

/** Returns the Tailwind fill class for a user's collaboration color (cursor arrow). */
export const collaborationFillColorFor = (userId?: string, email?: string) =>
  COLLABORATION_FILL_COLORS[collaborationColorIndexFor(userId, email)];

/** Returns the Tailwind text class for a user's collaboration color (lock badge). */
export const collaborationTextColorFor = (userId?: string, email?: string) =>
  COLLABORATION_TEXT_COLORS[collaborationColorIndexFor(userId, email)];

/**
 * Builds a deterministic, collision-free color per user from the set of users
 * currently present in the flow. Colors are assigned by sorted user id, so every
 * distinct user gets a unique color AND the same user always gets the same color
 * across the header avatar and the canvas cursor (both read the same presence
 * list from the collaboration store). Keys the map by user id.
 */
export const collaborationColorMapForPresence = (
  presence: { userId?: string; email?: string }[],
): Record<string, { border: string; fill: string; text: string }> => {
  const uniqueUsers = new Map<string, { userId?: string; email?: string }>();
  for (const p of presence) {
    if (p.userId && !uniqueUsers.has(p.userId)) {
      uniqueUsers.set(p.userId, p);
    }
  }
  const sorted = [...uniqueUsers.keys()].sort();
  const map: Record<string, { border: string; fill: string; text: string }> = {};
  sorted.forEach((userId, i) => {
    const idx = i % COLLABORATION_COLORS.length;
    map[userId] = {
      border: COLLABORATION_COLORS[idx],
      fill: COLLABORATION_FILL_COLORS[idx],
      text: COLLABORATION_TEXT_COLORS[idx],
    };
  });
  return map;
};

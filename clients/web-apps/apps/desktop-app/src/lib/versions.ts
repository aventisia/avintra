/**
 * Normalizes a version string to a comparable form and returns it as a tuple
 * of numeric segments. Handles common real-world formatting differences:
 * - Optional leading "v" (e.g. "v0.1.88" -> "0.1.88")
 * - Trailing ".0" padding (e.g. "0.1.88.0" -> "0.1.88")
 * - Build metadata / suffixes (e.g. "0.1.88+build5" -> "0.1.88")
 *
 * Returns `null` when the input is not a recognizable version string.
 */
export function parseVersionSegments(value: string | null | undefined): number[] | null {
  if (!value) return null;

  const cleaned = value.trim().replace(/^[vV]/, "").split(/[-+]/)[0];

  const parts = cleaned.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length === 0 || parts.some((part) => Number.isNaN(part))) return null;

  // Strip trailing zero segments so "0.1.88.0" === "0.1.88".
  while (parts.length > 1 && parts[parts.length - 1] === 0) {
    parts.pop();
  }

  return parts;
}

/**
 * Compares two version strings ignoring formatting differences (leading "v",
 * trailing ".0", build metadata). Returns:
 * - 1 if `a` is newer than `b`
 * - -1 if `a` is older than `b`
 * - 0 if they are equal (or either cannot be parsed and the raw strings match)
 */
export function compareVersions(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const segmentsA = parseVersionSegments(a);
  const segmentsB = parseVersionSegments(b);

  if (segmentsA === null || segmentsB === null) {
    // Fall back to a case-insensitive trimmed string comparison.
    const rawA = a?.trim().toLowerCase() ?? "";
    const rawB = b?.trim().toLowerCase() ?? "";
    return rawA === rawB ? 0 : rawA < rawB ? -1 : 1;
  }

  const length = Math.max(segmentsA.length, segmentsB.length);
  for (let i = 0; i < length; i++) {
    const segA = segmentsA[i] ?? 0;
    const segB = segmentsB[i] ?? 0;
    if (segA > segB) return 1;
    if (segA < segB) return -1;
  }

  return 0;
}

/** Returns true when two version strings are equal ignoring formatting differences. */
export function versionsEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  return compareVersions(a, b) === 0;
}

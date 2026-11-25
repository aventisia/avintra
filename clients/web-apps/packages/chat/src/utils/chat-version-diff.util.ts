import { diffLines } from "diff";

export type VersionDiffRow = {
  kind: "same" | "removed" | "added" | "changed";
  left: { line: number; text: string } | null;
  right: { line: number; text: string } | null;
};

export const MAX_COMPARE_LENGTH = 1_048_576;
const MAX_DIFF_MS = 1000;

const toLines = (value: string) => {
  const lines = value.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
};

const normalizeText = (text: string) => {
  const unix = text.replace(/\r\n/g, "\n");
  return unix === "" || unix.endsWith("\n") ? unix : `${unix}\n`;
};

/** Pairs two texts line by line for a side-by-side view; a changed block lines up its removed and added lines. Gives null when the rewrite is too heavy to diff. */
export const diffVersionTexts = (left: string, right: string): VersionDiffRow[] | null => {
  const parts = diffLines(normalizeText(left), normalizeText(right), { timeout: MAX_DIFF_MS });
  if (!parts) return null;
  const rows: VersionDiffRow[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (!part.removed && !part.added) {
      for (const text of toLines(part.value)) {
        rows.push({
          kind: "same",
          left: { line: leftLine++, text },
          right: { line: rightLine++, text },
        });
      }
      continue;
    }

    const removed = part.removed ? toLines(part.value) : [];
    const following = parts[index + 1];
    const pairsWithAdded = part.removed && following?.added;
    const added = part.added ? toLines(part.value) : pairsWithAdded ? toLines(following.value) : [];
    if (pairsWithAdded) index++;

    for (let offset = 0; offset < Math.max(removed.length, added.length); offset++) {
      const leftText = removed[offset];
      const rightText = added[offset];
      rows.push({
        kind:
          leftText !== undefined && rightText !== undefined
            ? "changed"
            : leftText !== undefined
              ? "removed"
              : "added",
        left: leftText !== undefined ? { line: leftLine++, text: leftText } : null,
        right: rightText !== undefined ? { line: rightLine++, text: rightText } : null,
      });
    }
  }
  return rows;
};

export const isTooLargeToCompare = (left: string, right: string) =>
  left.length > MAX_COMPARE_LENGTH || right.length > MAX_COMPARE_LENGTH;

/** Versions in ascending version-number order, leaving the input untouched. */
export const sortVersions = <T extends { versionNumber: number }>(versions: readonly T[]): T[] =>
  [...versions].sort((a, b) => a.versionNumber - b.versionNumber);

/** The versions a Compare opens with: the active one against the one before it (the lowest against the next). */
export const defaultComparePair = (
  versions: readonly { id: string; versionNumber: number }[],
  activeId: string,
): { leftId: string; rightId: string } | null => {
  const sorted = sortVersions(versions);
  const index = sorted.findIndex((version) => version.id === activeId);
  if (sorted.length < 2 || index < 0) return null;
  return index === 0
    ? { leftId: sorted[0].id, rightId: sorted[1].id }
    : { leftId: sorted[index - 1].id, rightId: sorted[index].id };
};

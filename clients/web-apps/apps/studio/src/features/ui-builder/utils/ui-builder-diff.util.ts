/** One line of a unified diff. */
export type UiBuilderDiffLine = {
  kind: "context" | "added" | "removed" | "gap";
  text: string;
  oldNumber?: number;
  newNumber?: number;
};

/** A line diff between two texts, or `tooLarge` when they differ too much to diff cheaply. */
export type UiBuilderDiff = {
  lines: UiBuilderDiffLine[];
  added: number;
  removed: number;
  tooLarge: boolean;
};

const MAX_EDIT_DISTANCE = 4000;
const CONTEXT_LINES = 3;

type Edit = { kind: "context" | "added" | "removed"; oldIndex: number; newIndex: number };

const myersEdits = (before: string[], after: string[]): Edit[] | null => {
  const total = before.length + after.length;
  const offset = total + 1;
  let frontier = new Int32Array(2 * total + 3);
  const trace: Int32Array[] = [];

  for (let distance = 0; distance <= Math.min(total, MAX_EDIT_DISTANCE); distance += 1) {
    trace.push(frontier.slice());
    for (let diagonal = -distance; diagonal <= distance; diagonal += 2) {
      const goDown =
        diagonal === -distance ||
        (diagonal !== distance &&
          frontier[offset + diagonal - 1] < frontier[offset + diagonal + 1]);
      let x = goDown ? frontier[offset + diagonal + 1] : frontier[offset + diagonal - 1] + 1;
      let y = x - diagonal;
      while (x < before.length && y < after.length && before[x] === after[y]) {
        x += 1;
        y += 1;
      }
      frontier[offset + diagonal] = x;
      if (x >= before.length && y >= after.length) {
        return backtrack(trace, before.length, after.length, offset);
      }
    }
    frontier = frontier.slice();
  }
  return null;
};

const backtrack = (
  trace: Int32Array[],
  beforeLength: number,
  afterLength: number,
  offset: number,
) => {
  const edits: Edit[] = [];
  let x = beforeLength;
  let y = afterLength;
  for (let distance = trace.length - 1; distance >= 0; distance -= 1) {
    const frontier = trace[distance];
    const diagonal = x - y;
    const goDown =
      diagonal === -distance ||
      (diagonal !== distance && frontier[offset + diagonal - 1] < frontier[offset + diagonal + 1]);
    const previousDiagonal = goDown ? diagonal + 1 : diagonal - 1;
    const previousX = frontier[offset + previousDiagonal];
    const previousY = previousX - previousDiagonal;
    while (x > previousX && y > previousY) {
      x -= 1;
      y -= 1;
      edits.push({ kind: "context", oldIndex: x, newIndex: y });
    }
    if (distance > 0) {
      if (goDown) edits.push({ kind: "added", oldIndex: x, newIndex: previousY });
      else edits.push({ kind: "removed", oldIndex: previousX, newIndex: y });
    }
    x = previousX;
    y = previousY;
  }
  return edits.reverse();
};

/** Computes a unified line diff with three lines of context around each change. */
export const diffUiBuilderSources = (before: string, after: string): UiBuilderDiff => {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const edits = myersEdits(beforeLines, afterLines);
  if (!edits) return { lines: [], added: 0, removed: 0, tooLarge: true };

  const changed = edits.map((edit) => edit.kind !== "context");
  const keep = edits.map((_, index) => {
    for (let near = index - CONTEXT_LINES; near <= index + CONTEXT_LINES; near += 1) {
      if (changed[near]) return true;
    }
    return false;
  });

  const lines: UiBuilderDiffLine[] = [];
  let added = 0;
  let removed = 0;
  edits.forEach((edit, index) => {
    if (edit.kind === "added") added += 1;
    if (edit.kind === "removed") removed += 1;
    if (!keep[index]) {
      if (lines[lines.length - 1]?.kind !== "gap") lines.push({ kind: "gap", text: "" });
      return;
    }
    lines.push({
      kind: edit.kind,
      text: edit.kind === "added" ? afterLines[edit.newIndex] : beforeLines[edit.oldIndex],
      oldNumber: edit.kind === "added" ? undefined : edit.oldIndex + 1,
      newNumber: edit.kind === "removed" ? undefined : edit.newIndex + 1,
    });
  });

  return { lines: added + removed === 0 ? [] : lines, added, removed, tooLarge: false };
};

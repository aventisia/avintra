/** One targeted replacement returned by the model in edit mode. */
export type UiBuilderEditBlock = {
  search: string;
  replace: string;
};

/** Outcome of applying edit blocks to the current code. */
export type UiBuilderEditApplyResult = {
  code: string;
  applied: number;
  failures: string[];
};

const SEARCH_MARKER = /^<{5,9} ?SEARCH\s*$/;
const DIVIDER_MARKER = /^={5,9}\s*$/;
const REPLACE_MARKER = /^>{5,9} ?REPLACE\s*$/;

/** Returns whether the output contains at least one SEARCH/REPLACE edit block. */
export const hasUiBuilderEditBlocks = (output: string) =>
  output.split("\n").some((line) => SEARCH_MARKER.test(line.trim()));

/** Parses SEARCH/REPLACE edit blocks; text outside blocks is ignored. */
export const parseUiBuilderEditBlocks = (output: string): UiBuilderEditBlock[] => {
  const blocks: UiBuilderEditBlock[] = [];
  let mode: "outside" | "search" | "replace" = "outside";
  let search: string[] = [];
  let replace: string[] = [];

  for (const line of output.replace(/\r\n/g, "\n").split("\n")) {
    const marker = line.trim();
    if (mode === "outside") {
      if (SEARCH_MARKER.test(marker)) {
        mode = "search";
        search = [];
        replace = [];
      }
    } else if (mode === "search") {
      if (DIVIDER_MARKER.test(marker)) mode = "replace";
      else search.push(line);
    } else if (REPLACE_MARKER.test(marker)) {
      blocks.push({ search: search.join("\n"), replace: replace.join("\n") });
      mode = "outside";
    } else {
      replace.push(line);
    }
  }

  return blocks;
};

const toLineRanges = (code: string) => {
  const ranges: { start: number; end: number; text: string }[] = [];
  let start = 0;
  for (const text of code.split("\n")) {
    ranges.push({ start, end: start + text.length, text });
    start += text.length + 1;
  }
  return ranges;
};

const findWhitespaceTolerantRange = (code: string, search: string) => {
  const wanted = search
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (wanted.length === 0) return null;

  const lines = toLineRanges(code);
  const matches: { start: number; end: number }[] = [];
  for (let first = 0; first < lines.length; first += 1) {
    let cursor = first;
    let matched = 0;
    while (cursor < lines.length && matched < wanted.length) {
      const trimmed = lines[cursor].text.trim();
      if (!trimmed && cursor > first) {
        cursor += 1;
        continue;
      }
      if (trimmed !== wanted[matched]) break;
      matched += 1;
      cursor += 1;
    }
    if (matched === wanted.length) {
      matches.push({ start: lines[first].start, end: lines[cursor - 1].end });
      if (matches.length > 1) return null;
    }
  }
  return matches[0] ?? null;
};

const describeBlock = (block: UiBuilderEditBlock) => {
  const firstLine = block.search.split("\n").find((line) => line.trim()) ?? "";
  return firstLine.trim().slice(0, 120);
};

/**
 * Applies edit blocks in order. Each SEARCH must match exactly one place, first verbatim and then
 * ignoring indentation; blocks that match nowhere or more than once are reported as failures.
 */
export const applyUiBuilderEditBlocks = (
  code: string,
  blocks: UiBuilderEditBlock[],
): UiBuilderEditApplyResult => {
  let next = code.replace(/\r\n/g, "\n");
  let applied = 0;
  const failures: string[] = [];

  for (const block of blocks) {
    if (!block.search.trim()) {
      failures.push("An edit block had an empty SEARCH section.");
      continue;
    }

    const exactIndex = next.indexOf(block.search);
    if (exactIndex !== -1 && next.indexOf(block.search, exactIndex + 1) === -1) {
      next = `${next.slice(0, exactIndex)}${block.replace}${next.slice(exactIndex + block.search.length)}`;
      applied += 1;
      continue;
    }

    const range = exactIndex === -1 ? findWhitespaceTolerantRange(next, block.search) : null;
    if (range) {
      next = `${next.slice(0, range.start)}${block.replace}${next.slice(range.end)}`;
      applied += 1;
      continue;
    }

    failures.push(
      exactIndex === -1
        ? `SEARCH text not found: "${describeBlock(block)}"`
        : `SEARCH text matches more than one place: "${describeBlock(block)}"`,
    );
  }

  return { code: next, applied, failures };
};

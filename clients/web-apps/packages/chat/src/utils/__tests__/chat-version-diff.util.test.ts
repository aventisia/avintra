import { describe, expect, it } from "vitest";

import {
  MAX_COMPARE_LENGTH,
  defaultComparePair,
  diffVersionTexts,
  isTooLargeToCompare,
} from "../chat-version-diff.util";

const diffRows = (left: string, right: string) => diffVersionTexts(left, right)!;

describe("diffVersionTexts", () => {
  it("gives only same rows for identical texts", () => {
    const rows = diffRows("a\nb\n", "a\nb\n");
    expect(rows.map((row) => row.kind)).toEqual(["same", "same"]);
    expect(rows.map((row) => row.left?.line)).toEqual([1, 2]);
    expect(rows.map((row) => row.right?.line)).toEqual([1, 2]);
  });

  it("pairs a removed and an added line as one changed row", () => {
    const rows = diffRows("<b>\ncolor: red\n</b>\n", "<b>\ncolor: blue\n</b>\n");
    expect(rows.map((row) => row.kind)).toEqual(["same", "changed", "same"]);
    expect(rows[1]).toEqual({
      kind: "changed",
      left: { line: 2, text: "color: red" },
      right: { line: 2, text: "color: blue" },
    });
  });

  it("gives an added line no left side", () => {
    const rows = diffRows("a\n", "a\nb\n");
    expect(rows[1]).toEqual({ kind: "added", left: null, right: { line: 2, text: "b" } });
  });

  it("gives a removed line no right side", () => {
    const rows = diffRows("a\nb\n", "a\n");
    expect(rows[1]).toEqual({ kind: "removed", left: { line: 2, text: "b" }, right: null });
  });

  it("pads the shorter side of an uneven change", () => {
    const rows = diffRows("x\n", "y\nz\n");
    expect(rows.map((row) => row.kind)).toEqual(["changed", "added"]);
    expect(rows[1].right).toEqual({ line: 2, text: "z" });
  });

  it("treats CRLF and LF as the same text", () => {
    const rows = diffRows("a\r\nb\r\n", "a\nb\n");
    expect(rows.map((row) => row.kind)).toEqual(["same", "same"]);
  });

  it("gives an empty text against two lines two added rows and nothing for two empties", () => {
    expect(diffRows("", "a\nb\n").map((row) => row.kind)).toEqual(["added", "added"]);
    expect(diffRows("", "")).toEqual([]);
  });

  it("does not mark an unchanged last line as changed when only one text ends with a newline", () => {
    const rows = diffRows("Apple\nMango", "Apple\nBanana\nMango\n");
    expect(rows.map((row) => row.kind)).toEqual(["same", "added", "same"]);
    expect(rows[2]).toEqual({
      kind: "same",
      left: { line: 2, text: "Mango" },
      right: { line: 3, text: "Mango" },
    });
  });

  it("keeps the last line of a text without a trailing newline", () => {
    const rows = diffRows("a\nb", "a\nb");
    expect(rows.map((row) => row.kind)).toEqual(["same", "same"]);
    expect(rows[1].left?.text).toBe("b");
  });
});

describe("diffVersionTexts on heavy rewrites", () => {
  it("gives up with null when every line of a large text changed", () => {
    const lines = (prefix: string) =>
      Array.from({ length: 12_000 }, (_, index) => `${prefix} row ${index} ${"x".repeat(20)}`).join(
        "\n",
      );
    const startedAt = Date.now();
    expect(diffVersionTexts(lines("old"), lines("new"))).toBeNull();
    expect(Date.now() - startedAt).toBeLessThan(4000);
  }, 20_000);
});

describe("isTooLargeToCompare", () => {
  it("allows texts up to the limit and refuses longer ones", () => {
    const atLimit = "a".repeat(MAX_COMPARE_LENGTH);
    expect(isTooLargeToCompare(atLimit, atLimit)).toBe(false);
    expect(isTooLargeToCompare(atLimit + "a", "x")).toBe(true);
    expect(isTooLargeToCompare("x", atLimit + "a")).toBe(true);
  });
});

describe("defaultComparePair", () => {
  const versions = [
    { id: "a", versionNumber: 1 },
    { id: "b", versionNumber: 2 },
    { id: "c", versionNumber: 3 },
  ];

  it("compares the active version with the one before it", () => {
    expect(defaultComparePair(versions, "c")).toEqual({ leftId: "b", rightId: "c" });
    expect(defaultComparePair(versions, "b")).toEqual({ leftId: "a", rightId: "b" });
  });

  it("compares the lowest version with the next one", () => {
    expect(defaultComparePair(versions, "a")).toEqual({ leftId: "a", rightId: "b" });
  });

  it("sorts versions given out of order", () => {
    expect(defaultComparePair([versions[2], versions[0], versions[1]], "c")).toEqual({
      leftId: "b",
      rightId: "c",
    });
  });

  it("gives nothing for fewer than two versions or an unknown active id", () => {
    expect(defaultComparePair([versions[0]], "a")).toBeNull();
    expect(defaultComparePair(versions, "zzz")).toBeNull();
  });
});

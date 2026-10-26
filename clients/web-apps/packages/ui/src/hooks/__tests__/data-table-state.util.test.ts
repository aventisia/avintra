import { describe, expect, it } from "vitest";

import {
  applyPaginationChange,
  clampPageIndex,
  resetPageIndex,
  resolveUpdater,
  stableRows,
} from "../data-table-state.util";

describe("resolveUpdater", () => {
  it("returns a plain value as is", () => {
    expect(resolveUpdater(5, 1)).toBe(5);
  });

  it("applies a function updater to the previous value", () => {
    expect(resolveUpdater((previous: number) => previous + 1, 1)).toBe(2);
  });
});

describe("applyPaginationChange", () => {
  it("keeps the requested page when only the page changes", () => {
    const previous = { pageIndex: 1, pageSize: 50 };
    const next = { pageIndex: 2, pageSize: 50 };

    expect(applyPaginationChange(previous, next)).toEqual(next);
  });

  it("returns to the first page when the page size changes", () => {
    expect(
      applyPaginationChange({ pageIndex: 3, pageSize: 50 }, { pageIndex: 3, pageSize: 100 }),
    ).toEqual({ pageIndex: 0, pageSize: 100 });
  });
});

describe("resetPageIndex", () => {
  it("sets the first page and keeps the page size", () => {
    expect(resetPageIndex({ pageIndex: 4, pageSize: 25 })).toEqual({ pageIndex: 0, pageSize: 25 });
  });
});

describe("clampPageIndex", () => {
  it("returns the same object when the page is in range", () => {
    const pagination = { pageIndex: 1, pageSize: 50 };

    expect(clampPageIndex(pagination, 3)).toBe(pagination);
  });

  it("clamps to the last page when the rows shrink", () => {
    expect(clampPageIndex({ pageIndex: 4, pageSize: 50 }, 2)).toEqual({
      pageIndex: 1,
      pageSize: 50,
    });
  });

  it("clamps to the first page when there are no pages", () => {
    expect(clampPageIndex({ pageIndex: 0, pageSize: 50 }, 0)).toEqual({
      pageIndex: 0,
      pageSize: 50,
    });
    expect(clampPageIndex({ pageIndex: 2, pageSize: 50 }, 0).pageIndex).toBe(0);
  });
});

describe("stableRows", () => {
  it("gives every empty inline fallback the same identity", () => {
    expect(stableRows([])).toBe(stableRows([]));
  });

  it("returns non-empty rows unchanged", () => {
    const rows = [{ id: "a1" }];

    expect(stableRows(rows)).toBe(rows);
  });
});

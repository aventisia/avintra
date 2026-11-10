import { describe, expect, it } from "vitest";

import { groupHistoryByDate } from "../history-groups.util";

const now = new Date(2026, 10, 10, 9, 30);
const at = (id: string, date: Date) => ({ id, title: id, lastModifiedOn: date.toISOString() });

describe("groupHistoryByDate", () => {
  it("buckets by local calendar day, keeping the given order", () => {
    const groups = groupHistoryByDate(
      [
        at("a", new Date(2026, 10, 10, 0, 5)),
        at("b", new Date(2026, 10, 9, 23, 55)),
        at("c", new Date(2026, 10, 9, 0, 1)),
        at("d", new Date(2026, 10, 8, 22, 0)),
        at("e", new Date(2026, 10, 4, 12, 0)),
        at("f", new Date(2026, 10, 3, 12, 0)),
      ],
      now,
    );
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ["Today", ["a"]],
      ["Yesterday", ["b", "c"]],
      ["Last 7 days", ["d", "e"]],
      ["Older", ["f"]],
    ]);
  });

  it("counts a timestamp slightly ahead of the clock as today", () => {
    expect(groupHistoryByDate([at("a", new Date(2026, 10, 10, 9, 31))], now)[0]?.label).toBe(
      "Today",
    );
  });

  it("returns no groups for no history", () => {
    expect(groupHistoryByDate([], now)).toEqual([]);
  });
});

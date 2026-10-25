import { type ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";

import { matchesFilterValue, withTableCNFilterFns } from "../utils/table-cn-filters.util";

const OCT_23 = new Date(2026, 9, 23).getTime();
const OCT_25 = new Date(2026, 9, 25).getTime();

describe("matchesFilterValue", () => {
  it("matches text case-insensitively, ignoring surrounding spaces", () => {
    expect(matchesFilterValue("text", "Billing Agent", " agent ")).toBe(true);
    expect(matchesFilterValue("text", "Billing Agent", "support")).toBe(false);
  });

  it("matches numbers exactly", () => {
    expect(matchesFilterValue("number", 42, "42")).toBe(true);
    expect(matchesFilterValue("number", null, "0")).toBe(false);
  });

  it("matches a date anywhere within the chosen day", () => {
    const evening = new Date(2026, 9, 23, 21, 30).toISOString();

    expect(matchesFilterValue("date", evening, OCT_23)).toBe(true);
    expect(matchesFilterValue("date", evening, OCT_25)).toBe(false);
  });

  it("includes both end days of a date range", () => {
    const lastDayEvening = new Date(2026, 9, 25, 23, 0);

    expect(matchesFilterValue("dateRange", lastDayEvening, [OCT_23, OCT_25])).toBe(true);
    expect(matchesFilterValue("dateRange", "2026-10-22", [OCT_23, undefined])).toBe(false);
  });

  it("matches any selected option, including array cells", () => {
    expect(matchesFilterValue("multiSelect", "chat", ["api", "chat"])).toBe(true);
    expect(matchesFilterValue("multiSelect", ["web", "api"], ["api"])).toBe(true);
    expect(matchesFilterValue("select", "web", ["api"])).toBe(false);
  });

  it("passes every row when the filter is empty", () => {
    expect(matchesFilterValue("select", "web", [])).toBe(true);
  });
});

describe("withTableCNFilterFns", () => {
  type Item = { name: string; type: string };

  const customFilterFn = () => true;
  const columns: ColumnDef<Item>[] = [
    { accessorKey: "name", meta: { variant: "text" } },
    { accessorKey: "type", meta: { variant: "select" }, filterFn: customFilterFn },
    {
      header: "Group",
      columns: [{ accessorKey: "type", id: "nested", meta: { variant: "select" } }],
    },
    { id: "plain", accessorFn: (item) => item.name },
  ];

  const [name, type, group, plain] = withTableCNFilterFns(columns);

  it("adds a filter function to columns with a variant", () => {
    expect(typeof name.filterFn).toBe("function");
    expect(plain.filterFn).toBeUndefined();
  });

  it("keeps a column's own filter function", () => {
    expect(type.filterFn).toBe(customFilterFn);
  });

  it("handles grouped columns", () => {
    const [nested] = "columns" in group && group.columns ? group.columns : [];
    expect(typeof nested?.filterFn).toBe("function");
  });
});

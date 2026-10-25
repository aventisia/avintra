import type { ColumnDef, ColumnSort, Table } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { type UseDataTableOptions, useDataTable } from "../useDataTable";

interface Item {
  id: string;
  name: string;
}

const ITEMS: Item[] = [
  { id: "a1", name: "Charlie" },
  { id: "a2", name: "Alice" },
  { id: "a3", name: "Bob" },
];

const COLUMNS: ColumnDef<Item>[] = [{ accessorKey: "name", id: "name" }];

const getItemRowId = (item: Item) => `agent:${item.id}`;

const captureTable = (
  sortState: ColumnSort[] | undefined,
  options?: UseDataTableOptions<Item>,
  enableRowSelection?: boolean,
) => {
  let captured: Table<Item> | undefined;

  const Probe = () => {
    captured = useDataTable(COLUMNS, ITEMS, {}, sortState, enableRowSelection, undefined, options);
    return null;
  };

  renderToStaticMarkup(<Probe />);

  if (!captured) throw new Error("Table was not captured");
  return captured;
};

const rowIds = (table: Table<Item>) => table.getRowModel().rows.map((row) => row.id);

describe("useDataTable render", () => {
  it("uses the supplied row identity", () => {
    const table = captureTable(undefined, { getRowId: getItemRowId });

    expect(rowIds(table)).toEqual(["agent:a1", "agent:a2", "agent:a3"]);
  });

  it("stops auto page reset and starts on the first page with keepPageOnDataChange", () => {
    const table = captureTable(undefined, { keepPageOnDataChange: true });

    expect(table.options.autoResetPageIndex).toBe(false);
    expect(table.getState().pagination).toEqual({ pageIndex: 0, pageSize: 50 });
  });

  it("keeps today's behaviour without options", () => {
    const table = captureTable(undefined, undefined, true);

    expect(rowIds(table)).toEqual(["0", "1", "2"]);
    expect(table.options.autoResetPageIndex).toBeUndefined();
    expect(table.getState().globalFilter).toBeUndefined();
    expect(table.getRowModel().rows.every((row) => row.getCanSelect())).toBe(true);
  });
});

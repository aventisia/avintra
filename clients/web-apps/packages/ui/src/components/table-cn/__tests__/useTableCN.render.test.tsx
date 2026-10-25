import { type ColumnDef, type Table } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { type UseTableCNOptions, useTableCN } from "../hooks/useTableCN.hook";

type Agent = {
  id: string;
  name: string;
  type: string;
  owner: string;
};

const AGENTS: Agent[] = Array.from({ length: 25 }, (_, index) => ({
  id: `a${index + 1}`,
  name: `Agent ${String(index + 1).padStart(2, "0")}`,
  type: index % 2 === 0 ? "chat" : "api",
  owner: index < 5 ? "Ana" : "Ben",
}));

const COLUMNS: ColumnDef<Agent>[] = [
  { accessorKey: "name" },
  { accessorKey: "type", meta: { variant: "multiSelect" } },
  { accessorKey: "owner" },
];

type CaptureOptions = Partial<UseTableCNOptions<Agent>>;

const captureTable = (url: string, options: CaptureOptions = {}) => {
  let captured: Table<Agent> | undefined;

  const Probe = () => {
    captured = useTableCN<Agent>({
      data: AGENTS,
      columns: COLUMNS,
      getRowId: (agent) => agent.id,
      ...options,
    }).table;
    return null;
  };

  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <Probe />
    </MemoryRouter>,
  );

  if (!captured) throw new Error("Table was not captured");
  return captured;
};

const rowIds = (table: Table<Agent>) => table.getRowModel().rows.map((row) => row.id);

describe("useTableCN render", () => {
  it("starts on the first page with the default page size", () => {
    const table = captureTable("/agents");

    expect(table.getState().pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(rowIds(table)).toHaveLength(10);
  });

  it("reads the page, page size, and sorting from the URL", () => {
    const table = captureTable("/agents?page=2&perPage=5&sort=name.desc");

    expect(table.getState().pagination).toEqual({ pageIndex: 1, pageSize: 5 });
    expect(rowIds(table)).toEqual(["a20", "a19", "a18", "a17", "a16"]);
  });

  it("uses renamed query keys", () => {
    const table = captureTable("/agents?p=3&page=1", { queryKeys: { page: "p" } });

    expect(table.getState().pagination.pageIndex).toBe(2);
  });

  it("falls back to the initial sorting when the URL sorting is unknown", () => {
    const table = captureTable("/agents?sort=missing.asc", {
      initialState: { sorting: [{ id: "name", desc: true }] },
    });

    expect(table.getState().sorting).toEqual([{ id: "name", desc: true }]);
  });

  it("reads an empty sort parameter as no sorting", () => {
    const table = captureTable("/agents?sort=", {
      initialState: { sorting: [{ id: "name", desc: true }] },
    });

    expect(table.getState().sorting).toEqual([]);
  });

  it("filters rows on the client from the URL column filters", () => {
    const table = captureTable("/agents?type=api&perPage=50");

    expect(table.getState().columnFilters).toEqual([{ id: "type", value: ["api"] }]);
    expect(table.getFilteredRowModel().rows).toHaveLength(12);
    expect(table.getColumn("type")?.getFacetedUniqueValues().get("chat")).toBe(13);
  });

  it("uses the initial column filters when the URL has none", () => {
    const table = captureTable("/agents", {
      initialState: { columnFilters: [{ id: "type", value: ["chat"] }] },
    });

    expect(table.getFilteredRowModel().rows).toHaveLength(13);
  });

  it("limits the global search to the search columns", () => {
    const table = captureTable("/agents", { searchColumns: ["name"], globalFilter: "ana" });
    expect(table.getFilteredRowModel().rows).toHaveLength(0);

    const unrestricted = captureTable("/agents", { globalFilter: "ana" });
    expect(unrestricted.getFilteredRowModel().rows).toHaveLength(5);
  });

  it("ignores a search of only spaces", () => {
    const table = captureTable("/agents?page=3", { searchColumns: ["name"], globalFilter: "  " });

    expect(table.getFilteredRowModel().rows).toHaveLength(25);
    expect(table.getState().pagination.pageIndex).toBe(2);
  });
});

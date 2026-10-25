import { type ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";

import { getTableCNColumnIndex } from "../utils/table-cn-column-index.util";
import {
  getColumnFiltersKey,
  getFilterParamsKey,
  parsePositiveIntegerParam,
  parseSortingParam,
  readColumnFilters,
  serializeSorting,
  writeColumnFilters,
} from "../utils/table-cn-url.util";

type Item = {
  name: string;
  type: string;
  owner: { email: string };
  createdOn: string;
};

const COLUMNS: ColumnDef<Item>[] = [
  { id: "select", header: "Select" },
  { accessorKey: "name", meta: { variant: "text" } },
  { accessorKey: "type", meta: { variant: "multiSelect" }, enableSorting: false },
  { accessorKey: "owner.email" },
  {
    header: "Dates",
    columns: [{ accessorKey: "createdOn", meta: { variant: "dateRange" } }],
  },
  { id: "hidden", accessorFn: () => "", meta: { variant: "text" }, enableColumnFilter: false },
];

const { filterVariants, sortableIds } = getTableCNColumnIndex(COLUMNS);

describe("getTableCNColumnIndex", () => {
  it("finds filterable leaf columns with their variants", () => {
    expect([...filterVariants]).toEqual([
      ["name", "text"],
      ["type", "multiSelect"],
      ["createdOn", "dateRange"],
    ]);
  });

  it("finds sortable accessor columns, resolving nested accessor ids", () => {
    expect([...sortableIds]).toEqual(["name", "owner_email", "createdOn", "hidden"]);
  });
});

describe("parsePositiveIntegerParam", () => {
  it.each([
    ["3", 3],
    ["0", undefined],
    ["-1", undefined],
    ["2.5", undefined],
    ["abc", undefined],
    [null, undefined],
  ])("reads %j as %j", (value, expected) => {
    expect(parsePositiveIntegerParam(value)).toBe(expected);
  });
});

describe("sorting parameter", () => {
  it("round-trips the compact form", () => {
    const sorting = [
      { id: "name", desc: true },
      { id: "createdOn", desc: false },
    ];

    expect(serializeSorting(sorting)).toBe("name.desc,createdOn.asc");
    expect(parseSortingParam("name.desc,createdOn.asc", sortableIds)).toEqual(sorting);
  });

  it("uses JSON for ids that contain a comma", () => {
    const sorting = [{ id: "a,b", desc: false }];
    const param = serializeSorting(sorting);

    expect(param).toBe('[{"id":"a,b","desc":false}]');
    expect(parseSortingParam(param, new Set(["a,b"]))).toEqual(sorting);
  });

  it.each(["type.asc", "unknown.desc", "name", "name.up", "name.asc,name.desc", "[oops"])(
    "rejects %j",
    (param) => {
      expect(parseSortingParam(param, sortableIds)).toBeUndefined();
    },
  );
});

describe("column filter parameters", () => {
  it("reads only filterable columns and skips invalid values", () => {
    const params = new URLSearchParams(
      "name=bot&type=chat,api&createdOn=bad&hidden=x&page=2&owner_email=a",
    );

    expect(readColumnFilters(params, filterVariants)).toEqual([
      { id: "name", value: "bot" },
      { id: "type", value: ["chat", "api"] },
    ]);
  });

  it("writes filters, removes cleared ones, and leaves other parameters alone", () => {
    const params = new URLSearchParams("name=old&type=chat&tab=all");

    writeColumnFilters(params, [{ id: "type", value: ["api"] }], filterVariants);

    expect(params.toString()).toBe("type=api&tab=all");
  });

  it("keys the URL filters the same way as the filters that produced them", () => {
    const filters = [
      { id: "type", value: ["chat"] },
      { id: "name", value: "bot" },
    ];
    const params = new URLSearchParams("tab=all&type=chat&name=bot");

    expect(getColumnFiltersKey(filters, filterVariants)).toBe(
      getFilterParamsKey(params, filterVariants),
    );
  });
});

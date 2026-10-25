import { type ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";

import {
  getTableCNColumnIndex,
  withoutHiddenAlwaysVisibleColumns,
} from "../utils/table-cn-column-index.util";

type Agent = { name: string };

const COLUMNS: ColumnDef<Agent>[] = [
  { id: "select", enableHiding: false },
  { accessorKey: "name" },
  { id: "actions", enableHiding: false },
];

describe("always visible columns", () => {
  const { alwaysVisibleIds } = getTableCNColumnIndex(COLUMNS);

  it("lists the columns that cannot be hidden", () => {
    expect([...alwaysVisibleIds]).toEqual(["select", "actions"]);
  });

  it("drops saved entries that hide them and keeps the rest", () => {
    expect(
      withoutHiddenAlwaysVisibleColumns(
        { select: false, name: false, actions: true },
        alwaysVisibleIds,
      ),
    ).toEqual({ name: false, actions: true });
  });
});

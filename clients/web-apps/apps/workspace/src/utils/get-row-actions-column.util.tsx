import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { type CellContext, type ColumnDef, type DisplayColumnDef } from "@tanstack/react-table";
import { type ReactNode } from "react";

type GetRowActionsColumnOptions<TData> = Omit<
  Partial<DisplayColumnDef<TData, unknown>>,
  "id" | "header" | "cell"
> & {
  actions: (context: CellContext<TData, unknown>) => ReactNode;
};

/**
 * Actions column whose cell is the row's own action control, so one click reaches the actions.
 *
 * Use it with a control that already renders its own trigger, such as a `*RowActions` dropdown.
 * `getTableCNActionsColumn` wraps the cell in a menu instead, and is for a plain list of items.
 * Pin it with `initialState.columnPinning: { right: ["actions"] }`.
 */
export const getRowActionsColumn = <TData,>({
  actions,
  size = 48,
  enableHiding = false,
  enableSorting = false,
  meta = { headerClassName: "pl-1 pr-3", cellClassName: "pl-1 pr-3" },
  ...overrides
}: GetRowActionsColumnOptions<TData>): ColumnDef<TData> => ({
  id: TABLE_CN_ACTIONS_COLUMN_ID,
  header: () => <span className="sr-only">Actions</span>,
  cell: actions,
  size,
  enableHiding,
  enableSorting,
  meta,
  ...overrides,
});

import {
  type CellContext,
  type ColumnDef,
  type DisplayColumnDef,
  type Row,
} from "@tanstack/react-table";
import { type ReactNode } from "react";

import {
  TABLE_CN_ACTIONS_COLUMN_ID,
  TABLE_CN_SELECT_COLUMN_ID,
} from "../constants/table-cn.constant";
import { TableCNRowActionsMenu } from "./TableCNRowActionsMenu";
import { TableCNSelectAllCheckbox, TableCNSelectRowCheckbox } from "./TableCNSelectCheckbox";

type TableCNColumnOverrides<TData> = Omit<
  Partial<DisplayColumnDef<TData, unknown>>,
  "id" | "header" | "cell"
>;

/**
 * Checkbox column for row selection with Shift+click range selection; it cannot be sorted or
 * hidden unless overridden.
 */
export const getTableCNSelectColumn = <TData,>({
  size = 32,
  enableHiding = false,
  enableSorting = false,
  meta,
  ...overrides
}: TableCNColumnOverrides<TData> = {}): ColumnDef<TData> => ({
  id: TABLE_CN_SELECT_COLUMN_ID,
  header: ({ table }) => <TableCNSelectAllCheckbox table={table} />,
  cell: ({ row, table }) => <TableCNSelectRowCheckbox table={table} row={row} />,
  size,
  enableHiding,
  enableSorting,
  meta: { headerClassName: "pr-0", cellClassName: "pr-0", ...meta },
  ...overrides,
});

type TableCNActionsColumnOptions<TData> = TableCNColumnOverrides<TData> & {
  /** Menu items for the row, e.g. `DropdownMenuItem`s. */
  actions: (context: CellContext<TData, unknown>) => ReactNode;
  getAriaLabel?: (row: Row<TData>) => string;
  menuClassName?: string;
};

/**
 * Row actions menu column. Pin it with `initialState.columnPinning: { right: ["actions"] }`
 * to keep it visible while the table scrolls sideways.
 */
export const getTableCNActionsColumn = <TData,>({
  actions,
  getAriaLabel = (row) => `Open actions for row ${row.index + 1}`,
  menuClassName,
  size = 48,
  enableHiding = false,
  enableSorting = false,
  meta = { headerClassName: "pl-1 pr-3", cellClassName: "pl-1 pr-3" },
  ...overrides
}: TableCNActionsColumnOptions<TData>): ColumnDef<TData> => ({
  id: TABLE_CN_ACTIONS_COLUMN_ID,
  header: () => <span className="sr-only">Actions</span>,
  cell: (context) => (
    <TableCNRowActionsMenu ariaLabel={getAriaLabel(context.row)} contentClassName={menuClassName}>
      {actions(context)}
    </TableCNRowActionsMenu>
  ),
  size,
  enableHiding,
  enableSorting,
  meta,
  ...overrides,
});

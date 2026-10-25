import { type ColumnDef, type VisibilityState } from "@tanstack/react-table";

import { type TableCNFilterVariant } from "../types/table-cn.type";

export type TableCNColumnIndex = {
  /** Filterable leaf column ids with their filter variant; each one owns a URL parameter. */
  filterVariants: ReadonlyMap<string, TableCNFilterVariant>;
  sortableIds: ReadonlySet<string>;
  /** Leaf column ids that cannot be hidden (`enableHiding: false`). */
  alwaysVisibleIds: ReadonlySet<string>;
};

const getColumnDefId = <TData, TValue>(column: ColumnDef<TData, TValue>) => {
  if (column.id) return column.id;
  if ("accessorKey" in column && column.accessorKey) {
    return String(column.accessorKey).replaceAll(".", "_");
  }
  return typeof column.header === "string" ? column.header : undefined;
};

const hasAccessor = <TData, TValue>(column: ColumnDef<TData, TValue>) =>
  "accessorKey" in column || "accessorFn" in column;

const getLeafColumns = <TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
): ColumnDef<TData, TValue>[] =>
  columns.flatMap((column) =>
    "columns" in column && column.columns ? getLeafColumns(column.columns) : [column],
  );

/**
 * Finds the filterable and sortable columns from their definitions, before the table exists,
 * so the URL state can be read for the table's first render.
 */
export const getTableCNColumnIndex = <TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
): TableCNColumnIndex => {
  const filterVariants = new Map<string, TableCNFilterVariant>();
  const sortableIds = new Set<string>();
  const alwaysVisibleIds = new Set<string>();

  for (const column of getLeafColumns(columns)) {
    const id = getColumnDefId(column);
    if (!id) continue;

    const variant = column.meta?.variant;
    if (variant && column.enableColumnFilter !== false) filterVariants.set(id, variant);
    if (hasAccessor(column) && column.enableSorting !== false) sortableIds.add(id);
    if (column.enableHiding === false) alwaysVisibleIds.add(id);
  }

  return { filterVariants, sortableIds, alwaysVisibleIds };
};

/**
 * Visibility without entries that would hide an always-visible column, e.g. one saved before the
 * column became unhideable.
 */
export const withoutHiddenAlwaysVisibleColumns = (
  columnVisibility: VisibilityState,
  alwaysVisibleIds: ReadonlySet<string>,
): VisibilityState =>
  Object.fromEntries(
    Object.entries(columnVisibility).filter(
      ([id, isVisible]) => isVisible || !alwaysVisibleIds.has(id),
    ),
  );

import { type Column, type Row, type Table, flexRender } from "@tanstack/react-table";
import type * as React from "react";

import { ScrollArea } from "@/ui/components/scroll";
import { cn } from "@/ui/lib";

import { TableCNPagination, type TableCNPaginationProps } from "./TableCNPagination";
import {
  TableCNCellElement,
  TableCNFrame,
  TableCNHeadElement,
  TableCNRowElement,
  TableCNTableElement,
} from "./primitives/TableCNElements";
import { getTableCNCellStyle, getTableCNPinnedCellClassName } from "./utils/table-cn-pinning.util";

const getAriaSort = <TData,>(column: Column<TData, unknown>): React.AriaAttributes["aria-sort"] => {
  const sortDirection = column.getIsSorted();
  if (!sortDirection) return undefined;
  return sortDirection === "desc" ? "descending" : "ascending";
};

const TableCNHeader = <TData,>({ table }: { table: Table<TData> }) => (
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableCNHeadElement
            key={header.id}
            colSpan={header.colSpan}
            aria-sort={getAriaSort(header.column)}
            className={cn(
              getTableCNPinnedCellClassName(header.column, "header"),
              header.column.columnDef.meta?.headerClassName,
            )}
            style={getTableCNCellStyle(header.column)}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TableCNHeadElement>
        ))}
      </tr>
    ))}
  </thead>
);

type TableCNBodyProps<TData> = {
  table: Table<TData>;
  emptyMessage: React.ReactNode;
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
};

const TableCNBody = <TData,>({ table, emptyMessage, getRowProps }: TableCNBodyProps<TData>) => {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <tbody>
        <TableCNRowElement className="hover:bg-background">
          <TableCNCellElement
            colSpan={table.getVisibleLeafColumns().length || 1}
            className="h-24 whitespace-normal text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </TableCNCellElement>
        </TableCNRowElement>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row) => (
        <TableCNRowElement
          key={row.id}
          data-state={row.getIsSelected() ? "selected" : undefined}
          {...getRowProps?.(row)}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCNCellElement
              key={cell.id}
              className={cn(
                getTableCNPinnedCellClassName(cell.column, "body"),
                cell.column.columnDef.meta?.cellClassName,
              )}
              style={getTableCNCellStyle(cell.column)}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCNCellElement>
          ))}
        </TableCNRowElement>
      ))}
    </tbody>
  );
};

type TableCNProps<TData> = React.ComponentProps<"div"> & {
  table: Table<TData>;
  /** Rendered after the table, e.g. a `TableCNActionBar` that shows while rows are selected. */
  actionBar?: React.ReactNode;
  /** Extra props for each body row, such as drag handlers. */
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
  emptyMessage?: React.ReactNode;
  paginationProps?: Omit<TableCNPaginationProps<TData>, "table">;
  /** Accessible name of the table element. */
  label?: string;
};

/**
 * Renders a `useTableCN` table: children (usually a `TableCNToolbar`), then a card holding the
 * table with sticky pinned columns and the pagination footer, then the action bar.
 */
export const TableCN = <TData,>({
  table,
  actionBar,
  getRowProps,
  emptyMessage = "No results.",
  paginationProps,
  label,
  children,
  className,
  ...props
}: TableCNProps<TData>) => (
  <div className={cn("flex w-full flex-col gap-3", className)} {...props}>
    {children}
    <TableCNFrame>
      <ScrollArea className="w-full" showHorizontalScrollbar showVerticalScrollbar={false}>
        <TableCNTableElement aria-label={label}>
          <TableCNHeader table={table} />
          <TableCNBody table={table} emptyMessage={emptyMessage} getRowProps={getRowProps} />
        </TableCNTableElement>
      </ScrollArea>
      <TableCNPagination
        table={table}
        {...paginationProps}
        className={cn(
          "border-t border-border bg-slate-50/60 px-4 py-1.5",
          paginationProps?.className,
        )}
      />
    </TableCNFrame>
    {actionBar}
  </div>
);

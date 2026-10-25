import { type Column, type Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import type * as React from "react";

import { Button } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

import { TableCNSearchInput } from "./TableCNSearchInput";
import { TableCNViewOptions } from "./TableCNViewOptions";
import { TableCNDateFilter } from "./filters/TableCNDateFilter";
import { TableCNFacetedFilter } from "./filters/TableCNFacetedFilter";
import { TableCNFilterInput } from "./filters/TableCNFilterInput";

const TableCNToolbarFilter = <TData,>({ column }: { column: Column<TData, unknown> }) => {
  const meta = column.columnDef.meta;
  const title = meta?.label ?? column.id;
  const placeholder = meta?.placeholder ?? title;

  switch (meta?.variant) {
    case "text":
      return (
        <TableCNFilterInput column={column} placeholder={placeholder} className="w-40 lg:w-56" />
      );
    case "number":
      return (
        <div className="relative">
          <TableCNFilterInput
            column={column}
            type="number"
            inputMode="numeric"
            placeholder={placeholder}
            className={cn("w-32", meta.unit && "pr-8")}
          />
          {meta.unit && (
            <span className="absolute bottom-0 right-0 top-0 flex items-center rounded-r-lg bg-slate-50 px-2 text-sm text-slate-500">
              {meta.unit}
            </span>
          )}
        </div>
      );
    case "date":
    case "dateRange":
      return (
        <TableCNDateFilter column={column} title={title} multiple={meta.variant === "dateRange"} />
      );
    case "select":
    case "multiSelect":
      return (
        <TableCNFacetedFilter
          column={column}
          title={title}
          options={meta.options ?? []}
          multiple={meta.variant === "multiSelect"}
        />
      );
    default:
      return null;
  }
};

type TableCNToolbarProps<TData> = React.ComponentProps<"div"> & {
  table: Table<TData>;
  /** Shows the global search first, with this placeholder. */
  searchPlaceholder?: string;
  withViewOptions?: boolean;
};

/**
 * Optional search, then filters for every column with a `meta.variant` and a reset button on
 * the left; children (e.g. a `TableCNSortMenu`) and the view options on the right.
 */
export const TableCNToolbar = <TData,>({
  table,
  searchPlaceholder,
  withViewOptions = true,
  children,
  className,
  ...props
}: TableCNToolbarProps<TData>) => {
  const filterColumns = table
    .getAllLeafColumns()
    .filter((column) => column.columnDef.meta?.variant && column.getCanFilter());
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className={cn("flex w-full items-start justify-between gap-2", className)} {...props}>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchPlaceholder !== undefined && (
          <TableCNSearchInput table={table} placeholder={searchPlaceholder} />
        )}
        {filterColumns.map((column) => (
          <TableCNToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            size="xs"
            className="h-8 gap-1.5 px-2.5 text-sm text-slate-500"
            onClick={() => table.resetColumnFilters(true)}
          >
            Reset
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {withViewOptions && <TableCNViewOptions table={table} />}
      </div>
    </div>
  );
};

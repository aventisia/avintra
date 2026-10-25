import type * as React from "react";

import { Skeleton } from "@/ui/components/Skeleton";
import { cn } from "@/ui/lib";

import {
  TableCNCellElement,
  TableCNFrame,
  TableCNHeadElement,
  TableCNRowElement,
  TableCNTableElement,
} from "./primitives/TableCNElements";

type TableCNSkeletonProps = React.ComponentProps<"div"> & {
  columnCount: number;
  rowCount?: number;
  /** Placeholders for toolbar filters on the left. */
  filterCount?: number;
  /** Cell widths, repeated across the columns. */
  cellWidths?: string[];
  withSearch?: boolean;
  withViewOptions?: boolean;
  withPagination?: boolean;
  /** Keeps cells from shrinking below their width. */
  shrinkZero?: boolean;
};

/**
 * Loading placeholder shaped like a TableCN toolbar, table, and pagination footer.
 */
export const TableCNSkeleton = ({
  columnCount,
  rowCount = 10,
  filterCount = 0,
  cellWidths = ["auto"],
  withSearch = false,
  withViewOptions = true,
  withPagination = true,
  shrinkZero = false,
  className,
  ...props
}: TableCNSkeletonProps) => {
  const columnWidths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? "auto",
  );
  const getCellStyle = (index: number): React.CSSProperties => ({
    width: columnWidths[index],
    minWidth: shrinkZero ? columnWidths[index] : "auto",
  });

  return (
    <div role="status" className={cn("flex w-full flex-col gap-3", className)} {...props}>
      <span className="sr-only">Loading table…</span>
      <div aria-hidden="true" className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          {withSearch && <Skeleton className="h-8 w-full rounded-lg mmd:w-[14rem] lg:w-[17rem]" />}
          {Array.from({ length: filterCount }, (_, index) => (
            <Skeleton key={index} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
        {withViewOptions && <Skeleton className="hidden h-8 w-[4.5rem] rounded-lg lg:flex" />}
      </div>
      <TableCNFrame aria-hidden="true">
        <TableCNTableElement>
          <thead>
            <tr>
              {columnWidths.map((_, index) => (
                <TableCNHeadElement key={index} style={getCellStyle(index)}>
                  <Skeleton className="h-3.5 w-2/3" />
                </TableCNHeadElement>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <TableCNRowElement key={rowIndex} className="hover:bg-background">
                {columnWidths.map((_, index) => (
                  <TableCNCellElement key={index} style={getCellStyle(index)}>
                    <Skeleton className="h-4 w-full" />
                  </TableCNCellElement>
                ))}
              </TableCNRowElement>
            ))}
          </tbody>
        </TableCNTableElement>
        {withPagination && (
          <div className="flex w-full items-center justify-between gap-4 border-t border-border bg-slate-50/60 px-4 py-1.5">
            <Skeleton className="h-4 w-40 shrink-0" />
            <div className="flex items-center gap-4 sm:gap-5">
              <Skeleton className="hidden h-7 w-36 rounded-lg sm:block" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16 rounded-lg lg:w-28" />
            </div>
          </div>
        )}
      </TableCNFrame>
    </div>
  );
};

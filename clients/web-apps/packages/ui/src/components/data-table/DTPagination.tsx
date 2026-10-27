import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/ui/components/buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";

interface DTPaginationProps<TData> {
  table: Table<TData>;
  isRowSelectionEnabled?: boolean;
  /** The label for a single record */
  singularLabel?: string;
  /** The label for multiple records */
  pluralLabel?: string;
}

export function DTPagination<TData>({
  table,
  isRowSelectionEnabled = false,
  singularLabel = "row",
  pluralLabel = "rows",
}: DTPaginationProps<TData>) {
  if (table.getPageCount() === 0) {
    return null;
  }

  const getDynamicRecordLabel = (count: number): string => {
    if (count === 1) {
      return `${count} ${singularLabel}`;
    }
    return `${count} ${pluralLabel}`;
  };

  return (
    <div className="flex items-center justify-end px-2 sm:justify-between">
      <div className="hidden flex-1 font-mono text-hint tabular-nums text-muted-foreground sm:flex">
        {isRowSelectionEnabled ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {getDynamicRecordLabel(table.getFilteredRowModel().rows.length)} selected.
          </>
        ) : (
          <>{getDynamicRecordLabel(table.getFilteredRowModel().rows.length)}</>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="hidden items-center space-x-2 xs:flex">
          <p className="text-body-sm text-muted-foreground">
            <span className="capitalize">{pluralLabel}</span> per page
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[4rem]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[4rem]">
              {[10, 20, 50, 100, 200, 500, 1000].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center font-mono text-hint tabular-nums text-ink-2">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

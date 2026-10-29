import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { UploadedItemsTableBulkActions } from "./UploadedItemsTableBulkActions";

interface UploadedItemsTablePaginationProps<TData> {
  table: Table<TData>;
  isRowSelectionEnabled?: boolean;
}

export function UploadedItemsTablePagination<TData>({
  table,
}: Readonly<UploadedItemsTablePaginationProps<TData>>) {
  return (
    <div className="flex items-center justify-end px-2 sm:justify-between">
      <div className="hidden items-center space-x-2 xs:flex">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 50, 100, 200, 500, 1000].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <UploadedItemsTableBulkActions table={table} />
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2 space-x-2">
          <ChevronsLeftIcon
            role="button"
            className="h-7 w-7 rounded-lg border p-1"
            onClick={() => (!table.getCanPreviousPage() ? null : table.setPageIndex(0))}
          />

          <ChevronLeftIcon
            className="h-7 w-7 rounded-lg border p-1"
            role="button"
            onClick={() => (!table.getCanPreviousPage() ? null : table.previousPage())}
          />

          <ChevronRightIcon
            role="button"
            className="h-7 w-7 rounded-lg border p-1"
            onClick={() => (!table.getCanNextPage() ? null : table.nextPage())}
          />

          <ChevronsRightIcon
            role="button"
            className="h-7 w-7 rounded-lg border p-1"
            onClick={() =>
              !table.getCanNextPage() ? null : table.setPageIndex(table.getPageCount() - 1)
            }
          />
        </div>
      </div>
    </div>
  );
}

import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { type Table } from "@tanstack/react-table";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { cn } from "@/ui/lib";

import { TABLE_CN_DEFAULT_PAGE_SIZE_OPTIONS } from "./constants/table-cn.constant";
import { type TableCNRowLabels } from "./types/table-cn.type";

const DEFAULT_ROW_LABELS: TableCNRowLabels = { singular: "row", plural: "rows" };

const withPageSize = (pageSizeOptions: number[], pageSize: number) =>
  pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((first, second) => first - second);

type PageButtonProps = React.ComponentProps<"button"> & {
  label: string;
  icon: PhosphorIcon;
};

const PageButton = ({ label, icon: Icon, className, ...props }: PageButtonProps) => (
  <button
    type="button"
    aria-label={label}
    className={cn(
      "grid size-7 place-items-center rounded-md text-ink-2 outline-none transition-colors duration-[120ms] ease-out",
      "hover:bg-hover hover:text-ink focus-visible:shadow-focus",
      "disabled:pointer-events-none disabled:text-muted-foreground/50",
      className,
    )}
    {...props}
  >
    <Icon className="size-4" />
  </button>
);

const Strong = ({ children }: React.PropsWithChildren) => (
  <span className="font-mono font-medium tabular-nums text-ink">{children}</span>
);

export type TableCNPaginationProps<TData> = React.ComponentProps<"div"> & {
  table: Table<TData>;
  pageSizeOptions?: number[];
  /** Words used for the row count, e.g. agent/agents. */
  rowLabels?: TableCNRowLabels;
};

/**
 * Shown range or selection count, page size picker, page position, and page buttons.
 */
export const TableCNPagination = <TData,>({
  table,
  pageSizeOptions = TABLE_CN_DEFAULT_PAGE_SIZE_OPTIONS,
  rowLabels = DEFAULT_ROW_LABELS,
  className,
  ...props
}: TableCNPaginationProps<TData>) => {
  const pageSizeLabelId = React.useId();

  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = Math.min(pageIndex + 1, pageCount);
  const rowCount = table.getRowCount();
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const rowLabel = rowCount === 1 ? rowLabels.singular : rowLabels.plural;

  const firstShownRow = Math.min((currentPage - 1) * pageSize + 1, rowCount);
  const lastShownRow = Math.min(currentPage * pageSize, rowCount);

  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-3 sm:flex-row sm:gap-6",
        className,
      )}
      {...props}
    >
      <div role="status" className="flex-1 whitespace-nowrap text-hint text-muted-foreground">
        {selectedRowCount > 0 ? (
          <>
            <Strong>{selectedRowCount}</Strong> of <Strong>{rowCount}</Strong> {rowLabel} selected
          </>
        ) : rowCount > 0 ? (
          <>
            Showing{" "}
            <Strong>
              {firstShownRow}–{lastShownRow}
            </Strong>{" "}
            of <Strong>{rowCount}</Strong> {rowLabel}
          </>
        ) : (
          `No ${rowLabels.plural}`
        )}
      </div>
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2">
          <p id={pageSizeLabelId} className="whitespace-nowrap text-hint text-muted-foreground">
            <span className="capitalize">{rowLabels.plural}</span> per page
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              aria-labelledby={pageSizeLabelId}
              size="sm"
              className="h-7 w-[4.25rem] rounded-md bg-surface font-medium text-ink-2"
            >
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[4.25rem]">
              {withPageSize(pageSizeOptions, pageSize).map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div role="status" className="whitespace-nowrap text-hint text-muted-foreground">
          Page <Strong>{currentPage}</Strong> of <Strong>{pageCount}</Strong>
        </div>
        <div className="flex items-center gap-0.5">
          <PageButton
            label="Go to first page"
            icon={CaretDoubleLeftIcon}
            className="hidden lg:grid"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          />
          <PageButton
            label="Go to previous page"
            icon={CaretLeftIcon}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
          <PageButton
            label="Go to next page"
            icon={CaretRightIcon}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
          <PageButton
            label="Go to last page"
            icon={CaretDoubleRightIcon}
            className="hidden lg:grid"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          />
        </div>
      </div>
    </div>
  );
};

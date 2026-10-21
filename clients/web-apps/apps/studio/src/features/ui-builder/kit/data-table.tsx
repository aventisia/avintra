import * as React from "react";

import { cn } from "./cn.util";
import { format, isDateLike } from "./format.util";
import { KitIcon } from "./icons";
import { Button, EmptyState, Skeleton } from "./primitives";

type Row = Record<string, unknown>;

/** One DataTable column; `key` may be a dot path such as "data.amount". */
export type DataTableColumn<TRow extends Row = Row> = {
  key: string;
  header: React.ReactNode;
  render?: (row: TRow) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: TRow) => string | number | null | undefined;
  align?: "left" | "right" | "center";
  width?: string;
  wrap?: boolean;
  className?: string;
};

/** Reads a value from a row by dot path. */
export const getPath = (row: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((value, segment) => {
    if (value === null || value === undefined) return undefined;
    return (value as Record<string, unknown>)[segment];
  }, row);

const renderDefault = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined || value === "")
    return <span className="text-muted-foreground">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return format.number(value);
  if (isDateLike(value)) return format.date(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const compareValues = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined || left === "") return 1;
  if (right === null || right === undefined || right === "") return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  if (isDateLike(left) && isDateLike(right))
    return new Date(left as string).getTime() - new Date(right as string).getTime();
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;

/** Props for {@link DataTable}. */
export type DataTableProps<TRow extends Row = Row> = {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  rowKey?: string | ((row: TRow) => string);
  caption?: string;
  loading?: boolean;
  error?: React.ReactNode;
  onRetry?: () => void;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  pageSize?: number;
  onRowClick?: (row: TRow) => void;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  initialSort?: { key: string; direction: "asc" | "desc" };
  dense?: boolean;
  toolbar?: React.ReactNode;
  className?: string;
};

/**
 * Table with sorting, client-side pagination, loading skeletons, empty and error states,
 * optional row selection, and keyboard-accessible row clicks.
 */
export const DataTable = <TRow extends Row = Row>({
  columns,
  rows,
  rowKey = "id",
  caption,
  loading = false,
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  pageSize = 10,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  initialSort,
  dense = false,
  toolbar,
  className,
}: DataTableProps<TRow>) => {
  const [sort, setSort] = React.useState(initialSort ?? null);
  const [page, setPage] = React.useState(0);
  const [internalSelection, setInternalSelection] = React.useState<string[]>([]);
  const selection = selectedKeys ?? internalSelection;

  const keyOf = React.useCallback(
    (row: TRow, index: number) =>
      typeof rowKey === "function" ? rowKey(row) : String(getPath(row, rowKey) ?? index),
    [rowKey],
  );

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((entry) => entry.key === sort.key);
    const valueOf = (row: TRow) =>
      column?.sortValue ? column.sortValue(row) : getPath(row, sort.key);
    const sorted = [...rows].sort((left, right) => compareValues(valueOf(left), valueOf(right)));
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = sortedRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  React.useEffect(() => setPage(0), [rows.length, sort]);

  const updateSelection = (keys: string[]) => {
    if (!selectedKeys) setInternalSelection(keys);
    onSelectionChange?.(keys);
  };

  const pageKeys = pageRows.map((row, index) => keyOf(row, currentPage * pageSize + index));
  const allPageSelected = pageKeys.length > 0 && pageKeys.every((key) => selection.includes(key));

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key
        ? current.direction === "asc"
          ? { key, direction: "desc" }
          : null
        : { key, direction: "asc" },
    );

  const cellPadding = dense ? "px-3 py-2" : "px-4 py-3";
  const columnCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {toolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              {selectable && (
                <th scope="col" className={cn("w-10", cellPadding)}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={allPageSelected}
                    onChange={() =>
                      updateSelection(
                        allPageSelected
                          ? selection.filter((key) => !pageKeys.includes(key))
                          : [...new Set([...selection, ...pageKeys])],
                      )
                    }
                    className="size-4 cursor-pointer accent-primary"
                  />
                </th>
              )}
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={
                      isSorted
                        ? sort?.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase",
                      cellPadding,
                      ALIGN[column.align ?? "left"],
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 rounded uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          column.align === "right" && "flex-row-reverse",
                        )}
                      >
                        {column.header}
                        <KitIcon
                          icon={
                            isSorted
                              ? sort?.direction === "asc"
                                ? "ArrowUp"
                                : "ArrowDown"
                              : "ChevronsUpDown"
                          }
                          size={12}
                          className={isSorted ? "text-foreground" : "opacity-50"}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: Math.min(pageSize, 5) }, (_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: columnCount }, (_, cell) => (
                    <td key={cell} className={cellPadding}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && error && (
              <tr>
                <td colSpan={columnCount}>
                  <EmptyState
                    icon="AlertTriangle"
                    title="Could not load data"
                    description={error}
                    action={
                      onRetry && (
                        <Button variant="outline" size="sm" onClick={onRetry}>
                          Try again
                        </Button>
                      )
                    }
                  />
                </td>
              </tr>
            )}
            {!loading && !error && sortedRows.length === 0 && (
              <tr>
                <td colSpan={columnCount}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              pageRows.map((row, index) => {
                const key = pageKeys[index];
                const isSelected = selection.includes(key);
                return (
                  <tr
                    key={key}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    aria-selected={selectable ? isSelected : undefined}
                    className={cn(
                      "transition-colors",
                      onRowClick &&
                        "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    {selectable && (
                      <td className={cellPadding} onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label="Select row"
                          checked={isSelected}
                          onChange={() =>
                            updateSelection(
                              isSelected
                                ? selection.filter((entry) => entry !== key)
                                : [...selection, key],
                            )
                          }
                          className="size-4 cursor-pointer accent-primary"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "text-foreground",
                          column.wrap ? "min-w-48" : "whitespace-nowrap",
                          cellPadding,
                          ALIGN[column.align ?? "left"],
                          column.align === "right" && "tabular-nums",
                          column.className,
                        )}
                      >
                        {column.render
                          ? column.render(row)
                          : renderDefault(getPath(row, column.key))}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {!loading && !error && sortedRows.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {currentPage * pageSize + 1}–{Math.min(sortedRows.length, (currentPage + 1) * pageSize)}{" "}
            of {sortedRows.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous page"
              icon="ChevronLeft"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            />
            <span className="px-1 tabular-nums">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next page"
              icon="ChevronRight"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

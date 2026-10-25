import { type Column, type ColumnSort, type Table } from "@tanstack/react-table";
import { ArrowDownUp, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/ui/components/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { cn } from "@/ui/lib";

import {
  TABLE_CN_PANEL_CLASS_NAME,
  TABLE_CN_TOOLBAR_BUTTON_CLASS_NAME,
} from "./constants/table-cn-class-names.constant";

const SORT_DIRECTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const getColumnLabel = <TData,>(column: Column<TData, unknown>) =>
  column.columnDef.meta?.label ?? column.id;

type SortRuleProps<TData> = {
  sort: ColumnSort;
  index: number;
  columns: Column<TData, unknown>[];
  takenIds: ReadonlySet<string>;
  onChange: (sort: ColumnSort) => void;
  onRemove: () => void;
};

const SortRule = <TData,>({
  sort,
  index,
  columns,
  takenIds,
  onChange,
  onRemove,
}: SortRuleProps<TData>) => {
  const fieldColumns = columns.filter(
    (column) => column.id === sort.id || !takenIds.has(column.id),
  );
  const label = getColumnLabel(columns.find((column) => column.id === sort.id) ?? columns[0]);

  return (
    <li className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-xs text-slate-400">
        {index === 0 ? "Sort by" : "then"}
      </span>
      <Select value={sort.id} onValueChange={(id) => onChange({ ...sort, id })}>
        <SelectTrigger
          aria-label={`Sort field ${index + 1}`}
          size="sm"
          className="w-40 rounded-lg font-medium text-slate-700"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fieldColumns.map((column) => (
            <SelectItem key={column.id} value={column.id}>
              {getColumnLabel(column)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={sort.desc ? "desc" : "asc"}
        onValueChange={(direction) => onChange({ ...sort, desc: direction === "desc" })}
      >
        <SelectTrigger
          aria-label={`${label} sort direction`}
          size="sm"
          className="w-[7.5rem] rounded-lg text-slate-700"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_DIRECTIONS.map((direction) => (
            <SelectItem key={direction.value} value={direction.value}>
              {direction.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        aria-label={`Remove ${label} sort`}
        variant="ghost"
        size="icon8"
        className="shrink-0 text-slate-400 hover:text-rose-600"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </li>
  );
};

type TableCNSortMenuProps<TData> = {
  table: Table<TData>;
  align?: "start" | "center" | "end";
};

/**
 * Toolbar menu that sorts by several columns in order; each rule picks a column and a direction.
 */
export const TableCNSortMenu = <TData,>({ table, align = "end" }: TableCNSortMenuProps<TData>) => {
  const titleId = React.useId();
  const sorting = table.getState().sorting;
  const sortableColumns = table.getAllLeafColumns().filter((column) => column.getCanSort());
  const takenIds = new Set(sorting.map((sort) => sort.id));
  const nextColumn = sortableColumns.find((column) => !takenIds.has(column.id));

  const onAddSort = () => {
    if (nextColumn) table.setSorting([...sorting, { id: nextColumn.id, desc: false }]);
  };

  const onChangeSort = (index: number, nextSort: ColumnSort) =>
    table.setSorting(sorting.map((sort, sortIndex) => (sortIndex === index ? nextSort : sort)));

  const onRemoveSort = (index: number) =>
    table.setSorting(sorting.filter((_, sortIndex) => sortIndex !== index));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className={cn(TABLE_CN_TOOLBAR_BUTTON_CLASS_NAME, sorting.length > 0 && "text-slate-900")}
        >
          <ArrowDownUp />
          Sort
          {sorting.length > 0 && (
            <span className="grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-md bg-indigo-50 px-1 text-2xs font-semibold tabular-nums text-indigo-700">
              {sorting.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-labelledby={titleId}
        align={align}
        sideOffset={6}
        className={cn(TABLE_CN_PANEL_CLASS_NAME, "flex w-auto min-w-[22rem] flex-col gap-3 p-3")}
      >
        <div className="px-0.5">
          <h4 id={titleId} className="text-[13px] font-semibold text-slate-900">
            {sorting.length > 0 ? "Sorting" : "No sorting applied"}
          </h4>
          {sorting.length === 0 && (
            <p className="mt-0.5 text-[13px] text-slate-500">Add a rule to order the rows.</p>
          )}
        </div>
        {sorting.length > 0 && (
          <ol className="flex flex-col gap-2">
            {sorting.map((sort, index) => (
              <SortRule
                key={sort.id}
                sort={sort}
                index={index}
                columns={sortableColumns}
                takenIds={takenIds}
                onChange={(nextSort) => onChangeSort(index, nextSort)}
                onRemove={() => onRemoveSort(index)}
              />
            ))}
          </ol>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <Button
            variant="ghost"
            size="xs"
            className="gap-1.5 text-[13px] text-slate-700"
            onClick={onAddSort}
            disabled={!nextColumn}
          >
            <Plus className="size-3.5" />
            Add sort
          </Button>
          {sorting.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-[13px] text-slate-500"
              onClick={() => table.resetSorting(true)}
            >
              Clear sorting
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

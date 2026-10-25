import { type Column } from "@tanstack/react-table";
import { CalendarIcon } from "lucide-react";
import type * as React from "react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/ui/components/buttons";
import { Calendar } from "@/ui/components/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/popover";
import { cn } from "@/ui/lib";
import { formatDate } from "@/ui/utils";

import { TABLE_CN_PANEL_CLASS_NAME } from "../constants/table-cn-class-names.constant";
import { type TableCNRangeValue } from "../types/table-cn.type";
import { toTime } from "../utils/table-cn-date.util";
import { toRangeValue } from "../utils/table-cn-filter-value.util";
import { TableCNFilterTrigger, TableCNFilterValue } from "./TableCNFilterTrigger";

const toDate = (time: number | undefined) => (time === undefined ? undefined : new Date(time));

const formatDateLabel = ([from, to]: TableCNRangeValue) => {
  if (from !== undefined && to !== undefined) return `${formatDate(from)} – ${formatDate(to)}`;
  return formatDate(from ?? to);
};

type TableCNDateFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title?: string;
  /** Picks a date range instead of a single day. */
  multiple?: boolean;
};

/**
 * Calendar filter for one day (`date`) or a from/to range (`dateRange`).
 */
export const TableCNDateFilter = <TData, TValue>({
  column,
  title = column.columnDef.meta?.label ?? column.id,
  multiple = false,
}: TableCNDateFilterProps<TData, TValue>) => {
  const filterValue = column.getFilterValue();
  const [from, to]: TableCNRangeValue = multiple
    ? toRangeValue(filterValue)
    : [toTime(filterValue), undefined];
  const isActive = from !== undefined || to !== undefined;

  const onReset = (event: React.MouseEvent) => {
    event.stopPropagation();
    column.setFilterValue(undefined);
  };

  const onSelectDate = (date: Date | undefined) => column.setFilterValue(date?.getTime());

  const onSelectRange = (range: DateRange | undefined) => {
    const nextRange = [range?.from?.getTime(), range?.to?.getTime()];
    column.setFilterValue(nextRange.some((time) => time !== undefined) ? nextRange : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <TableCNFilterTrigger
          title={title}
          isActive={isActive}
          onClear={onReset}
          icon={CalendarIcon}
        >
          <TableCNFilterValue>{formatDateLabel([from, to])}</TableCNFilterValue>
        </TableCNFilterTrigger>
      </PopoverTrigger>
      <PopoverContent
        aria-label={`${title} filter`}
        align="start"
        sideOffset={6}
        className={cn(TABLE_CN_PANEL_CLASS_NAME, "w-auto overflow-hidden")}
      >
        {multiple ? (
          <Calendar
            mode="range"
            autoFocus
            selected={{ from: toDate(from), to: toDate(to) }}
            onSelect={onSelectRange}
          />
        ) : (
          <Calendar mode="single" autoFocus selected={toDate(from)} onSelect={onSelectDate} />
        )}
        {isActive && (
          <div className="border-t border-slate-100 p-2">
            <Button
              aria-label={`Clear ${title} filter`}
              variant="ghost"
              size="xs"
              className="w-full text-sm"
              onClick={onReset}
            >
              Clear filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

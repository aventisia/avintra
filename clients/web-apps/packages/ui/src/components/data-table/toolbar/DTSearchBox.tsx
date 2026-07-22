import { type FilterFn, type Table } from "@tanstack/react-table";
import React, { useEffect, useMemo } from "react";

import { Input } from "@/ui/components";

interface DTSearchBoxProps<TData> extends React.ComponentPropsWithoutRef<typeof Input> {
  table: Table<TData>;
  /**
   * Column IDs to search against.
   * Pass one column for single-column search, or multiple for OR-based matching.
   */
  searchColumns: string[];
}

export const DTSearchBox = <TData,>({
  table,
  searchColumns,
  placeholder = "Search...",
}: DTSearchBoxProps<TData>) => {
  const globalFilterFn = useMemo<FilterFn<TData>>(() => {
    return (row, _columnId, filterValue) => {
      const term = String(filterValue ?? "")
        .trim()
        .toLowerCase();

      if (!term) {
        return true;
      }

      return (searchColumns ?? []).some((columnId) => {
        const value = row.getValue(columnId);
        return String(value ?? "")
          .toLowerCase()
          .includes(term);
      });
    };
  }, [searchColumns]);

  useEffect(() => {
    table.setOptions((previous) => ({
      ...previous,
      globalFilterFn,
    }));
  }, [globalFilterFn, table]);

  return (
    <Input
      placeholder={placeholder}
      value={(table.getState().globalFilter as string) ?? ""}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className="h-8 w-full text-sm tracking-wide mmd:w-[150px] lg:w-[250px]"
    />
  );
};

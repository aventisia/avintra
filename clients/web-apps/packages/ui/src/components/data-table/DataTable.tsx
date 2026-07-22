import { type Table, flexRender } from "@tanstack/react-table";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ScrollArea } from "@/ui/components/scroll";
import {
  TableExt,
  TableExtBody,
  TableExtCell,
  TableExtHead,
  TableExtHeader,
  TableExtRow,
} from "@/ui/components/table";
import { useDTCrudDialogStore } from "@/ui/stores";
import { type CrudActionType } from "@/ui/types";

import { useDataTableQueryParams } from ".";

const crudActionMapper: Record<string, string> = {
  edit: "update",
  view: "read",
};

interface DataTableProps<TData> {
  table: Table<TData>;
  columnsLength: number;
}

export function DataTable<TData>({ table, columnsLength }: DataTableProps<TData>) {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get CRUD action and row ID
  const { crudActionParam, rowIdParam } = useDataTableQueryParams();

  // Set default dialog options
  useEffect(() => {
    if (crudActionParam && crudActionParam === "create") {
      setCrudDialogOptions({
        showDialog: true,
        rowId: window.crypto.randomUUID(),
        crudAction: crudActionParam as CrudActionType,
      });
    }

    if (
      crudActionParam &&
      rowIdParam &&
      (crudActionParam === "view" || crudActionParam === "edit")
    ) {
      setCrudDialogOptions({
        showDialog: true,
        rowId: rowIdParam,
        crudAction: crudActionMapper[crudActionParam] as CrudActionType,
      });
    }
  }, [crudActionParam, rowIdParam, setCrudDialogOptions]);

  // Return the rendered DataTable component.
  return (
    <ScrollArea
      className="w-full overflow-hidden rounded-lg border bg-background"
      showHorizontalScrollbar
      showVerticalScrollbar={false}
    >
      <TableExt className="bg-background">
        {/* Render the table header. */}
        <TableExtHeader className="bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableExtRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const headerClassName = header.column.columnDef.meta?.headerClassName;

                return (
                  <TableExtHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={headerClassName}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableExtHead>
                );
              })}
            </TableExtRow>
          ))}
        </TableExtHeader>

        {/* Render the table body. */}
        <TableExtBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableExtRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => {
                  const cellClassName = cell.column.columnDef.meta?.cellClassName;

                  return (
                    <TableExtCell key={cell.id} className={cellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableExtCell>
                  );
                })}
              </TableExtRow>
            ))
          ) : (
            <TableExtRow className="hover:bg-transparent">
              <TableExtCell
                colSpan={columnsLength}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No results.
              </TableExtCell>
            </TableExtRow>
          )}
        </TableExtBody>
      </TableExt>
    </ScrollArea>
  );
}

import { type Table, flexRender } from "@tanstack/react-table";

import { ScrollArea } from "@/ui/components/scroll";
import {
  TableExt,
  TableExtBody,
  TableExtCell,
  TableExtHead,
  TableExtHeader,
  TableExtRow,
} from "@/ui/components/table";

interface DataTableProps<TData> {
  table: Table<TData>;
  columnsLength: number;
}

export function DataTable<TData>({ table, columnsLength }: DataTableProps<TData>) {
  return (
    <ScrollArea
      className="w-full overflow-hidden rounded-lg border bg-background"
      showHorizontalScrollbar
      showVerticalScrollbar={false}
    >
      <TableExt className="bg-background">
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

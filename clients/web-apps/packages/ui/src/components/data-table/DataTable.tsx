import { type Row, type Table, flexRender } from "@tanstack/react-table";

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
  /** Extra props merged onto each body row. */
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
}

export function DataTable<TData>({ table, columnsLength, getRowProps }: DataTableProps<TData>) {
  return (
    <ScrollArea
      className="w-full overflow-hidden rounded-lg border border-line bg-surface"
      showHorizontalScrollbar
      showVerticalScrollbar={false}
    >
      <TableExt className="bg-surface">
        <TableExtHeader>
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
              <TableExtRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                {...getRowProps?.(row)}
              >
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
                className="h-24 text-center text-body-sm text-muted-foreground"
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

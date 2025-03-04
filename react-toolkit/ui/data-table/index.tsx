import {
  TableExt,
  TableExtBody,
  TableExtCell,
  TableExtHead,
  TableExtHeader,
  TableExtRow,
} from "@/react-toolkit/ui/TableExt";
import { Table, flexRender } from "@tanstack/react-table";

interface DataTableProps<TData> {
  table: Table<TData>;
  columnsLength: number;
}

export function DataTable<TData>({
  table,
  columnsLength,
}: Readonly<DataTableProps<TData>>) {
  // Return the rendered DataTable component.
  return (
    <TableExt className="rounded-md bg-slate-50">
      {/* Render the table header. */}
      <TableExtHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableExtRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableExtHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
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
            <TableExtRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableExtCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableExtCell>
              ))}
            </TableExtRow>
          ))
        ) : (
          <TableExtRow>
            <TableExtCell colSpan={columnsLength} className="h-24 text-center">
              No results.
            </TableExtCell>
          </TableExtRow>
        )}
      </TableExtBody>
    </TableExt>
  );
}

import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { machineSelectTableColumns } from "./MachineSelectTableColumns";
import { MachineSelectTablePagination } from "./MachineSelectTablePagination";
import { Table } from "@tanstack/react-table";

interface MachineSelectTableProps<TData> {
  isRowSelectionEnabled?: boolean;
  table: Table<TData>;
}

export function MachineSelectTable<TData>({
  table,
  isRowSelectionEnabled = true,
}: Readonly<MachineSelectTableProps<TData>>) {
  return (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="text-md ml-1 flex w-full items-center truncate text-foreground">
          Select machines
        </h4>

        <div className="flex items-center gap-2">
          <DTSearchBox
            table={table}
            searchColumn="name"
            placeholder="Search machines..."
          />
        </div>
      </div>

      {/* Data table to render data */}
      <div className="rounded-md border">
        <DataTable
          table={table}
          columnsLength={machineSelectTableColumns.length}
        />
      </div>
      <div className="mt-2">
        <MachineSelectTablePagination
          isRowSelectionEnabled={isRowSelectionEnabled}
          table={table}
        />
      </div>
    </>
  );
}

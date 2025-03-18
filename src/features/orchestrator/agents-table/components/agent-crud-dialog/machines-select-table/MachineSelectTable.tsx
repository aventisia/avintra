import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { machineSelectTableColumns } from "./MachineSelectTableColumns";
import { MachineSelectTablePagination } from "./MachineSelectTablePagination";
import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { machineSelectTableColumnVisibilityState } from "../../../constants/column-visibility-state";
import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";
import { useShallow } from "zustand/react/shallow";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

interface MachineSelectTableProps {
  isRowSelectionEnabled?: boolean;
}

export function MachineSelectTable({
  isRowSelectionEnabled = true,
}: Readonly<MachineSelectTableProps>) {
  // Get store state and actions
  const { currentAgentMachines, isFetchinCurrentAgentMachines } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        currentAgentMachines: state.currentMachines,
        isFetchinCurrentAgentMachines: state.isFetching,
      })),
    );

  // Create a React table for agents data
  const table = useDataTable(
    machineSelectTableColumns,
    currentAgentMachines ?? [],
    machineSelectTableColumnVisibilityState,
    true,
  );
  return isFetchinCurrentAgentMachines ? (
    <DataTableSkeleton />
  ) : (
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

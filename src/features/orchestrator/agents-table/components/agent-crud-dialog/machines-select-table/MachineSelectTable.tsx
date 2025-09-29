import { Skeleton } from "@aventisia/ui";
import { DataTable, DTSearchBox } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { DataTableSkeletonGeneric } from "@/components/DataTableSkeletonGeneric";

import { machineSelectTableColumnVisibilityState } from "../../../constants/column-visibility-state";
import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";

import { machineSelectTableColumns } from "./MachineSelectTableColumns";
import { MachineSelectTablePagination } from "./MachineSelectTablePagination";

interface MachineSelectTableProps {
  isRowSelectionEnabled?: boolean;
}

export function MachineSelectTable({
  isRowSelectionEnabled = true,
}: Readonly<MachineSelectTableProps>) {
  // Get store state and actions
  const { currentMachines, isFetching, isReadOnly } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        currentMachines: state.currentMachines,
        isFetching: state.isFetching,
        isReadOnly: state.isReadOnly,
      })),
    );

  // Create a React table for agents data
  const table = useDataTable(
    machineSelectTableColumns,
    currentMachines ?? [],
    machineSelectTableColumnVisibilityState,
    [],
    true,
  );
  return isFetching ? (
    <DataTableSkeletonGeneric
      columnCount={2}
      rowCount={2}
      showHeader={false}
      customHeader={
        <div className="flex h-[1.75rem] items-center justify-between">
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[10rem]" />
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[13rem]" />
        </div>
      }
    />
  ) : (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="ml-1 flex w-full items-center truncate text-md text-foreground">
          {isReadOnly ? "Assigned Machines" : "Select machines"}
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
      <DataTable
        table={table}
        columnsLength={machineSelectTableColumns.length}
      />
      <div className="mt-2">
        <MachineSelectTablePagination
          isRowSelectionEnabled={isRowSelectionEnabled}
          table={table}
        />
      </div>
    </>
  );
}

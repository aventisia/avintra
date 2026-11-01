import { Skeleton } from "@avplatform/ui";
import { TableCN, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useShallow } from "zustand/react/shallow";

import { DataTableSkeletonGeneric } from "@/components/DataTableSkeletonGeneric";

import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";
import { machineSelectTableColumns } from "./MachineSelectTableColumns";
import { MachineSelectTablePagination } from "./MachineSelectTablePagination";

const MACHINES_QUERY_KEYS = {
  page: "machinesPage",
  perPage: "machinesPerPage",
  sort: "machinesSort",
};

interface MachineSelectTableProps {
  isRowSelectionEnabled?: boolean;
}

export function MachineSelectTable({
  isRowSelectionEnabled = true,
}: Readonly<MachineSelectTableProps>) {
  // Get store state and actions
  const { currentMachines, isFetching, isReadOnly } = useMachinesSelectTableStore(
    useShallow((state) => ({
      currentMachines: state.currentMachines,
      isFetching: state.isFetching,
      isReadOnly: state.isReadOnly,
    })),
  );

  // Create a TableCN table; the assignment state itself stays in the store
  const { table } = useTableCN({
    data: currentMachines ?? [],
    columns: machineSelectTableColumns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 50 } },
    queryKeys: MACHINES_QUERY_KEYS,
    persistKey: "agent-machines-select",
    searchColumns: ["name"],
  });

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
      </div>

      {/* IMPORTANT NOTE: TableCN always renders its own footer; this dialog keeps its
          store-derived assigned-count footer instead, so the built-in one is hidden. */}
      <TableCN table={table} label="Machines" paginationProps={{ className: "hidden" }}>
        <TableCNToolbar
          table={table}
          searchPlaceholder="Search machines..."
          withViewOptions={false}
        />
      </TableCN>
      <div className="mt-2">
        <MachineSelectTablePagination isRowSelectionEnabled={isRowSelectionEnabled} table={table} />
      </div>
    </>
  );
}

import { Skeleton } from "@aventisia/ui";
import { DataTable, DTSearchBox } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { DataTableSkeletonGeneric } from "@/components/DataTableSkeletonGeneric";

import { useFetchQueueAgents } from "../../hooks/useFetchQueueAgents";
import { useAssignAgentsStore } from "../../stores/assign-agents-store";
import { useQueueDTCrudDialogStore } from "../../stores/queue-dialog-store";

import { agentSelectTableColumns } from "./AgentSelectTableColumns";
import { AgentSelectTablePagination } from "./AgentSelectTablePagination";

export function AgentSelectTable() {
  // Get store state and actions
  const { currentAgents, setCurrentAgents } = useAssignAgentsStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
      setCurrentAgents: state.setCurrentAgents,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId },
  } = useQueueDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  const { isFetching, data } = useFetchQueueAgents(rowId);

  useEffect(() => {
    if (data?.data) setCurrentAgents(data.data);
  }, [data?.data, setCurrentAgents]);

  // Create a React table for agents data
  const table = useDataTable(
    agentSelectTableColumns,
    currentAgents ?? [],
    {
      id: true,
      name: false,
      versionNumber: true,
      isAssigned: false,
    },
    [],
    true,
  );

  return isFetching ? (
    <DataTableSkeletonGeneric
      columnCount={2}
      rowCount={2}
      showHeader={false}
      customHeader={
        <div className="flex h-[1.75rem] items-center justify-start">
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[10rem]" />
        </div>
      }
    />
  ) : (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="ml-1 flex w-full items-center truncate text-md text-foreground">
          Assign agents
        </h4>

        <div className="flex items-center gap-2">
          <DTSearchBox
            table={table}
            searchColumn="name"
            placeholder="Search agents..."
          />
        </div>
      </div>

      {/* Data table to render data */}
      <DataTable table={table} columnsLength={agentSelectTableColumns.length} />
      <div className="mt-2">
        <AgentSelectTablePagination table={table} />
      </div>
    </>
  );
}

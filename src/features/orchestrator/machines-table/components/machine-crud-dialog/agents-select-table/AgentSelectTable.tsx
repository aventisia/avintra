import { DataTable } from "@aventisia/ui/data-table";
import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { DTSearchBox } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";
import { agentSelectTableColumns } from "./AgentSelectTableColumns";
import { AgentSelectTablePagination } from "./AgentSelectTablePagination";

interface AgentSelectTableProps {
  isReadMode?: boolean;
  isFetching: boolean;
}

export function AgentSelectTable({
  isReadMode = true,
  isFetching,
}: Readonly<AgentSelectTableProps>) {
  // Get store state and actions
  const { currentAgents } = useAgentsSelectTableStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
    })),
  );

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
    true,
  );

  return isFetching ? (
    <DataTableSkeleton />
  ) : (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="text-md ml-1 flex w-full items-center truncate text-foreground">
          {isReadMode ? "Assigned agents" : "Select agents..."}
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
      <div className="rounded-md border">
        <DataTable
          table={table}
          columnsLength={agentSelectTableColumns.length}
        />
      </div>
      <div className="mt-2">
        <AgentSelectTablePagination table={table} />
      </div>
    </>
  );
}

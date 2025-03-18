import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { agentSelectTableColumns } from "./AgentSelectTableColumns";
import { AgentSelectTablePagination } from "./AgentSelectTablePagination";
import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { agentSelectTableColumnVisibilityState } from "../../../constants/column-visibility-state";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";
import { useShallow } from "zustand/react/shallow";

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
    currentAgents,
    agentSelectTableColumnVisibilityState,
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

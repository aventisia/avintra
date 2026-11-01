import { Skeleton } from "@avplatform/ui";
import { TableCN, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useShallow } from "zustand/react/shallow";

import { DataTableSkeletonGeneric } from "@/components/DataTableSkeletonGeneric";

import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";
import { agentSelectTableColumns } from "./AgentSelectTableColumns";
import { AgentSelectTablePagination } from "./AgentSelectTablePagination";

const AGENTS_QUERY_KEYS = {
  page: "messageAgentsPage",
  perPage: "messageAgentsPerPage",
  sort: "messageAgentsSort",
};

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

  // Create a TableCN table; the assignment state itself stays in the store
  const { table } = useTableCN({
    data: currentAgents ?? [],
    columns: agentSelectTableColumns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 50 } },
    queryKeys: AGENTS_QUERY_KEYS,
    persistKey: "message-agents-select",
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
          {isReadMode ? "Assigned agents" : "Select agents..."}
        </h4>
      </div>

      {/* IMPORTANT NOTE: TableCN always renders its own footer; this dialog keeps its
          store-derived assigned-count footer instead, so the built-in one is hidden. */}
      <TableCN table={table} label="Agents" paginationProps={{ className: "hidden" }}>
        <TableCNToolbar
          table={table}
          searchPlaceholder="Search agents..."
          withViewOptions={false}
        />
      </TableCN>
      <div className="mt-2">
        <AgentSelectTablePagination table={table} />
      </div>
    </>
  );
}

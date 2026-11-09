import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNPagination,
  TableCNSortMenu,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { ViewModeToggle } from "@avplatform/ui/view-mode-toggle";

import { useFlowsView } from "@/features/01-build/flows-table/hooks/useFlowsView";
import { NoAgentsAvailable } from "@/features/04-assist/my-chats/components/NoAgentsAvailable";

import {
  AGENTS_ASSIST_INITIAL_STATE,
  AGENTS_ASSIST_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchSelectTableAgents } from "../hooks/useFetchSelectAgents";
import { AgentCard } from "./AgentCard";
import { agentsAssistTableColumns } from "./AgentsAssistTableColumns";
import { AgentsTableSkeleton } from "./AgentsTableSkeleton";

const PAGINATION_PROPS = {
  pageSizeOptions: AGENTS_ASSIST_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "agent", plural: "agents" },
};

/**
 * Agents assigned to the user's machines, as a card grid or a table with type and platform
 * filters and sorting.
 */
export const AgentsAssistTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { data, isLoading } = useFetchSelectTableAgents();
  const { view, setView } = useFlowsView(TABLE_KEY);

  // Page, size, sorting and filters live in the URL
  const { table } = useTableCN({
    data: data?.data || [],
    columns: agentsAssistTableColumns,
    getRowId: (agent) => agent.id,
    initialState: AGENTS_ASSIST_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });
  const rows = table.getRowModel().rows;

  if (isLoading) return <AgentsTableSkeleton />;

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between gap-4">
        <TableCNHeading heading={TABLE_HEADING} />
        <ViewModeToggle view={view} onChange={setView} />
      </div>

      <TableCNToolbar
        table={table}
        searchPlaceholder="Search agents..."
        withViewOptions={view === "table"}
      >
        <TableCNSortMenu table={table} />
      </TableCNToolbar>

      {rows.length === 0 ? (
        <NoAgentsAvailable includeChat={false} />
      ) : view === "grid" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4 2xl:gap-6">
            {rows.map((row) => (
              <AgentCard key={row.id} agent={row.original} />
            ))}
          </div>
          <TableCNPagination table={table} {...PAGINATION_PROPS} />
        </div>
      ) : (
        <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS} />
      )}
    </div>
  );
};

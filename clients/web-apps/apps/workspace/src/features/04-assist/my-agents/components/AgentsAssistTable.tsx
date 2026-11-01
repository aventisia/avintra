import { DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCNPagination, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";

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
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const AgentsAssistTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const { data, isLoading } = useFetchSelectTableAgents();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data || [],
    columns: agentsAssistTableColumns,
    getRowId: (agent) => agent.id,
    initialState: AGENTS_ASSIST_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  // Return the rendered card list.
  return (
    <>
      {!isLoading ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>
          </div>

          {/* Search for the card list */}
          <TableCNToolbar table={table} searchPlaceholder="Search..." withViewOptions={false} />

          {/* Agents grid, matching the library card grid */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4 2xl:gap-6">
              {table.getRowModel().rows.map((row) => (
                <AgentCard key={row.id} agent={row.original} />
              ))}
            </div>
          ) : (
            <NoAgentsAvailable includeChat={false} />
          )}
          {/* Card list pagination */}
          <TableCNPagination table={table} {...PAGINATION_PROPS} />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <AgentsTableSkeleton />
      )}
    </>
  );
};

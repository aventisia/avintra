import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { HelpButton } from "@/components/help/HelpButton";
import { NoAgentsAvailable } from "@/features/04-assist/my-chats/components/NoAgentsAvailable";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSelectTableAgents } from "../hooks/useFetchSelectAgents";
import { AgentCard } from "./AgentCard";
import { agentsAssistTableColumns } from "./AgentsAssistTableColumns";
import { AgentsTableSkeleton } from "./AgentsTableSkeleton";

/**
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const AgentsAssistTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  const { data, isLoading } = useFetchSelectTableAgents();

  // Create a React table for configs data
  const table = useDataTable(
    agentsAssistTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {!isLoading ? (
        <div className="mx-auto max-w-screen-lg space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="assist-agents" />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search..." />
            </div>
          </div>
          {/* Agents grid, matching the library card grid */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {table.getRowModel().rows.map((row) => (
                <AgentCard key={row.id} agent={row.original} />
              ))}
            </div>
          ) : (
            <NoAgentsAvailable includeChat={false} />
          )}
          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="agent" pluralLabel="agents" />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <AgentsTableSkeleton />
      )}
    </>
  );
};

import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { SEARCH_COLUMN } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchAgents } from "../hooks/useFetchAgents";
import { AgentCrudDialog } from "./agent-crud-dialog/AgentCrudDialog";
import { agentsTableColumns } from "./AgentsTableColumns";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { AgentsBulkActions } from "./AgentsBulkActions";

/**
 * Renders a table of agents.
 *
 * @returns The rendered AgentsTable component.
 */
export const AgentsTable = () => {
  // Fetch agents data
  const { data } = useFetchAgents();

  // Create a React table for agents data
  const table = useDataTable(
    agentsTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <AgentCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              {/* <AgentsTableHeading /> */}
              <DTHeading heading="Agents" />
              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search agents..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={agentsTableColumns.length}
              />
            </div>
          </AgentCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <AgentsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the agents data
        <DataTableSkeleton />
      )}
    </>
  );
};

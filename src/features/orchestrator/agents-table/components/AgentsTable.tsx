import {
  DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { TabsList, TabsTrigger } from "@aventisia/ui/tabs";

import { SEARCH_COLUMN } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchAgents } from "../hooks/useFetchAgents";

import { AgentCrudDialog } from "./agent-crud-dialog/AgentCrudDialog";
import { agentsTableColumns } from "./AgentsTableColumns";
import { AgentStats } from "./AgentStats";
import { AgentsBulkActions } from "./table-actions/AgentsBulkActions";

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

              <span className="me-4">
                <TabsList>
                  <TabsTrigger value="machines">Machines</TabsTrigger>
                  <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>
              </span>

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
            <div className="flex flex-col gap-2">
              <AgentStats data={data?.data} />
              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={agentsTableColumns.length}
                />
              </div>
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

import { HorizontalScrollWrapper } from "@avplatform/ui/components/HorizontalScrollWrapper";
import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchAgents } from "../hooks/useFetchAgents";
import { AgentStats } from "./AgentStats";
import { agentsTableColumns } from "./AgentsTableColumns";
import AgentConfigDialog from "./agent-config/AgentConfigDialog";
import AssignMachinesDialog from "./assign-machines/AssignMachinesDialog";
import AssignUsersDialog from "./assign-users/AssignUsersDialog";
import { AgentsBulkActions } from "./table-actions/AgentsBulkActions";
import DisableAgentDialog from "./table-actions/DisableAgentDialog";

/**
 * Renders a table of agents.
 *
 * @returns The rendered AgentsTable component.
 */
export const AgentsTable = () => {
  // Set the document title
  useDocumentTitle("Published");

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch agents data
  const { data } = useFetchAgents();

  // Create a React table for agents data
  const table = useDataTable(
    agentsTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            {/* <AgentsTableHeading /> */}
            <DTHeading heading="Published" />

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search agents..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
            </div>
          </div>

          {/* Data table to render data */}
          <div className="flex flex-col gap-2">
            <AgentStats data={data?.data} />
            <HorizontalScrollWrapper>
              <DataTable table={table} columnsLength={agentsTableColumns.length} />
            </HorizontalScrollWrapper>
          </div>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <AgentsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the agents data
        <DataTableSkeleton />
      )}
      <AssignMachinesDialog />
      <AssignUsersDialog />
      <DisableAgentDialog />
      <AgentConfigDialog />
    </>
  );
};

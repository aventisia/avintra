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
import { useShallow } from "zustand/react/shallow";

import { HelpButton } from "@/components/help/HelpButton";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { DATA_QUERY_KEY, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchAgents } from "../hooks/useFetchAgents";
import { useFetchPublishedUis } from "../hooks/useFetchPublishedUis.hook";
import { mapPublishedUisToAgentRows } from "../utils/map-published-ui-to-agent-row.util";
import { AgentStats } from "./AgentStats";
import { agentsTableColumns } from "./AgentsTableColumns";
import AgentConfigDialog from "./agent-config/AgentConfigDialog";
import AssignMachinesDialog from "./assign-machines/AssignMachinesDialog";
import UiBuilderAssignUsersDialog from "./published-ui/UiBuilderAssignUsersDialog";
import UiBuilderDisableDialog from "./published-ui/UiBuilderDisableDialog";
import UiBuilderPreviewDialog from "./published-ui/UiBuilderPreviewDialog";
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

  // Match the agents query key so sharing mutations refresh the table
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({ currentSpace: state.currentSpace })),
  );
  const { data: uis } = useFetchPublishedUis();

  const rows = [...(data?.data ?? []), ...mapPublishedUisToAgentRows(uis?.data ?? [])];

  // Create a React table for agents data
  const table = useDataTable(agentsTableColumns, rows, columnVisibility, sortState, true);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            {/* <AgentsTableHeading /> */}
            <div className="flex items-center gap-2">
              <DTHeading heading="Published" />
              <HelpButton guideId="published-agents" />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search agents..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
            </div>
          </div>

          {/* Data table to render data */}
          <div className="flex flex-col gap-2">
            <AgentStats data={data?.data} />
            <DataTable table={table} columnsLength={agentsTableColumns.length} />
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
      <ResourceUserAccessDialog queryKey={[...DATA_QUERY_KEY, currentSpace?.id]} allowInProd />
      <DisableAgentDialog />
      <AgentConfigDialog />
      <UiBuilderAssignUsersDialog />
      <UiBuilderDisableDialog />
      <UiBuilderPreviewDialog />
    </>
  );
};

import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNSortMenu,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import {
  AGENTS_INITIAL_STATE,
  AGENTS_PAGE_SIZE_OPTIONS,
  DATA_QUERY_KEY,
  TABLE_KEY,
} from "../constants";
import { useFetchAgents } from "../hooks/useFetchAgents";
import { useFetchPublishedUis } from "../hooks/useFetchPublishedUis.hook";
import { mapPublishedUisToAgentRows } from "../utils/map-published-ui-to-agent-row.util";
import { AgentStats } from "./AgentStats";
import { agentsTableColumns } from "./AgentsTableColumns";
import AgentConfigDialog from "./agent-config/AgentConfigDialog";
import AssignMachinesDialog from "./assign-machines/AssignMachinesDialog";
import AssignUsersDialog from "./assign-users/AssignUsersDialog";
import UiBuilderAssignUsersDialog from "./published-ui/UiBuilderAssignUsersDialog";
import UiBuilderDisableDialog from "./published-ui/UiBuilderDisableDialog";
import UiBuilderPreviewDialog from "./published-ui/UiBuilderPreviewDialog";
import { AgentsBulkActions } from "./table-actions/AgentsBulkActions";
import DisableAgentDialog from "./table-actions/DisableAgentDialog";

const PAGINATION_PROPS = {
  pageSizeOptions: AGENTS_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "agent", plural: "agents" },
};

/**
 * Renders a table of agents.
 *
 * @returns The rendered AgentsTable component.
 */
export const AgentsTable = () => {
  // Set the document title
  useDocumentTitle("Published");

  // Fetch agents data
  const { data } = useFetchAgents();

  // Match the agents query key so sharing mutations refresh the table
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({ currentSpace: state.currentSpace })),
  );
  const { data: uis } = useFetchPublishedUis();

  const rows = [...(data?.data ?? []), ...mapPublishedUisToAgentRows(uis?.data ?? [])];

  // Controlled search so the name cell can highlight matches, like the Agents page
  const [searchText, setSearchText] = useState("");
  const columns = useMemo(() => agentsTableColumns({ searchText }), [searchText]);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    getRowId: (row) => row.id,
    initialState: AGENTS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
    globalFilter: searchText,
    onGlobalFilterChange: setSearchText,
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-6 pt-6">
          {/* Page heading */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableCNHeading heading="Published" />
              </div>
            </div>

            {/* Table with its toolbar, pagination footer, and bulk actions */}
            <div className="flex flex-col gap-2">
              <AgentStats data={data?.data} />
              <TableCN
                table={table}
                label="Published"
                paginationProps={PAGINATION_PROPS}
                actionBar={<AgentsBulkActions table={table} />}
              >
                <TableCNToolbar table={table} searchPlaceholder="Search agents...">
                  <TableCNSortMenu table={table} />
                </TableCNToolbar>
              </TableCN>
            </div>
          </div>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the agents data
        <TableCNSkeleton columnCount={9} filterCount={2} withSearch className="py-5" />
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

import { DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
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
import { AgentStats } from "./AgentStats";
import { agentsTableColumns } from "./AgentsTableColumns";
import AgentConfigDialog from "./agent-config/AgentConfigDialog";
import AssignMachinesDialog from "./assign-machines/AssignMachinesDialog";
import { AgentsBulkActions } from "./table-actions/AgentsBulkActions";
import DisableAgentDialog from "./table-actions/DisableAgentDialog";

const PAGINATION_PROPS = { pageSizeOptions: AGENTS_PAGE_SIZE_OPTIONS };

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

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: agentsTableColumns,
    getRowId: (row) => row.id,
    initialState: AGENTS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading="Published" />
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
              <TableCNToolbar table={table} searchPlaceholder="Search agents..." />
            </TableCN>
          </div>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the agents data
        <TableCNSkeleton columnCount={9} />
      )}
      <AssignMachinesDialog />
      <ResourceUserAccessDialog queryKey={[...DATA_QUERY_KEY, currentSpace?.id]} allowInProd />
      <DisableAgentDialog />
      <AgentConfigDialog />
    </>
  );
};

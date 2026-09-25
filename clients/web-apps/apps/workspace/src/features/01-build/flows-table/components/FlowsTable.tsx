import { NoContentMessage } from "@avplatform/ui";
import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import NewAgentIcon from "@/components/NewAgentIcon";
import { QueryTabs } from "@/components/QueryTab";
import { HelpButton } from "@/components/help/HelpButton";
import { ArchivedFlowsTable } from "@/features/05-tenant-admin/archives-table/components/ArchivedFlowsTable";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import { TABLE_HEADING, TABLE_KEY, TABLE_TAB_QUERY_PARAM, TABLE_VIEW_TABS } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchFlows } from "../hooks/useFetchFlows";
import { useFlowsView } from "../hooks/useFlowsView";
import { useTableTab } from "../hooks/useTableTab";
import { FlowCard } from "./FlowCard";
import { FlowsBulkActions } from "./FlowsBulkActions";
import { FlowsGridSkeleton } from "./FlowsGridSkeleton";
import { flowsTableColumns } from "./FlowsTableColumns";
import { FlowsViewToggle } from "./FlowsViewToggle";

/**
 * Renders a table of flows.
 *
 * @returns The rendered FlowsTable component.
 */
export const FlowsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Use this in place FLOWS_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, isArchived, isShared, queryKey } = useTableTab();

  // Grid/table view preference (persisted in localStorage)
  const { view, setView } = useFlowsView();

  // Fetch flows data
  const { data } = useFetchFlows();

  const flowsTableColumnsArray = flowsTableColumns(isShared);

  // Create a React table for flows data
  const table = useDataTable(
    flowsTableColumnsArray,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  if (isArchived) return <ArchivedFlowsTable isPersonal />;

  // Distinguish "no agents created at all" from "no matches for the current search/tab".
  const hasNoAgents = (data?.data?.length ?? 0) === 0;

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="agents" />
              <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search agents..." />
              <FlowsViewToggle view={view} onChange={setView} />
              {view === "table" && (
                <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              )}
              {isPersonal && <DTCreateButton entity="flow" />}{" "}
            </div>
          </div>
          {/* Grid or table view of the flows data */}
          {view === "grid" ? (
            <>
              {table.getRowModel().rows.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
                  {table.getRowModel().rows.map((row) => (
                    <FlowCard key={row.id} flow={row.original} isShared={isShared} />
                  ))}
                </div>
              ) : hasNoAgents ? (
                <NoContentMessage
                  Icon={NewAgentIcon}
                  primaryMessage="No agents created"
                  secondaryMessage="Click on create agent to get started."
                  className="h-64"
                />
              ) : (
                <NoContentMessage
                  Icon={NewAgentIcon}
                  primaryMessage="No agents found"
                  secondaryMessage="Try adjusting your search."
                  className="h-64"
                />
              )}
              {/* Data table Pagination component */}
              <DTPagination table={table} singularLabel="agent" pluralLabel="agents" />
            </>
          ) : (
            <>
              {/* Data table to render data */}
              <DataTable table={table} columnsLength={flowsTableColumnsArray.length} />
              {/* Data table Pagination component */}
              <DTPagination table={table} />
            </>
          )}
          {/* Resource Share Dialog */}
          <ResourceShareDialog queryKey={queryKey} />
          {/* Bulk actions for data table */}
          {isPersonal && view === "table" && <FlowsBulkActions table={table} />}{" "}
        </div>
      ) : view === "grid" ? (
        // Show grid skeleton while fetching the flows data
        <div className="space-y-4 pb-4 pt-[17px]">
          <FlowsGridSkeleton />
        </div>
      ) : (
        // Show data table skeleton while fetching the flows data
        <DataTableSkeleton />
      )}
    </>
  );
};

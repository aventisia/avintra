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

import { QueryTabs } from "@/components/QueryTab";
import { HelpButton } from "@/components/help/HelpButton";
import { ArchivedFlowsTable } from "@/features/05-tenant-admin/archives-table/components/ArchivedFlowsTable";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import { TABLE_HEADING, TABLE_KEY, TABLE_TAB_QUERY_PARAM, TABLE_VIEW_TABS } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchFlows } from "../hooks/useFetchFlows";
import { useTableTab } from "../hooks/useTableTab";
import { FlowsBulkActions } from "./FlowsBulkActions";
import { flowsTableColumns } from "./FlowsTableColumns";

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
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              {isPersonal && <DTCreateButton entity="flow" />}{" "}
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={flowsTableColumnsArray.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />
          {/* Resource Share Dialog */}
          <ResourceShareDialog queryKey={queryKey} />
          {/* Bulk actions for data table */}
          {isPersonal && <FlowsBulkActions table={table} />}{" "}
        </div>
      ) : (
        // Show data table skeleton while fetching the flows data
        <DataTableSkeleton />
      )}
    </>
  );
};

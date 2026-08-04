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
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import { TABLE_HEADING, TABLE_KEY, TABLE_TAB_QUERY_PARAM, TABLE_VIEW_TABS } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchQueues } from "../hooks/useFetchQueues";
import { useTableTab } from "../hooks/useTableTab";
import { queuesTableColumns } from "./QueuesTableColumns";
import AssignAgentsDialog from "./assign-agents/AssignAgentsDialog";
import AssignUsersDialog from "./assign-users/AssignUsersDialog";
import { QueueBulkActions } from "./queue-row-actions/QueueBulkActions";
import UploadItemsDialog from "./queue-upload-items/UploadItemsDialog";

/**
 * Renders a table of queues.
 *
 * @returns The rendered queuesTable component.
 */
export const QueuesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, queryKey, isShared } = useTableTab();

  // Fetch queues data
  const { data } = useFetchQueues();

  const queuesTableColumnsArray = queuesTableColumns(isShared);

  // Create a React table for queues data
  const table = useDataTable(
    queuesTableColumnsArray,
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
          <AssignAgentsDialog />
          <AssignUsersDialog />
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search queues..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              {isPersonal && <DTCreateButton entity="queue" />}
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={queuesTableColumnsArray.length} />
          <UploadItemsDialog />
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Resource Share Dialog component */}
          <ResourceShareDialog queryKey={queryKey} />
          {/* Bulk actions for data table */}
          <QueueBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the queues data
        <DataTableSkeleton />
      )}
    </>
  );
};

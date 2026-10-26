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

import { HelpButton } from "@/components/help/HelpButton";
import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchQueues } from "../hooks/useFetchQueues";
import { useTableTab } from "../hooks/useTableTab";
import { queuesTableColumns } from "./QueuesTableColumns";
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

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Fetch queues data
  const { data } = useFetchQueues();

  const queuesTableColumnsArray = queuesTableColumns();

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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="queues" />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search queues..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton entity="queue" />
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={queuesTableColumnsArray.length} />
          <UploadItemsDialog />
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} />
          <ResourceFlowAccessDialog queryKey={queryKey} />
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

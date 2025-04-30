import { Separator } from "@aventisia/ui";
import { DataTable } from "@aventisia/ui/data-table";
import { DTPagination } from "@aventisia/ui/data-table";
import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { DTCreateButton } from "@aventisia/ui/data-table";
import { DTHeading } from "@aventisia/ui/data-table";
import { DTSearchBox } from "@aventisia/ui/data-table";
import { DTViewOptions } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchQueues } from "../hooks/useFetchQueues";
import { queuesTableColumns } from "./QueuesTableColumns";
import { QueueCrudDialog } from "./queue-crud-dialog/QueueCrudDialog";
import { QueueBulkActions } from "./queue-row-actions/QueueBulkActions";
import { QueueUploadItemsDialog } from "./queue-upload-items/QueueUploadItemsDialog";

/**
 * Renders a table of queues.
 *
 * @returns The rendered queuesTable component.
 */
export const QueuesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch queues data
  const { data } = useFetchQueues();

  // Create a React table for queues data
  const table = useDataTable(
    queuesTableColumns,
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
          <QueueUploadItemsDialog>
            <QueueCrudDialog>
              {/* Table toolbar */}
              <div className="flex items-center justify-between">
                <DTHeading heading={TABLE_HEADING} />

                <div className="flex items-center gap-2">
                  <DTSearchBox
                    table={table}
                    searchColumn={SEARCH_COLUMN}
                    placeholder="Search queues..."
                  />
                  <DTViewOptions {...{ table, columnDisplayNames }} />
                  <Separator orientation="vertical" className="mx-2 h-6" />
                  <DTCreateButton />
                </div>
              </div>

              {/* Data table to render data */}
              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={queuesTableColumns.length}
                />
              </div>
            </QueueCrudDialog>
          </QueueUploadItemsDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

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


import {
  DataTable,
  DataTableSkeleton,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect, useState } from "react";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { useFetchQueusWorkItemsList } from "../hooks/useFetchQueusWorkItemsList";

import { QueuesWorkItemsTableColumns } from "./QueuesWorkItemsTableColumns";
import { WorkItemsTableBulkActions } from "./table-actions/WorkItemsTableBulkActions";
import { PayloadTableHeading } from "./table-components/TableHeading";

/**
 * Renders a table of queues.
 *
 * @returns The rendered queuesTable component.
 */
export const QueuesWorkItemsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const [tableData, setTableData] = useState<QueueWorkItemDto[]>();

  // Fetch queues data
  const { data } = useFetchQueusWorkItemsList();

  useEffect(() => {
    if (data?.data) setTableData(data.data);
  }, [data?.data]);

  // Create a React table for queues data
  const table = useDataTable(
    QueuesWorkItemsTableColumns,
    tableData || [],
    columnVisibilityState,
    true,
  );
  // Return the rendered DataTable component.
  return (
    <>
      {tableData ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <PayloadTableHeading />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search queues..."
              />
              <DTViewOptions {...{ table, columnDisplayNames }} />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable
            table={table}
            columnsLength={QueuesWorkItemsTableColumns.length}
          />

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <WorkItemsTableBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the queues data
        <DataTableSkeleton />
      )}
    </>
  );
};

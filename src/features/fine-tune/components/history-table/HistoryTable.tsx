import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../../constants";
import { historyTablecolumnDisplayNames } from "../../constants/history-table-column-display-names";
import { historyTablecolumnVisibilityState } from "../../constants/history-table-column-visibility-state";
import { useFetchHistoryRecords } from "../../hooks/useFetchHistoryRecords";
import FineTuneStats from "../FineTuneStats";
import { HistoryCrudDialog } from "../history-crud-dialog.tsx/HistoryCrudDialog";
import { historyTableColumns } from "./HistoryTableColumns";

/**
 * Renders a table of history.
 *
 * @returns The rendered History Table component.
 */
export const HistoryTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch history data
  const { data } = useFetchHistoryRecords();

  const table = useDataTable(
    historyTableColumns,
    data?.data || [],
    historyTablecolumnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 px-1">
          {/* Crud ops dialog */}
          <HistoryCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />
              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search..."
                />
                <DTViewOptions
                  {...{
                    table,
                    columnDisplayNames: historyTablecolumnDisplayNames,
                  }}
                />
              </div>
            </div>
            <FineTuneStats />
          </HistoryCrudDialog>

          {/* Data table to render data */}
          <div className="bg-white rounded-lg">
            <DataTable
              table={table}
              columnsLength={historyTableColumns.length}
            />
          </div>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          {/* <ModelsBulkActions table={table} /> */}
        </div>
      ) : (
        // Show data table skeleton while fetching the models data
        <DataTableSkeleton />
      )}
    </>
  );
};

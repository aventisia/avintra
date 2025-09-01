import {
  DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { useFetchBillingHistory } from "../hooks/useFetchBillingHistory";
import { billingHistoryTableColumns } from "./BillingHistoryTableColumns";

/**
 * Renders a table of credits.
 *
 * @returns The rendered CreditsPlansTable component.
 */
export const BillingHistoryTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch models data
  const { data } = useFetchBillingHistory();

  const table = useDataTable(
    billingHistoryTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {/* Remove the ! operator once we have the actual data */}
      {!data ? (
        <div className="space-y-4 pb-4">
          {/* Crud ops dialog */}
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search History..."
              />
              <DTViewOptions {...{ table, columnDisplayNames }} />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable
            table={table}
            columnsLength={billingHistoryTableColumns.length}
          />

          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the models data
        <DataTableSkeleton />
      )}
    </>
  );
};

import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable } from "@avplatform/ui/hooks";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names.ee";
import { columnVisibilityState } from "../constants/column-visibility-state.ee";
import { useFetchBillingHistory } from "../hooks/useFetchBillingHistory.ee";
import { billingHistoryTableColumns } from "./BillingHistoryTableColumns.ee";

/**
 * Renders a table of credits.
 *
 * @returns The rendered CreditsPlansTable component.
 */
export const BillingHistoryTable = () => {
  // Set the document title
  // useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch models data
  const { data, isLoading } = useFetchBillingHistory();

  const table = useDataTable(
    billingHistoryTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {/* Remove the ! operator once we have the actual data */}
      {!isLoading ? (
        <div className="space-y-4 pb-4">
          {/* Crud ops dialog */}
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["invoice"]}
                placeholder="Search History..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={billingHistoryTableColumns.length} />

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

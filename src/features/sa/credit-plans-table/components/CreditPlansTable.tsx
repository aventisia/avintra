import {
  DataTable,
  DataTableSkeleton,
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchCreditPlans } from "../hooks/useFetchCreditPlans";

import { CreditPlansCrudDialog } from "./credit-plans-crud-dialog/CreditPlanCrudDialog";
import { CreditsBulkActions } from "./CreditBulkActions";
import { creditPlansTableColumns } from "./CreditPlansTableColumns";

/**
 * Renders a table of credits.
 *
 * @returns The rendered CreditsPlansTable component.
 */
export const CreditPlansTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch models data
  const { data } = useFetchCreditPlans();

  const table = useDataTable(
    creditPlansTableColumns,
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
          {/* Crud ops dialog */}
          <CreditPlansCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search plan..."
                />
                <DTViewOptions
                  {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
                />
                <DTCreateButton buttonText="Create Plan" />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={creditPlansTableColumns.length}
            />
          </CreditPlansCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <CreditsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the models data
        <DataTableSkeleton />
      )}
    </>
  );
};

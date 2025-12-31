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
import { useFetchPricingPlans } from "../hooks/useFetchPricingPlans";

import { PricingPlanCrudDialog } from "./pricingPlan-crud-dialog/PricingPlanCrudDialog";
import { PricingPlansBulkActions } from "./pricingPlan-table-actions/PricingPlansBulkActions";
import { pricingPlansTableColumns } from "./PricingPlansTableColumns";

/**
 * Renders a table of pricingplans.
 *
 * @returns The rendered PricingPlansTable component.
 */
export const PricingPlansTable = () => {
  // Set the document title to "PricingPlans".
  useDocumentTitle("Pricing Plans");

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch pricingplans data
  const { data } = useFetchPricingPlans();

  // Create a React table for pricingplans data
  const table = useDataTable(
    pricingPlansTableColumns,
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
          <PricingPlanCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search plans..."
                />
                <DTViewOptions
                  {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
                />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={pricingPlansTableColumns.length}
            />
          </PricingPlanCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <PricingPlansBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the pricingplans data
        <DataTableSkeleton />
      )}
    </>
  );
};

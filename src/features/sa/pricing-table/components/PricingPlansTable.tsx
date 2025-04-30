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
import { useFetchPricingPlans } from "../hooks/useFetchPricingPlans";
import { pricingPlansTableColumns } from "./PricingPlansTableColumns";
import { PricingPlanCrudDialog } from "./pricingPlan-crud-dialog/PricingPlanCrudDialog";
import { PricingPlansBulkActions } from "./pricingPlan-table-actions/PricingPlansBulkActions";

/**
 * Renders a table of pricingplans.
 *
 * @returns The rendered PricingPlansTable component.
 */
export const PricingPlansTable = () => {
  // Set the document title to "PricingPlans".
  useDocumentTitle("Pricing Plans");

  // Fetch pricingplans data
  const { data } = useFetchPricingPlans();

  // Create a React table for pricingplans data
  const table = useDataTable(
    pricingPlansTableColumns,
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
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={pricingPlansTableColumns.length}
              />
            </div>
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

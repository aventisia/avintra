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

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names.ee";
import { columnVisibilityState } from "../constants/column-visibility-state.ee";
import { useFetchSubPlans } from "../hooks/useFetchSubPlans.ee";
import { SubPlansBulkActions } from "./SubPlansBulkActions.ee";
import { subPlansTableColumns } from "./SubPlansTableColumns.ee";

/**
 * Renders a table of Subscription Plans.
 *
 * @returns The rendered SubPlansTable component.
 */
export const SubPlansTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch subscription plans data
  const { data } = useFetchSubPlans();

  // Create a React table for plans data
  const table = useDataTable(
    subPlansTableColumns,
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
              <HelpButton guideId="subscription-plans" />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search plans..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Create plan" entity="subscriptionPlan" />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={subPlansTableColumns.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <SubPlansBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the plans data
        <DataTableSkeleton />
      )}
    </>
  );
};

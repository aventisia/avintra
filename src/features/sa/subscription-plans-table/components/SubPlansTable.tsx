import {
  DataTable,
  DataTableSkeleton,
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSubPlans } from "../hooks/useFetchSubPlans";

import { SubPlansCrudDialog } from "./sub-plans-crud-dialog/SubPlansCrudDialog";
import { SubPlansBulkActions } from "./SubPlansBulkActions";
import { subPlansTableColumns } from "./SubPlansTableColumns";

/**
 * Renders a table of Subscription Plans.
 *
 * @returns The rendered SubPlansTable component.
 */
export const SubPlansTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch subscription plans data
  const { data } = useFetchSubPlans();

  // Create a React table for plans data
  const table = useDataTable(
    subPlansTableColumns,
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
          <SubPlansCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search agents..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <DTCreateButton buttonText="Create Agent" />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={subPlansTableColumns.length}
            />
          </SubPlansCrudDialog>

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

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
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
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

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Get the state and actions from the base layout store
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

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
          {/* Crud ops dialog */}
          <SubPlansCrudDialog>
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
                <DTCreateButton buttonText="Create Plan" />
              </div>
            </div>

            <ScrollArea
              className={
                sidebarExpand
                  ? "md:w-[calc(100vw-var(--sidebar-max-width)-3.5rem)]"
                  : "md:w-[calc(100vw-var(--sidebar-min-width)-3.5rem)]"
              }
            >
              {/* Data table to render data */}
              <DataTable
                table={table}
                columnsLength={subPlansTableColumns.length}
              />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
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

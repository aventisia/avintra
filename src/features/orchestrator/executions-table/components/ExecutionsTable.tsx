import {
  DataTable,
  DataTableSkeleton,
  // DTCreateButton,
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
import { useFetchExecutions } from "../hooks/useFetchExecutions";

// import { ExecutionCrudDialog } from "./execution-crud-dialog/ExecutionCrudDialog";
// import { ExecutionBulkActions } from "./execution-row-actions/ExecutionBulkActions";
import { executionsTableColumns } from "./ExecutionsTableColumns";

/**
 * Renders a table of executions.
 *
 * @returns The rendered executionsTable component.
 */
export const ExecutionsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch executions data
  const { data } = useFetchExecutions();

  // Create a React table for executions data
  const table = useDataTable(
    executionsTableColumns,
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
          {/* <ExecutionCrudDialog> */}
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search executions..."
              />
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
              {/* <DTCreateButton /> */}
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable
            table={table}
            columnsLength={executionsTableColumns.length}
          />
          {/* </ExecutionCrudDialog> */}

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          {/* <ExecutionBulkActions table={table} /> */}
        </div>
      ) : (
        // Show data table skeleton while fetching the executions data
        <DataTableSkeleton />
      )}
    </>
  );
};

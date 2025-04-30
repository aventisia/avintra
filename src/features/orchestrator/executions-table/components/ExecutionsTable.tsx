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
import { useFetchExecutions } from "../hooks/useFetchExecutions";
import { executionsTableColumns } from "./ExecutionsTableColumns";
import { ExecutionCrudDialog } from "./execution-crud-dialog/ExecutionCrudDialog";
import { ExecutionBulkActions } from "./execution-row-actions/ExecutionBulkActions";

/**
 * Renders a table of executions.
 *
 * @returns The rendered executionsTable component.
 */
export const ExecutionsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch executions data
  const { data } = useFetchExecutions();

  // Create a React table for executions data
  const table = useDataTable(
    executionsTableColumns,
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
          <ExecutionCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search executions..."
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
                columnsLength={executionsTableColumns.length}
              />
            </div>
          </ExecutionCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <ExecutionBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the executions data
        <DataTableSkeleton />
      )}
    </>
  );
};

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
import { useFetchFlows } from "../hooks/useFetchFlows";
import { FlowsBulkActions } from "./FlowsBulkActions";
import { flowsTableColumns } from "./FlowsTableColumns";
import { FlowCrudDialog } from "./flow-crud-dialog/FlowCrudDialog";

/**
 * Renders a table of flows.
 *
 * @returns The rendered FlowsTable component.
 */
export const FlowsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch flows data
  const { data } = useFetchFlows();

  // Create a React table for flows data
  const table = useDataTable(
    flowsTableColumns,
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
          <FlowCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search flows..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton buttonText="Create Agent" />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={flowsTableColumns.length}
              />
            </div>
          </FlowCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <FlowsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the flows data
        <DataTableSkeleton />
      )}
    </>
  );
};

import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";
import { SEARCH_COLUMN } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchFlows } from "../hooks/useFetchFlows";
import { useFlowsQueryKey } from "../hooks/useFlowsQueryKey";
import { FlowCrudDialog } from "./flow-crud-dialog/FlowCrudDialog";
import { FlowsBulkActions } from "./FlowsBulkActions";
import { flowsTableColumns } from "./FlowsTableColumns";
import { FlowsTableHeading } from "./FlowsTableHeading";

/**
 * Renders a table of flows.
 *
 * @returns The rendered FlowsTable component.
 */
export const FlowsTable = () => {
  // Set flows query key, projectId and projectName in store
  useFlowsQueryKey();

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
              <FlowsTableHeading />

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

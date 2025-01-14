import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { SEARCH_COLUMN } from "../constants";
import { logsTableColumns } from "./LogTableColumns";
import { columnVisibilityState } from "../constants/columns-visibility-state";
import { useFetchFlowLogs } from "../hooks/useFetchFlowLogs";

export const FlowLogsTable = () => {
  // Fetch flow logs data
  const { data } = useFetchFlowLogs();

  // Create a React table for flow logs data
  const table = useDataTable(
    logsTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );
  // Return the rendered DataTable component.
  return (
    <>
      <div className="m-5 flex-1 space-y-4">
        {data ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              {/* Table toolbar */}
              <div className="flex items-center justify-end">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search Flows..."
                />
              </div>
              {/* Data table to render data */}
              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={logsTableColumns.length}
                />
              </div>
            </div>
            {/* Data table Pagination component */}
            <DTPagination table={table} />
          </div>
        ) : (
          // Show data table skeleton while fetching the flow logs data
          <DataTableSkeleton />
        )}
      </div>
    </>
  );
};

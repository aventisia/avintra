import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { logsTableColumns } from "./LogTableColumns";
import { columnVisibilityState } from "../constants/columns-visibility-state";
import { useFetchFlowLogs } from "../hooks/useFetchFlowLogs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/react-toolkit/ui/buttons/Button";

export const FlowLogsTable = () => {
  // Fetch flow logs data
  const { data } = useFetchFlowLogs();

  const navigate = useNavigate();

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
      <div className="m-5 space-y-4 pb-4 pt-[17px]">
      <Button variant="link" onClick={() => navigate(-1)}>Back to flow</Button>
      {data ? (
        <>
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search Flows..."
              />
            </div>
          </div>

          {/* Data table to render data */}
          <div className="rounded-md border">
            <DataTable table={table} columnsLength={logsTableColumns.length} />
          </div>

          {/* Data table Pagination component */}
          <DTPagination table={table} />
          </>
        ) : (
          // Show data table skeleton while fetching the flow logs data
          <DataTableSkeleton />
        )}
        </div>
    </>
  );
};

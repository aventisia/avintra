import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { DataTable } from "@/react-toolkit/ui/data-table/DataTable";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";
import { SEARCH_COLUMN } from "../constants/constants";
import { useFetchFlows } from "../hooks/useFetchFlows";
import { useFlowsQueryKey } from "../hooks/useFlowsQueryKey";
import { FlowCrudDialog } from "./flow-crud-dialog/FlowCrudDialog";
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
  const table = useDataTable(flowsTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog for flow crud operation */}
          <FlowCrudDialog>
            <div className="flex items-center justify-between">
              {/* Heading of the flow table */}
              <FlowsTableHeading />

              {/* Search, view and create flow container */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search flows..."
                />
                {/* Column view filter */}
                <DTViewOptions table={table} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                {/* Create flow button */}
                <DTCreateButton buttonText="Create Flow" />
              </div>
            </div>
            {/* Data table container */}
            <div className="rounded-md border">
              {/* Main data table component to render the flows data. */}
              <DataTable
                table={table}
                columnsLength={flowsTableColumns.length}
              />
            </div>
          </FlowCrudDialog>
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the flows data
        <DataTableSkeleton />
      )}
    </>
  );
};

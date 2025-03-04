import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { MachineCrudDialog } from "./machine-crud-dialog/MachineCrudDialog";
import { MachineTableColumns } from "./MachineTableColumns";
import { useFetchMachines } from "../hooks/useFetchMachines";
import { MachinesBulkActions } from "./MachinesBulkActions";
import { MachineAssignAgentDialog } from "./machine-assign-agent-dialog/MachineAssignAgentDialog";

/**
 * Renders a table of machines.
 *
 * @returns The rendered machinesTable component.
 */
export const MachineTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch machines data
  const { data } = useFetchMachines();

  // Create a React table for machines data
  const table = useDataTable(
    MachineTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* machine flow or agent assignemt ops dialog */}
          <MachineAssignAgentDialog>
            {/* Crud ops dialog */}
            <MachineCrudDialog>
              {/* Table toolbar */}
              <div className="flex items-center justify-between">
                <DTHeading heading={TABLE_HEADING} />

                <div className="flex items-center gap-2">
                  <DTSearchBox
                    table={table}
                    searchColumn={SEARCH_COLUMN}
                    placeholder="Search machines..."
                  />
                  <DTViewOptions {...{ table, columnDisplayNames }} />
                  <Separator orientation="vertical" className="mx-2 h-6" />
                  <DTCreateButton />
                </div>
              </div>

              {/* Data table to render data */}
              <div className="rounded-md border bg-slate-50">
                <DataTable
                  table={table}
                  columnsLength={MachineTableColumns.length}
                />
              </div>
            </MachineCrudDialog>
          </MachineAssignAgentDialog>

          {/* Data table Pagination component */}
          <div className="rounded-md border bg-slate-50 py-3">
            <DTPagination table={table} />
          </div>

          {/* Bulk actions for data table */}
          <MachinesBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the machines data
        <DataTableSkeleton />
      )}
    </>
  );
};

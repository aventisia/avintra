import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchMachines } from "../hooks/useFetchMachines";
import { MachineStats } from "./MachineStats";
import { machinesTableColumns } from "./MachinesTableColumns";
import { MachineCrudDialog } from "./machine-crud-dialog/MachineCrudDialog";
import { MachinesBulkActions } from "./machine-row-actions/MachinesBulkActions";

/**
 * Renders a table of machines.
 *
 * @returns The rendered MachinesTable component.
 */
export const MachinesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch machines data
  const { data } = useFetchMachines();

  // Create a React table for machines data
  const table = useDataTable(
    machinesTableColumns,
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
          <MachineCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumns={["name", "status", "username", "environment", "operatingSystem"]}
                  placeholder="Search by name, status, username, env, or OS..."
                />
                <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
                <DTCreateButton buttonText="Add Machine" />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="flex flex-col gap-2">
              <MachineStats data={data?.data} />
              <DataTable table={table} columnsLength={machinesTableColumns.length} />
            </div>
          </MachineCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="machine" pluralLabel="machines" />

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

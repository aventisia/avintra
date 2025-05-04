import { Separator } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { TabsList, TabsTrigger } from "@aventisia/ui/tabs";

import { useDtCrudQueryAction } from "@/react-toolkit/hooks/useDtCrudQueryAction";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchMachines } from "../hooks/useFetchMachines";

import { MachineCrudDialog } from "./machine-crud-dialog/MachineCrudDialog";
import { MachinesBulkActions } from "./machine-row-actions/MachinesBulkActions";
import { machinesTableColumns } from "./MachinesTableColumns";
import { MachineStats } from "./MachineStats";

/**
 * Renders a table of machines.
 *
 * @returns The rendered MachinesTable component.
 */
export const MachinesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch machines data
  const { data } = useFetchMachines();

  useDtCrudQueryAction(data?.data);

  // Create a React table for machines data
  const table = useDataTable(
    machinesTableColumns,
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
          <MachineCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <span className="me-4">
                <TabsList>
                  <TabsTrigger value="machines">Machines</TabsTrigger>
                  <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>
              </span>

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search machines..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton buttonText="Add Machine" />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="flex flex-col gap-2">
              <MachineStats data={data?.data} />
              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={machinesTableColumns.length}
                />
              </div>
            </div>
          </MachineCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

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

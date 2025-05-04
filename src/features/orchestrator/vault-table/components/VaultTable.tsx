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

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchVaults } from "../hooks/useFetchVaults";

import { VaultCrudDialog } from "./vault-crud-dialog/VaultCrudDialog";
import { VaultsBulkActions } from "./vault-row-actions/VaultsBulkActions";
import { vaultsTableColumns } from "./VaultsTableColumns";

/**
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const VaultTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch configs data
  const { data } = useFetchVaults();

  // Create a React table for configs data
  const table = useDataTable(
    vaultsTableColumns,
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
          <VaultCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search configs..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton buttonText="Add" />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={vaultsTableColumns.length}
              />
            </div>
          </VaultCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <VaultsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <DataTableSkeleton />
      )}
    </>
  );
};

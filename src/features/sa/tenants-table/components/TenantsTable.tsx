import { Separator } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchTenants } from "../hooks/useFetchTenants";

import { TenantCrudDialog } from "./tenant-crud-dialog/TenantCrudDialog";
import { TenantsBulkActions } from "./TenantsBulkActions";
import { tenantsTableColumns } from "./TenantsTableColumns";

/**
 * Renders a table of tenants.
 *
 * @returns The rendered TenantsTable component.
 */
export const TenantsTable = () => {
  // Set the document title to "Tenants".
  useDocumentTitle("Tenants");

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch tenants data
  const { data } = useFetchTenants();

  // Create a React table for tenants data
  const table = useDataTable(
    tenantsTableColumns,
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
          <TenantCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search tenants..."
                />
                <DTViewOptions
                  {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
                />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={tenantsTableColumns.length}
            />
          </TenantCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <TenantsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the tenants data
        <DataTableSkeleton />
      )}
    </>
  );
};

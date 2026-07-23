import { HorizontalScrollWrapper } from "@avplatform/ui/components/HorizontalScrollWrapper";
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
import { useFetchOnPremTenants } from "../hooks/useFetchOnPremTenants";
import { OnPremTenantsBulkActions } from "./OnPremTenantsBulkActions";
import { onPremTenantsTableColumns } from "./OnPremTenantsTableColumns";
import { OnPremTenantCrudDialog } from "./on-prem-tenant-crud-dialog/OnPremTenantCrudDialog";

/**
 * Renders a table of on-prem tenants.
 *
 * @returns The rendered OnPremTenantsTable component.
 */
export const OnPremTenantsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch on-prem tenants data
  const { data } = useFetchOnPremTenants();

  // Create a React table for on-prem tenants data
  const table = useDataTable(
    onPremTenantsTableColumns,
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
          <OnPremTenantCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumns={["name"]}
                  placeholder="Search tenants..."
                />
                <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
                <DTCreateButton buttonText="Create" />
              </div>
            </div>

            <HorizontalScrollWrapper>
              <div className="pr-0.5">
                {/* Data table to render data */}
                <DataTable table={table} columnsLength={onPremTenantsTableColumns.length} />
              </div>
            </HorizontalScrollWrapper>
          </OnPremTenantCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <OnPremTenantsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the tenants data
        <DataTableSkeleton />
      )}
    </>
  );
};

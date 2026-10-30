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

import { HelpButton } from "@/components/help/HelpButton.ee";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names.ee";
import { columnVisibilityState } from "../constants/column-visibility-state.ee";
import { useFetchOnPremTenants } from "../hooks/useFetchOnPremTenants.ee";
import { OnPremTenantsBulkActions } from "./OnPremTenantsBulkActions.ee";
import { onPremTenantsTableColumns } from "./OnPremTenantsTableColumns.ee";

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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="on-prem-tenants" />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search tenants..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Create" entity="onPremTenant" />
            </div>
          </div>

          <div className="pr-0.5">
            {/* Data table to render data */}
            <DataTable table={table} columnsLength={onPremTenantsTableColumns.length} />
          </div>
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

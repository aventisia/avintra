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
import { useFetchTenants } from "../hooks/useFetchTenants";
import { DateRangeFilter } from "./DateRangeFilter";
import { PlanFilter } from "./PlanFilter";
import { SATenantStats } from "./SATenantStats";
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
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search tenants..." />
              <DateRangeFilter />
              <PlanFilter table={table} data={data.data} columnId="activePlan" />{" "}
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton entity="tenant" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <SATenantStats data={data?.data} />

            <HorizontalScrollWrapper>
              {/* Data table to render data */}
              <DataTable table={table} columnsLength={tenantsTableColumns.length} />
            </HorizontalScrollWrapper>
          </div>
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

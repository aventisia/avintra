import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import {
  DTCreateButton,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { NavLink } from "react-router-dom";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names.ee";
import { columnVisibilityState } from "../constants/column-visibility-state.ee";
import { useFetchTenantInstances } from "../hooks/useFetchTenantInstances.ee";
import { useTenantRoute } from "../hooks/useTenantRoute.ee";
import { TenantInstanceBulkActions } from "./TenantInstanceBulkActions.ee";
import { tenantInstanceTableColumns } from "./TenantInstanceTableColumns.ee";
import { TenantStats } from "./TenantStats.ee";

/**
 * Renders a table of on-prem tenants.
 *
 * @returns The rendered TenantInstanceTable component.
 */
export const TenantInstanceTable = () => {
  const { tid, tname } = useTenantRoute();
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch on-prem tenants data
  const { data } = useFetchTenantInstances(tid ?? "");

  // Create a React table for on-prem tenants data
  const table = useDataTable(
    tenantInstanceTableColumns,
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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to="/ga/on-prem-tenants">On-prem tenants</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-96 truncate capitalize">{tname}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Create" entity="tenantInstance" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <TenantStats />

            <div className="pr-0.5">
              {/* Data table to render data */}
              <DataTable table={table} columnsLength={tenantInstanceTableColumns.length} />
            </div>
          </div>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <TenantInstanceBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the tenants data
        <DataTableSkeleton />
      )}
    </>
  );
};

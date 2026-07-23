import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { HorizontalScrollWrapper } from "@avplatform/ui/components/HorizontalScrollWrapper";
import {
  DTPagination,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { NavLink } from "react-router-dom";

import { useTenantRoute } from "../../on-prem-tenant-instance/hooks/useTenantRoute";
import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchTenantInstancesData } from "../hooks/useFetchTenantInstancesData";
import { DateRangeFilter } from "./DateRangeFilter";
import { instanceDataTableColumns } from "./InstanceDataTableColumns";
import { TenantInstanceStats } from "./TenantInstanceStats";

/**
 * Renders a table of on-prem tenants.
 *
 * @returns The rendered TenantInstanceDataTable component.
 */
export const TenantInstanceDataTable = () => {
  const { tid, tname, id, iname } = useTenantRoute();
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch on-prem tenants data
  const { data } = useFetchTenantInstancesData(id ?? "");

  // Create a React table for on-prem tenants data
  const table = useDataTable(
    instanceDataTableColumns,
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
                    <NavLink to="/ga/on-prem-tenants">On-prem Tenants</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to={`/ga/on-prem-tenants/${tid}?tname=${encodeURIComponent(tname)}`}>
                      {tname}
                    </NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-96 truncate capitalize">{iname}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-2">
              <DateRangeFilter />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <TenantInstanceStats />

            <HorizontalScrollWrapper>
              <div className="pr-0.5">
                {/* Data table to render data */}
                <DataTable table={table} columnsLength={instanceDataTableColumns.length} />
              </div>
            </HorizontalScrollWrapper>
          </div>

          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the tenants data
        <DataTableSkeleton />
      )}
    </>
  );
};

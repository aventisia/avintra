import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { NavLink } from "react-router-dom";

import { useTenantRoute } from "../../on-prem-tenant-instance/hooks/useTenantRoute.ee";
import {
  TABLE_HEADING,
  TABLE_KEY,
  TENANT_INSTANCE_DATA_INITIAL_STATE,
  TENANT_INSTANCE_DATA_PAGE_SIZE_OPTIONS,
} from "../constants";
import { useFetchTenantInstancesData } from "../hooks/useFetchTenantInstancesData.ee";
import { DateRangeFilter } from "./DateRangeFilter.ee";
import { instanceDataTableColumns } from "./InstanceDataTableColumns.ee";
import { TenantInstanceStats } from "./TenantInstanceStats.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: TENANT_INSTANCE_DATA_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of on-prem tenants.
 *
 * @returns The rendered TenantInstanceDataTable component.
 */
export const TenantInstanceDataTable = () => {
  const { tid, tname, id, iname } = useTenantRoute();
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch on-prem tenants data
  const { data } = useFetchTenantInstancesData(id ?? "");

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: instanceDataTableColumns,
    initialState: TENANT_INSTANCE_DATA_INITIAL_STATE,
    persistKey: TABLE_KEY,
  });

  // Return the rendered TableCN component.
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
                    <NavLink to="/on-prem-tenants">On-prem tenants</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to={`/on-prem-tenants/${tid}?tname=${encodeURIComponent(tname)}`}>
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
          </div>

          {/* Data table with its view options, filters, stats and footer */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            <TableCNToolbar table={table}>
              <DateRangeFilter />
            </TableCNToolbar>
            <TenantInstanceStats />
          </TableCN>
        </div>
      ) : (
        // Show the table skeleton while fetching the tenants data
        <TableCNSkeleton columnCount={7} filterCount={1} />
      )}
    </>
  );
};

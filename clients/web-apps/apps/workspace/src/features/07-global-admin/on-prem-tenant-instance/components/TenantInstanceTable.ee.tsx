import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { NavLink } from "react-router-dom";

import {
  TABLE_HEADING,
  TABLE_KEY,
  TENANT_INSTANCE_INITIAL_STATE,
  TENANT_INSTANCE_PAGE_SIZE_OPTIONS,
} from "../constants";
import { useFetchTenantInstances } from "../hooks/useFetchTenantInstances.ee";
import { useTenantRoute } from "../hooks/useTenantRoute.ee";
import { TenantInstanceBulkActions } from "./TenantInstanceBulkActions.ee";
import { tenantInstanceTableColumns } from "./TenantInstanceTableColumns.ee";
import { TenantStats } from "./TenantStats.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: TENANT_INSTANCE_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of on-prem tenants.
 *
 * @returns The rendered TenantInstanceTable component.
 */
export const TenantInstanceTable = () => {
  const { tid, tname } = useTenantRoute();
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch on-prem tenants data
  const { data } = useFetchTenantInstances(tid ?? "");

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: tenantInstanceTableColumns,
    getRowId: (row) => row.id,
    initialState: TENANT_INSTANCE_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
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
              <CrudCreateButton buttonText="Create" entity="tenantInstance" />
            </div>
          </div>

          {/* Data table with its search, stats, footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<TenantInstanceBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search..." />
            <TenantStats />
          </TableCN>
        </div>
      ) : (
        // Show the table skeleton while fetching the tenants data
        <TableCNSkeleton columnCount={7} withSearch />
      )}
    </>
  );
};

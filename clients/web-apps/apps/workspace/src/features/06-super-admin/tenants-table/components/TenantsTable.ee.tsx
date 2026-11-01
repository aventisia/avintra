import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";

import {
  TABLE_HEADING,
  TABLE_KEY,
  TENANTS_INITIAL_STATE,
  TENANTS_PAGE_SIZE_OPTIONS,
} from "../constants";
import { useFetchTenants } from "../hooks/useFetchTenants.ee";
import { DateRangeFilter } from "./DateRangeFilter.ee";
import { PlanFilter } from "./PlanFilter.ee";
import { SATenantStats } from "./SATenantStats.ee";
import { TenantsBulkActions } from "./TenantsBulkActions.ee";
import { tenantsTableColumns } from "./TenantsTableColumns.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: TENANTS_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of tenants.
 *
 * @returns The rendered TenantsTable component.
 */
export const TenantsTable = () => {
  // Set the document title to "Tenants".
  useDocumentTitle("Tenants");

  // Fetch tenants data
  const { data } = useFetchTenants();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: tenantsTableColumns,
    initialState: TENANTS_INITIAL_STATE,
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
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>

            <div className="flex items-center gap-2">
              <DTCreateButton entity="tenant" />
            </div>
          </div>

          {/* Data table with its search, filters, stats, footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<TenantsBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search tenants..." />
            <div className="flex items-center gap-2">
              <DateRangeFilter />
              <PlanFilter table={table} data={data.data} columnId="activePlan" />
            </div>
            <SATenantStats data={data?.data} />
          </TableCN>
        </div>
      ) : (
        // Show the table skeleton while fetching the tenants data
        <TableCNSkeleton columnCount={8} filterCount={2} withSearch />
      )}
    </>
  );
};

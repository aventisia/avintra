import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";

import { HelpButton } from "@/components/help/HelpButton.ee";

import {
  ON_PREM_TENANTS_INITIAL_STATE,
  ON_PREM_TENANTS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchOnPremTenants } from "../hooks/useFetchOnPremTenants.ee";
import { OnPremTenantsBulkActions } from "./OnPremTenantsBulkActions.ee";
import { onPremTenantsTableColumns } from "./OnPremTenantsTableColumns.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: ON_PREM_TENANTS_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of on-prem tenants.
 *
 * @returns The rendered OnPremTenantsTable component.
 */
export const OnPremTenantsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch on-prem tenants data
  const { data } = useFetchOnPremTenants();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: onPremTenantsTableColumns,
    getRowId: (row) => row.id,
    initialState: ON_PREM_TENANTS_INITIAL_STATE,
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
              <TableCNHeading heading={TABLE_HEADING} />
              <HelpButton guideId="on-prem-tenants" />
            </div>

            <div className="flex items-center gap-2">
              <CrudCreateButton buttonText="Create" entity="onPremTenant" />
            </div>
          </div>

          {/* Data table with its search, view options, footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<OnPremTenantsBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search tenants..." />
          </TableCN>
        </div>
      ) : (
        // Show the table skeleton while fetching the tenants data
        <TableCNSkeleton columnCount={8} withSearch />
      )}
    </>
  );
};

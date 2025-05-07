import { DataTable, DataTableSkeleton } from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { useFetchBillingAddresses } from "../../hooks/useFetchBillingAddresses";

import { AddressTableColumns } from "./AddressTableColumns";

const columnVisibilityState = {
  id: true,
};

/**
 * Renders a table of billing.
 *
 * @returns The rendered AddressTable component.
 */
export const AddressTable = () => {
  // Set the document title to "BillingPlans".
  useDocumentTitle("Billing Plans");

  // Fetch billingplans data
  const { data } = useFetchBillingAddresses();

  // Create a React table for billingplans data
  const table = useDataTable(
    AddressTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={AddressTableColumns.length} />
        </div>
      ) : (
        // Show data table skeleton while fetching the billingplans data
        <DataTableSkeleton />
      )}
    </>
  );
};

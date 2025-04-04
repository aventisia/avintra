import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { columnVisibilityState } from "../../constants/column-visibility-state";
import { AddressTableColumns } from "./AddressTableColumns";
import { useFetchBillingAddresses } from "../../hooks/useFetchBillingAddresses";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";

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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <h2 className="ml-1 flex w-full items-center truncate text-base font-medium text-foreground">
              My Addreses
            </h2>
            <DTCreateButton buttonText="Add Address" />
          </div>

          {/* Data table to render data */}
          <div className="rounded-md border">
            <DataTable
              table={table}
              columnsLength={AddressTableColumns.length}
            />
          </div>
        </div>
      ) : (
        // Show data table skeleton while fetching the billingplans data
        <DataTableSkeleton />
      )}
    </>
  );
};

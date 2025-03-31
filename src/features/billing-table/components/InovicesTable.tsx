import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchInovices } from "../hooks/useFetchInovices";
import { InovicesBulkActions } from "./inovice-table-actions/InovicesBulkActions";
import { inovicesTableColumns } from "./InovicesTableColumns";
import { BillingAddressCrudDialog } from "./billingAddress-crud-dialog/BillingAddressCrudDialog";
import { BillingAddressList } from "./BillingAddressList";

/**
 * Renders a table of billing.
 *
 * @returns The rendered InovicesTable component.
 */
export const InovicesTable = () => {
  // Set the document title to "BillingPlans".
  useDocumentTitle("Billing Plans");

  // Fetch billingplans data
  const { data } = useFetchInovices();

  // Create a React table for billingplans data
  const table = useDataTable(
    inovicesTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      <BillingAddressList />
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <BillingAddressCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search billingplans..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={inovicesTableColumns.length}
              />
            </div>
          </BillingAddressCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <InovicesBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the billingplans data
        <DataTableSkeleton />
      )}
    </>
  );
};

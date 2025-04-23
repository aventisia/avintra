import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";

import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchInovices } from "../hooks/useFetchInovices";
import { BillingAddressCrudDialog } from "./billingAddress-crud-dialog/BillingAddressCrudDialog";
import { InovicesBulkActions } from "./inovice-table-actions/InovicesBulkActions";
import { inovicesTableColumns } from "./InovicesTableColumns";
import { InvoicesStats } from "./InvoicesStats";

/**
 * Renders a table of billing.
 *
 * @returns The rendered InovicesTable component.
 */
export const InovicesTable = () => {
  // Set the document title to "billing plans".
  useDocumentTitle("Billing");

  // Fetch billing plans data
  const { data } = useFetchInovices();

  // Create a React table for billing plans data
  const table = useDataTable(
    inovicesTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <BillingAddressCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="ml-1 flex w-full items-center truncate text-base font-medium text-foreground">
                Inovices
              </h2>

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn="name"
                  placeholder="Search  invoices..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
              </div>
            </div>
            {/* Data table to render data */}

            <div className="flex flex-col gap-2">
              <InvoicesStats />

              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={inovicesTableColumns.length}
                />
              </div>
            </div>
          </BillingAddressCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <InovicesBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the billing plans data
        <DataTableSkeleton />
      )}
    </>
  );
};

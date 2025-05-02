import { Separator } from "@aventisia/ui";
import { DataTable } from "@aventisia/ui/data-table";
import { DTPagination } from "@aventisia/ui/data-table";
import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { DTHeading } from "@aventisia/ui/data-table";
import { DTSearchBox } from "@aventisia/ui/data-table";
import { DTViewOptions } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSaLicenses } from "../hooks/useFetchSaLicenses";
import { ManageSaLicenseButton } from "./ManageSaLicenseButton";
import { SaLicensesStats } from "./SaLicensesStats";
import { saLicensesTableColumns } from "./SaLicensesTableColumns";
import { SaLicenseCrudDialog } from "./sa-license-crud-dialog/SaLicenseCrudDialog";

/**
 * Renders a table of licenses.
 *
 * @returns The rendered LicensesTable component.
 */
export const SaLicensesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch licenses data
  const { data } = useFetchSaLicenses();

  // Create a React table for licenses data
  const table = useDataTable(
    saLicensesTableColumns,
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
          <SaLicenseCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search licenses..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <ManageSaLicenseButton />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="flex flex-col gap-2">
              <SaLicensesStats />
              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={saLicensesTableColumns.length}
                />
              </div>
            </div>
          </SaLicenseCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the licenses data
        <DataTableSkeleton />
      )}
    </>
  );
};

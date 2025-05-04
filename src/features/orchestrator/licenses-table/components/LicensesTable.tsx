import { Separator } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchLicenses } from "../hooks/useFetchLicenses";

import { LicenseCrudDialog } from "./license-crud-dialog/LicenseCrudDialog";
import { LicensesStats } from "./LicensesStats";
import { licensesTableColumns } from "./LicensesTableColumns";
import { ManageLicenseButton } from "./ManageLicenseButton";

/**
 * Renders a table of licenses.
 *
 * @returns The rendered LicensesTable component.
 */
export const LicensesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch licenses data
  const { data } = useFetchLicenses();

  // Create a React table for licenses data
  const table = useDataTable(
    licensesTableColumns,
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
          <LicenseCrudDialog>
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
                <ManageLicenseButton />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="flex flex-col gap-2">
              <LicensesStats />
              <div className="rounded-md border">
                <DataTable
                  table={table}
                  columnsLength={licensesTableColumns.length}
                />
              </div>
            </div>
          </LicenseCrudDialog>

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

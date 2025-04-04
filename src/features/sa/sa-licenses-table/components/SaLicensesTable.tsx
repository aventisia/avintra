import { useDataTable } from '@/react-toolkit/hooks/useDataTable';
import { useDocumentTitle } from '@/react-toolkit/hooks/useDocumentTitle';
import { DataTable } from '@/react-toolkit/ui/data-table';
import { DataTableSkeleton } from '@/react-toolkit/ui/data-table/DataTableSkeleton';
import { DTPagination } from '@/react-toolkit/ui/data-table/DTPagination';
import { DTHeading } from '@/react-toolkit/ui/data-table/toolbar/DTHeading';
import { DTSearchBox } from '@/react-toolkit/ui/data-table/toolbar/DTSearchBox';
import { DTViewOptions } from '@/react-toolkit/ui/data-table/toolbar/DTViewOptions';
import { Separator } from '@/react-toolkit/ui/separator';

import { SEARCH_COLUMN, TABLE_HEADING } from '../constants';
import { columnDisplayNames } from '../constants/column-display-names';
import { columnVisibilityState } from '../constants/column-visibility-state';
import { useFetchSaLicenses } from '../hooks/useFetchSaLicenses';
import { SaLicenseCrudDialog } from './sa-license-crud-dialog/SaLicenseCrudDialog';
import { SaLicensesStats } from './SaLicensesStats';
import { saLicensesTableColumns } from './SaLicensesTableColumns';
import { ManageSaLicenseButton } from './ManageSaLicenseButton';

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

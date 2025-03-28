import { useDataTable } from '@/react-toolkit/hooks/useDataTable';
import { useDocumentTitle } from '@/react-toolkit/hooks/useDocumentTitle';
import { DataTable } from '@/react-toolkit/ui/data-table';
import { DataTableSkeleton } from '@/react-toolkit/ui/data-table/DataTableSkeleton';
import { DTPagination } from '@/react-toolkit/ui/data-table/DTPagination';
import { DTCreateButton } from '@/react-toolkit/ui/data-table/toolbar/DTCreateButton';
import { DTHeading } from '@/react-toolkit/ui/data-table/toolbar/DTHeading';
import { DTSearchBox } from '@/react-toolkit/ui/data-table/toolbar/DTSearchBox';
import { DTViewOptions } from '@/react-toolkit/ui/data-table/toolbar/DTViewOptions';
import { Separator } from '@/react-toolkit/ui/separator';

import { SEARCH_COLUMN, TABLE_HEADING } from '../constants';
import { columnDisplayNames } from '../constants/column-display-names';
import { columnVisibilityState } from '../constants/column-visibility-state';
import { useFetchExecutions } from '../hooks/useFetchExecutions';
import { ExecutionCrudDialog } from './execution-crud-dialog/ExecutionCrudDialog';
import { ExecutionBulkActions } from './execution-row-actions/ExecutionBulkActions';
import { executionsTableColumns } from './ExecutionsTableColumns';

/**
 * Renders a table of executions.
 *
 * @returns The rendered executionsTable component.
 */
export const ExecutionsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch executions data
  const { data } = useFetchExecutions();

  // Create a React table for executions data
  const table = useDataTable(
    executionsTableColumns,
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
          <ExecutionCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search executions..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={executionsTableColumns.length}
              />
            </div>
          </ExecutionCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <ExecutionBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the executions data
        <DataTableSkeleton />
      )}
    </>
  );
};

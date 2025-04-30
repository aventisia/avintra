import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchTriggers } from "../hooks/useFetchTriggers";
import { triggersTableColumns } from "./TriggersTableColumns";
import { TriggerBulkActions } from "./table-actions/TriggerBulkActions";
import { TriggerCrudDialog } from "./trigger-crud-dialog/TriggerCrudDialog";

/**
 * Renders a table of triggers.
 *
 * @returns The rendered triggersTable component.
 */
export const TriggersTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch triggers data
  const { data } = useFetchTriggers();

  // Create a React table for triggers data
  const table = useDataTable(
    triggersTableColumns,
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
          <TriggerCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search triggers..."
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
                columnsLength={triggersTableColumns.length}
              />
            </div>
          </TriggerCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <TriggerBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the triggers data
        <DataTableSkeleton />
      )}
    </>
  );
};

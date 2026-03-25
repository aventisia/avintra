import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchTriggers } from "../hooks/useFetchTriggers";
import { TriggerTabs } from "./TriggerTabs";
import { triggersTableColumns } from "./TriggersTableColumns";
// import { TriggerBulkActions } from "./table-actions/TriggerBulkActions";
import { TriggerCrudDialog } from "./trigger-crud-dialog/TriggerCrudDialog";

/**
 * Renders a table of triggers.
 *
 * @returns The rendered triggersTable component.
 */
export const MessageTriggersTable = () => {
  // Set the document title
  useDocumentTitle(`Message - ${TABLE_HEADING}`);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch triggers data
  const { data, isLoading } = useFetchTriggers();

  // Create a React table for triggers data
  const table = useDataTable(
    triggersTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {!isLoading ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <TriggerCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DTHeading heading={TABLE_HEADING} />
                <TriggerTabs />
              </div>
              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search triggers..."
                />
                <DTViewOptions
                  {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
                />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={triggersTableColumns.length}
            />
          </TriggerCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          {/* <TriggerBulkActions table={table} /> */}
        </div>
      ) : (
        // Show data table skeleton while fetching the triggers data
        <DataTableSkeleton />
      )}
    </>
  );
};

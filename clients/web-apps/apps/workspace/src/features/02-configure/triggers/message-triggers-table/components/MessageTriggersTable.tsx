import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchTriggers } from "../hooks/useFetchTriggers";
import { useTableTab } from "../hooks/useTableTab";
import { triggersTableColumns } from "./TriggersTableColumns";

// import { TriggerBulkActions } from "./table-actions/TriggerBulkActions";

/**
 * Renders a table of triggers.
 *
 * @returns The rendered triggersTable component.
 */
export const MessageTriggersTable = () => {
  // Set the document title
  useDocumentTitle(`${TABLE_HEADING}`);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();
  // Fetch triggers data
  const { data, isLoading } = useFetchTriggers();

  const triggersTableColumnsArray = triggersTableColumns();

  // Create a React table for triggers data
  const table = useDataTable(
    triggersTableColumnsArray,
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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["name"]}
                placeholder="Search triggers..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton entity="messageTrigger" />
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={triggersTableColumnsArray.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} />

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

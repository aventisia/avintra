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

import { QueryTabs } from "@/components/QueryTab";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import {
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
} from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchTriggers } from "../hooks/useFetchTriggers";
import { useTableTab } from "../hooks/useTableTab";
import { triggersTableColumns } from "./TriggersTableColumns";
// import { TriggerBulkActions } from "./table-actions/TriggerBulkActions";
import { TriggerCrudDialog } from "./trigger-crud-dialog/TriggerCrudDialog";

/**
 * Renders a table of triggers.
 *
 * @returns The rendered triggersTable component.
 */
export const TriggersTable = () => {
  // Set the document title
  useDocumentTitle(`${TABLE_HEADING}`);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, queryKey, isShared } = useTableTab();

  // Fetch triggers data
  const { data } = useFetchTriggers();

  const triggersTableColumnsArray = triggersTableColumns(isShared);
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
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <TriggerCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DTHeading heading={TABLE_HEADING} />
                <QueryTabs
                  tabs={TABLE_VIEW_TABS}
                  key={TABLE_TAB_QUERY_PARAM}
                />{" "}
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
                {isPersonal && <DTCreateButton />}
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={triggersTableColumnsArray.length}
            />
          </TriggerCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Resource Share Dialog component */}
          <ResourceShareDialog queryKey={queryKey} />

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

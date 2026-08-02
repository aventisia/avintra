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

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchApiKeys } from "../hooks/useFetchApiKeys.hook";
import { getApiKeysTableColumns } from "./ApiKeysTableColumns";
import { ApiKeyBulkActions } from "./api-key-row-actions/ApiKeyBulkActions";

/**
 * Renders a table of API keys.
 */
export const ApiKeysTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch API keys data
  const { data } = useFetchApiKeys();

  // Build table columns
  const apiKeysTableColumns = getApiKeysTableColumns();

  // Create a React table for API keys data
  const table = useDataTable(
    apiKeysTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["name"]}
                placeholder="Search API keys..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Create" entity="apiKey" />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={apiKeysTableColumns.length} />

          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="key" pluralLabel="keys" />

          {/* Bulk actions for data table */}
          <ApiKeyBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the API keys data
        <DataTableSkeleton />
      )}
    </>
  );
};

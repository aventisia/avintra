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

import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchConfigStores } from "../hooks/useFetchConfigStores";
import { useTableTab } from "../hooks/useTableTab";
import { configStoresTableColumns } from "./ConfigStoresTableColumns";
import { ConfigStoresBulkActions } from "./config-store-row-actions/ConfigStoresBulkActions";

/**
 * Renders a table of config stores.
 *
 * @returns The rendered ConfigStoresTable component.
 */
export const ConfigStoresTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Fetch the merged config stores data
  const { data } = useFetchConfigStores();

  const configStoresTableColumnsArray = configStoresTableColumns();

  // Create a React table for config stores data
  const table = useDataTable(
    configStoresTableColumnsArray,
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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["name"]}
                placeholder="Search key stores..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton entity="configstore" />
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={configStoresTableColumnsArray.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />
          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} allowInProd />
          <ResourceFlowAccessDialog queryKey={queryKey} />
          {/* Bulk actions for data table */}
          <ConfigStoresBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the config stores data
        <DataTableSkeleton />
      )}
    </>
  );
};

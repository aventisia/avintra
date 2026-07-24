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
import { useFetchOnPremLLMs } from "../hooks/useFetchOnPremLLM";
import { OnPremLLMBulkActions } from "./OnPremLLMTableBulkAction";
import { onPremLLMsTableColumns } from "./OnPremLLMTableColumns";

export const OnPremLLMTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch models data
  const { data } = useFetchOnPremLLMs();

  const table = useDataTable(
    onPremLLMsTableColumns,
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
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["llm"]} placeholder="Search Model..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Add Model" entity="onPremLLM" />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={onPremLLMsTableColumns.length} />

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <OnPremLLMBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the models data
        <DataTableSkeleton />
      )}
    </>
  );
};

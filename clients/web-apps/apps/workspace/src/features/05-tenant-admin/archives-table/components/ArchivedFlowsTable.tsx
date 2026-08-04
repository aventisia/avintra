import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { QueryTabs } from "@/components/QueryTab";

import { TABLE_HEADING, TABLE_KEY, TABLE_TAB_QUERY_PARAM, TABLE_VIEW_TABS } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchArchivedFlows } from "../hooks/useFetchArchivedFlows";
import { archivedFlowsTableColumns } from "./ArchivedFlowsTableColumns";

/**
 * Renders a table of Archived flows.
 *
 * @returns The rendered ArchivedFlowsTable component.
 */
export const ArchivedFlowsTable = ({ isPersonal = false }: { isPersonal?: boolean }) => {
  // Set the document title
  useDocumentTitle(isPersonal ? "Agents" : TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch Archived flows data
  const { data } = useFetchArchivedFlows({ isPersonal });

  // Create a React table for Archived flows data
  const table = useDataTable(
    archivedFlowsTableColumns,
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
              <DTHeading heading={isPersonal ? "Agents" : TABLE_HEADING} />
              {isPersonal && <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />}{" "}
            </div>{" "}
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search agents..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={archivedFlowsTableColumns.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the Archived flows data
        <DataTableSkeleton />
      )}
    </>
  );
};

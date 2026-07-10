import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { HorizontalScrollWrapper } from "@/react-toolkit/ui/HorizontalScrollWrapper";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchConversationsList } from "../hooks/useFetchConversationsList";
import { ConversationsStats } from "./ConversationsStats";
import { conversationsTableColumns } from "./ConversationsTableColumns";
import { DateRangeFilter } from "./DateRangeFilter";

/**
 * Renders a table of Conversations.
 *
 * @returns The rendered ConversationsTable component.
 */
export const ConversationsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch conversations data
  const { data } = useFetchConversationsList();

  // Create a React table for conversations data
  const table = useDataTable(
    conversationsTableColumns,
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
                placeholder="Search..."
              />
              <DateRangeFilter />
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
            </div>
          </div>

          {/* Data table to render data */}
          <div className="flex flex-col gap-2">
            <ConversationsStats data={data?.data} />
            <HorizontalScrollWrapper>
              <DataTable
                table={table}
                columnsLength={conversationsTableColumns.length}
              />
            </HorizontalScrollWrapper>
          </div>

          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the conversations data
        <DataTableSkeleton />
      )}
    </>
  );
};

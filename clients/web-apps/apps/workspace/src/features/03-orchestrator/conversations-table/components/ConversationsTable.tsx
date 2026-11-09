import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { useState } from "react";

import {
  CONVERSATIONS_INITIAL_STATE,
  CONVERSATIONS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchConversationsList } from "../hooks/useFetchConversationsList";
import { ChannelFilter, ChannelFilterValue } from "./ChannelFilter";
import { ConversationsStats } from "./ConversationsStats";
import { conversationsTableColumns } from "./ConversationsTableColumns";
import { DateRangeFilter } from "./DateRangeFilter";

const PAGINATION_PROPS = { pageSizeOptions: CONVERSATIONS_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of Conversations.
 *
 * @returns The rendered ConversationsTable component.
 */
export const ConversationsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const [channel, setChannel] = useState<ChannelFilterValue>("all");

  // Fetch conversations data
  const { data } = useFetchConversationsList(channel === "all" ? undefined : channel);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: conversationsTableColumns,
    initialState: CONVERSATIONS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>
          </div>

          {/* Table with its toolbar, statistics strip and pagination footer */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            {/* Channel and date-range filters beside the search */}
            <TableCNToolbar table={table} searchPlaceholder="Search...">
              <ChannelFilter value={channel} onChange={setChannel} />
              <DateRangeFilter />
            </TableCNToolbar>

            {/* Statistics strip reads the fetched data, not the table instance */}
            <ConversationsStats data={data?.data} />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the conversations data
        <TableCNSkeleton columnCount={7} withSearch />
      )}
    </>
  );
};

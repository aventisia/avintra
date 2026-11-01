import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the Conversations query to be used in the query client. ["Conversations"]
 */
const DATA_QUERY_KEY = ["Conversations"];

/**
 * The heading for the Conversations table.
 */
const TABLE_HEADING = "Conversations";

const TABLE_KEY = "Conversations";

/** Page sizes offered by the table, unchanged from the legacy table. */
const CONVERSATIONS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const CONVERSATIONS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  CONVERSATIONS_INITIAL_STATE,
  CONVERSATIONS_PAGE_SIZE_OPTIONS,
};

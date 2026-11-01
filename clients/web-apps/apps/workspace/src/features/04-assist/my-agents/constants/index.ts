import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The heading for the table.
 */
const TABLE_HEADING = "My Agents";

const TABLE_KEY = "agents-assist";

/** Page sizes offered by the agents table, unchanged from the legacy table. */
const AGENTS_ASSIST_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const AGENTS_ASSIST_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
};

export { TABLE_HEADING, TABLE_KEY, AGENTS_ASSIST_INITIAL_STATE, AGENTS_ASSIST_PAGE_SIZE_OPTIONS };

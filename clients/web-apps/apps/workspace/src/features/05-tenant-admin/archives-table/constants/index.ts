import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

const ARCHIVED_FLOWS_QUERY_KEY = ["archived-flows"];

const TABLE_HEADING = "Archives";

const TABLE_KEY = "archives";

/** Page sizes offered by the table, unchanged from the legacy table. */
const ARCHIVED_FLOWS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const ARCHIVED_FLOWS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

export {
  ARCHIVED_FLOWS_INITIAL_STATE,
  ARCHIVED_FLOWS_PAGE_SIZE_OPTIONS,
  ARCHIVED_FLOWS_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
};

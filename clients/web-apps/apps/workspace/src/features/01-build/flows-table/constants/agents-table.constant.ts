import { TABLE_CN_ACTIONS_COLUMN_ID, TableCNRowLabels } from "@avplatform/ui/table-cn";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

export const AGENTS_SEARCH_COLUMNS = ["name"];

export const AGENTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const AGENTS_ROW_LABELS: TableCNRowLabels = { singular: "agent", plural: "agents" };

export const AGENTS_TABLE_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

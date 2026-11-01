import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import type { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

export const TABLE_KEY = "agents-table";

export const DATA_QUERY_KEY = ["agents"];

/** Page sizes offered by the table, unchanged from the legacy table. */
export const AGENTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const AGENTS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Assign machines", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

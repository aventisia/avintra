import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
export const DATA_QUERY_KEY = ["queues-work-items"];

/**
 * The heading for the queues table.
 */
export const TABLE_HEADING = "Work Items";

export const TABLE_KEY = "work-items";

/** Page sizes offered by the table, unchanged from the legacy table. */
export const WORK_ITEMS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const WORK_ITEMS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add works items", description: "" };
    case "read":
      return { heading: "Works items", description: "" };
    case "update":
      return { heading: "Edit works items", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

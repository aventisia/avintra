import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["webhook-triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Webhook Triggers";

const TABLE_KEY = "webhook-triggers";

/** Page sizes offered by the table, unchanged from the legacy table. */
const WEBHOOK_TRIGGERS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const WEBHOOK_TRIGGERS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create webhook trigger", description: "" };
    case "read":
      return { heading: "Webhook trigger", description: "" };
    case "update":
      return { heading: "Edit webhook trigger", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
  WEBHOOK_TRIGGERS_INITIAL_STATE,
  WEBHOOK_TRIGGERS_PAGE_SIZE_OPTIONS,
};

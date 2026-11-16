import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
const DATA_QUERY_KEY = ["queues"];

const QUEUE_USER_KEY = "QUEUE_USER";

/**
 * The heading for the queues table.
 */
const TABLE_HEADING = "Queues";

const TABLE_KEY = "queues";

/** Page sizes offered by the table, unchanged from the legacy table. */
const QUEUES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const QUEUES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create queue", description: "" };
    case "read":
      return { heading: "Queue", description: "" };
    case "update":
      return { heading: "Edit queue", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  QUEUE_USER_KEY,
  getDialogHeadingDescription,
  QUEUES_INITIAL_STATE,
  QUEUES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
};

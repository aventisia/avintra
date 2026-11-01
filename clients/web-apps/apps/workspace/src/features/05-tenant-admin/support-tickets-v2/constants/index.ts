import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

const DATA_QUERY_KEY = ["support-tickets-v2"];

const TABLE_HEADING = "Support Tickets";

const TABLE_KEY = "support-tickets-v2";

/** Page sizes offered by the table, unchanged from the legacy table. */
const TICKETS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const TICKETS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return {
        heading: "Create support ticket",
        description: "Fill in the details to raise a new request",
      };
    case "read":
      return { heading: "Support ticket", description: "" };
    case "update":
      return { heading: "Edit support ticket", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
  TICKETS_INITIAL_STATE,
  TICKETS_PAGE_SIZE_OPTIONS,
};

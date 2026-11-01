import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the users query to be used in the query client. ["users"]
 */
const DATA_QUERY_KEY = ["users"];

/**
 * The heading for the users table.
 */
const TABLE_HEADING = "Users";

const TABLE_KEY = "users";

/** Page sizes offered by the table, unchanged from the legacy table. */
const USERS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const USERS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Invite user", description: "" };
    case "read":
      return { heading: "User", description: "" };
    case "update":
      return { heading: "Edit user", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  USERS_INITIAL_STATE,
  USERS_PAGE_SIZE_OPTIONS,
  getDialogHeadingDescription,
};

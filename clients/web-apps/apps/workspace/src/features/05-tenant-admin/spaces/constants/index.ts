import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the spaces query to be used in the query client. ["spaces"]
 */
const DATA_QUERY_KEY = ["spaces"];

/**
 * The heading for the spaces table.
 */
const TABLE_HEADING = "Spaces";

const TABLE_KEY = "spaces";

/** Page sizes offered by the table, unchanged from the legacy table. */
const SPACES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const SPACES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create space", description: "" };
    case "read":
      return { heading: "Space", description: "" };
    case "update":
      return { heading: "Edit space", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  SPACES_INITIAL_STATE,
  SPACES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};

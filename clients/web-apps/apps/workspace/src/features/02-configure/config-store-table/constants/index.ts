import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the config stores query to be used in the query client.
 */
const DATA_QUERY_KEY = ["configstore"];

/**
 * The heading for the config stores table.
 */
const TABLE_HEADING = "Key Store";

const TABLE_KEY = "config-store";

/** Page sizes offered by the table, unchanged from the legacy table. */
const CONFIG_STORES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const CONFIG_STORES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create key store", description: "" };
    case "read":
      return { heading: "Key store", description: "" };
    case "update":
      return { heading: "Edit key store", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  CONFIG_STORES_INITIAL_STATE,
  TABLE_KEY,
  CONFIG_STORES_PAGE_SIZE_OPTIONS,
};

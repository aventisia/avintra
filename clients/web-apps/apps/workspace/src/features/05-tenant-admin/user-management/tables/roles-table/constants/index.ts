import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { roleTableColumnvisibilityState } from "./column-visibility-state";

export const DATA_QUERY_KEY = ["roles"];
export const TABLE_HEADING = "Roles";
export const TABLE_KEY = "roles";

/** Page sizes offered by the table, unchanged from the legacy table. */
export const ROLES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const ROLES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: roleTableColumnvisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add role", description: "" };
    case "read":
      return { heading: "View role", description: "" };
    case "update":
      return { heading: "Edit role", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

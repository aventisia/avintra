import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

const BILLING_HISOTRY_QUERY_KEY = ["billing_history"];

const TABLE_HEADING = "Billing History";

const TABLE_KEY = "billing-history";

/** Page sizes offered by the table, unchanged from the legacy table. */
const BILLING_HISTORY_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const BILLING_HISTORY_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create history", description: "" };
    case "read":
      return { heading: "Billing history", description: "" };
    case "update":
      return { heading: "Edit history", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  BILLING_HISOTRY_QUERY_KEY,
  BILLING_HISTORY_INITIAL_STATE,
  BILLING_HISTORY_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};

import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

const CREDIT_PLANS_QUERY_KEY = ["credit_plans"];

const TABLE_HEADING = "Credit Plans";

const TABLE_KEY = "credit-plans";

/** Page sizes offered by the table, unchanged from the legacy table. */
const CREDIT_PLANS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const CREDIT_PLANS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create plan", description: "" };
    case "read":
      return { heading: "Plan", description: "" };
    case "update":
      return { heading: "Edit plan", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  CREDIT_PLANS_INITIAL_STATE,
  CREDIT_PLANS_PAGE_SIZE_OPTIONS,
  CREDIT_PLANS_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};

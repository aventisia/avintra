import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

const PLANS_QUERY_KEY = ["subscription-plans"];

const TABLE_HEADING = "Subscription Plans";

const TABLE_KEY = "subscription-plans";

/** Page sizes offered by the table, unchanged from the legacy table. */
const SUB_PLANS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const SUB_PLANS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create subscription plan", description: "" };
    case "read":
      return { heading: "Subscription plan", description: "" };
    case "update":
      return { heading: "Edit subscription plans", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

function displayValue(value: number) {
  if (value === -1) return "Unlimited";
  if (value === 0) return "N/A";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export {
  PLANS_QUERY_KEY,
  SUB_PLANS_INITIAL_STATE,
  SUB_PLANS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
  displayValue,
};

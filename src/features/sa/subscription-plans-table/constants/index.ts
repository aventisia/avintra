import { CrudActionType } from "@aventisia/ui/types";

const PLANS_QUERY_KEY = ["subscription-plans"];

const TABLE_HEADING = "Subscription Plans";

const TABLE_KEY = "subscription-plans";

/**
 * The column used for searching in the Subscription Plans.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Subscription Plan", description: "" };
    case "read":
      return { heading: "Subscription Plan", description: "" };
    case "update":
      return { heading: "Edit Subscription Plans", description: "" };
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
  TABLE_HEADING,
  TABLE_KEY,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
  displayValue,
};

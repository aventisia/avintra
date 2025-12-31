import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the pricing plans query to be used in the query client. ["pricingplans"]
 */
const DATA_QUERY_KEY = ["pricingplans"];

/**
 * The heading for the pricing plans table.
 */
const TABLE_HEADING = "Pricing Plans";

const TABLE_KEY = "pricing-plans";

/**
 * The column used for searching in the pricing plans.
 */
const SEARCH_COLUMN = "pricingComponent";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Plan", description: "" };
    case "read":
      return { heading: "Plan", description: "" };
    case "update":
      return { heading: "Edit Plan", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};

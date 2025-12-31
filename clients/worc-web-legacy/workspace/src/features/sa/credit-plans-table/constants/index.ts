import { CrudActionType } from "@aventisia/ui/types";

const CREDIT_PLANS_QUERY_KEY = ["credit_plans"];

const TABLE_HEADING = "Credit Plans";

const TABLE_KEY = "credit-plans";

/**
 * The column used for searching in the models.
 */
const SEARCH_COLUMN = "serviceType";

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
  CREDIT_PLANS_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
};

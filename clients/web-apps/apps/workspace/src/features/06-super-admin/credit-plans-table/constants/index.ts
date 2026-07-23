import { CrudActionType } from "@avplatform/ui/types";

const CREDIT_PLANS_QUERY_KEY = ["credit_plans"];

const TABLE_HEADING = "Credit Plans";

const TABLE_KEY = "credit-plans";

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

export { CREDIT_PLANS_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };

import { CrudActionType } from "@aventisia/ui/types";

const BILLING_HISOTRY_QUERY_KEY = ["billing_history"];

const TABLE_HEADING = "Billing History";

const TABLE_KEY = "billing-history";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create History", description: "" };
    case "read":
      return { heading: "Billing History", description: "" };
    case "update":
      return { heading: "Edit History", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  BILLING_HISOTRY_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};

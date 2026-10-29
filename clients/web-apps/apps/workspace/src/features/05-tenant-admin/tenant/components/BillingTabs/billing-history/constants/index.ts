import { DialogCrudAction } from "@avplatform/ui/types";

const BILLING_HISOTRY_QUERY_KEY = ["billing_history"];

const TABLE_HEADING = "Billing History";

const TABLE_KEY = "billing-history";

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

export { BILLING_HISOTRY_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };

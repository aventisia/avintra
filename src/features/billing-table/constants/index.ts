import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the billing Address query to be used in the query client. ["billingAddress"]
 */
export const DATA_QUERY_KEY = ["billing-addresses"];

export const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Address", description: "" };
    case "read":
      return { heading: "Address", description: "" };
    case "update":
      return { heading: "Edit Address", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

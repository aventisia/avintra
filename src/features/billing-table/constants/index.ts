import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the billing Address query to be used in the query client. ["billingAddress"]
 */
const DATA_QUERY_KEY = ["billings"];

/**
 * The heading for the billing Address table.
 */
const TABLE_HEADING = "Billing";

/**
 * The column used for searching in the billing Address.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
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

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};

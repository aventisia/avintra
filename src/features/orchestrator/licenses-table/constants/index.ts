import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the licenses query to be used in the query client. ["licenses"]
 */
const DATA_QUERY_KEY = ["my-licenses"];

/**
 * The heading for the licenses table.
 */
const TABLE_HEADING = "Licenses & Credits";

const TABLE_KEY = "licenses-and-credits";

/**
 * The column used for searching in the licenses.
 */
const SEARCH_COLUMN = "pricingComponent";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Manage Licenses & Credits", description: "" };
    case "read":
      return { heading: "License & Credits", description: "" };
    case "update":
      return { heading: "Update Request", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
};

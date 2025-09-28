import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the licenses query to be used in the query client. ["licenses"]
 */
const DATA_QUERY_KEY = ["all-licenses"];

/**
 * The heading for the licenses table.
 */
const TABLE_HEADING = "Licenses & Credits";

const TABLE_KEY = "sa-licenses-and-credits";

/**
 * The column used for searching in the licenses.
 */
const SEARCH_COLUMN = "tenantName";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Manage Licenses & Credits", description: "" };
    case "read":
      return { heading: "License & Credits", description: "" };
    case "update":
      return { heading: "Record Payment", description: "" };
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

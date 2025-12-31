import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["vault"];

/**
 * The heading for the configs table.
 */
const TABLE_HEADING = "Vault";

const TABLE_KEY = "vault";

/**
 * The column used for searching in the configs.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (action: CrudActionType) => {
  switch (action) {
    case "create":
      return { heading: "Add Credential", description: "" };
    case "read":
      return { heading: "Credential", description: "" };
    case "update":
      return { heading: "Edit Credential", description: "" };
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

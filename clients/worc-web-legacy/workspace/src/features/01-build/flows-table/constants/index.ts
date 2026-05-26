import { CrudActionType } from "@aventisia/ui/types";

const FLOWS_QUERY_KEY = ["flows"];

const TABLE_HEADING = "Agents";

const TABLE_KEY = "flows";

/**
 * The column used for searching in the flows.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Agent", description: "" };
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Edit Agent", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  FLOWS_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};

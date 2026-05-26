import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["email-triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Triggers";

const TABLE_KEY = "email-triggers";

/**
 * The column used for searching in the triggers.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Email Trigger", description: "" };
    case "read":
      return { heading: "Email Trigger", description: "" };
    case "update":
      return { heading: "Edit Email Trigger", description: "" };
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

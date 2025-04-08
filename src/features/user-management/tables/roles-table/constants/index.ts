import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the roles query to be used in the query client. ["roles"]
 */
const DATA_QUERY_KEY = ["roles"];

/**
 * The heading for the roles table.
 */
const TABLE_HEADING = "Roles";

/**
 * The column used for searching in the roles table.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Role", description: "" };
    case "read":
      return { heading: "Role", description: "" };
    case "update":
      return { heading: "Edit Role", description: "" };
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

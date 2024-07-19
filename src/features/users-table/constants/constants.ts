import { CrudActionType } from "@/react-toolkit/types";

/**
 * The unique key for the users query to be used in the query client. ["users"]
 */
const DATA_QUERY_KEY = ["users"];

/**
 * The unique key for the user roles query to be used in the query client. ["userRoles"]
 */
const USER_ROLES_QUERY_KEY = ["userRoles"];

/**
 * The heading for the users table.
 */
const TABLE_HEADING = "Users";

/**
 * The column used for searching in the users.
 */
const SEARCH_COLUMN = "firstName";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create User", description: "" };
    case "read":
      return { heading: "User", description: "" };
    case "update":
      return { heading: "Edit User", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  USER_ROLES_QUERY_KEY,
  TABLE_HEADING,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};

import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the users query to be used in the query client. ["users"]
 */
const DATA_QUERY_KEY = ["users"];

/**
 * The heading for the users table.
 */
const TABLE_HEADING = "Users";

const TABLE_KEY = "users";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Invite User", description: "" };
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
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};

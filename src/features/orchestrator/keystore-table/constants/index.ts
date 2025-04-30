import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the keystores query to be used in the query client. ["keystores"]
 */
const DATA_QUERY_KEY = ["keystore"];

/**
 * The heading for the keystores table.
 */
const TABLE_HEADING = "Key Store";

/**
 * The column used for searching in the keystores.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create key", description: "" };
    case "read":
      return { heading: "Key", description: "" };
    case "update":
      return { heading: "Edit key", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
};

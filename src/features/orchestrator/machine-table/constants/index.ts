import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the Machines query to be used in the query client. ["Machines"]
 */
const DATA_QUERY_KEY = ["machines"];

/**
 * The heading for the Machines table.
 */
const TABLE_HEADING = "Machines";

/**
 * The column used for searching in the Machines.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Machine", description: "" };
    case "read":
      return { heading: "Machine", description: "" };
    case "update":
      return { heading: "Edit Machine", description: "" };
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

import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the machines query to be used in the query client. ["machines"]
 */
const DATA_QUERY_KEY = ["machines"];

/**
 * The heading for the machines table.
 */
const TABLE_HEADING = "Machines";

/**
 * The column used for searching in the machines.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Machine", description: "" };
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

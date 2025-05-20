import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
const DATA_QUERY_KEY = ["queues"];

/**
 * The heading for the queues table.
 */
const TABLE_HEADING = "Queues";

/**
 * The column used for searching in the queues.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Queue", description: "" };
    case "read":
      return { heading: "Queue", description: "" };
    case "update":
      return { heading: "Edit Queue", description: "" };
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

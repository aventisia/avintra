import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the models query to be used in the query client. ["models"]
 */
const DATA_QUERY_KEY = ["models"];

/**
 * The heading for the models table.
 */
const TABLE_HEADING = "Model Library";

/**
 * The column used for searching in the models.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create new model", description: "" };
    case "read":
      return { heading: "Model", description: "" };
    case "update":
      return { heading: "Edit model", description: "" };
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

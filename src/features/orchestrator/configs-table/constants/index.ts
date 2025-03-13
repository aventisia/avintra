import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["configs"];

/**
 * The heading for the configs table.
 */
const TABLE_HEADING = "Config Hub";

/**
 * The column used for searching in the configs.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Config", description: "" };
    case "read":
      return { heading: "Config", description: "" };
    case "update":
      return { heading: "Edit Config", description: "" };
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

import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Time Triggers";

const TABLE_KEY = "triggers";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create time trigger", description: "" };
    case "read":
      return { heading: "Time trigger", description: "" };
    case "update":
      return { heading: "Edit time trigger", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };

import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the spaces query to be used in the query client. ["spaces"]
 */
const DATA_QUERY_KEY = ["spaces"];

/**
 * The heading for the spaces table.
 */
const TABLE_HEADING = "Spaces";

const TABLE_KEY = "spaces";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create space", description: "" };
    case "read":
      return { heading: "Space", description: "" };
    case "update":
      return { heading: "Edit space", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };

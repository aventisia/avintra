import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["webhook-triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Webhook Triggers";

const TABLE_KEY = "webhook-triggers";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create webhook trigger", description: "" };
    case "read":
      return { heading: "Webhook trigger", description: "" };
    case "update":
      return { heading: "Edit webhook trigger", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };

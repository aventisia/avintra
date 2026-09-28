import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
const DATA_QUERY_KEY = ["queues"];

const QUEUE_AGENT_KEY = "QUEUE_AGENT";
const QUEUE_USER_KEY = "QUEUE_USER";

/**
 * The heading for the queues table.
 */
const TABLE_HEADING = "Queues";

const TABLE_KEY = "queues";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
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
  QUEUE_AGENT_KEY,
  QUEUE_USER_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
};

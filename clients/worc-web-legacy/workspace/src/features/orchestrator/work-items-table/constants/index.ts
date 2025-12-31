import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
export const DATA_QUERY_KEY = ["queues-work-items"];

/**
 * The heading for the queues table.
 */
export const TABLE_HEADING = "Work Items";

export const TABLE_KEY = "work-items";

/**
 * The column used for searching in the queues.
 */
export const SEARCH_COLUMN = "queueName";

export const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Works Items", description: "" };
    case "read":
      return { heading: "Works Items", description: "" };
    case "update":
      return { heading: "Edit Works Items", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

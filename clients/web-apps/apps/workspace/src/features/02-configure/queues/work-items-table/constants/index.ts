import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
export const DATA_QUERY_KEY = ["queues-work-items"];

/**
 * The heading for the queues table.
 */
export const TABLE_HEADING = "Work Items";

export const TABLE_KEY = "work-items";

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add works items", description: "" };
    case "read":
      return { heading: "Works items", description: "" };
    case "update":
      return { heading: "Edit works items", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

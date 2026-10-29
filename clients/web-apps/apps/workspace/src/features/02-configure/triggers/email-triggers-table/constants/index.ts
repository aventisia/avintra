import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["email-triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Email Triggers";

const TABLE_KEY = "email-triggers";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create email trigger", description: "" };
    case "read":
      return { heading: "Email trigger", description: "" };
    case "update":
      return { heading: "Edit email trigger", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };

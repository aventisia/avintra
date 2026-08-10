import { DialogCrudAction } from "@avplatform/ui/types";

const DATA_QUERY_KEY = ["support-tickets-v2"];

const TABLE_HEADING = "Support Tickets";

const TABLE_KEY = "support-tickets-v2";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return {
        heading: "Create Support Ticket",
        description: "Fill in the details to raise a new request",
      };
    case "read":
      return { heading: "Support Ticket", description: "" };
    case "update":
      return { heading: "Edit Support Ticket", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };

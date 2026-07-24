import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the supportTickets query to be used in the query client. ["supportTickets"]
 */
const DATA_QUERY_KEY = ["supportTickets"];

/**
 * The unique key for the supportTicket query to be used in the query client. ["supportTicket", ticketId]
 *  Defining TICKET_QUERY_KEY as a function that accepts a ticket ID
 */
const getTicketQueryKey = (ticketId: string) => ["supportTicket", ticketId];

/**
 * The heading for the supportTickets table.
 */
const TABLE_HEADING = "Support tickets";

const TABLE_KEY = "support-tickets";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Support ticket", description: "" };
    case "read":
      return { heading: "Support ticket", description: "" };
    case "update":
      return { heading: "Edit Support ticket", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getTicketQueryKey, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };

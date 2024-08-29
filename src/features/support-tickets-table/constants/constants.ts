import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The unique key for the supportTickets query to be used in the query client. ["supportTickets"]
 */
const DATA_QUERY_KEY = ["supportTickets"];

/**
 * The unique key for the supportTicket query to be used in the query client. ["supportTicket", ticketId]
 */
const TICKET_QUERY_KEY = "supportTicket";

/**
 * The unique key for the supportTicketRemarks query to be used in the query client. ["supportTicketRemarks", ticketId]
 */
const REMARKS_QUERY_KEY = "supportTicketRemarks";

/**
 * The heading for the supportTickets table.
 */
const TABLE_HEADING = "Support tickets";

/**
 * The column used for searching in the supportTickets table.
 */
const SEARCH_COLUMN = "subject";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
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

export {
  DATA_QUERY_KEY,
  TICKET_QUERY_KEY,
  REMARKS_QUERY_KEY,
  TABLE_HEADING,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};

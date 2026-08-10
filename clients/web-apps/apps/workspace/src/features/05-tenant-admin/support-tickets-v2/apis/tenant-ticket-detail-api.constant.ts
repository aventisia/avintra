import type { TicketDetailApiAdapter } from "../types/ticket-detail-api-adapter.type";
import {
  createAttachment,
  createComment,
  deleteAttachment,
  deleteComment,
  updateComment,
  updateTicketStatus,
  updateTicketTriage,
} from "./ticket-apis";

export const tenantTicketDetailApiAdapter: TicketDetailApiAdapter = {
  updateTicketStatus,
  updateTicketTriage,
  createComment,
  updateComment,
  deleteComment,
  createAttachment,
  deleteAttachment,
};

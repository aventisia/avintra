import type { TicketDetailApiAdapter } from "../types/ticket-detail-api-adapter.type";
import {
  updateTicketStatus,
  updateTicketTriage,
  createComment,
  updateComment,
  deleteComment,
  createAttachment,
  deleteAttachment,
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

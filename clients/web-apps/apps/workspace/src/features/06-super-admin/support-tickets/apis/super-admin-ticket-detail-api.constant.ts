import type { TicketDetailApiAdapter } from "@/features/05-tenant-admin/support-tickets-v2/types/ticket-detail-api-adapter.type";

import {
  createSaAttachment,
  createSaComment,
  deleteSaAttachment,
  deleteSaComment,
  updateSaComment,
  updateSaTicketStatus,
  updateSaTicketTriage,
} from "./sa-ticket-apis";

export const superAdminTicketDetailApiAdapter: TicketDetailApiAdapter = {
  updateTicketStatus: updateSaTicketStatus,
  updateTicketTriage: updateSaTicketTriage,
  createComment: createSaComment,
  updateComment: updateSaComment,
  deleteComment: deleteSaComment,
  createAttachment: createSaAttachment,
  deleteAttachment: deleteSaAttachment,
};

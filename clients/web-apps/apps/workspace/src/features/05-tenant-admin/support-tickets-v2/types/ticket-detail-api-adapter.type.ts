import type { IHttpResponse } from "@avplatform/ui/dtos";

import type {
  TicketAttachmentDto,
  TicketCommentDto,
  TicketDto,
  TicketStatusUpdateDto,
  TicketTriageUpdateDto,
} from "../dtos/TicketDto";

export interface TicketDetailApiAdapter {
  updateTicketStatus: (dto: TicketStatusUpdateDto) => Promise<IHttpResponse<TicketDto>>;
  updateTicketTriage: (dto: TicketTriageUpdateDto) => Promise<IHttpResponse<TicketDto>>;
  createComment: (
    ticketId: string,
    dto: TicketCommentDto,
  ) => Promise<IHttpResponse<TicketCommentDto>>;
  updateComment: (
    ticketId: string,
    commentId: string,
    dto: TicketCommentDto,
  ) => Promise<IHttpResponse<TicketCommentDto>>;
  deleteComment: (ticketId: string, commentId: string) => Promise<IHttpResponse<boolean>>;
  createAttachment: (
    ticketId: string,
    dto: TicketAttachmentDto,
  ) => Promise<IHttpResponse<TicketAttachmentDto>>;
  deleteAttachment: (ticketId: string, attachmentId: string) => Promise<IHttpResponse<boolean>>;
}

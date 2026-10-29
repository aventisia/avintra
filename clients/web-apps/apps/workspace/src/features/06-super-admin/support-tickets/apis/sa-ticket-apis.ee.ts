import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";

import {
  TicketAttachmentDto,
  TicketCommentDto,
  TicketDto,
  TicketHistoryDto,
  TicketStatusUpdateDto,
  TicketTableDto,
  TicketTriageUpdateDto,
} from "@/features/05-tenant-admin/support-tickets-v2/dtos/TicketDto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/sa/support-tickets`;

/** Retrieves a ticket by its ID across all tenants. */
export const getSaTicket = (id: string) =>
  axiosInstance.get<IHttpResponse<TicketDto>>(`${baseAPIURL}/${id}`).then((res) => res.data);

/** Retrieves list of tickets across all tenants. */
export const getSaTickets = () =>
  axiosInstance.get<IHttpResponse<TicketTableDto[]>>(`${baseAPIURL}/list`).then((res) => res.data);

/** Inserts a new ticket. */
export const createSaTicket = (dto: TicketTableDto) =>
  axiosInstance.post<IHttpResponse<TicketDto>>(`${baseAPIURL}`, dto).then((res) => res.data);

/** Updates an existing ticket. */
export const updateSaTicket = (dto: TicketTableDto) =>
  axiosInstance.put<IHttpResponse<TicketDto>>(`${baseAPIURL}`, dto).then((res) => res.data);

/** Deletes an existing ticket. */
export const deleteSaTicket = (id: string) =>
  axiosInstance.delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`).then((res) => res.data);

/** Deletes multiple tickets by their IDs. */
export const deleteSaTickets = (ids: string[]) =>
  axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);

/** Updates the status of an existing ticket. */
export const updateSaTicketStatus = (dto: TicketStatusUpdateDto) =>
  axiosInstance.put<IHttpResponse<TicketDto>>(`${baseAPIURL}/status`, dto).then((res) => res.data);

/** Updates the triage information of an existing ticket. */
export const updateSaTicketTriage = (dto: TicketTriageUpdateDto) =>
  axiosInstance.put<IHttpResponse<TicketDto>>(`${baseAPIURL}/triage`, dto).then((res) => res.data);

/** Retrieves list of comments for a ticket. */
export const getSaComments = (ticketId: string) =>
  axiosInstance
    .get<IHttpResponse<TicketCommentDto[]>>(`${baseAPIURL}/${ticketId}/comments`)
    .then((res) => res.data);

/** Inserts a new comment on a ticket. */
export const createSaComment = (ticketId: string, dto: TicketCommentDto) =>
  axiosInstance
    .post<IHttpResponse<TicketCommentDto>>(`${baseAPIURL}/${ticketId}/comments`, dto)
    .then((res) => res.data);

/** Updates an existing comment on a ticket. */
export const updateSaComment = (ticketId: string, commentId: string, dto: TicketCommentDto) =>
  axiosInstance
    .put<IHttpResponse<TicketCommentDto>>(`${baseAPIURL}/${ticketId}/comments/${commentId}`, dto)
    .then((res) => res.data);

/** Deletes an existing comment on a ticket. */
export const deleteSaComment = (ticketId: string, commentId: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${ticketId}/comments/${commentId}`)
    .then((res) => res.data);

/** Retrieves list of attachments for a ticket. */
export const getSaAttachments = (ticketId: string) =>
  axiosInstance
    .get<IHttpResponse<TicketAttachmentDto[]>>(`${baseAPIURL}/${ticketId}/attachments`)
    .then((res) => res.data);

/** Inserts a new attachment on a ticket. */
export const createSaAttachment = (ticketId: string, dto: TicketAttachmentDto) =>
  axiosInstance
    .post<IHttpResponse<TicketAttachmentDto>>(`${baseAPIURL}/${ticketId}/attachments`, dto)
    .then((res) => res.data);

/** Deletes an existing attachment on a ticket. */
export const deleteSaAttachment = (ticketId: string, attachmentId: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${ticketId}/attachments/${attachmentId}`)
    .then((res) => res.data);

/** Retrieves the history of a ticket. */
export const getSaHistory = (ticketId: string) =>
  axiosInstance
    .get<IHttpResponse<TicketHistoryDto[]>>(`${baseAPIURL}/${ticketId}/history`)
    .then((res) => res.data);

export const saTicketOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<TicketTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return createSaTicket(payload as TicketTableDto);
    case "update":
      return updateSaTicket(payload as TicketTableDto);
    case "delete":
      return deleteSaTicket(payload as string);
    case "delete-multiple":
      return deleteSaTickets(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

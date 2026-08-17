import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import {
  TenantSupportConfigDto,
  TicketAttachmentDto,
  TicketCommentDto,
  TicketDto,
  TicketHistoryDto,
  TicketStatusUpdateDto,
  TicketTableDto,
  TicketTriageUpdateDto,
} from "../dtos/TicketDto";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/support-tickets`;
const accountsAPIURL = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/sa`;

/** Retrieves a ticket by its ID. */
export const getTicket = (id: string) =>
  axiosInstance.get<IHttpResponse<TicketDto>>(`${baseAPIURL}/${id}`).then((res) => res.data);

/** Retrieves list of tickets. */
export const getTickets = () =>
  axiosInstance.get<IHttpResponse<TicketTableDto[]>>(`${baseAPIURL}/list`).then((res) => res.data);

/** Insert a new ticket. */
export const createTicket = (dto: TicketTableDto) =>
  axiosInstance.post<IHttpResponse<TicketDto>>(`${baseAPIURL}`, dto).then((res) => res.data);

/** Updates an existing ticket. */
export const updateTicket = (dto: TicketTableDto) =>
  axiosInstance.put<IHttpResponse<TicketDto>>(`${baseAPIURL}`, dto).then((res) => res.data);

/** Deletes an existing ticket. */
export const deleteTicket = (id: string) =>
  axiosInstance.delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`).then((res) => res.data);

/** Deletes multiple tickets by their IDs. */
export const deleteTickets = (ids: string[]) =>
  axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);

/** Updates the status of an existing ticket. */
export const updateTicketStatus = (dto: TicketStatusUpdateDto) =>
  axiosInstance.put<IHttpResponse<TicketDto>>(`${baseAPIURL}/status`, dto).then((res) => res.data);

/** Updates the triage information of an existing ticket. */
export const updateTicketTriage = (dto: TicketTriageUpdateDto) =>
  axiosInstance.put<IHttpResponse<TicketDto>>(`${baseAPIURL}/triage`, dto).then((res) => res.data);

/** Retrieves list of comments for a ticket. */
export const getComments = (ticketId: string) =>
  axiosInstance
    .get<IHttpResponse<TicketCommentDto[]>>(`${baseAPIURL}/${ticketId}/comments`)
    .then((res) => res.data);

/** Inserts a new comment on a ticket. */
export const createComment = (ticketId: string, dto: TicketCommentDto) =>
  axiosInstance
    .post<IHttpResponse<TicketCommentDto>>(`${baseAPIURL}/${ticketId}/comments`, dto)
    .then((res) => res.data);

/** Updates an existing comment on a ticket. */
export const updateComment = (ticketId: string, commentId: string, dto: TicketCommentDto) =>
  axiosInstance
    .put<IHttpResponse<TicketCommentDto>>(`${baseAPIURL}/${ticketId}/comments/${commentId}`, dto)
    .then((res) => res.data);

/** Deletes an existing comment on a ticket. */
export const deleteComment = (ticketId: string, commentId: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${ticketId}/comments/${commentId}`)
    .then((res) => res.data);

/** Retrieves list of attachments for a ticket. */
export const getAttachments = (ticketId: string) =>
  axiosInstance
    .get<IHttpResponse<TicketAttachmentDto[]>>(`${baseAPIURL}/${ticketId}/attachments`)
    .then((res) => res.data);

/** Inserts a new attachment on a ticket. */
export const createAttachment = (ticketId: string, dto: TicketAttachmentDto) =>
  axiosInstance
    .post<IHttpResponse<TicketAttachmentDto>>(`${baseAPIURL}/${ticketId}/attachments`, dto)
    .then((res) => res.data);

/** Deletes an existing attachment on a ticket. */
export const deleteAttachment = (ticketId: string, attachmentId: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${ticketId}/attachments/${attachmentId}`)
    .then((res) => res.data);

/** Retrieves the history of a ticket. */
export const getHistory = (ticketId: string) =>
  axiosInstance
    .get<IHttpResponse<TicketHistoryDto[]>>(`${baseAPIURL}/${ticketId}/history`)
    .then((res) => res.data);

export const getTenantSupportConfig = (tenantId: string) =>
  axiosInstance
    .get<IHttpResponse<TenantSupportConfigDto>>(
      `${accountsAPIURL}/tenants/${tenantId}/support-config`,
    )
    .then((res) => res.data);

/** Retrieves the current tenant's support configuration (e.g. whether Change Requests are enabled). */
export const getCurrentTenantSupportConfig = () =>
  axiosInstance
    .get<IHttpResponse<TenantSupportConfigDto>>(`${baseAPIURL}/support-config`)
    .then((res) => res.data);

export const updateTenantSupportConfig = (tenantId: string, dto: TenantSupportConfigDto) =>
  axiosInstance
    .put<IHttpResponse<TenantSupportConfigDto>>(
      `${accountsAPIURL}/tenants/${tenantId}/support-config`,
      dto,
    )
    .then((res) => res.data);

export const ticketOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<TicketTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return createTicket(payload as TicketTableDto);
    case "update":
      return updateTicket(payload as TicketTableDto);
    case "delete":
      return deleteTicket(payload as string);
    case "delete-multiple":
      return deleteTickets(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { STUpdateByReviewerDto } from "../dtos/STUpdateByReviewerDto";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/supportticket`;

/**
 * Retrieves a support ticket.
 */
const getSupportTicket = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SupportTicketsTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieves a list of support tickets.
 */
const getSupportTickets = () => {
  return axiosInstance
    .get<IHttpResponse<SupportTicketsTableDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Retrieves a list of all support tickets.
 */
const getAllSupportTickets = () => {
  return axiosInstance
    .get<IHttpResponse<SupportTicketsTableDto[]>>(`${baseAPIURL}/all`)
    .then((res) => res.data);
};

/**
 * Inserts a new support ticket.
 */
const insertSupportTicket = (newSupportTicket: SupportTicketsTableDto) => {
  return axiosInstance
    .post<
      IHttpResponse<SupportTicketsTableDto>
    >(`${baseAPIURL}`, newSupportTicket)
    .then((res) => res.data);
};

const updateSupportTicketStatus = (
  updatedSupportTicketStatus: STUpdateByReviewerDto,
) => {
  return axiosInstance
    .put<
      IHttpResponse<SupportTicketsTableDto>
    >(`${baseAPIURL}/ticket-status`, updatedSupportTicketStatus)
    .then((res) => res.data);
};

/**
 * Deletes a support ticket.
 */
const deleteSupportTicket = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a supportTicket based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<SupportTicketsTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const supportTicketsOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<SupportTicketsTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertSupportTicket(payload as SupportTicketsTableDto);
    case "delete":
      return deleteSupportTicket(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  deleteSupportTicket,
  getSupportTickets,
  insertSupportTicket,
  supportTicketsOptimisticMutationFn,
  getSupportTicket,
  updateSupportTicketStatus,
  getAllSupportTickets,
};

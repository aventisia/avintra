import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";

import { SupportTicketRemarksDto } from "../dtos/SupportTicketRemarksDto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/supportticket-remarks`;

/**
 * Retrieves all remarks associated with a support ticket.
 */
const getSupportTicketRemarks = (supportTicketId?: string) => {
  // Fetch remarks from API
  return axiosInstance
    .get<
      IHttpResponse<SupportTicketRemarksDto[]>
    >(`${baseAPIURL}/list/${supportTicketId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new support ticket remark.
 */
const insertSupportTicketRemark = (
  newSupportTicketRemark: SupportTicketRemarksDto,
) => {
  return axiosInstance
    .post<
      IHttpResponse<SupportTicketRemarksDto>
    >(`${baseAPIURL}`, newSupportTicketRemark)
    .then((res) => res.data);
};

/**
 * Updates a support ticket remark.
 */
const updateSupportTicketRemark = (
  updatedSupportTicketRemark: SupportTicketRemarksDto,
) => {
  return axiosInstance
    .put<
      IHttpResponse<SupportTicketRemarksDto>
    >(`${baseAPIURL}`, updatedSupportTicketRemark)
    .then((res) => res.data);
};

/**
 * Deletes a support ticket remark.
 */
const deleteSupportTicketRemark = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a supportTicketRemark based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<SupportTicketRemarksDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const supportTicketRemarksOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<SupportTicketRemarksDto | string | string>) => {
  switch (crudAction) {
    case "create":
      return insertSupportTicketRemark(payload as SupportTicketRemarksDto);
    case "update":
      return updateSupportTicketRemark(payload as SupportTicketRemarksDto);
    case "delete":
      return deleteSupportTicketRemark(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getSupportTicketRemarks,
  insertSupportTicketRemark,
  updateSupportTicketRemark,
  deleteSupportTicketRemark,
  supportTicketRemarksOptimisticMutationFn,
};

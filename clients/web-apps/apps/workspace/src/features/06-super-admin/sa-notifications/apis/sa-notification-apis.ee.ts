import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AppUserBaseDto } from "../../../notifications/dtos/app-user-base.dto";
import { CreateSaNotificationDto } from "../dtos/create-sa-notification.dto.ee";
import { SaNotificationDto } from "../dtos/sa-notification.dto.ee";
import { SaTenantOptionDto } from "../dtos/sa-tenant-option.dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/sa/notification`;
const userAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/user`;

/** Get the roles available for notification recipient targeting. */
const getSaNotificationRoles = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${userAPIURL}/roles-to-select`)
    .then((res) => res.data);
};

/** Create a new Super Admin notification. */
const createSaNotification = (createSaNotificationDto: CreateSaNotificationDto) => {
  return axiosInstance
    .post<IHttpResponse<SaNotificationDto>>(`${baseAPIURL}`, createSaNotificationDto)
    .then((res) => res.data);
};

/** Get the list of Super Admin notifications. */
const getSaNotifications = () => {
  return axiosInstance
    .get<IHttpResponse<SaNotificationDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/** Get a single Super Admin notification by ID. */
const getSaNotification = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SaNotificationDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/** Get the recipient users of a Super Admin notification (used to prefill the edit form). */
const getSaNotificationRecipients = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<AppUserBaseDto[]>>(`${baseAPIURL}/${id}/recipients`)
    .then((res) => res.data);
};

/** Update an existing Super Admin notification (only allowed before it is sent). */
const updateSaNotification = (id: string, createSaNotificationDto: CreateSaNotificationDto) => {
  return axiosInstance
    .put<IHttpResponse<SaNotificationDto>>(`${baseAPIURL}/${id}`, createSaNotificationDto)
    .then((res) => res.data);
};

/** Delete a Super Admin notification (only allowed before it is sent). */
const deleteSaNotification = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/** Delete multiple Super Admin notifications (only allowed before they are sent). */
const deleteMultipleSaNotifications = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/** Search users across all tenants for the Super Admin recipient picker. */
const searchAllUsers = (searchKey: string) => {
  return axiosInstance
    .get<IHttpResponse<AppUserBaseDto[]>>(`${baseAPIURL}/users/search/${searchKey}`)
    .then((res) => res.data);
};

/** Get the list of active tenants for the Super Admin audience picker. */
const getSaTenants = () => {
  return axiosInstance
    .get<IHttpResponse<SaTenantOptionDto[]>>(`${baseAPIURL}/tenants`)
    .then((res) => res.data);
};

export {
  createSaNotification,
  getSaNotifications,
  getSaNotification,
  getSaNotificationRecipients,
  updateSaNotification,
  deleteSaNotification,
  deleteMultipleSaNotifications,
  searchAllUsers,
  getSaTenants,
  getSaNotificationRoles,
};

/** Optimistic mutation dispatcher used by bulk list mutations. */
export const saNotificationOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<string[]>) => {
  switch (crudAction) {
    case "delete-multiple":
      return deleteMultipleSaNotifications(payload);
    default:
      throw new Error("Invalid action type");
  }
};

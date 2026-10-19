import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AppUserBaseDto } from "../dtos/app-user-base.dto";
import { CreateNotificationDto } from "../dtos/create-notification.dto";
import { NotificationDto } from "../dtos/notification.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/notification`;
const userAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/user`;

/** Get the roles available for notification recipient targeting (Tenant Admin scope). */
const getNotificationRoles = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${userAPIURL}/roles-to-select`, {
      params: { isSuperAdmin: false },
    })
    .then((res) => res.data);
};

/** Create a new notification. */
const createNotification = (createNotificationDto: CreateNotificationDto) => {
  return axiosInstance
    .post<IHttpResponse<NotificationDto>>(`${baseAPIURL}`, createNotificationDto)
    .then((res) => res.data);
};

/** Get the list of notifications. */
const getNotifications = () => {
  return axiosInstance
    .get<IHttpResponse<NotificationDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/** Get a single notification by ID. */
const getNotification = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<NotificationDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/** Get the recipient users of a notification (used to prefill the edit form). */
const getNotificationRecipients = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<AppUserBaseDto[]>>(`${baseAPIURL}/${id}/recipients`)
    .then((res) => res.data);
};

/** Update an existing notification (only allowed before it is sent). */
const updateNotification = (id: string, createNotificationDto: CreateNotificationDto) => {
  return axiosInstance
    .put<IHttpResponse<NotificationDto>>(`${baseAPIURL}/${id}`, createNotificationDto)
    .then((res) => res.data);
};

/** Delete a notification (only allowed before it is sent). */
const deleteNotification = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/** Delete multiple notifications (only allowed before they are sent). */
const deleteMultipleNotifications = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

export {
  createNotification,
  getNotifications,
  getNotification,
  getNotificationRecipients,
  updateNotification,
  deleteNotification,
  deleteMultipleNotifications,
  getNotificationRoles,
};

/** Optimistic mutation dispatcher used by bulk list mutations. */
export const notificationOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<string[]>) => {
  switch (crudAction) {
    case "delete-multiple":
      return deleteMultipleNotifications(payload);
    default:
      throw new Error("Invalid action type");
  }
};

import { IHttpResponse } from "@avplatform/ui/dtos";

import { NotificationHistoryListDto } from "@/react-toolkit/features/unread-notifications/dtos/notification-history.dto";
import { UnreadNotificationDto } from "@/react-toolkit/features/unread-notifications/dtos/unread-notification-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/notification/unread`;
const historyAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/notification/history`;

/** Get list of unread notifications for the user */
const getUnreadNotifications = () => {
  return axiosInstance
    .get<IHttpResponse<UnreadNotificationDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/** Mark notification as read for the user */
const markNotificationAsRead = (id: string) => {
  return axiosInstance.put<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`).then((res) => res.data);
};

/** Query params for the notification history endpoint */
interface NotificationHistoryParams {
  /** (optional): Filter by notification type */
  type?: string;

  /** (optional): Filter by read/unread status */
  isRead?: boolean;

  /** (optional): Filter by created-on date (from) */
  from?: string;

  /** (optional): Filter by created-on date (to) */
  to?: string;
}

/** Get the notification history for the user with optional filters */
const getNotificationHistory = (params?: NotificationHistoryParams) => {
  return axiosInstance
    .get<IHttpResponse<NotificationHistoryListDto>>(`${historyAPIURL}`, { params })
    .then((res) => res.data);
};

export { getNotificationHistory, getUnreadNotifications, markNotificationAsRead };
export type { NotificationHistoryParams };

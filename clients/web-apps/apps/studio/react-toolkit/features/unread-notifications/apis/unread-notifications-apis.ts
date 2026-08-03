import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { UnreadNotificationDto } from "@/react-toolkit/features/unread-notifications/dtos/unread-notification-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/notification/unread`;

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

export { getUnreadNotifications, markNotificationAsRead };

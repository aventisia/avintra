import type { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import type { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { redirectToLoginOn401Util } from "@/react-toolkit/utils/redirect-util";

import { toast } from "@aventisia/ui/sonner";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/me`;

/** Gets user's current session to view latest user's info */
const getMySession = () => {
  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/my-session`)
    .then((res) => res.data)
    .catch((error) => {
      // Show error toast
      toast.error(error);

      // Redirect to login page after 2 seconds
      redirectToLoginOn401Util();

      return null;
    });
};

/** Refreshes user session using cookies */
const refreshSession = () => {
  return axiosInstance
    .put<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/refresh-session`)
    .then((res) => res.data)
    .catch((error) => {
      // Show error toast
      toast.error(error);

      // Redirect to login page after 2 seconds
      redirectToLoginOn401Util();

      return null;
    });
};

/** Logs off from current session for current device */
const logOffFromCurrentSession = () => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/logoff`)
    .then((res) => res.data);
};

export { getMySession, logOffFromCurrentSession, refreshSession };

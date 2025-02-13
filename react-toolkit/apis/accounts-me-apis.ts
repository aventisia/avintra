import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { redirectToLoginUtil } from "@/react-toolkit/utils/redirect-utils";
import { getTenantId } from "@/react-toolkit/utils/user-session-utils";
import { toast } from "sonner";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/me`;

/** Gets user's current session to view latest user's info */
const getMySession = () => {
  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/my-session`)
    .then((res) => res.data);
};

/** Refreshes user session using cookies */
const refreshSession = () => {
  return axiosInstance
    .put<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/refresh-session`, null, {
      headers: {
        tntid: getTenantId()?.toString(),
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      // Show error toast
      toast.error(error);

      // Redirect to login page after 2 seconds
      redirectToLoginUtil();

      return null;
    });
};

/** Logs off from current session for current device */
const logOffFromCurrentSession = () => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/logoff`)
    .then((res) => res.data);
};

export {
  getMySession,
  logOffFromCurrentSession,
  refreshSession,
};


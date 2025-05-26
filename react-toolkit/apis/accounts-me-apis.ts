import { IHttpResponse } from "@aventisia/ui/dtos";
import { TerminateSessionDto } from "@/react-toolkit/dtos/request/terminate-session-dto";
import { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { redirectToLoginUtil } from "@/react-toolkit/utils/redirect-utils";
import { toast } from "@aventisia/ui/sonner";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/me`;

/** Logoff from sessions basis sessionIds (request is from MyAcccount) */
const terminateUserSelectedSessions = (postObj: TerminateSessionDto) => {
  return axiosInstance
    .post(`${baseAPIURL}/terminate-my-sessions`, postObj)
    .then((res) => res.data);
};

/** Gets user's current session to view latest user's info */
const getMySession = () => {
  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/my-session`)
    .then((res) => res.data);
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
  terminateUserSelectedSessions,
};

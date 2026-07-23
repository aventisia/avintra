import { IHttpResponse } from "@avplatform/ui/dtos";
import { UserSessionDto } from "@avplatform/ui/dtos/response/user-session-dto";
import { toast } from "@avplatform/ui/sonner";
import { redirectToLoginOn401Util } from "@avplatform/ui/utils/redirect-util";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/me`;

/** Gets user's current session to view latest user's info */
const getMySession = () => {
  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/my-session`)
    .then((res) => res.data);
};

// TODO: Temporarily added for switch tenant feat
const isTenantSwitch = localStorage.getItem("tenant_switch") == "true";

/** Refreshes user session using cookies */
const refreshSession = () => {
  return axiosInstance
    .put<IHttpResponse<UserSessionDto>>(
      isTenantSwitch
        ? `${import.meta.env.VITE_ACCOUNTS_API_PATH}/sa/tenants/auth/tokens/refresh`
        : `${baseAPIURL}/refresh-session`,
    )
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
  return axiosInstance.put<IHttpResponse<boolean>>(`${baseAPIURL}/logoff`).then((res) => res.data);
};

export { getMySession, logOffFromCurrentSession, refreshSession };

import { toast } from "@avplatform/ui/sonner";

import type { IHttpResponse } from "@/ui/dtos";
import type { UserSessionDto } from "@/ui/dtos/response/user-session-dto";
import { axiosInstance } from "@/ui/lib/axios-instance";
import { redirectToLoginOn401Util } from "@/ui/utils/redirect-util";

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

/** Refreshes user session using cookies. When a Super Admin has switched into a
 *  tenant to view it (read-only), the session must be refreshed against the
 *  tenant-switch endpoint so the JWT carries the "access_mode: read_only" claim. */
const refreshSession = () => {
  const isTenantSwitch = localStorage.getItem("tenant_switch") == "true";

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

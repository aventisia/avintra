import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-user`;

/**
 * Remove flow access.
 */
export const removeFlowAccess = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/access/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

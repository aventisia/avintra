import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-user`;

/**
 * Remove flow access.
 */
export const removeFlowAccess = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/access/${id}`)
    .then((res) => res.data);
};

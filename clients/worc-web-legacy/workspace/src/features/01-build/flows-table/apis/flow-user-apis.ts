import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/flow-user`;

/**
 * Remove flow access.
 */
export const removeFlowAccess = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/access/${id}`)
    .then((res) => res.data);
};

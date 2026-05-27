import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { toast } from "@aventisia/ui/sonner";

import { LoadFlowDto } from "../dtos/load-flow-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow`;

/**
 * Gets flow record to load when user opens it in studio
 * @param id Flow record Id (Primary Key)
 * @returns Flow data required for studio to load flow
 */
const getFlowToLoad = (id: string, versionId?: string) => {
  const url = versionId
    ? `${baseAPIURL}/load/${id}?versionId=${versionId}`
    : `${baseAPIURL}/load/${id}`;

  return axiosInstance
    .get<IHttpResponse<LoadFlowDto>>(url)
    .then((res) => res.data)
    .catch(() => {
      toast.error("Unable to load flow. Please try again.");
      return null;
    });
};
export { getFlowToLoad };

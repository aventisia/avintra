import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";

import { FlowSilentUpdateDto } from "../dtos/flow-silent-update-dto";
import { LoadFlowDto } from "../dtos/load-flow-dto";
import { PublishFlowDto } from "../dtos/publish-flow";

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

/**
 * Updates flow's nodes, edges etc silently in the background
 * @param putObj Dto containing nodes, edges etc
 * @returns True if update job is successful, else false
 */
const updateFlowSilently = (putObj: FlowSilentUpdateDto) => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/save`, putObj)
    .then((res) => res.data);
};

const publishFlow = (putObj: PublishFlowDto) => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/publish`, putObj)
    .then((res) => res.data);
};

export { getFlowToLoad, updateFlowSilently, publishFlow };

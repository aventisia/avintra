import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { FlowSilentUpdateDto } from "../dtos/flow-silent-update-dto";
import { LoadFlowDto } from "../dtos/load-flow-dto";
import { toast } from "sonner";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/flow`;

/**
 * Gets flow record to load when user opens it in studio
 * @param id Flow record Id (Primary Key)
 * @returns Flow data required for studio to load flow
 */
const getFlowToLoad = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<LoadFlowDto>>(`${baseAPIURL}/load/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      // Show error toast
      toast.error(error);

      // Redirect to workspace projects page after 2 seconds
      setTimeout(() => {
        window.location.assign(`${import.meta.env.VITE_WORKSPACE_URL}projects`);
      }, 2000);

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
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/silent-update`, putObj)
    .then((res) => res.data);
};

export { getFlowToLoad, updateFlowSilently };

import { LoadFlowDto } from "@/features/react-flow";
import { axiosInstance } from "@/react-toolkit/apis";
import { IHttpResponse } from "@/react-toolkit/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/flow`;

/**
 * Gets flow record to load when user opens it in studio
 * @param id Flow record Id (Primary Key)
 * @returns Flow data required for studio to load flow
 */
const getFlowToLoad = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<LoadFlowDto>>(`${baseAPIURL}/load/${id}`)
    .then((res) => res.data);
};

export { getFlowToLoad };

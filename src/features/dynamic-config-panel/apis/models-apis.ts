import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { ModelsListDto } from "../dtos/models-table-dto";
import { ModelSetupDto } from "../dtos/model-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ai-models`;

/**
 * Retrieves all ai models created by user
 */
const getModels = () => {
  return axiosInstance
    .get<IHttpResponse<ModelsListDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Get model setup by model id
 */

const getModelSetup = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<ModelSetupDto>>(`${baseAPIURL}/setup/${modelId}`)
    .then((res) => res.data);
};

export { getModels, getModelSetup };

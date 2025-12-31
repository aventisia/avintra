import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { ModelsListDto } from "../dtos/models-list-dto";
import { ModelSetupDto } from "../dtos/model-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ai-models`;

/**
 * Search models
 */
const getSearchModels = (
  query: string,
  includeUnpublished: boolean = false,
) => {
  return axiosInstance
    .get<
      IHttpResponse<ModelsListDto[]>
    >(`${baseAPIURL}/list/${query}?includeUnpublish=${includeUnpublished}`)
    .then((res) => res.data);
};

const getModels = () => {
  return axiosInstance
    .get<
      IHttpResponse<ModelsListDto[]>
    >(`${baseAPIURL}/list?includeUnpublish=true`)
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

export { getSearchModels, getModelSetup, getModels };

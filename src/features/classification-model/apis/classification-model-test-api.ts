// Update dto
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { ClassificationTestDTO } from "../dtos/classification-model-test-dto";


const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/classification/extracted-data`;

/**
 * Get Form Data by id.
 */
const getClassificationTestFormDataByModelId = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<ClassificationTestDTO[]>>(`${baseAPIURL}/${modelId}`)
    .then((res) => res.data);
};

export { getClassificationTestFormDataByModelId}
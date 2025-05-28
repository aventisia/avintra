import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { InfoExtractorTestDTO } from "../dtos/info-extractor-test-dto";


const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/extraction/extracted-data`;

/**
 * Get Form Data by id.
 */
const getInfoExtractorTestFormDataByModelId = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<InfoExtractorTestDTO[]>>(`${baseAPIURL}/${modelId}`)
    .then((res) => res.data);
};

export { getInfoExtractorTestFormDataByModelId}
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { SummarizationTestDTO } from "../dtos/summarization-test-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/summarization/extracted-data`;

/**
 * Get Form Data by id.
 */
const getSummarizationTestFormDataByModelId = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<SummarizationTestDTO[]>>(`${baseAPIURL}/${modelId}`)
    .then((res) => res.data);
};

export { getSummarizationTestFormDataByModelId };

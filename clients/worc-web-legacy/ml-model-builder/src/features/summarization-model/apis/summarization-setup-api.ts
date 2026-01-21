import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { SummarizationSetupDTO } from "../dtos/summarization-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/summarization`;

/**
 * Get Form Data by id.
 */
const getSummarizationSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<SummarizationSetupDTO>
    >(`${baseAPIURL}/setup-by-model/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateSummarizationSetupFormData = (data: SummarizationSetupDTO) => {
  return axiosInstance
    .put<IHttpResponse<SummarizationSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};

export { getSummarizationSetupFormDataById, updateSummarizationSetupFormData };

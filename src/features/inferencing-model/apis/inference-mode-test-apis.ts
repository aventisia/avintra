import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { InferenceModelTestDTO } from "../dtos/inference-model-test-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/inferencing-model`;

/**
 * Get Form Data by id.
 */
const getInferenceModelExtractedDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<InferenceModelTestDTO[]>
    >(`${baseAPIURL}/extracted-data/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateInferenceModelTestFormData = (data: InferenceModelTestDTO) => {
  return axiosInstance
    .put<
      IHttpResponse<InferenceModelTestDTO>
    >(`${baseAPIURL}/extracted-data`, data)
    .then((res) => res.data);
};

export { getInferenceModelExtractedDataById, updateInferenceModelTestFormData };

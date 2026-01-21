import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { InferenceModelSetupDTO } from "../dtos/inference-model-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/inferencing-model`;

/**
 * Get Form Data by id.
 */
const getInferenceModelDataById = (modelId: string, versionId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<InferenceModelSetupDTO>
    >(`${baseAPIURL}/setup/${modelId}?mlModelVersionId=${versionId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateInferenceModelSetupFormData = (data: InferenceModelSetupDTO) => {
  return axiosInstance
    .put<IHttpResponse<InferenceModelSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};

export { getInferenceModelDataById, updateInferenceModelSetupFormData };

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ClassficationModelSetupDTO } from "../dtos/classfication-model-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/classification`;

/**
 * Get Form Data by id.
 */
const getClassificationSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<ClassficationModelSetupDTO>
    >(`${baseAPIURL}/setup-by-model/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateClassificationSetupFormData = (
  data: ClassficationModelSetupDTO,
) => {
  return axiosInstance
    .put<IHttpResponse<ClassficationModelSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};

export {
  getClassificationSetupFormDataById,
  updateClassificationSetupFormData,
};

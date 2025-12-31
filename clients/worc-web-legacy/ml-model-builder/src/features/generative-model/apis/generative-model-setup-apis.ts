/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { GenerativeModelSetupDTO } from "../dtos/generative-model-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/generative-model`;

/**
 * Get Form Data by id.
 */
const getGenerativeModelDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<GenerativeModelSetupDTO>
    >(`${baseAPIURL}/setup/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateGenerativeModelSetupFormData = (data: any) => {
  return axiosInstance
    .put<IHttpResponse<any>>(`${baseAPIURL}/update-and-execute`, data)
    .then((res) => res.data);
};

export { getGenerativeModelDataById, updateGenerativeModelSetupFormData };

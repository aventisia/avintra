import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ModelVersionDto } from "../dtos/model-version-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ai-project-version`;

/**
 * Retrieves all versions of a model.
 */
const getMLModelVersions = (modelId?: string) => {
  // Return if modelId is not provided (modelId can be null if not passed in query params)
  if (!modelId) return Promise.resolve(null);

  // Fetch versions from API
  return axiosInstance
    .get<IHttpResponse<ModelVersionDto[]>>(`${baseAPIURL}/list/${modelId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new version.
 */
const insertMLModelVersion = (newMLModelVersion: ModelVersionDto) => {
  return axiosInstance
    .post<IHttpResponse<ModelVersionDto>>(`${baseAPIURL}`, newMLModelVersion)
    .then((res) => res.data);
};

/**
 * Delete version version.
 */
const deleteMLModelVersion = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export { getMLModelVersions, insertMLModelVersion, deleteMLModelVersion };

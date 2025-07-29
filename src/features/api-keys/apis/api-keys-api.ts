import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { APIKeyDTO } from "../dtos/api-keys-dto";
import { UpdateAPIKeyDTO } from "../dtos/update-api-key-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/api-keys`;

const getAPIKeysList = (modelId: string) => {
    return axiosInstance
    .get<IHttpResponse<APIKeyDTO[]>>(`${baseAPIURL}/list/${modelId}`)
    .then((res) => res.data);
}

/**
 * Updates Extracted data.
 */
const insertAPIKey = (data: APIKeyDTO) => {
  return axiosInstance
    .post<IHttpResponse<APIKeyDTO>>(`${baseAPIURL}/generate`, data)
    .then((res) => res.data);
};


const deleteAPIKey = (apiKeyId: string) => {
    return axiosInstance
    .delete<IHttpResponse<APIKeyDTO>>(`${baseAPIURL}/${apiKeyId}`)
    .then((res) => res.data);
}

const updateAPIKey = (data: UpdateAPIKeyDTO) => {
    return axiosInstance
    .put<IHttpResponse<UpdateAPIKeyDTO>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
}

export { insertAPIKey, getAPIKeysList, deleteAPIKey, updateAPIKey };

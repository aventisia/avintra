import type { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import type { ApiKeyDto } from "../dtos/api-key.dto";
import type { CreateApiKeyReqDto } from "../dtos/create-api-key-req.dto";
import type { CreateApiKeyResDto } from "../dtos/create-api-key-res.dto";
import type { UpdateApiKeyDto } from "../dtos/update-api-key.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/api-keys`;

/**
 * Retrieves a list of API keys.
 */
const getApiKeys = () => {
  return axiosInstance
    .get<IHttpResponse<ApiKeyDto[]>>(`${baseAPIURL}/list`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Retrieves an API key by its ID.
 */
const getApiKey = (apiKeyId: string) => {
  return axiosInstance
    .get<IHttpResponse<ApiKeyDto>>(`${baseAPIURL}/${apiKeyId}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Creates a new API key.
 */
const createApiKey = (createApiKeyReqDto: CreateApiKeyReqDto) => {
  return axiosInstance
    .post<IHttpResponse<CreateApiKeyResDto>>(`${baseAPIURL}`, createApiKeyReqDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing API key.
 */
const updateApiKey = (updateApiKeyDto: UpdateApiKeyDto) => {
  return axiosInstance
    .put<IHttpResponse<ApiKeyDto>>(`${baseAPIURL}`, updateApiKeyDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes an existing API key.
 */
const deleteApiKey = (apiKeyId: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${apiKeyId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes multiple API keys by their IDs.
 */
const deleteApiKeys = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { createApiKey, deleteApiKey, deleteApiKeys, getApiKey, getApiKeys, updateApiKey };

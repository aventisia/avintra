import { IHttpResponse } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { TenantModelProviderDto } from "../dtos/model-provider-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tenant-model-provider`;

/**
 * Retrieves all model provider configurations for the current tenant.
 */
export const getModelProviders = () => {
  return axiosInstance
    .get<IHttpResponse<TenantModelProviderDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Creates or updates a model provider configuration for the current tenant.
 */
export const upsertModelProvider = (payload: TenantModelProviderDto) => {
  return axiosInstance
    .post<IHttpResponse<TenantModelProviderDto>>(`${baseAPIURL}`, payload)
    .then((res) => res.data);
};

/**
 * Deletes a model provider configuration by its identifier.
 */
export const deleteModelProvider = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieves the list of models for a given provider using a selected credential.
 */
export const getProviderModels = (providerType: string, credentialId: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/llm-provider/models/select-option?providerType=${providerType}&credentialId=${credentialId}`,
    )
    .then((res) => res.data);
};

/**
 * Ollama model as returned by the on-prem Ollama endpoint.
 */
export interface OllamaModelDto {
  name: string;
  model?: string | null;
  modifiedAt?: string;
  size?: number;
  digest?: string;
}

/**
 * Retrieves the list of models available from an Ollama server at the given URL.
 */
export const getOllamaModels = (providerUrl: string) => {
  return axiosInstance
    .get<IHttpResponse<OllamaModelDto[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/onprem-model/ollama/models?providerUrl=${encodeURIComponent(providerUrl)}`,
    )
    .then((res) => res.data);
};

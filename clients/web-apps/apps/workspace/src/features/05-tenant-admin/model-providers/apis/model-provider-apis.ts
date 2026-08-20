import { IHttpResponse } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { LlmModelsResponseDto, LlmProvidersResponseDto } from "../dtos/llm-provider-v2-dto";
import { TenantModelProviderDto } from "../dtos/model-provider-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tenant-model-provider`;
const llmPipelineBaseURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/v2/llm`;

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
 * Retrieves the list of models for a given provider using a selected credential name.
 */
export const getProviderModels = (providerType: string, credentialName: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/llm-provider/models/select-option?providerType=${providerType}&credentialName=${credentialName}`,
    )
    .then((res) => res.data);
};

/**
 * Retrieves the list of providers supported by LiteLLM (dynamic) from the LLM
 * pipeline API. Returns raw JSON (not wrapped in IHttpResponse).
 */
export const getLlmProvidersV2 = (capability?: string) => {
  const params = capability ? `?capability=${encodeURIComponent(capability)}` : "";
  return axiosInstance
    .get<LlmProvidersResponseDto>(`${llmPipelineBaseURL}/providers${params}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves the list of models for a given provider from the LLM pipeline API.
 * Returns raw JSON (not wrapped in IHttpResponse).
 *
 * When a `credentialId` is supplied it is forwarded to the pipeline as
 * `credentialId`, which is echoed back on each model for ollama providers.
 */
export const getLlmModelsV2 = (
  provider: string,
  capability?: string,
  credentialName?: string,
) => {
  const params = new URLSearchParams({ provider });
  if (capability) params.set("capability", capability);
  if (credentialName) params.set("credential_name", credentialName);
  return axiosInstance
    .get<LlmModelsResponseDto>(`${llmPipelineBaseURL}/models?${params.toString()}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

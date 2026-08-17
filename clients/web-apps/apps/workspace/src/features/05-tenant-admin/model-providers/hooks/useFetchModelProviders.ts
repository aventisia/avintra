import { useQuery } from "@tanstack/react-query";

import {
  getLlmModelsV2,
  getLlmProvidersV2,
  getModelProviders,
  getProviderModels,
} from "../apis/model-provider-apis";

export const MODEL_PROVIDERS_QUERY_KEY = ["model-providers"] as const;

/**
 * Custom hook to fetch all model provider configurations for the current tenant.
 */
export const useFetchModelProviders = () => {
  return useQuery({
    queryKey: MODEL_PROVIDERS_QUERY_KEY,
    queryFn: getModelProviders,
  });
};

/**
 * Custom hook to fetch the list of models for a given provider using a selected credential.
 * Enabled only when both a provider type and a credential are provided.
 */
export const useFetchProviderModels = (providerType?: string, credentialId?: string) => {
  return useQuery({
    queryKey: ["model-providers", "models", providerType, credentialId],
    queryFn: () => getProviderModels(providerType as string, credentialId as string),
    enabled: Boolean(providerType && credentialId),
  });
};

/**
 * Custom hook to fetch the list of providers supported by LiteLLM from the LLM
 * pipeline API (`/v2/llm/providers`).
 */
export const useFetchLlmProvidersV2 = (capability?: string) => {
  return useQuery({
    queryKey: ["llm-providers-v2", capability],
    queryFn: () => getLlmProvidersV2(capability),
  });
};

/**
 * Custom hook to fetch the list of models for a given provider from the LLM
 * pipeline API (`/v2/llm/models?provider=X`). Enabled only when a provider is given.
 * A `credentialId` is forwarded for ollama providers so the pipeline can echo it
 * back on each returned model.
 */
export const useFetchLlmModelsV2 = (
  provider?: string,
  capability?: string,
  credentialId?: string,
) => {
  return useQuery({
    queryKey: ["llm-models-v2", provider, capability, credentialId],
    queryFn: () => getLlmModelsV2(provider as string, capability, credentialId),
    enabled: Boolean(provider),
  });
};

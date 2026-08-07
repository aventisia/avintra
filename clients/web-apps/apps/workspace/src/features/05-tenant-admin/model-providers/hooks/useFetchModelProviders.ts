import { useQuery } from "@tanstack/react-query";

import { getModelProviders, getProviderModels } from "../apis/model-provider-apis";

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

import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getUiBuilderModels } from "../apis/ui-builder.apis";
import {
  getUiBuilderLiteLlmProvider,
  getUiBuilderProviderLabel,
  toUiBuilderModelId,
  toUiBuilderModelKey,
} from "../utils/ui-builder-model-routing.util";

const UI_BUILDER_MODELS_QUERY_KEY = ["ui-builder-models"] as const;

/** A tenant-enabled model shown in the builder's model picker. */
export type UiBuilderModelState = {
  key: string;
  providerType: string;
  providerLabel: string;
  /** LiteLLM provider name sent to the pipeline. */
  provider: string;
  modelId: string;
  /** Vault credential configured for the provider in Tenant Admin. */
  credentialName: string;
  envType: string;
};

/** A provider group in the builder's model picker. */
export type UiBuilderProviderGroup = {
  providerType: string;
  label: string;
  models: UiBuilderModelState[];
};

/**
 * Derives the builder's model options from the tenant's enabled Text models whose provider has
 * a credential in Tenant Admin; models without one (platform credits) are never offered.
 */
export const useUiBuilderModels = () => {
  const tenantId = useUserSessionStore((state) => state.userSession?.tenantId ?? "");
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: [...UI_BUILDER_MODELS_QUERY_KEY, tenantId],
    queryFn: getUiBuilderModels,
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });

  const models = useMemo<UiBuilderModelState[]>(() => {
    const seen = new Set<string>();
    const options: UiBuilderModelState[] = [];

    for (const enabledModel of data?.data ?? []) {
      const provider = getUiBuilderLiteLlmProvider(enabledModel.providerType);
      const modelId = toUiBuilderModelId(provider, enabledModel.modelId);
      const key = toUiBuilderModelKey(enabledModel.providerType, modelId);
      if (!modelId || seen.has(key)) continue;
      seen.add(key);

      const credentialName = enabledModel.credentialName?.trim();
      if (!credentialName) continue;

      options.push({
        key,
        providerType: enabledModel.providerType,
        providerLabel: getUiBuilderProviderLabel(enabledModel.providerType),
        provider,
        modelId,
        credentialName,
        envType: enabledModel.credentialEnvType?.trim().toLowerCase() || "dev",
      });
    }

    return options;
  }, [data]);

  const groups = useMemo<UiBuilderProviderGroup[]>(() => {
    const byProvider = new Map<string, UiBuilderProviderGroup>();
    for (const model of models) {
      const group = byProvider.get(model.providerType) ?? {
        providerType: model.providerType,
        label: model.providerLabel,
        models: [],
      };
      group.models.push(model);
      byProvider.set(model.providerType, group);
    }

    return [...byProvider.values()];
  }, [models]);

  const initialModelKey = models[0]?.key ?? "";

  return {
    models,
    groups,
    hasUsableModel: models.length > 0,
    initialModelKey,
    isLoading,
    isError,
    isSuccess,
  };
};

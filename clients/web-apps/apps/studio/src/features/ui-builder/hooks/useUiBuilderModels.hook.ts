import { ModelCapabilityEnum, type ModelProviderEnum } from "@avplatform/ui/enums";
import { useMemo } from "react";

import { type ProviderLiteral } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { useFetchTenantEnabledModels } from "@/features/dynamic-config-panel/hooks/useFetchTenantEnabledModels.hook";

import {
  getUiBuilderProviderLabel,
  getUiBuilderWireProvider,
  toUiBuilderModelKey,
} from "../utils/ui-builder-model-routing.util";

/** A tenant-enabled provider shown in the builder's provider dropdown. */
export type UiBuilderProviderState = {
  providerType: ModelProviderEnum;
  label: string;
  isRoutable: boolean;
};

/** A tenant-enabled model shown in the builder's model dropdown. */
export type UiBuilderModelState = {
  key: string;
  providerType: ModelProviderEnum;
  providerLabel: string;
  modelId: string;
  wireProvider: ProviderLiteral | null;
};

/**
 * Derives the builder's provider and model options from the tenant's enabled Text models.
 */
export const useUiBuilderModels = () => {
  const { data, isLoading, isError, isSuccess } = useFetchTenantEnabledModels(
    ModelCapabilityEnum.Text,
  );

  const models = useMemo<UiBuilderModelState[]>(() => {
    const seen = new Set<string>();
    const options: UiBuilderModelState[] = [];

    for (const enabledModel of data?.data ?? []) {
      const modelId = enabledModel.modelId.trim();
      const key = toUiBuilderModelKey(enabledModel.providerType, modelId);
      if (!modelId || seen.has(key)) continue;

      seen.add(key);
      options.push({
        key,
        providerType: enabledModel.providerType,
        providerLabel: getUiBuilderProviderLabel(enabledModel.providerType),
        modelId,
        wireProvider: getUiBuilderWireProvider(enabledModel.providerType),
      });
    }

    return options;
  }, [data]);

  const providers = useMemo<UiBuilderProviderState[]>(() => {
    const seen = new Set<ModelProviderEnum>();
    const options: UiBuilderProviderState[] = [];

    for (const model of models) {
      if (seen.has(model.providerType)) continue;

      seen.add(model.providerType);
      options.push({
        providerType: model.providerType,
        label: model.providerLabel,
        isRoutable: model.wireProvider !== null,
      });
    }

    return options.sort((left, right) => Number(right.isRoutable) - Number(left.isRoutable));
  }, [models]);

  const initialModel = useMemo(() => {
    const initialProvider = providers.find((provider) => provider.isRoutable) ?? providers[0];
    return models.find((model) => model.providerType === initialProvider?.providerType) ?? null;
  }, [models, providers]);

  return {
    providers,
    models,
    hasRoutableModel: models.some((model) => model.wireProvider !== null),
    initialModelKey: initialModel?.key ?? "",
    isLoading,
    isError,
    isSuccess,
  };
};

import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { useMemo } from "react";

import { useFetchTenantEnabledModels } from "@/features/dynamic-config-panel/hooks/useFetchTenantEnabledModels.hook";

import {
  DEFAULT_UI_BUILDER_MODEL,
  UI_BUILDER_MODELS,
  type UiBuilderModelOption,
} from "../constants/ui-builder-models.constant";

/** A builder model paired with its tenant gating state. */
export type UiBuilderModelState = UiBuilderModelOption & { enabled: boolean };

const toModelGateKey = (providerType: string, modelId: string) =>
  `${providerType.trim()}::${modelId.trim()}`.toLowerCase();

/**
 * Resolves the tenant Text-capability gating state for the builder's fixed models.
 */
export const useUiBuilderModels = () => {
  const { data, isLoading } = useFetchTenantEnabledModels(ModelCapabilityEnum.Text);

  const models = useMemo<UiBuilderModelState[]>(() => {
    const enabledSet = new Set(
      (data?.data ?? []).map((m) => toModelGateKey(m.providerType, m.modelId)),
    );
    return UI_BUILDER_MODELS.map((model) => ({
      ...model,
      enabled: enabledSet.has(toModelGateKey(model.providerType, model.model)),
    }));
  }, [data]);

  const hasAnyEnabled = models.some((model) => model.enabled);
  const defaultModel = models.find(
    (model) => model.model === DEFAULT_UI_BUILDER_MODEL && model.enabled,
  );
  const initialModel =
    (defaultModel ?? models.find((model) => model.enabled))?.model ?? DEFAULT_UI_BUILDER_MODEL;

  return { models, hasAnyEnabled, initialModel, isLoading };
};

import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getModelProviders } from "@/features/05-tenant-admin/model-providers";

const WORKSPACE_CHAT_MODELS_QUERY_KEY = ["workspace-chat-models"] as const;

/** LiteLLM provider names accepted by the llmpipeline chat API, keyed by the names either side reports. */
const PIPELINE_PROVIDERS: Record<string, string> = {
  openai: "openai",
  ollama: "ollama",
  deepinfra: "deepinfra",
  gemini: "googlegemini",
  googlegemini: "googlegemini",
  anthropic: "anthropic",
  openrouter: "openrouter",
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  ollama: "Ollama",
  deepinfra: "DeepInfra",
  googlegemini: "Google Gemini",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
};

/** A model shown in the landing chat's model picker. */
export type WorkspaceChatModelState = {
  key: string;
  /** LiteLLM provider name sent to the pipeline. */
  provider: string;
  providerLabel: string;
  modelId: string;
  /** Vault credential configured for the provider, or null when it runs on platform credits. */
  credentialName: string | null;
  isByokEnabled: boolean;
};

/** A provider group in the landing chat's model picker. */
export type WorkspaceChatProviderGroup = {
  provider: string;
  label: string;
  models: WorkspaceChatModelState[];
};

const toPipelineProvider = (providerName: string) =>
  PIPELINE_PROVIDERS[providerName.trim().toLowerCase()] ?? null;

const toModelId = (provider: string, modelId: string) => {
  const trimmed = modelId.trim();
  const unprefixed = trimmed.toLowerCase().startsWith(`${provider}/`)
    ? trimmed.slice(provider.length + 1)
    : trimmed;
  return unprefixed.replace(/\/\d+$/, "");
};

const createModel = (
  provider: string,
  rawModelId: string,
  credentialName: string | null,
): WorkspaceChatModelState | null => {
  const modelId = toModelId(provider, rawModelId);
  if (!modelId) return null;
  return {
    key: `${provider}::${modelId}`,
    provider,
    providerLabel: PROVIDER_LABELS[provider],
    modelId,
    credentialName,
    isByokEnabled: Boolean(credentialName),
  };
};

/**
 * Derives the landing chat's model options from the tenant's enabled models,
 * keeping only providers the llmpipeline can route.
 */
export const useWorkspaceChatModels = () => {
  const tenantId = useUserSessionStore((state) => state.userSession?.tenantId ?? "");
  const tenantQuery = useQuery({
    queryKey: [...WORKSPACE_CHAT_MODELS_QUERY_KEY, "tenant", tenantId],
    queryFn: getModelProviders,
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });

  const models = useMemo<WorkspaceChatModelState[]>(() => {
    const options: WorkspaceChatModelState[] = [];

    for (const provider of tenantQuery.data?.data ?? []) {
      if (provider.isDisabled) continue;

      const pipelineProvider = toPipelineProvider(provider.providerType);
      if (!pipelineProvider) continue;

      const credentialName = provider.credentialName?.trim() || null;
      const enabledModelIds = provider.enabledModels?.length
        ? provider.enabledModels
            .filter((model) => !model.capability || model.capability === ModelCapabilityEnum.Text)
            .map((model) => model.modelId)
        : provider.enabledModelIds;

      for (const rawModelId of enabledModelIds) {
        const model = createModel(pipelineProvider, rawModelId, credentialName);
        if (model) options.push(model);
      }
    }

    // A tenant-enabled model wins over a duplicate entry.
    const seen = new Set<string>();
    return options.filter((model) => {
      if (seen.has(model.key)) return false;
      seen.add(model.key);
      return true;
    });
  }, [tenantQuery.data]);

  const groups = useMemo<WorkspaceChatProviderGroup[]>(() => {
    const byProvider = new Map<string, WorkspaceChatProviderGroup>();
    for (const model of models) {
      const group = byProvider.get(model.provider) ?? {
        provider: model.provider,
        label: model.providerLabel,
        models: [],
      };
      group.models.push(model);
      byProvider.set(model.provider, group);
    }

    return [...byProvider.values()];
  }, [models]);

  return {
    models,
    groups,
    hasUsableModel: models.length > 0,
    isLoading: tenantQuery.isLoading,
    isError: tenantQuery.isError,
    isSuccess: tenantQuery.isSuccess,
  };
};

import { modelDisplayName, modelSupportsEffort } from "@avplatform/chat";
import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getModelProviders } from "@/features/05-tenant-admin/model-providers";

const HOME_CHAT_MODELS_QUERY_KEY = ["home-chat-models"] as const;

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

/** A model shown in the Home composer's model picker. */
export type HomeChatModel = {
  key: string;
  /** LiteLLM provider name sent to the pipeline. */
  provider: string;
  providerLabel: string;
  modelId: string;
  label: string;
  supportsEffort: boolean;
  /** Vault credential configured for the provider, or null when it runs on platform credits. */
  credentialName: string | null;
  isByokEnabled: boolean;
};

/** The speech-to-text model Home dictation runs on. */
export type HomeChatSpeechModel = Pick<
  HomeChatModel,
  "provider" | "modelId" | "credentialName" | "isByokEnabled"
>;

/** Runs on platform credits when the tenant enables no speech-to-text model. */
const PLATFORM_SPEECH_MODEL: HomeChatSpeechModel = {
  provider: "elevenlabs",
  modelId: "scribe_v2",
  credentialName: null,
  isByokEnabled: false,
};

/** A provider group in the Home composer's model picker. */
export type HomeChatModelGroup = {
  provider: string;
  label: string;
  models: HomeChatModel[];
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
): HomeChatModel | null => {
  const modelId = toModelId(provider, rawModelId);
  if (!modelId) return null;
  return {
    key: `${provider}::${modelId}`,
    provider,
    providerLabel: PROVIDER_LABELS[provider],
    modelId,
    label: modelDisplayName(modelId),
    supportsEffort: modelSupportsEffort(provider, modelId),
    credentialName,
    isByokEnabled: Boolean(credentialName),
  };
};

/** One model per provider and name, so an alias hides its dated snapshot and a prefixed copy; the shortest ID stays. */
const keepShortestIdPerName = (models: HomeChatModel[]) => {
  const byName = new Map<string, HomeChatModel>();
  for (const model of models) {
    const name = `${model.provider}::${model.label}`;
    const kept = byName.get(name);
    if (!kept || model.modelId.length < kept.modelId.length) byName.set(name, model);
  }
  return [...byName.values()];
};

/**
 * Derives the Home composer's model options from the tenant's enabled models,
 * keeping only providers the llmpipeline can route.
 */
export const useHomeChatModels = () => {
  const tenantId = useUserSessionStore((state) => state.userSession?.tenantId ?? "");
  const tenantQuery = useQuery({
    queryKey: [...HOME_CHAT_MODELS_QUERY_KEY, "tenant", tenantId],
    queryFn: getModelProviders,
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });

  const models = useMemo<HomeChatModel[]>(() => {
    const options: HomeChatModel[] = [];

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

    return keepShortestIdPerName(options);
  }, [tenantQuery.data]);

  const groups = useMemo<HomeChatModelGroup[]>(() => {
    const byProvider = new Map<string, HomeChatModelGroup>();
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

  const speechModel = useMemo<HomeChatSpeechModel>(() => {
    for (const provider of tenantQuery.data?.data ?? []) {
      const credentialName = provider.credentialName?.trim() || null;
      const model = provider.enabledModels?.find(
        ({ capability }) => capability === ModelCapabilityEnum.Stt,
      );
      if (provider.isDisabled || !model || !credentialName) continue;
      const providerName = provider.providerType.trim().toLowerCase();
      const pipelineProvider = PIPELINE_PROVIDERS[providerName] ?? providerName;
      return {
        provider: pipelineProvider,
        modelId: toModelId(pipelineProvider, model.modelId),
        credentialName,
        isByokEnabled: true,
      };
    }
    return PLATFORM_SPEECH_MODEL;
  }, [tenantQuery.data]);

  return {
    models,
    groups,
    speechModel,
    hasUsableModel: models.length > 0,
    isLoading: tenantQuery.isLoading,
    isError: tenantQuery.isError,
    isSuccess: tenantQuery.isSuccess,
  };
};

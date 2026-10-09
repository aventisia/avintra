import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import {
  Model,
  getSpecialtyFromNode,
  modelProviders,
} from "@/features/dynamic-config-panel/constants/model-providers";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";
import { getProviderBrandIcon } from "@/utils/provider-brand-icons.util";

import { getProviderModels } from "../../apis/llm-pipelines-apis";
import { embeddingModelProviders } from "../../constants/embedding-model-providers";
import { sttModelProviders } from "../../constants/stt-model-proivder";
import { ttsModelProviders } from "../../constants/tts-model-proivder";
import { TenantModelProviderDto } from "../../dtos/tenant-model-provider-dto";
import { useFetchTenantModelProviders } from "../../hooks/useFetchTenantModelProviders";
import { uniqueAndNormalizeArray } from "../../utils/uniqueAndNormalizeArray";
import { CredentialsSelectField } from "./CredentialsSelectField";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";
import { VoiceConfigField } from "./VoiceConfigField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
  /** If true, show the JSON output toggle in the model settings. */
  showJsonOutput?: boolean;
  /**
   * Forces the model list to a speech specialty (tenant-enabled models)
   * regardless of the node name or BYOK state.
   */
  specialty?: "stt" | "tts";
  /** Hides the "Bring your own API key" switch. */
  hideByok?: boolean;
}

const PROVIDER_MAP: Record<string, string> = {
  openai: "OpenAI",
  googlegemini: "Gemini",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
  elevenlabs: "ElevenLabs",
  ollama: "Ollama",
  ollamacloud: "OllamaCloud",
  groq: "Groq",
  mistral: "Mistral",
};

// Studio provider values whose models are sourced from the tenant config's
// "enabledModelIds" (per the Tenant Admin "Model Providers" section) rather than
// fetched dynamically via a credential (e.g. Ollama On-prem).
const TENANT_CONFIG_MODEL_PROVIDERS = new Set(["ollama"]);

const ModelConfigField = ({
  name,
  showJsonOutput = true,
  specialty,
  hideByok = false,
}: ModelConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { control, setValue, getValues, watch } = useFormContext();
  const nodeKey = name.replace("__ModelConfig__", "");

  // Resolve the active specialty from the explicit prop or the node name so the
  // same component can drive standalone STT/TTS nodes and the ChatAgent's voice
  // sub-configs.
  const isStt = specialty === "stt" || nodeKey === "SpeechToText";
  const isTts = specialty === "tts" || nodeKey === "TextToSpeech";
  const isEmbedding = nodeKey === "Embedding";
  // Specialty-flagged speech sub-configs use tenant-enabled models.
  const isSpeechSpecialty = specialty === "stt" || specialty === "tts";

  // Fetch the tenant's enabled model-provider configurations (Tenant Admin > Model Providers).
  const { data: tenantProvidersData } = useFetchTenantModelProviders();

  // Configs that are enabled (not disabled) for this tenant.
  const enabledTenantConfigs = useMemo(
    () => (tenantProvidersData?.data ?? []).filter((c) => !c.isDisabled),
    [tenantProvidersData],
  );

  // Map a studio provider value (e.g. "googlegemini") to the enabled tenant config
  // for that provider (backend type e.g. "Gemini"). Only includes enabled providers.
  const enabledConfigByProvider = useMemo(() => {
    const map: Record<string, TenantModelProviderDto> = {};
    for (const [studioValue, backendType] of Object.entries(PROVIDER_MAP)) {
      const config = enabledTenantConfigs.find((c) => c.providerType === backendType);
      if (config) map[studioValue] = config;
    }
    return map;
  }, [enabledTenantConfigs]);

  // 1. Memoize Field Names to prevent effect loops
  const fieldNames = useMemo(
    () =>
      ({
        is_byok_enabled: `${name}.is_byok_enabled`,
        credential_name: `${name}.credential_name`,
        provider: `${name}.provider`,
        model: `${name}.model`,
        voice: `${name}.voice`,
        temperature: `${name}.temperature`,
        top_p: `${name}.top_p`,
        is_json_output: `${name}.is_json_output`,
        max_output_tokens: `${name}.max_output_tokens`,
        reasoning_effort: `${name}.reasoning_effort`,
      }) as const,
    [name],
  );

  // 2. Controllers
  const { field: isByokField } = useController({
    name: fieldNames.is_byok_enabled,
    control,
  });
  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });
  const { field: modelField } = useController({
    name: fieldNames.model,
    control,
  });
  const { field: credentialsField } = useController({
    name: fieldNames.credential_name,
    control,
  });
  const { field: temperatureField } = useController({
    name: fieldNames.temperature,
    control,
  });
  const { field: topPField } = useController({
    name: fieldNames.top_p,
    control,
  });

  const is_byok_enabled = Boolean(isByokField.value);
  const providerValue = providerField.value;
  const credentialsValue = credentialsField.value;

  const prevValues = useRef({
    is_byok_enabled,
    providerValue,
    credentialsValue,
  });

  const enableModelSetup = useMemo(
    () => ["__ModelConfig__Inferencing", "__ModelConfig__Conversation"].includes(name),
    [name],
  );

  // Reasoning effort has no explicit "unset" state, so fall back to the default
  // "medium" for ChatAgent nodes that stored a null/empty value or pre-date the
  // field. Scoped to the conversation model so other model configs are untouched.
  const reasoningEffortValue = watch(fieldNames.reasoning_effort);
  useEffect(() => {
    if (name !== "__ModelConfig__Conversation") return;
    if (reasoningEffortValue == null || reasoningEffortValue === "") {
      setValue(fieldNames.reasoning_effort, "medium", { shouldDirty: false });
    }
  }, [name, reasoningEffortValue, setValue, fieldNames]);

  // Whether the currently selected provider has at least one model enabled for
  // this tenant. When BYOK is ON, the provider / credentials dropdowns must not
  // render for providers that have no enabled models.
  const currentProviderHasEnabledModels = useMemo(() => {
    if (!is_byok_enabled) return true;
    const config = enabledConfigByProvider[providerValue];
    return Boolean(config && (config.enabledModelIds?.length ?? 0) > 0);
  }, [is_byok_enabled, enabledConfigByProvider, providerValue]);

  // 3. Filtered Data
  const filteredProviders = useMemo(() => {
    const requiredSpecialties = getSpecialtyFromNode(nodeKey);

    if (isStt) return sttModelProviders;
    if (isTts) return ttsModelProviders;
    if (isEmbedding) return embeddingModelProviders;

    // When BYOK is enabled, only show providers that are enabled for this tenant
    // (per the Tenant Admin "Model Providers" section).
    const providers = is_byok_enabled
      ? modelProviders.filter((p) => {
          const config = enabledConfigByProvider[p.value];
          return Boolean(config) && (config?.enabledModelIds?.length ?? 0) > 0;
        })
      : modelProviders.filter((p) => p.isEnabled !== false);

    return providers.map((p) => ({
      ...p,
      models: p.models.filter((m) => {
        const specialtyMatch = requiredSpecialties.every((req) => m.specialty.includes(req));
        return specialtyMatch && m.available;
      }),
    }));
  }, [isStt, isTts, isEmbedding, is_byok_enabled, enabledConfigByProvider, nodeKey]);

  // 4. Initial Load Logic
  useEffect(() => {
    const init = async () => {
      if (is_byok_enabled && credentialsValue && providerValue) {
        try {
          if (isStt) {
            setByokModels(sttModelProviders[0].models as Model[]);
            setIsInitialized(true);

            return;
          }
          if (isTts) {
            setByokModels(ttsModelProviders[0].models as Model[]);
            setIsInitialized(true);

            return;
          }
          if (isEmbedding) {
            setByokModels(embeddingModelProviders[0].models as Model[]);
            setIsInitialized(true);

            return;
          }
          setIsLoading(true);

          const provider = PROVIDER_MAP[providerValue];
          if (provider) {
            const res = await getProviderModels(provider, credentialsValue);
            setByokModels((res?.data as Model[]) || []);
          }
        } catch {
          toast.error("Failed to load initial models");
        } finally {
          setIsLoading(false);
        }
      }
      setIsInitialized(true);
    };
    init();
  }, []); // Only on mount

  // 5. Handle Field Resets (BYOK Toggle or Provider Change)
  useEffect(() => {
    if (!isInitialized) return;

    const byokChanged = prevValues.current.is_byok_enabled !== is_byok_enabled;
    const providerChanged = prevValues.current.providerValue !== providerValue;

    if (byokChanged || providerChanged) {
      prevValues.current.is_byok_enabled = is_byok_enabled;
      prevValues.current.providerValue = providerValue;

      setValue(fieldNames.credential_name, "", { shouldDirty: true });
      setValue(fieldNames.model, "", { shouldDirty: true });
      setByokModels([]);

      // When BYOK is turned ON, the provider dropdown only lists providers that
      // have enabled models for this tenant. If the previously selected provider
      // is not among them, clear it so a stale provider (e.g. OpenAI) does not
      // remain visible and leak its API-key credential dropdown.
      if (is_byok_enabled) {
        const config = enabledConfigByProvider[providerValue];
        const hasModels = Boolean(config && (config.enabledModelIds?.length ?? 0) > 0);
        if (!hasModels) {
          setValue(fieldNames.provider, "", { shouldDirty: true });
        }
      }
    }
  }, [
    is_byok_enabled,
    providerValue,
    isInitialized,
    setValue,
    fieldNames,
    enabledConfigByProvider,
  ]);

  // 6. Fetch BYOK Models on Credential Change
  useEffect(() => {
    if (!isInitialized || !is_byok_enabled) return;
    if (prevValues.current.credentialsValue === credentialsValue) return;

    prevValues.current.credentialsValue = credentialsValue;
    if (isStt) {
      setByokModels(sttModelProviders[0].models as Model[]);

      return;
    }
    if (isTts) {
      setByokModels(ttsModelProviders[0].models as Model[]);

      return;
    }
    if (isEmbedding) {
      setByokModels(embeddingModelProviders[0].models as Model[]);
      return;
    }

    const fetchModels = async () => {
      if (!credentialsValue || !providerValue) {
        setByokModels([]);
        return;
      }

      // Snapshot before blanking so a failed fetch can restore the selection.
      // Blanking first means a flush during the async gap below never persists
      // a new credential alongside a stale model.
      const previousModel = getValues(fieldNames.model) as string | undefined;
      setValue(fieldNames.model, "", { shouldDirty: true });

      try {
        setIsLoading(true);
        const provider = PROVIDER_MAP[providerValue];
        if (provider) {
          const res = await getProviderModels(provider, credentialsValue);
          const models = (res?.data as Model[]) || [];
          setByokModels(models);
          // Keep the previous selection when the new credential still offers it.
          if (previousModel && models.some((m) => m.value === previousModel)) {
            setValue(fieldNames.model, previousModel, { shouldDirty: true });
          }
        }
      } catch {
        toast.error("Error fetching provider models");
        setByokModels([]);
        // IMPORTANT NOTE: restore the snapshot so a failed fetch never leaves a
        // blank model that the next flush would persist over a valid selection.
        if (previousModel) {
          setValue(fieldNames.model, previousModel, { shouldDirty: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchModels, 150);
    return () => clearTimeout(timer);
  }, [
    credentialsValue,
    providerValue,
    is_byok_enabled,
    isInitialized,
    setValue,
    getValues,
    fieldNames,
  ]);

  // 7. Render Helpers
  const availableModels = useMemo(() => {
    const enabledConfig = enabledConfigByProvider[providerValue];

    // STT / TTS / tenant-config-based providers (e.g. Ollama On-prem) do not fetch
    // models dynamically via a credential, so the model dropdown must show the models
    // that were ENABLED for that provider in the tenant config. Specialty-flagged
    // sub-configs use tenant models regardless of BYOK.
    if (
      isSpeechSpecialty ||
      (is_byok_enabled && (isStt || isTts || TENANT_CONFIG_MODEL_PROVIDERS.has(providerValue)))
    ) {
      const enabledIds = enabledConfig?.enabledModelIds ?? [];
      return uniqueAndNormalizeArray(
        enabledIds.map((id) => ({ value: id, label: id, available: true }) as Model),
      );
    }

    const models = is_byok_enabled
      ? (() => {
          const enabledIds = new Set(enabledConfig?.enabledModelIds ?? []);
          // Only show models that were enabled for this provider in the tenant config.
          return byokModels.filter((m) => enabledIds.has(m.value));
        })()
      : filteredProviders
          .find((p) => p.value === providerValue)
          ?.models?.filter((m) => m.available) || [];
    return uniqueAndNormalizeArray(models);
  }, [
    is_byok_enabled,
    isSpeechSpecialty,
    isStt,
    isTts,
    byokModels,
    filteredProviders,
    providerValue,
    enabledConfigByProvider,
  ]);

  // Voice sub-configs are tenant-gated: warn when the tenant has no speech
  // models enabled for the provider instead of showing an empty picker.
  const hasEnabledSpeechModels = useMemo(() => {
    if (!isSpeechSpecialty) return true;
    const enabledIds = enabledConfigByProvider[providerValue]?.enabledModelIds ?? [];
    return enabledIds.length > 0;
  }, [isSpeechSpecialty, enabledConfigByProvider, providerValue]);

  const currentModel = useMemo(
    () => availableModels.find((m) => m.value === modelField.value),
    [availableModels, modelField.value],
  );

  const currentProviderLabel = filteredProviders.find((p) => p.value === providerValue)?.label;
  const providerIcon = getProviderBrandIcon(providerValue);
  const basePath = import.meta.env.VITE_STUDIO_PATH?.replace(/\/$/, "") ?? "";

  // Models inherit the selected provider's brand icon so it shows in both the
  // trigger and the option list of the Model select.
  const modelSelectOptions = useMemo(
    () => availableModels.map((model) => ({ ...model, icon: providerIcon })),
    [availableModels, providerIcon],
  );

  const modelAdvancedSettings = (
    <>
      <Controller
        {...temperatureField}
        render={({ field }) => (
          <SliderField label="Temperature" name={field.name} min={0} max={1.2} step={0.1} />
        )}
      />

      <Controller
        {...topPField}
        render={({ field }) => (
          <SliderField label="TopP" name={field.name} min={0} max={1.2} step={0.1} />
        )}
      />

      {showJsonOutput && (
        <SwitchField
          size="sm"
          name={fieldNames.is_json_output}
          label="Is JSON Output"
          description="Output results in JSON format."
        />
      )}

      <InputField
        name={fieldNames.max_output_tokens}
        type="number"
        label="Max Output Token"
        fieldSize="sm"
        description="Maximum number of tokens the model may generate in its reply. Leave empty to use the model default; values must be greater than 0 (0 is invalid)."
      />

      <SelectField
        size="sm"
        name={fieldNames.reasoning_effort}
        selectOptions={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ]}
        label="Reasoning Effort"
        description="Controls how much internal reasoning the model performs before answering. Higher effort can improve accuracy on complex tasks at the cost of speed and tokens. Not supported by all models."
      />
    </>
  );

  // Speech model configs render inside a titled group box. Text-to-speech also
  // renders its sibling voice settings (language/voice/speed) inline so the
  // whole sub-config shares one box.
  const groupName = isStt ? "Speech to Text" : isTts ? "Text to Speech" : undefined;
  const showInlineVoiceConfig = isTts;
  const voiceConfigName = name.replace("__ModelConfig__", "__VoiceConfig__");

  const content = (
    <div className="w-full space-y-3.5">
      {!hideByok && (
        <SwitchField
          size="sm"
          name={fieldNames.is_byok_enabled}
          label="Bring your own API key"
          description="Use your own provider API key instead of platform-hosted models."
        />
      )}

      <div className="flex items-end gap-2">
        {providerIcon && (
          <img src={basePath + providerIcon} alt="" className="mb-1 h-5 w-5 shrink-0" />
        )}
        <div className="flex-grow">
          <SelectField
            size="sm"
            name={fieldNames.provider}
            selectOptions={filteredProviders}
            label="Model Provider"
          />
        </div>
      </div>

      {is_byok_enabled && currentProviderHasEnabledModels && (
        <CredentialsSelectField
          name={fieldNames.credential_name}
          size="sm"
          label={`${currentProviderLabel ?? ""} Credentials`}
          modelProvider={providerValue}
        />
      )}

      <SearchableSelectField
        size="sm"
        name={fieldNames.model}
        selectOptions={modelSelectOptions}
        label="Model"
        primaryText="Models"
        isLoading={isLoading}
        disabled={
          !isInitialized ||
          (isSpeechSpecialty && !hasEnabledSpeechModels) ||
          (is_byok_enabled &&
            !TENANT_CONFIG_MODEL_PROVIDERS.has(providerValue) &&
            !credentialsValue)
        }
      />

      {isSpeechSpecialty && isInitialized && !hasEnabledSpeechModels && (
        <p className="text-xs text-muted-foreground">
          No {isStt ? "speech-to-text" : "text-to-speech"} models are enabled for this tenant.
          Enable one under Tenant Admin &gt; Model Providers.
        </p>
      )}

      {enableModelSetup && <div className="space-y-3.5">{modelAdvancedSettings}</div>}

      {currentModel?.voices?.length ? (
        <SelectField
          size="sm"
          name={fieldNames.voice}
          selectOptions={currentModel.voices}
          label="Voice"
        />
      ) : null}

      {showInlineVoiceConfig && (
        <VoiceConfigField name={voiceConfigName} providerPath={fieldNames.provider} />
      )}
    </div>
  );

  return groupName ? (
    <GroupedFieldsWrapper groupName={groupName}>{content}</GroupedFieldsWrapper>
  ) : (
    content
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
